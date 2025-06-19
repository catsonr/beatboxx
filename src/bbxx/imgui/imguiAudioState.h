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
        
        ImGui::Text("chart.current_beat = %d", chart.current_beat);
        
        if((int)chart.beats.size() > 0 && ImPlot::BeginPlot("note positions"))
        {
            ImPlot::SetupAxes("beat", "note position");
            
            int window_width = 10;
            int window_start = chart.current_beat - window_width;
            int window_end   = chart.current_beat + window_width + 1;
            
            if(window_start < 0) window_start = 0;
            if(window_end > chart.beats.size()) window_end = chart.beats.size();
            
            std::vector<double> beat_frames;
            std::vector<std::string> beat_labels;

            std::vector<double> note_frames;
            std::vector<std::string> note_labels;
            for (size_t i = window_start; i < window_end; ++i)
            {
                // grab beats in window
                beat_frames.push_back((double)chart.beats[i]);
                if( i != chart.current_beat)
                    beat_labels.push_back(std::to_string(i));
                else
                    beat_labels.push_back(std::string("current beat"));
                
                // grab notes in window 
                std::vector<Note> current_notes = chart.get_beat_notes(i);
                for(const Note& note : current_notes)
                {
                    note_frames.push_back(chart.beats[i] + note.pos * chart.get_dFrames(i));
                }
            }
            std::vector<const char*> beat_labels_c;
            beat_labels_c.reserve(beat_labels_c.size());
            for (auto &s : beat_labels)
                beat_labels_c.push_back(s.c_str());
            
            std::vector<const char*> note_labels_c;
            note_labels_c.reserve(note_labels_c.size());
            for (auto &s : note_labels)
                note_labels_c.push_back(s.substr(0, 2).c_str());

            // set window as plot limits 
            double window_center_frame = audiostate.bgm_get_pos();
            double window_radius = 100000.0;
            double window_start_frame = window_center_frame - window_radius;
            double window_end_frame   = window_center_frame + window_radius;
            double window_padding = 10000.0;
            ImPlot::SetupAxisLimits(ImAxis_X1, window_start_frame - window_padding, window_end_frame + window_padding, ImGuiCond_Always);
            ImPlot::SetupAxisLimits(ImAxis_Y1, 0.0, 1.0, ImGuiCond_Always);
            
            ImPlot::SetupAxisTicks(
                ImAxis_X1,
                beat_frames.data(),
                (int)beat_frames.size(),
                beat_labels_c.data()
            );
            
            // set beat colors
            ImPlot::SetNextLineStyle(ImVec4(1.0, 0.5, 0.25, 1.0), 1.0f);

            // plot beats
            ImPlot::PlotInfLines("beat",
                beat_frames.data(),
                (int)beat_frames.size()
            );

            // set note colors
            ImPlot::SetNextLineStyle(ImVec4(0.0, 0.5, 1.00, 1.0), 1.0f);

            // plot notes
            ImPlot::PlotInfLines("beat",
                note_frames.data(),
                (int)note_frames.size()
            );
            
            ImPlot::EndPlot();
        }
        
        if( ImGui::Button("Chart::json_write() !") ) {
            chart.json_write();
        }
        if( ImGui::Button("add beat @ audiostate,bgm_get_pos() ") ) {
            chart.beats.push_back(audiostate.bgm_get_pos());
        }
        if( ImGui::Button("Chart::add_note() !") ) {
            chart.add_note(audiostate.bgm_get_pos());
        }

        /*
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
        */

        ImGui::End(); // Chart
    }
}; // imguiAudioState

#endif // imguiAUDIOSTATE_H