/*
    PaceMaker is a tool used to generate pacemakerfiles, which simply describe at what point
    in a track the beats happen
    these pacemakerfiles are loaded into Pace, which keeps track of the beat in a track
*/

#ifndef PACEMAKER_H
#define PACEMAKER_H

#include <vector>

#include <SDL3/SDL.h>

#include "Track.h"
#include "utilities.h"

struct PaceMaker
{
    // the track being used
    Track* track { nullptr };

    // beat times in seconds since start of track
    std::vector<double> beats;
    
    uint64_t startTime_ticks { 0 };
    double one_over_freq { 1.0f / (double)SDL_GetPerformanceFrequency() };

    bool started { false };
    int beats_per_bar { 4 };
    
    void start(Track* track)
    {
        this->track = track;
        
        started = true;
        beats.clear();

        track->play__force();
        startTime_ticks = SDL_GetPerformanceCounter();
    }
    
    void beat()
    {
        if( !started ) return;

        uint64_t now = SDL_GetPerformanceCounter();
        uint64_t dt = now - startTime_ticks;
        
        double elapsedTime = (double)dt * one_over_freq;
        
        beats.push_back(elapsedTime);
        
        printf("[PaceMaker::beat] beat %d @ t=%f seconds\n", (int)beats.size(), beats.back());
    }
}; // PaceMaker


#endif // PACEMAKER_H