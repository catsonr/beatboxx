#ifndef imguiAUDIOSTATE_H
#define imguiAUDIOSTATE_H

// imgui
#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

// implot
#include <implot.h>

// beatboxx
#include "../utilities.h"
#include "../AudioState.h"

namespace imguiAudioState
{
    inline void draw(AudioState& audiostate)
    {
        // AudioState
        ImGui::Begin("AudioState", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        
        std::vector<const char*> names;
        names.reserve(audiostate.tracks.size());
        for (auto* t : audiostate.tracks)
            names.push_back(t->path);

        int current = 0;
        for (int i = 0; i < (int)audiostate.tracks.size(); ++i)
            if (audiostate.tracks[i] == audiostate.bgm)
                current = i;

        if (ImGui::Combo("current track", &current, names.data(), (int)names.size()))
        {
            audiostate.set_currentTrack(audiostate.tracks[current]);
        }

        ImGui::Separator();
        ImGui::Text("track: %s", audiostate.bgm_playing ? "playing" : "paused");

        // play/pause buttons
        if (ImGui::Button("Play"))
            audiostate.bgm_play();
        ImGui::SameLine();
        if (ImGui::Button("Pause"))
            audiostate.bgm_pause();

        // track progress
        float percent = audiostate.bgm_get_pos() / (float)audiostate.bgm->length_frames;
        char overlay[64];
        snprintf(overlay, sizeof(overlay), "%llu / %llu frames (%.1f%%)",
        audiostate.bgm_get_pos(), audiostate.bgm->length_frames, percent * 100.0f);
        ImGui::ProgressBar(percent, ImVec2(-1, 0), overlay);

        ImGui::End(); // AudioState

        // Chart
        Chart& chart = audiostate.bgm->chart;
        ImGui::Begin("Chart", nullptr, ImGuiWindowFlags_None);
        
        ImGui::Text("chart.meter.current_beat = %d", chart.meter.current_beat);
        
        if((int)chart.meter.beat_locations.size() > 0 && ImPlot::BeginPlot("note positions"))
        {
            ImPlot::SetupAxes("beat", "note position");
            
            int window_width = 2;
            int window_start = chart.meter.current_beat - window_width;
            int window_end   = chart.meter.current_beat + window_width + 1;
            
            if(window_start < 0) window_start = 0;
            if(window_end > chart.meter.beat_locations.size()) window_end = chart.meter.beat_locations.size();
            
            std::vector<std::string> beat_labels;
            std::vector<double> beat_frames;
            for (size_t i = window_start; i < window_end; ++i) {
                beat_frames.push_back((double)chart.meter.beat_locations[i]);
                if( i != chart.meter.current_beat)
                    beat_labels.push_back(std::to_string(i));
                else
                    beat_labels.push_back(std::to_string(i) + std::string(" current"));
            }
            std::vector<const char*> beat_labels_c;
            beat_labels_c.reserve(beat_labels_c.size());
            for (auto &s : beat_labels)
                beat_labels_c.push_back(s.c_str());

            double window_start_frame = beat_frames.front();
            double window_end_frame   = beat_frames.back();
            double window_padding = 10000.0;
            ImPlot::SetupAxisLimits(ImAxis_X1, window_start_frame - window_padding, window_end_frame + window_padding, ImGuiCond_Always);
            ImPlot::SetupAxisLimits(ImAxis_Y1, 0.0, 1.0, ImGuiCond_Always);
            
            ImPlot::SetupAxisTicks(
                ImAxis_X1,
                beat_frames.data(),
                (int)beat_frames.size(),
                beat_labels_c.data()
            );

            ImPlot::PlotInfLines("beat",
                beat_frames.data(),
                (int)beat_frames.size()
            );
            
            ImPlot::EndPlot();
        }
        
        if( ImGui::Button("Chart::add_note() !") ) {
            audiostate.bgm->chart.add_note(audiostate.bgm_get_pos());
        }

        std::vector<Note>& notes = audiostate.bgm->chart.notes;

        if (ImGui::BeginTable("NotesTable", 2, ImGuiTableFlags_Borders | ImGuiTableFlags_RowBg | ImGuiTableFlags_Resizable))
        {
            ImGui::TableSetupColumn("beat");
            ImGui::TableSetupColumn("beat pos");
            ImGui::TableHeadersRow();

            for (int i = 0; i < (int)notes.size(); ++i)
            {
                const auto &n = notes[i];
                ImGui::TableNextRow();
                ImGui::TableSetColumnIndex(0);
                ImGui::Text("%d", n.beat);
                ImGui::TableSetColumnIndex(1);
                ImGui::Text("%.3f", n.pos);
            }

            ImGui::EndTable();
        }

        ImGui::End(); // Chart
        
        ImGui::Begin("Meter", nullptr, ImGuiWindowFlags_None);
        Meter& meter = audiostate.bgm->chart.meter;
        ImGui::Text("beats loaded = %d", (int)meter.beat_locations.size());
        if(ImGui::Button("beat_locations.clear()")) {
            meter.beat_locations.clear();
        }
        if(ImGui::Button("add beat @ current pos")) {
            meter.beat_locations.push_back(audiostate.bgm_get_pos());
        }
        if(ImGui::Button("json_write() !")) {
            meter.json_write();
        }
        ImGui::End(); // Chart
    }
}; // imguiAudioState

#endif // imguiAUDIOSTATE_H