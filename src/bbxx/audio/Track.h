#ifndef TRACK_H
#define TRACK_H

// std
#include <string>
#include <filesystem>
namespace fs = std::filesystem;

// miniaudio
#include "miniaudio.h"

// bbxx
#include "../utilities.h"
#include "../Texture.h"
#include "Chart.h"
#include "TrackInfo.h"

/*
    Track 
    Tracks are stored in /assets/tracks/{song name}/   where...
        track.mp3  -> the actual song
        info.json  -> information like the artist, and album name
        chart.json -> contains the chart data like beat positions, notes
        art.jpg    -> the album art
*/
struct Track
{
    /* PUBLIC MEMBERS */

    /* the mp3 data, handled by miniaudio */
    ma_sound sound;
    bool sound_loaded { false };
    /* the track's album art */
    Texture art;
    /* the track's chart */
    Chart chart;
    TrackInfo info;
    /* where all tracks are stored */
    const static inline char* tracks_folder { "assets/tracks/" };
    /*
        the folder this track is stored in (should be inside tracks_folder)
        this is expected to be the track's title, but ig it doesn't have to be
    */
    const char* folder { nullptr };
    /* the absolute path to the track's folder */
    fs::path folder_full_path;
    /* 
        the speed at which the track plays 
        1.0 -> normal speed
        0.5 -> half speed
        2.0 -> double speed, etc.
    */
    const float playbackspeed { 1.0f };
    /* whether or not the track is currently playing */
    bool playing { false };
    /* the length of the track, in PCM frames */
    uint64_t length_frames { 0 };
    
    /* CONSTRUCTORS */
    
    /* folder_relative_path is the the path relative to tracks_folder */
    Track(const char* folder_relative_path) :
        folder(folder_relative_path)
    {
        fs::path relative = fs::path(tracks_folder) / folder;
        std::string full = util::get_fullPath(relative.string().c_str());
        folder_full_path = fs::path(full);
    }
    
    /* PUBLIC METHODS */
    
    bool init()
    {
        std::string art_path_str = (folder_full_path / "art.jpg").string();
        const char* art_path = art_path_str.c_str();
        if( !fs::exists(art_path) ) {
            printf("[Track::init] could not find '%s'! (does it exist?)\n", art_path);
            return false;
        }
        if( !art.init(art_path) ) {
            printf("[Track::init] failed to initialize album art!\n");
            return false;
        }
        
        std::string info_path_str = (folder_full_path / "info.json").string();
        const char* info_path = info_path_str.c_str();
        if( !fs::exists(info_path) ) {
            printf("[Track::init] could not find '%s'! (does it exist?)\n", info_path);
            return false;
        }
        if( !info.init(info_path) ) {
            printf("[Track::init] failed to initialize track info!\n");
            return false;
        }
        
        return true;
    }
    
    bool init_sound(ma_engine& engine)
    {
        if( sound_loaded ) return true;

        /*
            UPDATE: streaming seems to be working now!

            for some reason sound streaming doesn't work on web, so for now it will simply be loaded
            entirely into memory
            desktop builds will stream audio as needed

            this will stall beatboxx on ma_sound_init_from_file() until loading is done
        */
#ifdef __EMSCRIPTEN__
        ma_uint32 flags = MA_SOUND_FLAG_STREAM;
        //ma_uint32 flags = MA_SOUND_FLAG_DECODE;
        //printf("[Track::init] loading '%s' ... (this may take a while!)\n", folder_full_path.string().c_str());
#else
        ma_uint32 flags = MA_SOUND_FLAG_STREAM;
        //ma_uint32 flags = MA_SOUND_FLAG_DECODE;
#endif
        
        std::string track_path_str = (folder_full_path / "track.mp3").string();
        const char* track_path = track_path_str.c_str();
        
        if( !fs::exists(track_path) ) {
            printf("[Track::init_sound] could not find '%s'! (does it exist?)\n", track_path);
        }
        
        if( ma_sound_init_from_file(&engine, track_path, flags, NULL, NULL, &sound) != MA_SUCCESS ) {
            printf("[Track::load] failed to load mp3 '%s'!\n", track_path);
            return false;
        }
        
        ma_sound_get_length_in_pcm_frames(&sound, &length_frames);        
        
        printf("[Track::init_sound] loaded '%s'!\n", track_path);
        
        sound_loaded = true;

        return true;
    }
    
    bool init_chart()
    {
        std::string chart_path_str = (folder_full_path / "chart.json").string().c_str();
        const char* chart_path = chart_path_str.c_str();
        if( !fs::exists(chart_path) ) {
            printf("[Track::init_chart] could not find '%s'! (does it exist?)\n", chart_path);
            return false;
        }
        if( !chart.init(chart_path) ) {
            printf("[Track::init_chart] failed to initialize chart!\n");
            return false;
        }
        
        return true;
    }
    
    void play()
    {
        if( playing ) return;
        
        ma_sound_set_pitch(&sound, playbackspeed);
        ma_sound_start(&sound);
        
        playing = true;
    }
    
    void pause()
    {
        if( !playing ) return;
        
        ma_sound_stop(&sound);

        playing = false;
    }
    
    void cleanup()
    {
        if( sound_loaded )
            ma_sound_uninit(&sound);
    
        sound_loaded = false;
        playing = false;
    }
}; // Track

#endif // TRACK_H