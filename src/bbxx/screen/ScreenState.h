#ifndef SCREENSTATE_H
#define SCREENSTATE_H

// std
#include <vector>
#include <memory>

// beatboxx
#include "Screen.h"
#include "Welcome.h"
#include "DebugGUI.h"

/*
    ScreenState is a manager class for all the Screens of the game
    the vector 'screens' hold the list of current Screens, which is both iterated and drawn in order

    ScreenState also handles any Commands that a Screen may generate, which are lambdas that BBXX will call
        Command definition is in Screen.h
*/
class ScreenState
{
    ScreenContext ctx;

public:
    // all the structs required by ScreenContext
    ScreenState(WindowState& windowstate,
        InputState& inputstate,
        AudioState& audiostate,
        GLState& glstate,
        NanoVGState& nanovgstate,
        ImguiState& imguistate,
        Polyline2DState& polyline2dstate
    ) : ctx { 
        windowstate,
        inputstate,
        audiostate,
        glstate,
        nanovgstate,
        imguistate,
        polyline2dstate,
    }
    {}

    std::vector< std::unique_ptr<Screen> > screens;
    std::stack<Command> commands;
    
    template<typename ScreenT>
    /* add a new Screen */
    void push()
    {
        static_assert(std::is_base_of_v<Screen, ScreenT>, "[ScreenState::push] given class is not of base class Screen!\n");
        
        screens.emplace_back( std::make_unique<ScreenT>(ctx) );
    }

    bool init()
    {
        /* current screen */
        push<Welcome>();

        /* debug menu (off by default) */
        push<DebugGUI>();
        
        for( auto& screen : screens ) {
            if( !screen->init() ) {
                printf("[ScreenState::init] failed to initialize a screen!\n");
                return false;
            }
        }
        
        return true;
    }
    
    void handle_event(const SDL_Event* event)
    {
        for( auto& screen : screens )
        {
            if( screen->focused || screen->focus_force )
            {
                Command command = screen->handles_event(event);
                commands.push(std::move(command));
            }
        }
    }

    bool handle_commands(BBXX* bbxx)
    {
        while( !commands.empty() )
        {
            //printf("[ScreenState::handle_commands] handling %d commands ...\n", (int)commands.size());

            if( !commands.top().execute(bbxx) ) {
                printf("[Screen::handle_commands] failed to handle a command!\n");
                return false;
            }
            
            commands.pop();
        }
        
        return true;
    }
    
    void iterate()
    {
        for( auto& screen : screens )
            screen->iterate();
    }
    
    void draw()
    {
        for( auto& screen : screens )
            screen->draw();
    }
}; // ScreenState

#endif // ScreenState
