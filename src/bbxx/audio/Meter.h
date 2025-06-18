/*
    Meter determines where the beat is, represented as miniaudio frames since the track started
*/

#ifndef METER_H
#define METER_H

// std
#include <iostream>
#include <vector>
#include <filesystem>
#include <fstream>

// json
#include <nlohmann/json.hpp>

#define METER_BEFORE_BEAT -1

struct Meter
{
    std::vector<uint64_t> beat_locations;
    
    std::filesystem::path json_path;
    
    const static int dumpvalue = 2; // -1 for no space, 2 for indentation
    
    int current_beat { METER_BEFORE_BEAT };
    
    bool iterate(uint64_t current_frame)
    {
        // before first beat
        if( beat_locations.size() == 0 || current_frame < beat_locations.front()) {
            return false;
        }
        
        // first beat happens
        else if(current_beat == METER_BEFORE_BEAT) {
            current_beat = 0;
            return true;
        }
        
        // beat passed
        if( current_frame > get_nextBeatLocation(current_beat) && current_beat < (int)beat_locations.size()) {
            current_beat++;
            return true;
        }
        
        return false;
    }
    
    uint64_t get_nextBeatLocation(int beat_index) const
    {
        assert(beat_index >= 0); // TO-DO: remove assert()

        int beat_count = (int)beat_locations.size();

        // if we're at the last beat there is no next beat, so return the last beat's location
        if( beat_index >= beat_count ) return beat_locations[beat_count - 1];
        
        return beat_locations[beat_index + 1];
    }
    
    uint64_t get_dFrames(int beat_index) const
    {
        assert(beat_index >= 0); // TO-DO: remove assert()
        
        return get_nextBeatLocation(beat_index) - beat_locations[beat_index];
    }

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

#endif // METER_H