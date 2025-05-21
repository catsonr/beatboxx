#ifndef WINDOWSTATE_H
#define WINDOWSTATE_H

#include <SDL3/SDL.h>
#include <cstring>

struct WindowState
{
    SDL_Window *window;
    
    // the width and height of the screen, in physical pixels
    int w, h;
    
    // display scale 
    // will be 1.0 for most displays, but >1.0 for high-DPI screens, which must be accounted for
    float ds;
    
    bool init(SDL_Window *window)
    {
        if( !window ) {
            printf("[WindowState::init] unable to initialize WindowState. cannot use null window!\n");
            return false;
        }
        this->window = window;

        refresh();

        return true;
    }
    
    void refresh()
    {
        if( !window )
        {
            printf("[WindowState::refresh] window is null. call WindowState::init()!!\n");
            return;
        }

        SDL_GetWindowSizeInPixels(window, &w, &h);
        ds = SDL_GetWindowDisplayScale(window);
        
        //printf("[WindowState::refresh]\n\twidth: %i\n\theight: %i\n\tdisplay scale: %f\n", w, h, ds);
    }
    
    void handle_event(SDL_Event *event)
    {
        if(event->type == SDL_EVENT_WINDOW_RESIZED) {
            printf("[WindowState::handle_event] window resize\n");
            
            refresh();
        }
        if(event->type == SDL_EVENT_WINDOW_DISPLAY_CHANGED) {
            printf("[WindowState::handle_event] display change\n");
            
            refresh();
        }
    }
}; // WindowState

#endif // WINDOWSTATE_H
