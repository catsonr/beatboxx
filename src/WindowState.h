#ifndef WINDOWSTATE_H
#define WINDOWSTATE_H

#include <cstring>

#include <SDL3/SDL.h>

#include <glad/glad.h>

struct WindowState
{
    SDL_Window* window;
    SDL_GLContext* gl;
    
    // the width and height of the screen, in physical pixels
    int w, h;
    
    // display scale 
    // will be 1.0 for most displays, but >1.0 for high-DPI screens, which must be accounted for
    float ds;
    
    // whether or not BBXX is controling the mouse
    bool grab_focus { true };
    bool focused { false };
    
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
        ds = SDL_GetWindowDisplayScale(window);
        
        //printf("[WindowState::refresh]\n\twidth: %i\n\theight: %i\n\tdisplay scale: %f\n", w, h, ds);
    }
    
    void handle_event(SDL_Event *event)
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
}; // WindowState

#endif // WINDOWSTATE_H
