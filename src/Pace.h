#ifndef PACE_H
#define PACE_H

#include <vector>

#include <SDL3/SDL.h>

#include "utilities.h"

struct Pace
{
    int beats_per_measure { 4 };
    std::vector<std::vector<double>> measures;
    std::vector<double> beats;
    
    double offset { 0.12 };
    
    bool parse(const char* path_to_pacemakerfile)
    {
        std::string fullpath = util::get_fullPath(path_to_pacemakerfile);
        std::ifstream file(fullpath);
        if( !file.is_open() ) {
            SDL_Log("[Pace::init] failed to open file '%s\n", fullpath.c_str());
            return false;
        }
        
        std::string line;
        
        // read all lines into beats
        while( std::getline(file, line) )
        {
            // skips blank line or comment
            auto first = line.find_first_not_of(" \t");
            if( first == std::string::npos ) continue;
            line = line.substr(first);
            if(line.empty() || line[0] == '#') continue;
            
            // reads line
            try
            {
                double t = std::stod(line);
                beats.push_back(t);
                //printf("beat #%d @ t=%.3f\n", (int)beats.size(), beats.back());
            }
            catch(const std::exception& e)
            {
                SDL_Log("bad line '%s': %s\n", line.c_str(), e.what());
                return false;
            }
        }
        
        // divide beats into measures 
        measures.clear();
        for(size_t i = 0; i < beats.size(); i += beats_per_measure)
        {
            size_t count = std::min<size_t>(beats_per_measure, beats.size() - i);
            measures.emplace_back(beats.begin() + i, beats.begin() + i + count);
        }
        
        return true;
    }
    
    bool init(const char* path_to_pacemakerfile)
    {
        if( !parse(path_to_pacemakerfile) ) {
            printf("[Pace::init] unable to initialize pace! failed to parse '%s'!\n", path_to_pacemakerfile);
            return false;
        }
        
        return true;
    }
    
    size_t currentbeat { 0 };
    void start()
    {
        currentbeat = 0;
    }

    // assumes 'now' is track position
    bool iterate(double now)
    {
        now += offset;

        if( currentbeat < beats.size() && now >= beats[currentbeat] ) {
            //printf("beat %i!\n", (int)currentbeat);
            currentbeat++;
            return true;
        }
        
        return false;
    }
}; // Pace

#endif // PACE_H