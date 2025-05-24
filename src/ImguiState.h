#ifndef IMGUISTATE_H
#define IMGUISTATE_H

#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

#include "FPSCounter.h"

#include "WindowState.h"
#include "GLState.h"

struct ImguiState
{
    WindowState* windowstate;
    
    float padding = 10.f;

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        // TODO: error checking!
        IMGUI_CHECKVERSION();
        ImGui::CreateContext();
        ImGuiIO &io = ImGui::GetIO(); (void)io;

        ImGui_ImplSDL3_InitForOpenGL(windowstate->window, windowstate->gl);
        ImGui_ImplOpenGL3_Init("#version 330 core");
        
        // no imgui.ini
        io.IniFilename = nullptr;

        return true;
    }

    void draw(FPSCounter *fpscounter, GLState *glstate)
    {
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplSDL3_NewFrame();
        ImGui::NewFrame();

        ImGui::SetNextWindowPos(
            ImVec2(padding, padding),
            ImGuiCond_Once);
        ImGui::SetNextWindowSize(
            {200, 100},
            ImGuiCond_Once);
        ImGui::Begin("FPSCounter", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        ImGui::Text("fps: %.1f", fpscounter->fps);
        ImGui::Text("ema_fps: %.1f", fpscounter->ema_fps);
        ImGui::Text("time elapsed (s): %.1f", fpscounter->seconds);

        ImVec2 fps_pos = ImGui::GetWindowPos();
        ImVec2 fps_size = ImGui::GetWindowSize();
        ImGui::End();

        ImGui::SetNextWindowPos(
            {fps_pos.x, fps_pos.y + fps_size.y + padding},
            ImGuiCond_Once);
        ImGui::SetNextWindowSize(
            {250, 100},
            ImGuiCond_Once);
        ImGui::Begin("raymarching colors", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        ImGui::ColorEdit3("ambient", glm::value_ptr(glstate->color_ambient));
        ImGui::ColorEdit3("diffuse", glm::value_ptr(glstate->color_diffuse));
        ImGui::ColorEdit3("specular", glm::value_ptr(glstate->color_specular));
        ImGui::SliderFloat("shininess", &glstate->shininess, 0.1f, 255.0f);
        ImGui::End();

        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    }
}; // ImguiState

#endif // IMGUISTATE_H