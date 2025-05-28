/*
    PaceMaker is a tool used to generate pacemakerfiles, which simply describe at what point
    in a track the beats happen
    these pacemakerfiles are loaded into Pace, which keeps track of the beat in a track
*/

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


#endif // PACEMAKER_H