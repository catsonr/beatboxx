/*
    a Screen represents a slice of the screen to render to
    all Screens occupy the entirety of the window, and must only be opqaue where desired
*/

#ifndef SCREEN_H
#define SCREEN_H

// std
#include <stack>

// SDL
#include <SDL3/SDL.h>

// bbxx
#include "../WindowState.h"

class Screen
{
protected:
    WindowState& windowstate;

public:
    /* CONSTRUCTORS*/
    Screen(WindowState& windowstate) :
        windowstate(windowstate)
    {}
    
    /* PUBLIC MEMBERS */
    // if this Screen is handling events
    bool focused { false };
    // wether or not focused is true, this Screen will handle events
    bool focus_force { true };

    /* PUBLIC METHODS */
    virtual void draw() = 0;
    
    virtual bool init() { return true; }
    virtual void iterate() {}
    virtual void handle_event(const SDL_Event* event) {} // should never be called by Screen child!
    virtual void cleanup() {}
    
    void handles_event(const SDL_Event* event)
    {
        if( focused || focus_force )
            handle_event(event);
    }
    
    virtual ~Screen() = default; // prevents compiler from complaining (?)
}; // Screen

#endif // SCREEN_H