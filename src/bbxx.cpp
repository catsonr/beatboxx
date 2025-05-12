#include "bbxx.h"

SDL_AppResult BBXX::init()
{
    SDL_WindowFlags windowflags =
        SDL_WINDOW_HIGH_PIXEL_DENSITY |
        SDL_WINDOW_ALWAYS_ON_TOP |
        SDL_WINDOW_RESIZABLE |
        SDL_WINDOW_INPUT_FOCUS |
        SDL_WINDOW_MOUSE_FOCUS;

    if (!SDL_CreateWindowAndRenderer("beatboxx!", WINDOW_WIDTH, WINDOW_HEIGHT, windowflags, &window, &renderer))
    {
        SDL_Log("[BBXX::init] failed to create window and/or renderer: %s", SDL_GetError());

        return SDL_APP_FAILURE;
    }
    printf("[BBXX::init] created SDL window and renderer\n");
    
    if (SDL_SetRenderVSync(renderer, SDL_RENDERER_VSYNC_ADAPTIVE))
    {
        SDL_Log("[BBXX::init] failed to enable vsync: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    printf("[BBXX::init] enabled vsync\n");
    
    fpscounter.init();
    
    return SDL_APP_CONTINUE;
}

void BBXX::draw()
{
    SDL_SetRenderDrawColor(renderer, 211, 255, 233, 255);
    SDL_RenderClear(renderer);

    fpscounter.iterate();
    fpscounter.draw(renderer);

    SDL_RenderPresent(renderer);
}