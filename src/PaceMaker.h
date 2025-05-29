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
    std::vector<double> beats;
    double start_position;
    
    bool started { false };
    
    int beats_per_bar { 4 };
    
    void start(Track* track)
    {
        this->track = track;
        
        track->play__force();

        beats.clear();
        started = true;
    }
    
    void beat()
    {
        if( !started ) return;

        beats.push_back( track->get_pos() );
        printf("[PaceMaker::beat] beat (%i) : #%i\n", (int)(beats.size()-1) % beats_per_bar + 1, (int)beats.size());
    }
}; // PaceMaker


#endif // PACEMAKER_H