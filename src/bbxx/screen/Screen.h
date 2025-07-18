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

struct ScreenDimensions
{
    bool fullscreen { true };
    bool scissor { true };
    bool centered { false };
    int w_l { 0 };
    int h_l { 0 };
    float x_ndc { 0.0 };
    float y_ndc { 0.0 };
}; // ScreenDimensions

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
    all Screens occupy the entirety of the window, unless given dimensions by passing in ScreenDimensions
*/
class Screen
{
protected:
    ScreenContext& ctx;
    ScreenDimensions dim;

public:
    /* CONSTRUCTORS*/
    explicit Screen(ScreenContext& ctx, ScreenDimensions dimensions={}) :
        ctx(ctx),
        dim(dimensions)
    {}
    
    /* PUBLIC MEMBERS */

    /* if this Screen is handling events */
    bool focused { false };
    /* wether or not focused is true, this Screen will handle events */
    bool focus_force { true };

    /* PUBLIC METHODS */

    /* draw() call to be overridden by subclass */
    virtual void draw() = 0;
    /* what actually gets called by BBXX */
    void draws()
    {
        const WindowState& ws = ctx.windowstate; 

        int w = ws.w;
        int h = ws.h;
        int x = 0;
        int y = 0;
        float ds = ws.ds;
        
        if( dim.fullscreen )
        {
            glDisable(GL_SCISSOR_TEST);
            glViewport(x, y, w, h);
        }
        else
        {
            w = int(dim.w_l * ds);
            h = int(dim.h_l * ds);
            
            x = int( ws.w*0.5 + (dim.x_ndc * ws.w*0.5) );
            y = int( ws.h*0.5 + (dim.y_ndc * ws.h*0.5) );
            
            if( dim.centered ) {
                x -= int(w * 0.5);
                y -= int(h * 0.5);
            }
            
            glViewport(x, y, w, h);
            
            if( dim.scissor )
            {
                glEnable(GL_SCISSOR_TEST);
                glScissor(x, y, w, h);
            }
            else
            {
                glDisable(GL_SCISSOR_TEST);
            }
        }

        draw();
    }
    virtual bool init() { return true; }
    virtual Command iterate() { return {}; };
    //virtual void cleanup() {}
    /* handle_event() to be overridden by subclass */
    virtual Command handle_event(const SDL_Event* event) { return {}; } // should never be called by Screen child!
    /* what actually gets called by BBXX */
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

// below is the Screen subclass header template
/*
#ifndef MYSCREEN_H
#define MYSCREEN_H

#include "Screen.h"

struct MyScreen : Screen
{
    MyScreen(ScreenContext& ctx) :
        Screen(ctx)
    {}
    
    void draw() override
    {
        
    }
}; // MyScreen

#endif // MYSCREEN_H
*/

#endif // SCREEN_H