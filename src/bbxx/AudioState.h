#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

// std
#include <iostream>
#include <cstdio>
#include <string>
#include <vector>
#include <memory>

// miniaudio
#include "miniaudio.h"

// bbxx
#include "utilities.h"
#include "audio/Track.h"
#include "audio/Sfx.h"

struct AudioState
{
    /* PUBLIC MEMBERS */
    ma_engine engine;
    
    std::vector<std::unique_ptr<Track>> tracks;
    
    // sound effects
    std::vector<Sfx> sfxs { {"click.wav"}, {"note.wav"} };

    float volume { 1.0f };
    
    int periodsizeinframes { 256 };
    int periodcount { 3 };
    
    /* PUBLIC METHODS */
    bool init();
    
    bool source_tracks();
    
    void set_volume(float volume_new);

    void cleanup();
}; // AudioState

#endif // AUDIOSTATE_H