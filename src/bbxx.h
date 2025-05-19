#ifndef BBXX_H
#define BBXX_H

#define BBXVERSION "0.0.1"

// SDL headers
#include <SDL3/SDL.h>

// RmlUi headers
#include <RmlUi/Core.h>
#include <RmlUi/Debugger.h>
#include "RmlUi_Platform_SDL.h"
#include "RmlUi_Renderer_GL3.h"

// BBXX state classes
#include "InputState.h"
#include "AudioState.h"
#include "RenderState.h"

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
    int WINDOW_WIDTH_MIN { 800 };
    int WINDOW_HEIGHT_MIN { 600 };
    const char *WINDOW_TITLE { "beatboxx :)" };
    
    Rml::Context *rml_ctx { nullptr };
    SystemInterface_SDL *rml_system_interface { nullptr };
    RenderInterface_GL3 *rml_render_interface { nullptr };

    // state managing classes
    InputState inputstate;
    AudioState audiostate;
    RenderState renderstate;
    
    // drawables classes
    FPSCounter fpscounter;
    KeyDisplay keydisplay;
    
    // beatboxx specific classes
    SongSelect songselect;

public:
    /* PUBLIC MEMBERS */
    SDL_Window *window { nullptr };
    SDL_Renderer *renderer { nullptr };
    
    // display scale
    static float ds;
    
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