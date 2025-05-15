#ifndef BBXX_H
#define BBXX_H

#define BBXVERSION "0.0.1"

// SDL headers
#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

// BBXX state classes
#include "InputState.h"
#include "AudioState.h"
#include "TextRender.h"

// BBXX drawable utilities 
#include "FPSCounter.h"
#include "KeyDisplay.h"

// beatboxx specific utilities
#include "SongSelect.h"

class BBXX
{
private:
    /* PRIVATE MEMBERS */
    int WINDOW_WIDTH { 1280 };
    int WINDOW_HEIGHT { 720 };
    const char *WINDOW_TITLE { "beatboxx :)" };

    // state managing classes
    InputState inputstate;
    AudioState audiostate;
    TextRender textrender;
    
    // drawables classes
    FPSCounter fpscounter;
    KeyDisplay keydisplay;
    
    // beatboxx specific classes
    SongSelect songselect;

public:
    /* PUBLIC MEMBERS */
    SDL_Window *window { nullptr };
    SDL_Renderer *renderer { nullptr };
    
    /* PUBLIC METHODS */
    SDL_AppResult init();
    void iterate();
    void draw();
    SDL_AppResult handle_event(SDL_Event *event);
    void quit();
    
    int get_windowWidth() const { return WINDOW_WIDTH; }
    int get_windowHeight() const { return WINDOW_HEIGHT; }
}; // BBXX

#endif // BBXX_H