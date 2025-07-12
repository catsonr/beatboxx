/*
    ScreenState is a manager class for all the Screens of the game
    the vector 'screens' hold the list of current Screens, which is both iterated and drawn in order

    ScreenState also handles any Commands that a Screen may generate, which are lambdas that BBXX will call
        Command definition is in Screen.h
*/

#ifndef SCREENSTATE_H
#define SCREENSTATE_H

// std
#include <vector>
#include <memory>

// beatboxx
#include "Screen.h"
#include "Welcome.h"
#include "DebugGUI.h"
#include "Polyline2D.h"
#include "NowPlaying.h"

class ScreenState
{
    WindowState& windowstate;
    InputState& inputstate;
    AudioState& audiostate;
    
    GLState& glstate;
    NanoVGState& nanovgstate;
    
    ImguiState& imguistate;
    
    Polyline2DState& polyline2dstate;

public:
    // all the structs a screen might need
    ScreenState(WindowState& windowstate,
        InputState& inputstate,
        AudioState& audiostate,
        GLState& glstate,
        NanoVGState& nanovgstate,
        ImguiState& imguistate,
        Polyline2DState& polyline2dstate
    ) :
        windowstate(windowstate),
        inputstate(inputstate),
        audiostate(audiostate),
        glstate(glstate),
        nanovgstate(nanovgstate),
        imguistate(imguistate),
        polyline2dstate(polyline2dstate)
    {}

    std::vector< std::unique_ptr<Screen> > screens;
    std::stack<Command> commands;

    bool init()
    {
        /* current screen */
        screens.emplace_back( std::make_unique<Welcome>(windowstate, inputstate, glstate, nanovgstate) );

        /* debug menu (off by default) */
        screens.emplace_back( std::make_unique<DebugGUI>(windowstate, inputstate, imguistate) );

        /* optional 
        screens.emplace_back( std::make_unique<Poly>(windowstate, polyline2dstate, glstate) );
        screens.emplace_back( std::make_unique<NowPlaying>(windowstate, audiostate, inputstate) );
        */
        
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
