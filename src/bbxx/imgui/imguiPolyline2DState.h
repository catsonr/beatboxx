#ifndef imguiPOLYLINE2DSTATE_H
#define imguiPOLYLINE2DSTATE_H

// imgui
#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

// implot
#include <implot.h>

// bbxx
#include "../Polyline2DState.h"

namespace imguiPolyline2DState
{
    inline void draw(Polyline2DState& polyline2dstate)
    {
        ImGui::Begin("Polyline2D", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        
        static float t = 0.0f;
        if( ImGui::SliderFloat("t", &t, 0.0f, 1.0f, "t = %.2f")) {
            polyline2dstate.t = t;
        }
        static float thickness = 0.0f;
        if( ImGui::SliderFloat("thickness", &thickness, 0.0f, 0.01f, "t = %.4f")) {
            polyline2dstate.thickness = thickness;
        }
        static float movement_speed = 0.0f;
        if( ImGui::SliderFloat("movement speed", &movement_speed, 1.0f, 100.0f, "t = %.2f")) {
            polyline2dstate.glstate.camera_movementSpeed = movement_speed;
        }
        
        ImGui::End();
    }
}; // imguiPolyline2DState

#endif // imguiPOLYLINE2DSTATE_H