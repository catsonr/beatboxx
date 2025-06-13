#ifndef IMGUISTATE_H
#define IMGUISTATE_H

// imgui
#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

// bbxx
#include "FPSCounter.h"
#include "WindowState.h"
#include "GLState.h"

struct ImguiState
{
    bool show = true;

    WindowState* windowstate;
    
    float padding = 10.f;
    
    static float pace_beats_getter(void* data, int idx)
    {
        auto beats = static_cast<std::vector<double>*>(data);
        return (float)(*beats)[idx];
    }

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        // TODO: error checking!
        IMGUI_CHECKVERSION();
        ImGui::CreateContext();
        ImGuiIO &io = ImGui::GetIO();

        ImGui::StyleColorsLight();
        ImGuiStyle& style = ImGui::GetStyle();
        style.FrameRounding = 6.0f;
        style.FrameBorderSize = 1.0f;

        float Text_color = 79 / 255.0f;
        style.Colors[ImGuiCol_Text] = ImVec4(Text_color, Text_color, Text_color, 1.0f);
        float WindowBg_color = 244 / 255.0f;
        style.Colors[ImGuiCol_WindowBg] = ImVec4(WindowBg_color, WindowBg_color, WindowBg_color, 1.0f);

        // === Main ===
        style.WindowPadding = ImVec2(10, 10);
        style.FramePadding = ImVec2(3, 2);
        style.ItemSpacing = ImVec2(5, 2);
        style.ItemInnerSpacing = ImVec2(4, 4);
        style.TouchExtraPadding = ImVec2(0, 0);
        style.IndentSpacing = 21.0f;
        style.ScrollbarSize = 14.0f;
        style.GrabMinSize = 12.0f;

        // === Borders ===
        style.WindowBorderSize = 1.0f;
        style.ChildBorderSize = 1.0f;
        style.PopupBorderSize = 1.0f;
        style.FrameBorderSize = 1.0f;

        // === Rounding ===
        style.WindowRounding = 6.0f;
        style.ChildRounding = 12.0f;
        style.FrameRounding = 6.0f;
        style.PopupRounding = 12.0f;
        style.ScrollbarRounding = 12.0f;
        style.GrabRounding = 6.0f;

        io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;
        io.ConfigFlags |= ImGuiConfigFlags_NavEnableGamepad;
        io.IniFilename = nullptr;
        
        // default latin font
        ImFontConfig cfg;
        std::string latinpath = util::get_fullPath(
            "assets/fonts/JetBrains_Mono/JetBrainsMono-VariableFont_wght.ttf"
        );
        io.Fonts->AddFontFromFileTTF(
            latinpath.c_str(),
            16.0f,
            &cfg,
            io.Fonts->GetGlyphRangesDefault()
        );
        
        // default japanese font
        cfg.MergeMode = true;
        std::string japanesepath = util::get_fullPath(
            "assets/fonts/DotGothic16/DotGothic16-Regular.ttf"
        );
        io.Fonts->AddFontFromFileTTF(
            japanesepath.c_str(),
            16.0f,
            &cfg,
            io.Fonts->GetGlyphRangesJapanese()
        );

        ImGui_ImplSDL3_InitForOpenGL(windowstate->window, windowstate->gl);
        
        #ifndef __EMSCRIPTEN__
            ImGui_ImplOpenGL3_Init("#version 330 core");
        #else
            ImGui_ImplOpenGL3_Init("#version 300 es");
        #endif

        return true;
    }

    void draw(FPSCounter *fpscounter, GLState *glstate)
    {
        if( !show ) return;

        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplSDL3_NewFrame();
        ImGui::NewFrame();

        ImGui::SetNextWindowPos(
            ImVec2(padding, padding)
        );
        ImGui::Begin("FPSCounter", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        ImGui::Text("fps: %.1f", fpscounter->fps);
        ImGui::Text("ema_fps: %.1f", fpscounter->ema_fps);
        ImGui::Text("time elapsed (s): %.1f", fpscounter->seconds);
        ImGui::End(); // FPSCounter

        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    }
}; // ImguiState

#endif // IMGUISTATE_H
