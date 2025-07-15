#ifndef TRACKINFO_H
#define TRACKINFO_H

// std
#include <string>
#include <fstream>
#include <filesystem>
namespace fs = std::filesystem;

// json
#include "nlohmann/json.hpp"

struct TrackInfo
{
    std::string artist {};
    std::string album {};
    std::string title {};
    int release_year { 0 };
    bool is_explicit { false };
    
    bool init(const char* full_path)
    {
        if( !fs::exists(full_path) ) {
            printf("[TrackInfo::init] could not find '%s'! (does it exist?)\n", full_path);
            return false;
        }
        
        std::ifstream file(full_path);
        if( !file.is_open() ) {
            printf("[TrackInfo::init] could not open '%s'!\n", full_path);
            return false;
        }
        
        nlohmann::json j;
        file >> j;
        
        if( !j.contains("artist") ) {
            printf("[TrackInfo::init] '%s' has no 'artist'! (using default value 'idk')\n", full_path);
        }
        artist = j.value("artist", "idk");

        if( !j.contains("album") ) {
            printf("[TrackInfo::init] '%s' has no 'album'! (using default value 'idk')\n", full_path);
        }
        album = j.value("album", "idk");

        if( !j.contains("title") ) {
            printf("[TrackInfo::init] '%s' has no 'title'! (using default value 'idk')\n", full_path);
        }
        title = j.value("title", "idk");
        
        if( !j.contains("release_year") ) {
            printf("[TrackInfo::init] '%s' has no 'release_year'! (using default value '0')\n", full_path);
        } else {
            if( j["release_year"].is_number_integer() )
                release_year = j["release_year"].get<int>();
            else
                release_year = std::stoi( j["release_year"].get<std::string>() );
        }
        
        if( !j.contains("explicit") ) {
            printf("[TrackInfo::init] '%s' has no 'explicit! (using default value FALSE)\n", full_path);
        }
        is_explicit = j.value("explicit", false);
        
        return true;
    }
}; // TrackInfo

#endif // TRACKINFO_H