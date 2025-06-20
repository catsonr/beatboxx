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
    
    if( nvgCreateFont(vg, "exile", util::get_fullPath("assets/fonts/Exile/Exile-Regular.ttf").c_str() ) == -1 ) {
        printf("[NanoVGState::init] failed to load font!\n");
        return false;
    }
    
    if( !windowstate ) {
        printf("[NanoVGState::init] cannot init with null windowstate!\n");
        return false;
    }
    this->windowstate = windowstate;
    
    return true;
}

void NanoVGState::draw(AudioState* audiostate)
{
    if( !audiostate ) {
        printf("[NanoVGState::draw] cannot draw null audio state!\n");
    }
    
    const Chart& chart = audiostate->bgm->chart;

    int w = windowstate->w;
    int h = windowstate->h;
    nvgBeginFrame(vg, w, h, windowstate->ds);
    
    // draw now line
    float now_x = w * 0.2f;
    nvgBeginPath(vg);
    nvgMoveTo(vg, now_x, 0);
    nvgLineTo(vg, now_x, h);
    nvgStrokeWidth(vg, 2.0f);
    nvgStrokeColor(vg, nvgRGBAf(0.0, 0.0, 0.0, 1.0));  // opaque white
    nvgStroke(vg);
    
    // draw circle
    const int forward = 25;
    const int behind  = 5;
    const float speed = 30;

    std::vector<float> beats;
    std::vector<float> notes;
    int start = chart.current_beat - behind >= 0 ? chart.current_beat - behind : 0;
    int64_t now_frame = int64_t(audiostate->bgm->get_frame());
    for(int i = start; i < chart.current_beat + forward && i < chart.beats.size(); i++)
    {
        // save on screen beats
        int64_t beat_frame = int64_t(chart.beats[i]);
        int64_t dFrame = beat_frame - now_frame;
        float dist_from_now = float(dFrame) / float(audiostate->bgm->length_frames);

        beats.push_back(dist_from_now * speed);
        
        // save on screen notes
        for(const Note& note : chart.get_beat_notes(i)) {
            float noteDist = ((float(chart.beats[i]) + note.pos * float(chart.get_dFrames(i)) - float(now_frame)) / float(audiostate->bgm->length_frames));

            notes.push_back(noteDist * speed);
        }
    }

    // draw all beat lines
    for(const float pos : beats)
    {
        float x = now_x + pos * w;
        float y = h / 2;
        
        nvgBeginPath(vg);
        nvgMoveTo(vg, x, 0);
        nvgLineTo(vg, x, h);
        nvgStrokeWidth(vg, 2.0f);
        nvgStrokeColor(vg, nvgRGBAf(0.9, 0.2, 0.1, 1.0));  // opaque white
        nvgStroke(vg);
    }
    
    // draw all notes
    for(const float pos : notes)
    {
        float x = now_x + pos * w;
        float y = h / 2;
        
        nvgBeginPath(vg);
        nvgMoveTo(vg, x, 0);
        nvgLineTo(vg, x, h);
        nvgStrokeWidth(vg, 2.0f);
        nvgStrokeColor(vg, nvgRGBAf(0.0, 0.2, 1.0, 1.0));  // opaque white
        nvgStroke(vg);
    }

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