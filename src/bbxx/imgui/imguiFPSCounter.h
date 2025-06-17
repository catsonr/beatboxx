#ifndef IMGUIFPSCOUNTER_H
#define IMGUIFPSCOUNTER_H

// imgui
#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

// beatboxx
#include "../FPSCounter.h"

namespace imguiFPSCounter
{
    inline void draw(const FPSCounter& fpscounter)
    {
        ImGui::Begin("FPSCounter", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        ImGui::Text("fps: %.1f", fpscounter.fps);
        ImGui::Text("ema_fps: %.1f", fpscounter.ema_fps);
        ImGui::Text("time elapsed (s): %.1f", fpscounter.seconds);
        ImGui::End(); // FPSCounter
    }
}; // imguiFPSCounter

#endif // IMGUIFPSCOUNTER_H