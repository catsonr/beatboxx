#ifndef RENDERSTATE_H
#define RENDERSTATE_H

#include <SDL3/SDL.h>
#include <cstring>

struct RenderState
{
    // SDL renderer
    SDL_Renderer *renderer;
    // SDL window
    SDL_Window *window;
    
    // the width and height of the screen, in physical pixels
    int w, h;
    
    // display scale 
    // will be 1.0 for most displays, but >1.0 for high-DPI screens, which must be accounted for
    float ds;
    
    bool init(SDL_Window *window, SDL_Renderer *renderer)
    {
        if( !window ) {
            printf("[RenderState::init] unable to initialize RenderState. cannot use null window!\n");
            return false;
        }
        this->window = window;

        if( !renderer ) {
            printf("[RenderState::init] unable to initialize RenderState. cannot use null renderer!\n");
            return false;
        }
        this->renderer = renderer;
        
        refresh();

        return true;
    }
    
    void refresh()
    {
        SDL_GetWindowSizeInPixels(window, &w, &h);
        ds = SDL_GetWindowDisplayScale(window);
        
        printf("[RenderState::refresh]\n\twidth: %i\n\theight: %i\n\tdisplay scale: %f\n", w, h, ds);
    }
    
    void handle_event(SDL_Event *event)
    {
        if(event->type == SDL_EVENT_WINDOW_RESIZED) {
            printf("window resize\n");
            
            refresh();
        }
        if(event->type == SDL_EVENT_WINDOW_DISPLAY_CHANGED) {
            printf("display changed!\n");
            
            refresh();
        }
    }
}; // RenderState

#endif // RENDERSTATE_H
