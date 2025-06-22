/*
    a Screen represents a portion of the window to render to
*/

#ifndef SCREEN_H
#define SCREEN_H

// std
#include <stack>

// SDL
#include <SDL3/SDL.h>

// bbxx
#include <bbxx/WindowState.h>

class Screen
{
protected:
    WindowState& windowstate;

public:
    Screen(WindowState& windowstate) :
        windowstate(windowstate)
    {}

    virtual void draw() = 0;
    virtual void iterate() {};
    virtual void handle_event(SDL_Event* event) {};
    virtual void cleanup() {};
    
    virtual ~Screen() = default;
}; // Screen

#endif // SCREEN_H