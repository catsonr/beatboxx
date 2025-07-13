#ifndef DEBUGGUI_H
#define DEBUGGUI_H

#include "../ImguiState.h"
#include "../InputState.h"

#include "Screen.h"

// bbxx::imgui
#include "../imgui/imguiFPSCounter.h"
#include "../imgui/imguiAudioState.h"
#include "../imgui/imguiPolyline2DState.h"

struct DebugGUI : Screen
{
    InputState& inputstate;
    ImguiState& imguistate;

    DebugGUI(ScreenContext& ctx) :
        Screen(ctx),
        inputstate(ctx.inputstate),
        imguistate(ctx.imguistate)
    {
        focus_force = true;
    }
    
    Command handle_event(const SDL_Event* event) override
    {
        if( inputstate.key_pressed(SDL_SCANCODE_GRAVE) )
            imguistate.show = !imguistate.show;
        
        return {};
    }

    void draw() override
    {
        if( !imguistate.show ) return;

        const float padding = 10.f;
        // fix fps counter to (10, 10)
        ImGui::SetNextWindowPos(
            ImVec2(padding, padding)
        );
        imguiFPSCounter::draw(imguistate.draw_args.fpscounter);
        imguiAudioState::draw(imguistate.draw_args.audiostate);
        //imguiPolyline2DState::draw(imguistate.draw_args.polyline2dstate);
    }
}; // DebugGUI

#endif // DEBUGGUI