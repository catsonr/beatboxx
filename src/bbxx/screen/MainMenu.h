#ifndef MAINMENU_H
#define MAINMENU_H

#include "Screen.h"

struct MainMenu : Screen
{
    float t { 0 };
    MainMenu(WindowState& windowstate) :
        Screen(windowstate)
    {}
    
    void iterate() override
    {
        t += 0.01;
    }

    void draw() override
    {
        NVGcontext* vg = windowstate.vg;
        float W = (float)windowstate.w;
        float H = (float)windowstate.h;

        // 1) Full-screen gradient background
        nvgBeginPath(vg);
        nvgRect(vg, 0, 0, W, H);
        // create a diagonal gradient from top-left to bottom-right
        NVGpaint bg = nvgLinearGradient(vg,
                                        0, 0,                             // start
                                        W, H,                             // end
                                        nvgRGBAf(0.1f, 0.1f, 0.3f, 1.0f), // dark navy
                                        nvgRGBAf(0.8f, 0.2f, 0.4f, 1.0f)  // pinkish
        );
        nvgFillPaint(vg, bg);
        nvgFill(vg);

        // 2) Center circle
        float cx = W * 0.5f;
        float cy = H * 0.5f;
        float radius = std::min(W, H) * 0.4f;
        nvgBeginPath(vg);
        nvgCircle(vg, cx, cy, radius);
        nvgFillColor(vg, nvgRGBAf(1, 1, 1, 0.3f)); // white @30%
        nvgFill(vg);

        // 4) Centered title text
        nvgFontSize(vg, 340.0f + sin(t));
        nvgFontFace(vg, "exile");
        nvgTextAlign(vg, NVG_ALIGN_CENTER | NVG_ALIGN_MIDDLE);
        nvgFillColor(vg, nvgRGBAf(1, 1, 1, 0.9f));
        nvgText(vg, cx, cy, "BeatBoxx", nullptr);
    }
}; // MainMenu

#endif // MAINMENU_H