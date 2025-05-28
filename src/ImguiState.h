#ifndef IMGUISTATE_H
#define IMGUISTATE_H

#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

#include "FPSCounter.h"

#include "WindowState.h"
#include "GLState.h"
#include "Miku.h"

struct ImguiState
{
    WindowState* windowstate;
    
    float padding = 10.f;
    
    bool mikuplaying { false };

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        // TODO: error checking!
        IMGUI_CHECKVERSION();
        ImGui::CreateContext();
        ImGuiIO &io = ImGui::GetIO();
        
        io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;
        io.ConfigFlags |= ImGuiConfigFlags_NavEnableGamepad;
        
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
        
        // no imgui.ini
        io.IniFilename = nullptr;
        // high dpi support
        io.DisplayFramebufferScale = ImVec2(40, 40);

        return true;
    }

    void draw(FPSCounter *fpscounter, GLState *glstate, Miku* miku)
    {
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
        ImGui::End();

        ImGui::Begin("raymarching colors", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        ImGui::ColorEdit3("ambient", glm::value_ptr(glstate->color_ambient));
        ImGui::ColorEdit3("diffuse", glm::value_ptr(glstate->color_diffuse));
        ImGui::ColorEdit3("specular", glm::value_ptr(glstate->color_specular));
        ImGui::ColorEdit4("bg", glm::value_ptr(glstate->color_none));
        ImGui::SliderFloat("shininess", &glstate->shininess, 0.1f, 255.0f);
        ImGui::End();
        
        ImGui::Begin("miku", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        if( ImGui::CollapsingHeader("Track", ImGuiTreeNodeFlags_Leaf) ) {
            if( ImGui::Checkbox("playing", &mikuplaying) ) {
                if(mikuplaying) {
                    miku->pacemaker.start();
                    miku->track.play();
                }
                else miku->track.pause();
            }
            ImGui::Text("artist: %s", miku->track.artist);
            ImGui::Text("album: %s", miku->track.album);
            ImGui::Text("title: %s", miku->track.title);

            double pos = miku->track.get_pos();
            double len = miku->track.length;
            ImGui::Text("%02d:%02d / %02d:%02d",
                        int(pos) / 60, int(pos) % 60,
                        int(len) / 60, int(len) % 60);
        }
        
        if( ImGui::CollapsingHeader("PaceMaker", ImGuiTreeNodeFlags_OpenOnArrow) ) {
            if( ImGui::Button("pacemaker::beat()!") ) {
                miku->pacemaker.beat();
            }
            if( ImGui::Button("pacemaker::save()!") ) {
                miku->pacemaker.save();
            }

            ImGui::Text("pacemaker::beat count = %i", (int)miku->pacemaker.beat_positions.size());
        }
        
        if( ImGui::CollapsingHeader("Pace", ImGuiTreeNodeFlags_Leaf) ) {
            ImGui::Text("pace::measure count = %i", (int)miku->pace.measures.size());
        }
        
        //ImGui::ShowDemoWindow();

        ImGui::End();

        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    }
}; // ImguiState

#endif // IMGUISTATE_H
