#ifndef FPSCOUNTER_H
#define FPSCOUNTER_H

#include <SDL3/SDL.h>

struct FPSCounter
{
    /* PUBLIC MEMBERS */
    uint64_t then, now, dt;
    uint64_t freq { SDL_GetPerformanceFrequency() };
    
    float seconds { 0 };
    float d_seconds { 0 };

    float fps, ema_fps;
    const float alpha = 0.1f;

    /* PUBLIC METHODS */
    void start()
    {
        then = SDL_GetPerformanceCounter();
    }

    void iterate()
    {
        now = SDL_GetPerformanceCounter();
        
        dt = now - then;
        d_seconds = (float)dt / freq;
        seconds += d_seconds;

        fps = 1.0 / d_seconds;
        if (ema_fps == 0.0f)
            ema_fps = fps;
        else
            ema_fps += alpha * (fps - ema_fps);

        then = now;
    }
}; // FPSCounter

#endif // FPSCounter