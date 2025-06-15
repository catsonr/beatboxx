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

bool AudioState::set_currentTrack(Track* track)
{
    if( !track ) {
        printf("[AudioState::set_currentTrack] cannot set null track!\n");
        return false;
    }
    
    bgm_pause();
    ct->cleanup();
    ct = track;
    
    bgm_load();
    
    return true;
}

bool AudioState::bgm_load()
{
    /*
        for some reason sound streaming doesnt work on web, so for now it will simply be loaded
        entirely into memory

        this will stall beatboxx until loading is done
    */
#ifndef __EMSCRIPTEN__
    ma_uint32 flags = MA_SOUND_FLAG_STREAM;
#else
    ma_uint32 flags = MA_SOUND_FLAG_DECODE;
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
    if( bgm_playing ) return;

    ma_sound_set_pitch(&ct->sound, ct->playbackspeed);
    ma_sound_start(&ct->sound);
    
    printf("[AudioState::bgm_play] playing current bgm ...\n");
    bgm_playing = true;
}

void AudioState::bgm_pause()
{
    if( !bgm_playing ) return;

    ma_sound_stop(&ct->sound);
     
    printf("[AudioState::bgm_pause] paused current bgm ...\n");
    bgm_playing = false;
}

uint64_t AudioState::bgm_pos()
{
    ma_uint64 cursor_frames;
    ma_sound_get_cursor_in_pcm_frames(&ct->sound, &cursor_frames);
    
    return static_cast<uint64_t>(cursor_frames);
}

void AudioState::cleanup()
{
    for( Track* track : tracks )
    {
        track->cleanup();
    }
    ma_engine_uninit(&engine);
}