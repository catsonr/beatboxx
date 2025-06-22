#ifndef DEBUGGUI_H
#define DEBUGGUI_H

#include "../ImguiState.h"
#include "../InputState.h"

#include "Screen.h"

// bbxx::imgui
#include "../imgui/imguiFPSCounter.h"
#include "../imgui/imguiAudioState.h"

struct DebugGUI : Screen
{
    ImguiState& imguistate;
    InputState& inputstate;

    DebugGUI(WindowState& windowstate, ImguiState& imguistate, InputState& inputstate) :
        Screen(windowstate),
        imguistate(imguistate),
        inputstate(inputstate)
    {
        focus_force = true;
    }
    
    void handle_event(const SDL_Event* event) override
    {
        if( inputstate.key_down(SDL_SCANCODE_GRAVE) )
            imguistate.show = !imguistate.show;
    }

    void draw() override
    {
        if( !imguistate.show ) return;

        const float padding = 10.f;
        // draw fps counter
        ImGui::SetNextWindowPos(
            ImVec2(padding, padding)
        );
        imguiFPSCounter::draw(imguistate.draw_args.fpscounter);
        
        // draw audio state
        imguiAudioState::draw(imguistate.draw_args.audiostate);
    }
}; // DebugGUI

#endif // DEBUGGUI