#ifndef IMGUISTATE_H
#define IMGUISTATE_H

#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

#include "FPSCounter.h"

#include "WindowState.h"

struct ImguiState
{
    WindowState* windowstate;

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        // TODO: error checking!
        IMGUI_CHECKVERSION();
        ImGui::CreateContext();
        ImGuiIO &io = ImGui::GetIO(); (void)io;

        ImGui_ImplSDL3_InitForOpenGL(windowstate->window, windowstate->gl);
        ImGui_ImplOpenGL3_Init("#version 330 core");

        return true;
    }

    void draw(FPSCounter* fpscounter)
    {
    ImGui_ImplOpenGL3_NewFrame();
    ImGui_ImplSDL3_NewFrame();
    ImGui::NewFrame();

    ImGui::Begin("FPSCounter");
    ImGui::Text("fps: %.1f", fpscounter->fps);
    ImGui::Text("ema_fps: %.1f", fpscounter->ema_fps);
    ImGui::Text("time elapsed (s): %.1f", fpscounter->seconds);
    ImGui::End();

    ImGui::Render();
    ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData()); 
    }
}; // ImguiState

#endif // IMGUISTATE_H