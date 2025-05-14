#ifndef FPSCOUNTER_H
#define FPSCOUNTER_H

#include <SDL3/SDL.h>

#include <cstdio>

struct FPSCounter
{
    uint64_t then, now, freq, dt;
    double timeElapsed, fps;

    void start()
    {
        freq = SDL_GetPerformanceFrequency();
        then = SDL_GetPerformanceCounter();
    }
    
    void iterate()
    {
        now = SDL_GetPerformanceCounter();

        dt = now - then;
        fps = (double)freq / dt;
        timeElapsed += (double)dt / freq;
        
        then = now;
    }
    
    void draw(SDL_Renderer *renderer)
    {
        SDL_SetRenderDrawColor(renderer, 10, 10, 60, 255 * 0.8f);

        int lineHeight = (int)SDL_DEBUG_TEXT_FONT_CHARACTER_SIZE;
        
        char FPS_string[32];
        snprintf(FPS_string, sizeof(FPS_string), "%.1f fps", fps);
        SDL_RenderDebugText(renderer, 0, lineHeight * 0, FPS_string);

        char timeElapsed_string[32];
        snprintf(timeElapsed_string, sizeof(timeElapsed_string), "%.1f seconds elapsed", timeElapsed);
        SDL_RenderDebugText(renderer, 0, lineHeight * 1, timeElapsed_string);
    }
}; // FPSCounter

#endif //FPSCOUNTER_H
