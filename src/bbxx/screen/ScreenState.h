#ifndef SCREENSTATE_H
#define SCREENSTATE_H

// std
#include <vector>
#include <memory>

// beatboxx
#include "Screen.h"

#include "Background.h"
#include "Browse.h"
#include "DebugGUI.h"

#include "Welcome.h"
#include "SliceTest.h"
#include "FontTest.h"

/*
    ScreenState is a manager class for all the Screens of the game
    the vector 'screens' hold the list of current Screens, which is both iterated and drawn in order

    ScreenState also handles any Commands that a Screen may generate, which are lambdas that BBXX will call
        Command definition is in Screen.h
        
    Screen knows nothing of ScreenState
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
        Polyline2DState& polyline2dstate,
        FontState& fontstate
    ) : 
        ctx { 
            windowstate,
            inputstate,
            audiostate,
            glstate,
            nanovgstate,
            imguistate,
            polyline2dstate,
            fontstate,
    }
    {}

    std::vector< std::unique_ptr<Screen> > screens;
    std::stack<Command> commands;
    
    /*
       creates a vector of all the screens to be used this frame
       this vector does get regenerated every call, which is not the most efficient way of handling
       master screens, but it is the simplest 
    */
    std::vector<Screen*> get_active_screens() const
    {
        std::vector<Screen*> active_screens;
        
        int last_master = -1;
        // find last master
        for( int i = screens.size() - 1; i >= 0; i-- )
        {
            if( screens[i]->master ) {
                last_master = i;
                break;
            }
        }
        
        // create vecor of active screens
        for ( int i = 0; i < screens.size(); i++ )
        {
            if( !screens[i]->master || i == last_master )
                active_screens.push_back(screens[i].get());
        }
        
        return active_screens;
    }
    
    template<typename ScreenT>
    /* adds a new Screen (and init()'s it) */
    void push()
    {
        static_assert(std::is_base_of_v<Screen, ScreenT>, "[ScreenState::push] given class is not of base class Screen!\n");
        
        screens.emplace_back( std::make_unique<ScreenT>(ctx) );
        
        screens.back()->init();
    }

    bool init()
    {
        push<Background>();

        //push<Welcome>();
        push<FontTest>();

        push<DebugGUI>();
        
        return true;
    }
    
    void handle_event(const SDL_Event* event)
    {
        for( Screen* screen : get_active_screens() )
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
        for( Screen* screen : get_active_screens() )
            screen->iterate();
    }
    
    void draw()
    {
        for( Screen* screen : get_active_screens() )
            screen->draws();
    }
}; // ScreenState

#endif // ScreenState
