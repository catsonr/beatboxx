#define MINIAUDIO_IMPLEMENTATION
#define MA_ENABLE_AUDIO_WORKLETS

#include "miniaudio.h"
#include "AudioState.h"

bool AudioState::init()
{
    ma_engine_config config = ma_engine_config_init();
    config.periodSizeInFrames = periodsizeinframes;
    if( ma_engine_init(&config, &engine) != MA_SUCCESS ) {
        printf("[AudioState::init] failed to initialize mini audio engine!\n");
        return false;
    }
    
    for(Sfx& sfx : sfxs)
    {
        if( !sfx.loaded )
            sfx.init(&engine);
    }
    
    return bgm_load();
}

void AudioState::iterate()
{
    if( bgm->meter.current_beat >= bgm->meter.beat_locations.size() ) return;

    int offset = periodsizeinframes * periodcount;
    if( bgm_get_pos() + offset >= bgm->meter.beat_locations[bgm->meter.current_beat] )
    {
        bgm->meter.current_beat++;
        sfxs[0].play();
    }
}

bool AudioState::set_currentTrack(Track* track)
{
    if( !track ) {
        printf("[AudioState::set_currentTrack] cannot set null track!\n");
        return false;
    }
    
    bgm_pause();
    bgm->cleanup();
    bgm = track;
    
    bgm_load();
    
    return true;
}

void AudioState::set_volume(float volume_new)
{
    volume = volume_new;
    
    ma_engine_set_volume(&engine, volume);
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
    if( ma_sound_init_from_file(&engine, bgm->full_path.c_str(), flags, NULL, NULL, &bgm->sound) != MA_SUCCESS ) {
        printf("[AudioState::bgm_load] failed to init load file '%s'!\n", bgm->path);
    }
    
    if( !bgm->meter.init(bgm->full_path.c_str()) ) {
        printf("[AudioState::bgm_load] failed to initialize current bgm's meter!\n");
        return false;
    }

    bgm->loaded = true;
    ma_sound_get_length_in_pcm_frames(&bgm->sound, &bgm->length_frames);
    

    printf("[AudioState::bgm_load] loaded '%s'!\n", bgm->path);
    
    return true;
}


void AudioState::bgm_play()
{
    if( bgm_playing ) return;

    ma_sound_set_pitch(&bgm->sound, bgm->playbackspeed);
    ma_sound_start(&bgm->sound);
    
    printf("[AudioState::bgm_play] playing current bgm ...\n");
    bgm_playing = true;
}

void AudioState::bgm_pause()
{
    if( !bgm_playing ) return;

    ma_sound_stop(&bgm->sound);
     
    printf("[AudioState::bgm_pause] paused current bgm ...\n");
    bgm_playing = false;
}

uint64_t AudioState::bgm_get_pos()
{
    ma_uint64 cursor_frames;
    ma_sound_get_cursor_in_pcm_frames(&bgm->sound, &cursor_frames);
    
    return static_cast<uint64_t>(cursor_frames);
}

void AudioState::bgm_set_pos(uint64_t frame)
{
    bgm_pause();
    ma_sound_seek_to_pcm_frame(&bgm->sound, frame);
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