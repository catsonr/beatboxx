#include "NanoVGState.h"


/*
   NanoVG requires some #define gl_implementation in some .cpp once and only once,
   so i do it here, as well as function definitions
*/
#include <glad/glad.h>
#ifdef __EMSCRIPTEN__
#define NANOVG_GLES3_IMPLEMENTATION
#else
#define NANOVG_GL3_IMPLEMENTATION
#endif
#include <nanovg.h>
#include <nanovg_gl.h>

bool NanoVGState::init(WindowState* windowstate)
{
#ifdef __EMSCRIPTEN__
    vg = nvgCreateGLES3(NVG_ANTIALIAS | NVG_STENCIL_STROKES);
#else
    vg = nvgCreateGL3(NVG_ANTIALIAS | NVG_STENCIL_STROKES);
#endif

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
#ifdef __EMSCRIPTEN__
        nvgDeleteGLES3(vg);
#else
        nvgDeleteGL3(vg);
#endif
        vg = nullptr;
    }
}