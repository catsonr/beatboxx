#ifndef PACEMAKER_H
#define PACEMAKER_H

#include <vector>

#include "Track.h"
#include "utilities.h"

struct PaceMaker
{
    Track* track { nullptr };
    std::vector<double> beat_positions;
    double start_position;
    
    int beats_per_bar { 4 };
    
    PaceMaker(Track* t) : track(t) {}
    
    void start()
    {
        beat_positions.clear();
    }
    
    void beat()
    {
        beat_positions.push_back( track->get_pos() );
        printf("[PaceMaker::beat] beat (%i) : #%i\n", (int)(beat_positions.size()-1) % beats_per_bar + 1, (int)beat_positions.size());
    }

    std::string serialize() const
    {
        std::ostringstream ss;
        ss << "# i am a comment. i will be ignored!\n";
        ss << "# pacemaker positions for " << track->path << "\n";
        ss << "# " << beat_positions.size() << " total beats\n";
        ss << "# (assuming " << beats_per_bar << " beats per measure)\n";

        for (size_t i = 0; i < beat_positions.size(); ++i)
        {
            if(i % beats_per_bar == 0) {
                ss << "# measure " << i / beats_per_bar << "\n";
            }
            ss << beat_positions[i] << "\n";
        }
        return ss.str();
    }

    void save()
    {
        util::save_file_string("assets/out/lamp.pacemaker", serialize());
    }
}; // PaceMaker

struct Pace
{
    int beats_per_measure { 4 };
    std::vector<std::vector<double>> measure;
    
    bool init(const char* path_to_pacemakerfile)
    {
        std::string fullpath = util::get_fullPath(path_to_pacemakerfile);
        std::ifstream file(fullpath);
        if( !file.is_open() ) {
            SDL_Log("[Pace::init] failed to open file '%s\n", fullpath.c_str());
            return false;
        }
        
        std::string line;
        std::vector<double> beats;
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
                printf("beat #%d @ t=%.3f\n", (int)beats.size(), beats.back());
            }
            catch(const std::exception& e)
            {
                SDL_Log("bad line '%s': %s\n", line.c_str(), e.what());
            }
        }

        return true;
    }
};

#endif // PACEMAKER_H