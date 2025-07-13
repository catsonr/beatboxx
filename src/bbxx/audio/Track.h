#ifndef TRACK_H
#define TRACK_H

#include <filesystem>

// miniaudio
#include "miniaudio.h"

// bbxx
#include "../utilities.h"
#include "Chart.h"
#include "../Texture.h"

struct Track
{
    Chart chart;
    ma_sound sound;
    
    Texture art;

    const static inline char* tracks_basepath { "assets/tracks/" }; // where all tracks are located
    
    const char* path { nullptr }; // file path relateive to tracks_basepath
    std::string full_path; // full path to track file

    const float playbackspeed { 1.0f };

    bool loaded { false };
    uint64_t length_frames { 0 };
    
    bool playing { false };
    
    Track(const char* path_from_assets_slash_tracks) :
        path(path_from_assets_slash_tracks)
    {
        std::string relative_path = std::string(tracks_basepath) + path;
        full_path = util::get_fullPath(relative_path.c_str());
    }
    
    bool init(ma_engine& engine)
    {
        /*
            for some reason sound streaming doesnt work on web, so for now it will simply be loaded
            entirely into memory

            this will stall beatboxx on ma_sound_init_from_file() until loading is done
        */
#ifndef __EMSCRIPTEN__
        ma_uint32 flags = MA_SOUND_FLAG_STREAM;
        //ma_uint32 flags = MA_SOUND_FLAG_DECODE;
#else
        ma_uint32 flags = MA_SOUND_FLAG_DECODE;
#endif
        
        printf("[Track::init] loading '%s'... (this may take a while)\n", path);
        if( ma_sound_init_from_file(&engine, full_path.c_str(), flags, NULL, NULL, &sound) != MA_SUCCESS ) {
            printf("[Track::load] failed to load file '%s'!\n", path);
        }
        
        if( !chart.init(full_path.c_str()) ) {
            printf("[Track::load] failed to initialize chart for '%s'!\n", path);
            return false;
        }
        
        // init texture here
        namespace fs = std::filesystem;
        fs::path art_path(full_path);
        art_path.replace_extension(".jpg"); // for now, Track expects album art to be .jpg
        
        if( fs::exists(art_path) )
        {
            art.init(art_path.c_str());
        }
        else
        {
            printf("[Track::init] could not find album art '%s'! ( ignoring ... )\n", art_path.c_str());
        }

        loaded = true;
        ma_sound_get_length_in_pcm_frames(&sound, &length_frames);

        printf("[Track::init] loaded track '%s'!\n", path);
        
        return true;
    }
    
    bool iterate()
    {
        // song ended
        if( ma_sound_at_end(&sound) ) {
            on_sound_end();
            return false;
        }
        return chart.iterate(get_frame());
    }
    
    void play()
    {
        if( playing ) return;

        ma_sound_set_pitch(&sound, playbackspeed);
        ma_sound_start(&sound);
        
        //printf("[Track::play] playing current bgm ...\n");
        playing = true;
    }
    
    void pause()
    {
        if( !playing ) return;

        ma_sound_stop(&sound);
         
        //printf("[Track::pause] paused current bgm ...\n");
        playing = false;
    }

    uint64_t get_frame()
    {
        ma_uint64 cursor_frames;
        ma_sound_get_cursor_in_pcm_frames(&sound, &cursor_frames);

        return static_cast<uint64_t>(cursor_frames);
    }
    
    void set_frame(uint64_t frame)
    {
        ma_sound_seek_to_pcm_frame(&sound, frame);
        chart.seek_frame(frame);
    }
    
    void on_sound_end()
    {
        if( playing ) {
            playing = false;
            printf("[Track::on_sound_end] song '%s' ended!\n", path);
        }
    }
    
    bool cleanup()
    {
        if( loaded ) {
            ma_sound_uninit(&sound);
            
            loaded = false;
            
            //printf("[Track::cleanup] freed track '%s'!\n", path);
            return true;
        }

        chart.cleanup();
        
        return false;
    }
    
    /* converts frame to position in track, where 0.0 is start and 1.0 is end */
    double frame_to_pos(uint64_t frame) const
    {
        return static_cast<double>(frame) / static_cast<double>(length_frames);
    }
}; // Track

#endif // TRACK_H