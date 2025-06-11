#ifndef TRACK_H
#define TRACK_H

#include "AudioState.h"
#include "Pace.h"

struct Track
{
    AudioState* audiostate;
    Pace pace;

    const char* bgm_path;
    const char* pace_path;

    Mix_Music* music { nullptr };
    
    // the length of the song, in seconds
    double length { 0 };
    int sample_rate { 0 };
    int channels { 0 };
    
    const char* type { nullptr };
    const char* title { nullptr };
    const char* artist { nullptr };
    const char* album { nullptr };
    const char* copyright { nullptr };
    
    bool playing { false };
    
    /* CONSTRUCTOR */
    Track(const char* bgm_path, const char* pace_path) : 
        bgm_path(bgm_path),
        pace_path(pace_path)
    {}
    
    /* PUBLIC METHODS */
    bool init()
    {
        music = Mix_LoadMUS(util::get_fullPath(bgm_path).c_str());
        if( music == NULL ) {
            SDL_Log("[Track::init] failed to load music!\n");
            return false;
        }
        
        switch( Mix_GetMusicType(music))
        {
            case MUS_WAV: type = "WAV"; break;
            case MUS_MOD: type = "MOD"; break;
            case MUS_FLAC: type = "FLAC"; break;
            case MUS_MID: type = "MIDI"; break;
            case MUS_OGG: type = "OGG Vorbis"; break;
            case MUS_MP3: type = "MP3"; break;
            case MUS_OPUS: type = "OPUS"; break;
            case MUS_WAVPACK: type = "WavPack"; break;
            default: type = "NONE (file type not detected!)"; break;
        }
        
        title = Mix_GetMusicTitleTag(music);
        artist = Mix_GetMusicArtistTag(music);
        album = Mix_GetMusicAlbumTag(music);
        copyright = Mix_GetMusicCopyrightTag(music);
        
        length = Mix_MusicDuration(music);

        if( !pace.init(pace_path) ) {
            SDL_Log("[Track::init] failed to initialize pace!\n");
            return false;
        }
        
        return true;
    }
    
    void play__force()
    {
        Mix_HaltMusic();
        Mix_PlayMusic(music, 0);

        playing = true;
        pace.start();
    }

    /* begin (or restart) playback */
    void play(int fadeInTime_ms = 0)
    {
        if(playing) return;
        
        pace.start();
        Mix_FadeInMusic(music, 0, fadeInTime_ms);
        playing = true;
        
        
        //printf("[Track::play] playing '%s'!\n", title);
    }
    
    /* pause playback */
    void pause()
    {
        if(!playing) return;
        
        Mix_PauseMusic();
        playing = false;

        //printf("[Track::pause] paused '%s'!\n", title);
    }
    
    /* resume playback */
    void resume()
    {
        if(playing) return;
        
        Mix_ResumeMusic();
        playing = true;

        //printf("[Track::resume] resumed '%s'!\n", title);
    }
    
    /* prevents further playback */
    void stop()
    {
        Mix_HaltMusic();
        playing = false;
    }
    
    double get_pos()
    {
        return Mix_GetMusicPosition(music);
    }
    
    double get_dt(int beat_index)
    {
        if( beat_index == 0 ) return 0.f; 
        
        return pace.beats[beat_index] - pace.beats[beat_index - 1];
    }
    
    void set_ddt(int beat_index, double change_in_dt)
    {
        SDL_assert(beat_index > 0);
        
        double dt = get_dt(beat_index);
        dt += change_in_dt;
        
        pace.beats[beat_index] = pace.beats[beat_index - 1] + dt;
    }
    
    bool set_pos(double pos)
    {
        if( !Mix_SetMusicPosition(pos) ) {
            SDL_Log("[Track::set_pos] failed to set track position: %s", SDL_GetError());
            return false;
        }
        
        return true;
    }
    
    bool set_pos_atBeat(int beat)
    {
        double pos = pace.beats[beat];
        
        pace.currentbeat = beat;
        return set_pos(pos);
    }
    
    void destory()
    {
        if( music ) Mix_FreeMusic(music);

        music = nullptr;
    }
}; // Track

#endif // TRACK_H