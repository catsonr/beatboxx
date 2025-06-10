#ifndef NANOVGSTATE_H
#define NANOVGSTATE_H

#include <nanovg.h>

#include "WindowState.h"

struct NanoVGState
{
    NVGcontext* vg { nullptr };
    WindowState* windowstate;

    bool init(WindowState* windowstate);
    void draw();
    void cleanup();
}; // NanoVGState

#endif // NANOVGSTATE_H
