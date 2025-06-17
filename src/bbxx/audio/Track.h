#ifndef TRACK_H
#define TRACK_H

// miniaudio
#include "miniaudio.h"

// bbxx
#include "../utilities.h"
#include "Chart.h"

struct Track
{
    Chart chart;
    ma_sound sound;

    const static inline char* tracks_basepath { "assets/tracks/" }; // where all tracks are located
    
    const char* path { nullptr }; // file path relateive to tracks_basepath
    std::string full_path; // full path to track file

    const float playbackspeed { 1.0f };

    bool loaded = { false };
    uint64_t length_frames { 0 };
    
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
            
            printf("[Track::cleanup] freed track '%s'!\n", path);
            return true;
        }
        
        return false;
    }
}; // Track

#endif // TRACK_H