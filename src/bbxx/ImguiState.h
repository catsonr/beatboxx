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
    ImGui::End(); // FPSCounter
        
    static bool mikushow = false;
    if( mikushow )
    {
    ImGui::Begin("miku", &mikushow, ImGuiWindowFlags_AlwaysAutoResize);
    
        if( ImGui::BeginCombo("current track", miku->current_track->title) )
        {
            for(int i = 0; i < miku->tracks.size(); i++)
            {
                const bool is_selected = ( i == miku->current_track_index );
                
                if( ImGui::Selectable(miku->tracks[i]->title, is_selected) )
                    miku->set_current_track(i);
            }
            
            ImGui::EndCombo();
        }

        if( ImGui::CollapsingHeader("Track", ImGuiTreeNodeFlags_Leaf) ) {
            ImGui::Text("title: %s", miku->current_track->title);
            ImGui::Text("album: %s", miku->current_track->album);
            ImGui::Text("artist: %s", miku->current_track->artist);

            if (!miku->current_track->playing)
            {
                if( miku->current_track->get_pos() > 0) {
                    if (ImGui::Button("resume() !")) {
                        miku->current_track->resume();
                    }
                }

                if (ImGui::Button("play() !")) {
                    miku->current_track->play();
                }
            }
            else {
                if (ImGui::Button("pause() !")) {
                    miku->current_track->pause();
                }
            }

            double pos = miku->current_track->get_pos();
            double len = miku->current_track->length;
            ImGui::Text("%02d:%02d / %02d:%02d",
                        int(pos) / 60, int(pos) % 60,
                        int(len) / 60, int(len) % 60);

            ImGui::ProgressBar(miku->current_track->get_pos() / miku->current_track->length );
        }
        ImGui::Separator();
        ImGui::Separator();
        
        if( ImGui::CollapsingHeader("PaceMaker") ) {
            if( ImGui::Button("PaceMaker::start() !") ) {
                miku->pacemaker.start(miku->current_track);
            }

            if( ImGui::Button("PaceMaker::beat() !") ) {
                miku->pacemaker.beat();
            }

            static char pacemakersavepath[256] = "assets/out/hi-posi.pacemaker";
            ImGui::InputText("##pacemaker save path", pacemakersavepath, IM_ARRAYSIZE(pacemakersavepath));
            ImGui::SameLine();
            if( ImGui::Button("Pace::save() !") ) {
                miku->current_track->pace.save(pacemakersavepath, &miku->pacemaker.beats);
            }
        }
        
        if( ImGui::CollapsingHeader("Pace", ImGuiTreeNodeFlags_Leaf) ) {
            ImGui::Text("beat count = %i", (int)miku->current_track->pace.beats.size());
            ImGui::Text("current beat = %i", (int)miku->current_track->pace.currentbeat);
            
            auto& pace   = miku->current_track->pace;
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
                    dt[i] = miku->current_track->get_dt(firstbeat + i);

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
                    "dt (seconds)", // label
                    dt.data(),      // data
                    (int)dt.size(), // count
                    0,              // values offset
                    overlay,        // no overlay text
                    dt_min,         // y-axis minimum
                    dt_max,         // y-axis maximum
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
                miku->current_track->set_pos_atBeat(posbeat - 1);
            }
            
            static int editbeat = 2;
            ImGui::SliderInt("editbeat", &editbeat, 2, miku->current_track->pace.beats.size());
            static float ddt = 0.0f;
            ImGui::SameLine();
            ImGui::SliderFloat("ddt", &ddt, -0.2f, 0.2f);
            ImGui::BeginDisabled(ddt == 0.0f);
            if( ImGui::Button("set_ddt() !") ) {
                miku->current_track->set_ddt(editbeat - 1, ddt);
                ddt = 0.0f;
            }
            ImGui::EndDisabled();
            
            static char pacesavepath[256] = "assets/out/lamp.pacemaker";
            ImGui::InputText("##pace save path", pacesavepath, IM_ARRAYSIZE(pacesavepath));
            ImGui::SameLine();
            if( ImGui::Button("save() !") ) {
                miku->current_track->pace.save(pacesavepath);
            }
        }
        ImGui::Separator();
        ImGui::Separator();

        //ImGui::ShowDemoWindow();

    ImGui::End(); // miku

    }

        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    }
}; // ImguiState

#endif // IMGUISTATE_H
