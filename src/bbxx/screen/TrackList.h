#ifndef TRACKLIST_H
#define TRACKLIST_H

#include "../InputState.h"
#include "../AudioState.h"

#include "Screen.h"

struct TrackList : Screen
{
    InputState& inputstate;
    AudioState& audiostate;

    TrackList(WindowState& windowstate, InputState& inputstate, AudioState& audiostate) :
        Screen(windowstate),
        inputstate(inputstate),
        audiostate(audiostate)
    {}
    
    bool init() override
    {
        
    }
    
    void draw() override
    {
        NVGcontext* vg = windowstate.vg;
    }
}; // TrackList

#endif // TRACKLIST_H