#ifndef imguiAUDIOSTATE_H
#define imguiAUDIOSTATE_H

// imgui
#include <imgui.h>
#include <backends/imgui_impl_sdl3.h>
#include <backends/imgui_impl_opengl3.h>

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

        if (ImGui::Button("Play"))
            audiostate.bgm_play();
        ImGui::SameLine();
        if (ImGui::Button("Pause"))
            audiostate.bgm_pause();

        ImGui::Separator();
        float percent = audiostate.bgm_get_pos() / (float)audiostate.bgm->length_frames;
        ImGui::Text("track pos: %llu / %llu frames (%.1f%%)", audiostate.bgm_get_pos(), audiostate.bgm->length_frames, percent * 100);
        
        uint64_t maxFrames = audiostate.bgm->length_frames;
        static uint64_t seekPos = 0;
        static uint64_t seekMin = 0;
        ImGui::SliderScalar("Position Slider", ImGuiDataType_U64, &seekPos, &seekMin, &maxFrames);
        if (seekPos != audiostate.bgm_get_pos() && ImGui::IsItemDeactivatedAfterEdit())
            audiostate.bgm_set_pos(seekPos);
        
        ImGui::Separator();
        ImGui::Text("bgm->meter.beat_locations count : %i", (int)audiostate.bgm->meter.beat_locations.size());
        if(ImGui::Button("clear beat_locations")) {
            audiostate.bgm->meter.beat_locations.clear();
        }
        if(ImGui::Button("add beat!")) {
            audiostate.bgm->meter.beat_locations.push_back(audiostate.bgm_get_pos());
        }
        if(ImGui::Button("Meter::json_write() !")) {
            audiostate.bgm->meter.json_write();
        }

        ImGui::Separator();
        if(ImGui::Button("play sfx!")) {
            audiostate.sfxs[0].play();
        }

        ImGui::End();
    }
}; // imguiAudioState

#endif // imguiAUDIOSTATE_H