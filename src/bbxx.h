#ifndef BBXX_H
#define BBXX_H

#define BBXVERSION "0.0.1"

#include <SDL3/SDL.h>

#include "InputState.h"
#include "AudioState.h"

#include "FPSCounter.h"
#include "KeyDisplay.h"

class BBXX
{
private:
    /* PRIVATE MEMBERS */
    int WINDOW_WIDTH { 1280 };
    int WINDOW_HEIGHT { 720 };
    const char *WINDOW_TITLE { "beatbox :)" };

    // state managing classes
    InputState inputstate;
    AudioState audiostate;
    
    // drawables classes
    FPSCounter fpscounter;
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
    
    int get_windowWidth() const { return WINDOW_WIDTH; }
    int get_windowHeight() const { return WINDOW_HEIGHT; }
}; // BBXX

#endif // BBXX_H