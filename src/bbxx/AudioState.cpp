#define MINIAUDIO_IMPLEMENTATION
//#define MA_ENABLE_AUDIO_WORKLETS

/*
   audio worklets work correctly, however they require a cross origin isolated context, which
   static sites like neocites don't serve, so for not audio worklets will not be used
   this should be only a minor, unnoticable performance hit
*/

#include "AudioState.h"
#include "miniaudio.h"

bool AudioState::init()
{
    ma_engine_config config = ma_engine_config_init();
    config.periodSizeInFrames = periodsizeinframes;
    if( ma_engine_init(&config, &engine) != MA_SUCCESS ) {
        printf("[AudioState::init] failed to initialize mini audio engine!\n");
        return false;
    }
    
    set_volume(volume);
    
    for(Sfx& sfx : sfxs)
    {
        if( !sfx.loaded )
            sfx.init(&engine);
    }
    
    return bgm->init(engine);
}

void AudioState::iterate()
{
    if( bgm->iterate() && bgm->playing ) {
        sfxs[0].play();
    }
}

bool AudioState::set_currentTrack(Track* track)
{
    if( !track ) {
        printf("[AudioState::set_currentTrack] cannot set null track!\n");
        return false;
    }
    
    bgm->pause();
    bgm->cleanup();
    bgm = track;
    
    bgm->init(engine);
    
    return true;
}

void AudioState::set_volume(float volume_new)
{
    volume = volume_new;
    
    ma_engine_set_volume(&engine, volume);
}

void AudioState::cleanup()
{
    for( Track* track : tracks )
    {
        track->cleanup();
    }
    for( Sfx& sfx : sfxs )
    {
        sfx.cleanup();
    }
    ma_engine_uninit(&engine);
}