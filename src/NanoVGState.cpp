#include <glad/glad.h>
#define NANOVG_GL3_IMPLEMENTATION
#include <nanovg.h>
#include <nanovg_gl.h>

#include "NanoVGState.h"

bool NanoVGState::init(WindowState* windowstate)
{
    vg = nvgCreateGL3(NVG_ANTIALIAS | NVG_STENCIL_STROKES);

    if ( !vg ) {
        printf("[NanoVGState::init] failed to create nvg context!\n");
        return false;
    }
    
    if( !windowstate ) {
        printf("[NanoVGState::init] cannot init with null windowstate!\n");
        return false;
    }
    this->windowstate = windowstate;
    
    return true;
}

void NanoVGState::draw()
{
    nvgBeginFrame(vg, windowstate->w, windowstate->h, windowstate->ds);
    
    float t = static_cast<float>(SDL_GetTicks()) * 0.001f;  // seconds
    float cx = windowstate->w * 0.5f;
    float cy = windowstate->h * 0.5f;
    float r  = 30 + 10 * sin(t * 2.0f);
    nvgBeginPath(vg);
    nvgCircle(vg, cx, cy, r);
    nvgFillColor(vg, nvgRGBA(255, 64, 64, 220));
    nvgFill(vg);
    
    nvgEndFrame(vg);
}

void NanoVGState::cleanup()
{
    if( vg ) {
        nvgDeleteGL3(vg);
        vg = nullptr;
    }
}