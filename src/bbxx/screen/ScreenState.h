#ifndef SCREENSTATE_H
#define SCREENSTATE_H

// std
#include <vector>
#include <memory>

// beatboxx
#include "Screen.h"
#include "Welcome.h"
#include "DebugGUI.h"

class ScreenState
{
    WindowState& windowstate;
    InputState& inputstate;
    AudioState& audiostate;
    
    GLState& glstate;
    NanoVGState& nanovgstate;
    
    ImguiState& imguistate;

public:
    ScreenState(WindowState& windowstate,
        InputState& inputstate,
        AudioState& audiostate,
        GLState& glstate,
        NanoVGState& nanovgstate,
        ImguiState& imguistate
    ) :
        windowstate(windowstate),
        inputstate(inputstate),
        audiostate(audiostate),
        glstate(glstate),
        nanovgstate(nanovgstate),
        imguistate(imguistate)
    {}

    std::vector< std::unique_ptr<Screen> > screens;

    bool init()
    {
        screens.emplace_back( std::make_unique<Welcome>(windowstate, inputstate, glstate, nanovgstate) );
        screens.emplace_back( std::make_unique<DebugGUI>(windowstate, inputstate, imguistate) );
        
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
            screen->handles_event(event);
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
