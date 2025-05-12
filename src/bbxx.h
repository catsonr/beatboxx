#ifndef BBXX_H
#define BBXX_H

#include <SDL3/SDL.h>

struct FPSCounter
{
    uint64_t then, now, freq, dt;
    double timeElapsed, fps;

    void init()
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
        SDL_SetRenderDrawColor(renderer, 10, 10, 60, 255);

        int lineHeight = (int)SDL_DEBUG_TEXT_FONT_CHARACTER_SIZE;
        
        char FPS_string[32];
        snprintf(FPS_string, sizeof(FPS_string), "%.1f fps", fps);
        SDL_RenderDebugText(renderer, 0, lineHeight * 0, FPS_string);

        char timeElapsed_string[32];
        snprintf(timeElapsed_string, sizeof(timeElapsed_string), "%.1f seconds elapsed", timeElapsed);
        SDL_RenderDebugText(renderer, 0, lineHeight * 1, timeElapsed_string);
    }
};

class BBXX
{
public:
    int WINDOW_WIDTH { 800 };
    int WINDOW_HEIGHT { 600 };

    SDL_Window *window { nullptr };
    SDL_Renderer *renderer { nullptr };
    
    FPSCounter fpscounter;
    
    /* PUBLIC METHODS */
    SDL_AppResult init();
    void draw();
};


#endif