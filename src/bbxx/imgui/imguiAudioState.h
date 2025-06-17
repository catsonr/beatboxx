#ifndef imguiAUDIOSTATE_H
#define imguiAUDIOSTATE_H

// imgui
#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

// implot
#include <implot.h>

// beatboxx
#include "../AudioState.h"

namespace imguiAudioState
{
    inline void draw(AudioState& audiostate)
    {
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

        ImGui::Begin("Chart", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
        
        if( ImGui::Button("Chart::add_note() !") ) {
            audiostate.bgm->chart.add_note(audiostate.bgm_get_pos());
        }

        std::vector<Note>& notes = audiostate.bgm->chart.notes;
        
        if (ImGui::BeginTable("NotesTable", 5,
        ImGuiTableFlags_Borders | ImGuiTableFlags_RowBg | ImGuiTableFlags_Resizable))
{
    // setup headers
    ImGui::TableSetupColumn("beat");
    ImGui::TableSetupColumn("subdiv");
    ImGui::TableSetupColumn("subdiv pos");
    ImGui::TableSetupColumn("frame");
    ImGui::TableSetupColumn("frame quantized");
    ImGui::TableHeadersRow();

    // one row per note
    for (int i = 0; i < (int)notes.size(); ++i) {
        const auto& n = notes[i];
        ImGui::TableNextRow();
        ImGui::TableSetColumnIndex(0); ImGui::Text("%d",    n.beat);
        ImGui::TableSetColumnIndex(1); ImGui::Text("%d",    n.beat_subdivision);
        ImGui::TableSetColumnIndex(2); ImGui::Text("%d",    n.beat_subdivision_count);
        ImGui::TableSetColumnIndex(3); ImGui::Text("%llu",  n.frame);
        ImGui::TableSetColumnIndex(4); ImGui::Text("%llu",  n.frame_quantized);
    }

    ImGui::EndTable();
}

        ImGui::End(); // Chart
    }
}; // imguiAudioState

#endif // imguiAUDIOSTATE_H