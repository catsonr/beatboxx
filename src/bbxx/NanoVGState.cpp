#include "NanoVGState.h"

/*
   NanoVG requires some #define gl_implementation in some .cpp once and only once,
   so i do it here, as well as (old) draw()
*/
#include <glad/glad.h>
#ifdef __EMSCRIPTEN__
#define NANOVG_GLES3_IMPLEMENTATION
#else
#define NANOVG_GL3_IMPLEMENTATION
#endif
#include <nanovg.h>
#include <nanovg_gl.h>

bool NanoVGState::init()
{
    // create nanovg instance
#ifdef __EMSCRIPTEN__
    vg = nvgCreateGLES3(NVG_ANTIALIAS | NVG_STENCIL_STROKES);
#else
    vg = nvgCreateGL3(NVG_ANTIALIAS | NVG_STENCIL_STROKES);
#endif

    if ( !vg ) {
        printf("[NanoVGState::init] failed to create nvg context!\n");
        return false;
    }
    
    if( !init_fonts() ) {
        printf("[NanoVGStte::init] failed to initalize fonts!\n");
        return false;
    }
    
    windowstate.vg = vg;
    
    return true;
}

bool NanoVGState::init_fonts()
{
    if( nvgCreateFont(vg, "exile", util::get_fullPath("assets/fonts/Exile/Exile-Regular.ttf").c_str() ) == -1 ) {
        printf("[NanoVGState::init] failed to load exile font!\n");
        return false;
    }
    fonts.push_back("exile");

    if( nvgCreateFont(vg, "doto", util::get_fullPath("assets/fonts/Doto/Doto-VariableFont_ROND,wght.ttf").c_str() ) == -1 ) {
        printf("[NanoVGState::init] failed to load font!\n");
        return false;
    }
    fonts.push_back("doto");
    
    return true;
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

void NanoVGState::draw_begin()
{
    nvgBeginFrame(vg, windowstate.w, windowstate.h, windowstate.ds);
}
void NanoVGState::draw_end()
{
    nvgEndFrame(vg);
}