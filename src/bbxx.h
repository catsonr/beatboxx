#ifndef BBXX_H
#define BBXX_H

#define BBXVERSION "0.0.1"

#include <SDL3/SDL.h>

#include "FPSCounter.h"
#include "InputState.h"

#include "KeyDisplay.h"

class BBXX
{
private:
    /* PRIVATE MEMBERS */
    int WINDOW_WIDTH { 800 };
    int WINDOW_HEIGHT { 600 };
    const char *WINDOW_TITLE { "beatbox :)" };

    FPSCounter fpscounter;
    InputState inputstate;
    KeyDisplay keydisplay;

public:
    /* PUBLIC MEMBERS */
    SDL_Window *window { nullptr };
    SDL_Renderer *renderer { nullptr };
    
    /* PUBLIC METHODS */
    SDL_AppResult init();
    void iterate();
    void draw();
    SDL_AppResult handle_event(SDL_Event *event);
}; // BBXX


#endif