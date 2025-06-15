#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

// std
#include <cstdio>
#include <string>
#include <vector>

// miniaudio
#include "miniaudio.h"

// bbxx
#include "utilities.h"

struct Track
{
    ma_sound sound;
    
    bool loaded = { false };

    const static inline char* tracks_basepath { "assets/tracks/" }; // where all tracks are located
    
    const char* path { nullptr }; // file path relateive to tracks_basepath
    std::string full_path; // full path to track file

    const float playbackspeed { 1.0f };
    
    Track(const char* path_from_assets_slash_tracks) :
        path(path_from_assets_slash_tracks)
    {
        std::string relative_path = std::string(tracks_basepath) + path;
        full_path = util::get_fullPath(relative_path.c_str());
    }
    
    bool cleanup()
    {
        if( loaded ) {
            ma_sound_uninit(&sound);
            
            loaded = false;
            return true;
        }
        
        return false;
    }
}; // Track

struct AudioState
{
    ma_engine engine;
    
    Track hi_posi { "hi-posi.mp3" };
    Track kaede { "kaede.mp3" };
    Track lamp { "lamp.mp3" };
    
    std::vector<Track*> tracks { &hi_posi, &kaede, &lamp };
    Track* ct { tracks[0] }; // current track
    
    bool init();

    void set_currentTrack(Track* track);

    bool bgm_load();
    void bgm_play();
    void bgm_pause();
    void cleanup();
}; // AudioState

#endif // AUDIOSTATE_H