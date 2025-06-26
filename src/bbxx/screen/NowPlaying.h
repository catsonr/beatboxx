#ifndef NOWPLAYING_H
#define NOWPLAYING_H

#include <nanovg.h>

#include "../AudioState.h"
#include "../InputState.h"
#include "Screen.h"

#include "../audio/Run.h"

struct NowPlaying : Screen
{
    AudioState& audiostate;
    InputState& inputstate;
    
    /* NowPlaying only tracks the run of the first loaded track!!!!! switching tracks w/ imguiAudioState wont do anything */
    Run run { audiostate.bgm->chart };
    
    uint64_t latest_click { 0 };

    NowPlaying(WindowState& windowstate, AudioState& audiostate, InputState& inputstate) :
        Screen(windowstate),
        audiostate(audiostate),
        inputstate(inputstate)
    {
        run.init();
    }
    
    void iterate() override
    {
        run.iterate(audiostate.bgm->get_frame());
    }

    void handle_event(const SDL_Event* event) override
    {
        Track* current_track = audiostate.bgm;

        if( inputstate.key_pressed(SDL_SCANCODE_P) ) {
            if( current_track->playing ) {
                audiostate.bgm->pause();
            }
            else {
                audiostate.bgm->play();
            }
        }
        else if( inputstate.key_pressed(SDL_SCANCODE_SPACE) ) run.button_pressed(current_track->get_frame(), buttons::space);

        else if( inputstate.key_released(SDL_SCANCODE_SPACE) ) run.button_released(current_track->get_frame(), buttons::space);
    }
    
    void draw() override
    {
        // constants 
        NVGcontext* vg = windowstate.vg;
        const Chart& chart = audiostate.bgm->chart;
        const float w = (float)windowstate.w;
        const float h = (float)windowstate.h;
        
        Track* bgm = audiostate.bgm;
        if( !bgm ) return; // TODO: better error checking
        
        const double now = bgm->frame_to_pos( bgm->get_frame() );
        const float now_x = w * 0.25f;
        const double rightside_space = w - now_x;

        // draw now line
        nvgBeginPath(vg);
        nvgMoveTo(vg, now_x, 0);
        nvgLineTo(vg, now_x, h);
        if( inputstate.key_down(SDL_SCANCODE_SPACE) )
            nvgStrokeWidth(vg, 5.0f);
        else
            nvgStrokeWidth(vg, 1.0f);
        nvgStrokeColor(vg, nvgRGBAf(1.0, 1.0, 1.0, 1.0));
        nvgStroke(vg);
        
        /*
        // draw mouse_y line
        nvgBeginPath(vg);
        nvgMoveTo(vg, 0, inputstate.mouse_y * windowstate.ds);
        nvgLineTo(vg, w, inputstate.mouse_y * windowstate.ds);
        nvgStrokeWidth(vg, 1.0f);
        nvgStrokeColor(vg, nvgRGBAf(1.0, 1.0, 1.0, 1.0));
        nvgStroke(vg);
        */
        
        // draw beat lines
        const float speed = 120.0f; // speed of 1.0 -> entire chart is on screen
        for(int i = 0; i < (int)chart.beats.size(); i++)
        {
            double beat_pos = bgm->frame_to_pos(chart.beats[i]) - now;
            double nextbeat_pos = bgm->frame_to_pos(chart.beats[i + 1]) - now;
            double d_pos = nextbeat_pos - beat_pos;
            
            float one_x = now_x + float(beat_pos * rightside_space*speed);
            float ti_x = now_x + float((beat_pos + 0.25*d_pos) * rightside_space*speed);
            float te_x = now_x + float((beat_pos + 0.50*d_pos) * rightside_space*speed);
            float ta_x = now_x + float((beat_pos + 0.75*d_pos) * rightside_space*speed);

            auto drawline = [&](float x, NVGcolor c, float alpha, float strokewidth=1.0f)
            {
                float xx = floor(x) + 0.5;
                nvgBeginPath(vg);
                nvgMoveTo(vg, xx, 0);
                nvgLineTo(vg, xx, h);
                nvgStrokeWidth(vg, strokewidth);
                nvgStrokeColor(vg, nvgRGBAf(c.r, c.g, c.b, alpha));
                nvgStroke(vg);
            };
            
            const NVGcolor beatcolor = nvgRGBf(0.8, 0.8, 0.8);
            const NVGcolor notecolor = nvgRGBf(0.2, 0.6, 0.9);
            const NVGcolor note_hitcolor = nvgRGBf(0.2, 0.6, 0.2);
            
            drawline(one_x, beatcolor, 1.0);
            drawline(ti_x, beatcolor, 0.25 / 2);
            drawline(te_x, beatcolor, 0.50 / 2);
            drawline(ta_x, beatcolor, 0.25 / 2);
            
            // drar note lines
            for(const Note& note : chart.get_beat_notes(i))
            {
                float note_x = now_x + float((beat_pos + note.pos*d_pos) * rightside_space*speed);
                drawline(note_x, notecolor, 1.0, 4.0);
            }
        }
    }
}; // NowPlaying

#endif // NOWPLAYING_H