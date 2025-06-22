#ifndef DEBUGGUI_H
#define DEBUGGUI_H

#include "../ImguiState.h"

#include "Screen.h"

// bbxx::imgui
#include "../imgui/imguiFPSCounter.h"
#include "../imgui/imguiAudioState.h"

struct DebugGUI : Screen
{
    ImguiState& imguistate;
    float padding = 10.f;

    DebugGUI(WindowState& windowstate, ImguiState& imguistate) :
        Screen(windowstate),
        imguistate(imguistate)
    {}
    
    void iterate() override
    {

    }

    void draw() override
    {
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