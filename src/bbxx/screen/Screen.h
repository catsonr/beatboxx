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
private:
    WindowState* windowstate;

public:
    Screen(WindowState* windowstate) :
        windowstate(windowstate)
    {}

    virtual void draw() = 0;
    virtual void handle_event(SDL_Event* event) {};
}; // Screen

#endif // SCREEN_H