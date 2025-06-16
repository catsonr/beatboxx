#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

// std
#include <iostream>
#include <cstdio>
#include <string>
#include <vector>
#include <filesystem>

// miniaudio
#include "miniaudio.h"

// json
#include <nlohmann/json.hpp>

// bbxx
#include "utilities.h"

struct Meter
{
    std::vector<uint64_t> beat_locations;
    
    std::filesystem::path json_path;
    
    const static int dumpvalue = 2; // -1 for no space, 2 for indentation
    
    int current_beat { 0 };

    bool init(const char* full_path)
    {
        json_path = std::filesystem::path(full_path);
        json_path.replace_extension(".json");

        if( !json_load() ) {
            printf("[Meter::init] failed to load JSON '%s'!\n", json_path.c_str());
            return false;
        }
        
        return true;
    }
    
    // returns true if it created a new file, and false otherwise
    bool json_init()
    {
        if( std::filesystem::exists(json_path) ) return false;

        nlohmann::json j;
        j["beats"] = nlohmann::json::array();
        
        std::ofstream ofs(json_path, std::ios::binary);
        if( !ofs ) {
            std::cerr << "[Meter::json_init] canont write '" << json_path << "'!\n";
            
            return false;
        }
        
        ofs << j.dump(dumpvalue) << "\n";
        
        return true;
    }
    
    bool json_write() const
    {
        nlohmann::json j;
        j["beats"] = beat_locations;

        // Open the file for (over)writing
        std::ofstream ofs(json_path, std::ios::binary);
        if (!ofs) {
            std::cerr << "[Meter::json_write] failed to open '"
                      << json_path.string() << "'!\n";
            return false;
        }

        ofs << j.dump(dumpvalue) << "\n";
        
        printf("[Meter::json_write] wrote %i beats to '%s'!\n", (int)beat_locations.size(), json_path.c_str());
        return true;
    }
    
    bool json_load()
    {
        if ( json_init() ) {
            printf("[Meter::json_load] new file '%s' created!\n", json_path.c_str());
        }

        std::ifstream ifs(json_path);
        if( !ifs ) {
            printf("[Meter::json_load] unable to load file '%s'! (does the file exist?)\n", json_path.c_str());
            return false;
        }
        
        std::string text {
            std::istreambuf_iterator<char>(ifs),
            std::istreambuf_iterator<char>()
        };
        
        try
        {
            auto j = nlohmann::json::parse(text);

            beat_locations = j.at("beats").get<std::vector<uint64_t>>();
        }
        catch(const nlohmann::json::parse_error& e)
        {
            std::size_t pos = e.byte;
            std::cerr << "ERROR!!!!!!![Meter::load_json] JSON parse error at byte "
                      << pos << ": " << e.what() << "\n";

            // extract ~40 chars around the error
            std::size_t start = (pos > 20 ? pos - 20 : 0);
            std::string snippet = text.substr(start, 60);
            std::cerr << "… " << snippet << " …\n";

            return false;
        }

        return true;
    }
}; // Meter

struct Track
{
    Meter meter;
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

struct Sfx
{
    ma_sound sound;
    bool loaded { false };
    
    std::string fullPath;

    // Construct with the filename relative to assets/sfx/
    Sfx(const char* filename) {
        std::string rel = std::string("assets/sfx/") + filename;
        fullPath = util::get_fullPath(rel.c_str());
    }
    
    bool init(ma_engine* engine)
    {
        if (ma_sound_init_from_file(
                engine,
                fullPath.c_str(),
                MA_SOUND_FLAG_DECODE,  // decode to PCM for fast start
                nullptr,               // no sound group
                nullptr,               // no done-fence
                &sound                 // pointer to your ma_sound
            ) != MA_SUCCESS) {
            return false;
        }
        ma_sound_set_looping(&sound, false);
        ma_sound_set_volume(&sound, 1.0f);
        loaded = true;
        return true;
    }
    
    void play()
    {
        if (!loaded) return;

        ma_sound_seek_to_pcm_frame(&sound, 0);
        ma_sound_start(&sound);
    }

    void cleanup()
    {
        if( loaded ) {
            ma_sound_uninit(&sound);
            loaded = false;
        }
    }
}; // Sfx

struct AudioState
{
    /* PUBLIC MEMBERS */
    ma_engine engine;
    
    Track hi_posi { "hi-posi.mp3" };
    Track kaede { "kaede.mp3" };
    Track lamp { "lamp.mp3" };
    
    std::vector<Track*> tracks { &hi_posi, &kaede, &lamp };
    Track* bgm { tracks[0] }; // current track
    
    std::vector<Sfx> sfxs { {"click.wav"} };

    bool bgm_playing { false };
    
    float volume { 1.0f };
    
    int periodsizeinframes { 256 };
    int periodcount { 3 };
    
    /* PUBLIC METHODS */
    bool init();
    
    void iterate();

    bool set_currentTrack(Track* track);
    void set_volume(float volume_new);

    bool bgm_load();
    void bgm_play();
    void bgm_pause();

    uint64_t bgm_get_pos();
    void bgm_set_pos(uint64_t frame);

    void cleanup();
}; // AudioState

#endif // AUDIOSTATE_H