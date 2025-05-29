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

        /*
        ImGui::Begin("raymarching colors", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        ImGui::ColorEdit3("ambient", glm::value_ptr(glstate->color_ambient));
        ImGui::ColorEdit3("diffuse", glm::value_ptr(glstate->color_diffuse));
        ImGui::ColorEdit3("specular", glm::value_ptr(glstate->color_specular));
        ImGui::ColorEdit4("bg", glm::value_ptr(glstate->color_none));
        ImGui::SliderFloat("shininess", &glstate->shininess, 0.1f, 255.0f);
        ImGui::End();
        */
        
        ImGui::Begin("miku", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        if( ImGui::CollapsingHeader("Track", ImGuiTreeNodeFlags_Leaf) ) {
            ImGui::Text("title: %s", miku->track.title);
            ImGui::Text("album: %s", miku->track.album);
            ImGui::Text("artist: %s", miku->track.artist);

            if (!miku->track.playing)
            {
                if( miku->track.get_pos() > 0) {
                    if (ImGui::Button("resume() !")) {
                        miku->track.resume();
                    }
                }

                if (ImGui::Button("play() !")) {
                    miku->track.play();
                }
            }
            else {
                if (ImGui::Button("pause() !")) {
                    miku->track.pause();
                }
            }

            double pos = miku->track.get_pos();
            double len = miku->track.length;
            ImGui::Text("%02d:%02d / %02d:%02d",
                        int(pos) / 60, int(pos) % 60,
                        int(len) / 60, int(len) % 60);

            ImGui::ProgressBar((float)miku->track.pace.currentbeat / (float)miku->track.pace.beats.size());
        }
        ImGui::Separator();
        ImGui::Separator();
        
        /*
        if( ImGui::CollapsingHeader("PaceMaker", ImGuiTreeNodeFlags_OpenOnArrow) ) {
            if( ImGui::Button("pacemaker::beat()!") ) {
                miku->pacemaker.beat();
            }
            if( ImGui::Button("pacemaker::save()!") ) {
                miku->pacemaker.save();
            }

            ImGui::Text("pacemaker::beat count = %i", (int)miku->pacemaker.beat_positions.size());
        }
        */
        
        if( ImGui::CollapsingHeader("Pace", ImGuiTreeNodeFlags_Leaf) ) {
            ImGui::Text("beat count = %i", (int)miku->track.pace.beats.size());
            ImGui::Text("current beat = %i", (int)miku->track.pace.currentbeat);
            //ImGui::Text("pace::measure count = %i", (int)miku->track.pace.measures.size());
            
            auto& pace   = miku->track.pace;
            auto &beats = pace.beats;
            int currentbeat = (int)pace.currentbeat;

            static int window = 8;
            ImGui::SliderInt("dt width", &window, 2, pace.beats.size());
            int firstbeat = std::max(1, currentbeat - window);
            int windowcount = currentbeat - firstbeat;

            if (currentbeat > 1)
            {
                static std::vector<float> dt;
                dt.resize(windowcount);

                for (int i = 0; i < windowcount; ++i)
                    dt[i] = miku->track.get_dt(firstbeat + i);

                float dt_min = dt[0], dt_max = dt[0];
                for (float v : dt)
                {
                    if (v < dt_min)
                        dt_min = v;
                    if (v > dt_max)
                        dt_max = v;
                }
                float dt_padding = 0.2;
                dt_min -= dt_padding;
                dt_max += dt_padding;

                char overlay[32];
                snprintf(overlay, sizeof(overlay), "beat %d dt = %f", currentbeat, dt.back());

                ImGui::PlotLines(
                    "dt",           // label
                    dt.data(),      // data
                    (int)dt.size(), // count
                    0,              // values offset
                    overlay,        // no overlay text
                    dt_min,          // y-axis minimum
                    dt_max,          // y-axis maximum
                    ImVec2(0, 100)  // plot size
                );
            }
            else
            {
                ImGui::TextUnformatted("Waiting for at least 2 beats...");
            }
            
            
            static int posbeat = 1;
            ImGui::SetNextItemWidth(120.0f);
            ImGui::SliderInt("posbeat", &posbeat, 1, pace.beats.size());
            ImGui::SameLine();
            if( ImGui::Button("set_pos_atBeat() !") ) {
                miku->track.set_pos_atBeat(posbeat - 1);
            }
            
            static int editbeat = 2;
            ImGui::SliderInt("editbeat", &editbeat, 2, miku->track.pace.beats.size());
            static float ddt = 0.0f;
            ImGui::SameLine();
            ImGui::SliderFloat("ddt", &ddt, -0.2f, 0.2f);
            if( ddt == 0.0f ) ImGui::BeginDisabled();
            if( ImGui::Button("set_ddt() !") ) {
                miku->track.set_ddt(editbeat - 1, ddt);
                ddt = 0.0f;
            }
            if( ddt == 0.0f ) ImGui::EndDisabled();
        }
        ImGui::Separator();
        ImGui::Separator();

        //ImGui::ShowDemoWindow();

        ImGui::End();

        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    }
}; // ImguiState

#endif // IMGUISTATE_H
