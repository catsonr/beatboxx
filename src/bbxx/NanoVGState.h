#ifndef NANOVGSTATE_H
#define NANOVGSTATE_H

#include <nanovg.h>

#include "utilities.h"
#include "WindowState.h"
#include "AudioState.h"

struct NanoVGState
{
    NanoVGState(WindowState& windowstate) :
        windowstate(windowstate)
    {}
    /* PUBLIC MEMBERS */
    NVGcontext* vg { nullptr };
    WindowState& windowstate;

    /* PUBLIC METHODS */
    bool init();
    //void draw(AudioState* audiostate);
    void cleanup();
    void draw_begin();
    void draw_end();
}; // NanoVGState

#endif // NANOVGSTATE_H
