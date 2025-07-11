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

/*
    an enum containing all available screen types
        in alphabetical order
*/
enum struct ScreenTypes
{
    DebugGUI,
    MainMenu,
    NowPlaying,
    Polyline2D,
    Screen,
    Tracklist,
    Welcome,
}; // ScreenTypes

/*
    a Screen rarely needs to talk to beatboxx, but when it does it can generate a Command
    Commands are executed after iterate() and before draw()
        in other words, Commands have no effect until next frame
        
    this definition should probably be inside BBXX.h, or some Command.h, but right now Screen is the
    only class that can emit them, so for now it's fine here
*/
#include <functional>
class BBXX;
struct Command
{
    std::function<bool(BBXX*)> body;
    
    Command() : body([](BBXX*) { return true; }) {}
    
    template<
        typename F,
        typename=std::enable_if_t<std::is_invocable_r_v<bool, F, BBXX*>>
    >
    Command(F&& f) : body(std::forward<F>(f)) {}
    
    bool execute(BBXX* bbxx) { return body(bbxx); }
}; // Command

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

    /* if this Screen is handling events */
    bool focused { false };
    /* wether or not focused is true, this Screen will handle events */
    bool focus_force { true };
    

    /* PUBLIC METHODS */

    virtual void draw() = 0;
    
    virtual bool init() { return true; }
    virtual Command iterate() { return {}; };
    //virtual void cleanup() {}

    virtual Command handle_event(const SDL_Event* event) { return {}; } // should never be called by Screen child!
    Command handles_event(const SDL_Event* event)
    {
        if( focused || focus_force )
        {
            return handle_event(event);
        }
        
        return {};
    }
    
    virtual ~Screen() = default;
}; // Screen

#endif // SCREEN_H