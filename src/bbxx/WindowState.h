#ifndef WINDOWSTATE_H
#define WINDOWSTATE_H

// std
#include <cstring>

// SDL
#include <SDL3/SDL.h>

// glad
#include <glad/glad.h>

// nanovg
#include <nanovg.h>

// bbxx
#include "utilities.h"

struct WindowState
{
    SDL_Window* window;

    // the global opengl context
    SDL_GLContext* gl;
    // the global nanovg context
    NVGcontext* vg { nullptr };
    
    // the width and height of the screen, in PHYSICAL pixels
    int w, h;
    
    // the width and height of the screen, in LOGICAL pixels
    int w_l, h_l;
    
    // display scale 
    // will be 1.0 for most displays, but >1.0 for high-DPI screens, which must be accounted for
    float ds;
    
    // if bbxx will try to grab focus of the mouse
    bool grab_focus { true };

    // if the mouse is focused to the window
    bool focused { false };
    
    bool fullscreened { false };
    
    // common, shared colors
    util::Color color_highlight { 237/255.0f, 242/255.0f, 244/255.0f };
    util::Color color_midtone { 141/255.0f, 153/255.0f, 174/255.0f };
    util::Color color_shadow { 43/255.0f, 45/255.0f, 66/255.0f };
    
    bool init(SDL_Window *window, SDL_GLContext* gl)
    {
        if( !window ) {
            printf("[WindowState::init] unable to initialize WindowState. cannot use null SDL_Window!\n");
            return false;
        }
        this->window = window;

        if( !gl ) {
            printf("[WindowState::init] unable to initialize WindowState. cannot use null SDL_GLContext!\n");
            return false;
        }
        this->gl = gl;

        refresh();

        return true;
    }
    
    void refresh()
    {
        SDL_GetWindowSizeInPixels(window, &w, &h);
        SDL_GetWindowSize(window, &w_l, &h_l);
        ds = SDL_GetWindowDisplayScale(window);
    }
    
    void handle_event(const SDL_Event *event)
    {
        if(event->type == SDL_EVENT_WINDOW_RESIZED)
        {
            printf("[WindowState::handle_event] window resize\n");
            
            refresh();
        }

        else if(event->type == SDL_EVENT_WINDOW_DISPLAY_CHANGED)
        {
            printf("[WindowState::handle_event] display change\n");
            
            refresh();
        }
        
        else if( grab_focus )
        {
            // if '[' pressed
            if ( event->type == SDL_EVENT_KEY_DOWN && event->key.scancode == SDL_SCANCODE_LEFTBRACKET )
            {
                if( !fullscreen(true) ) {
                    printf("[WindowState::handle_event] failed to enter fullscreen!\n");
                }
            }

            if ( event->type == SDL_EVENT_KEY_DOWN && event->key.scancode == SDL_SCANCODE_RIGHTBRACKET )
            {
                if( !fullscreen(false) ) {
                    printf("[WindowState::handle_event] failed to exit fullscreen!\n");
                }
            }

            // if ctrl + left click
            if ( !focused &&
                event->type == SDL_EVENT_MOUSE_BUTTON_DOWN &&
                event->button.button == SDL_BUTTON_LEFT &&
                SDL_GetModState() & SDL_KMOD_CTRL
            )
            {
                printf("[WindowState::handle_event] window focus grab\n");
                
                focused = true;

                SDL_HideCursor();
                SDL_SetWindowRelativeMouseMode(window, true);
                SDL_SetWindowMouseGrab(window, true);
            }

            else if ( focused && event->type == SDL_EVENT_KEY_DOWN && event->key.scancode == SDL_SCANCODE_ESCAPE)
            {
                printf("[WindowState::handle_event] window focus release\n");

                focused = false;

                SDL_ShowCursor();
                SDL_SetWindowRelativeMouseMode(window, false);
                SDL_SetWindowMouseGrab(window, false);
            }
        }
    }
    
    bool fullscreen(bool request_open=true)
    {
        if( !SDL_SetWindowFullscreen(window, request_open) )
        {
            printf("[WindowState::fullscreen] unable to %s fullscreen!\n", (request_open) ? "enter" : "exit");
            return false;
        } else
        {
            fullscreened = request_open;
            return true;
        }
    }
}; // WindowState

#endif // WINDOWSTATE_H
