
#define MINIAUDIO_IMPLEMENTATION
#define MA_ENABLE_AUDIO_WORKLETS

#include "miniaudio.h"
#include "AudioState.h"

bool AudioState::init()
{
    ma_engine_config config = ma_engine_config_init();
    if( ma_engine_init(&config, &engine) != MA_SUCCESS ) {
        printf("[AudioState::init] failed to initialize mini audio engine!\n");
        return false;
    }
    
    return bgm_load();
}

void AudioState::set_currentTrack(Track* track)
{
    SDL_assert(track); // TODO: better error checking
    
    bgm_pause();
    ct = track;
    
    bgm_load();
}

bool AudioState::bgm_load()
{
#ifndef __EMSCRIPTEN__
    ma_uint32 flags = MA_SOUND_FLAG_STREAM; // MA_SOUND_FLAG_DECODE to load entire track into memory
#else
    ma_uint32 flags = MA_SOUND_FLAG_DECODE; // MA_SOUND_FLAG_DECODE to load entire track into memory
#endif
    if( ma_sound_init_from_file(&engine, ct->full_path.c_str(), flags, NULL, NULL, &ct->sound) != MA_SUCCESS ) {
        printf("[AudioState::bgm_load] failed to init load file '%s'!\n", ct->path);
    }
    
    ct->loaded = true;
    printf("[AudioState::bgm_load] loaded '%s'!\n", ct->path);
    
    return true;
}


void AudioState::bgm_play()
{
    printf("[AudioState::bgm_play] playing current bgm ...\n");

    ma_sound_set_pitch(&ct->sound, ct->playbackspeed);
    ma_sound_start(&ct->sound);
}

void AudioState::bgm_pause()
{
    ma_sound_stop(&ct->sound);
}

void AudioState::cleanup()
{
    for( Track* track : tracks )
    {
        track->cleanup();
    }
    ma_engine_uninit(&engine);
}