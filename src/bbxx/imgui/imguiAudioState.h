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

        // find current index
        int current = 0;
        for (int i = 0; i < (int)audiostate.tracks.size(); ++i)
            if (audiostate.tracks[i] == audiostate.ct)
                current = i;

        if (ImGui::Combo("current track", &current, names.data(), (int)names.size()))
        {
            audiostate.set_currentTrack(audiostate.tracks[current]);
        }

        // --- BGM status & controls ---
        ImGui::Separator();
        ImGui::Text("track: %s", audiostate.bgm_playing ? "playing" : "paused");

        if (ImGui::Button("Play"))
            audiostate.bgm_play();
        ImGui::SameLine();
        if (ImGui::Button("Pause"))
            audiostate.bgm_pause();
        
        ImGui::Text("track pos: %llu", audiostate.bgm_pos());
        
        ImGui::End();
    }
}; // imguiAudioState

#endif // imguiAUDIOSTATE_H