#ifndef NANOVGSTATE_H
#define NANOVGSTATE_H

#include <string>
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
    
    std::vector<const char*> fonts;

    /* PUBLIC METHODS */
    bool init();
    bool init_fonts();
    //void draw(AudioState* audiostate);
    void cleanup();
    void draw_begin();
    void draw_end();
}; // NanoVGState

#endif // NANOVGSTATE_H
