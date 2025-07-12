#ifndef TRACKLIST_H
#define TRACKLIST_H

#include "../InputState.h"
#include "../AudioState.h"

#include "Screen.h"

struct TrackList : Screen
{
    InputState& inputstate;
    AudioState& audiostate;

    TrackList(ScreenContext& ctx) :
        Screen(ctx),
        inputstate(ctx.inputstate),
        audiostate(ctx.audiostate)
    {}
    
    bool init() override
    {
        
    }
    
    void draw() override
    {
        NVGcontext* vg = ctx.windowstate.vg;
    }
}; // TrackList

#endif // TRACKLIST_H