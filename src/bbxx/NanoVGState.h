#ifndef NANOVGSTATE_H
#define NANOVGSTATE_H

#include <nanovg.h>

#include "utilities.h"
#include "WindowState.h"
#include "AudioState.h"

struct NanoVGState
{
    NVGcontext* vg { nullptr };
    WindowState* windowstate;

    bool init(WindowState* windowstate);
    void draw(AudioState* audiostate);
    void cleanup();
}; // NanoVGState

#endif // NANOVGSTATE_H
