#ifndef SCREEN_H
#define SCREEN_H

// std
#include <stack>

// SDL
#include <SDL3/SDL.h>

// beatboxx states
#include "../WindowState.h"
#include "../InputState.h"
#include "../AudioState.h"
#include "../GLState.h"
#include "../NanoVGState.h"
#include "../ImguiState.h"
#include "../Polyline2DState.h"
/*
    ScreenContext contains all the BBXX state classes that a Screen might need
*/
struct ScreenContext
{
    WindowState& windowstate;
    InputState& inputstate;
    AudioState& audiostate;
    
    GLState& glstate;
    NanoVGState& nanovgstate;
    ImguiState& imguistate;

    Polyline2DState& polyline2dstate;
}; // ScreenContext

#include <functional>
class BBXX; // forward declare
/*
    a Command is a lambda that BBXX will call
    Commands are executed after iterate() and before draw()
        
    this definition should probably be inside BBXX.h, or some Command.h, but right now Screen is the
    only class that can emit them, so it stays here
*/
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

/*
    a Screen represents a slice of the screen to render to
    all Screens occupy the entirety of the window, and must only be opaque where desired
*/
class Screen
{
protected:
    ScreenContext& ctx;

public:
    /* CONSTRUCTORS*/
    explicit Screen(ScreenContext& ctx) :
        ctx(ctx)
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
    /* this is the actual handle_event() function to override */
    virtual Command handle_event(const SDL_Event* event) { return {}; } // should never be called by Screen child!
    /* this is what is called by BBXX instead of the overridden handle_event() */
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