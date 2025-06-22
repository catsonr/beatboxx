#ifndef BBXX_H
#define BBXX_H

// SDL
#include <SDL3/SDL.h>

// glad
#include <glad/glad.h>

// bbxx
#include "FPSCounter.h"
#include "InputState.h"
#include "AudioState.h"
#include "WindowState.h"
#include "GLState.h"
#include "ImguiState.h"
#include "NanoVGState.h"

// bbxx screens
#include <memory> // for smart pointers
#include "screen/DebugGUI.h"
#include "screen/MainMenu.h"
#include "screen/NowPlaying.h"
#include "screen/Screen.h"

class BBXX
{
private:
    /* PRIVATE MEMBERS */
    const int WINDOW_WIDTH_INITIAL { 1280 };
    const int WINDOW_HEIGHT_INITIAL { 720 };
    const int WINDOW_WIDTH_MIN { 800 };
    const int WINDOW_HEIGHT_MIN { 600 };
    const char* WINDOW_TITLE { "beatboxx 🎵" };
    const char* BBXX_VERSION { "pre-alpha 1.0"};

    SDL_WindowFlags windowflags =
        //SDL_WINDOW_FULLSCREEN |
        //SDL_WINDOW_ALWAYS_ON_TOP |
        SDL_WINDOW_OPENGL |
        SDL_WINDOW_HIGH_PIXEL_DENSITY |
        SDL_WINDOW_RESIZABLE |
        SDL_WINDOW_INPUT_FOCUS |
        SDL_WINDOW_MOUSE_FOCUS;

    // state managing classes
    FPSCounter fpscounter;
    InputState inputstate;
    AudioState audiostate;
    WindowState windowstate;

    GLState glstate;
    NanoVGState nanovgstate { windowstate };
    
    ImguiStateDrawArgs imguistatedrawargs { fpscounter, audiostate };
    ImguiState imguistate { imguistatedrawargs };
    
    MainMenu mainmenu { windowstate };
    std::vector< std::unique_ptr<Screen> > screens;
    
public:
    /* PUBLIC MEMBERS */
    SDL_Window* window { nullptr };
    SDL_Renderer* renderer { nullptr };
    SDL_GLContext gl { nullptr };
    
    /* PUBLIC METHODS */
    SDL_AppResult init();
    void iterate();
    void draw();
    SDL_AppResult handle_event(const SDL_Event *event);
    void quit();
}; // BBXX

#endif // BBXX_H