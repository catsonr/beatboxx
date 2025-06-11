#ifndef FPSCOUNTER_H
#define FPSCOUNTER_H

#include <SDL3/SDL.h>

struct FPSCounter
{
    /* PUBLIC MEMBERS */
    uint64_t then { 0 }, now { 0 }, dt { 0 };
    uint64_t freq { SDL_GetPerformanceFrequency() };
    double one_over_freq { 1.0f / (double)freq };
    
    float seconds { 0 };
    float d_seconds { 0 };

    float fps { 0 }, ema_fps { 0 };

    /* PUBLIC METHODS */
    void start()
    {
        then = SDL_GetPerformanceCounter();
    }

    void iterate()
    {
        now = SDL_GetPerformanceCounter();
        dt = now - then;
        if(dt == 0) return;
        
        d_seconds = (float)dt * one_over_freq;
        seconds += d_seconds;

        fps = 1.0 / d_seconds;
        if (ema_fps == 0.0f)
            ema_fps = fps;
        else
            ema_fps += 0.1f * (fps - ema_fps);

        then = now;
    }
}; // FPSCounter

#endif // FPSCounter