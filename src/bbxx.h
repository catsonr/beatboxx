#ifndef BBXX_H
#define BBXX_H

#define BBXVERSION "0.0.1"

// c++ headers
#include <cstdio>

// SDL headers
#include <SDL3/SDL.h>

// glad headers
#include <glad/glad.h>

// BBXX state classes
#include "FPSCounter.h"
#include "InputState.h"
#include "AudioState.h"
#include "WindowState.h"
#include "GLState.h"
#include "ImguiState.h"
#include "Miku.h"

#include "MSDFState.h"

class BBXX
{
private:
    /* PRIVATE MEMBERS */
    int WINDOW_WIDTH { 1280 };
    int WINDOW_HEIGHT { 720 };
    int WINDOW_WIDTH_MIN { 800 };
    int WINDOW_HEIGHT_MIN { 600 };
    const char *WINDOW_TITLE { "beatboxx 🎵" };

    // state managing classes
    FPSCounter fpscounter;
    InputState inputstate;
    AudioState audiostate;
    WindowState windowstate;
    
    GLState glstate;
    ImguiState imguistate;
    
    Miku miku;
    
    MSDFState msdfstate;

public:
    /* PUBLIC MEMBERS */
    SDL_Window *window { nullptr };
    SDL_Renderer *renderer { nullptr };
    SDL_GLContext gl { nullptr };
    
    /* PUBLIC METHODS */
    SDL_AppResult init();
    void iterate();
    void draw();
    SDL_AppResult handle_event(SDL_Event *event);
    void quit();
}; // BBXX

#endif // BBXX_H