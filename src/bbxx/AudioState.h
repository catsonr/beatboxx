#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

// std
#include <iostream>
#include <cstdio>
#include <string>
#include <vector>

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
    
    Track hi_posi { "hi-posi.mp3" };
    Track kaede { "kaede.mp3" };
    Track lamp { "lamp.mp3" };
    Track mid_air_thief { "mid-air thief.mp3" };
    
    // tracks
    std::vector<Track*> tracks {
        &hi_posi, &kaede, &lamp, &mid_air_thief
    };
    Track* bgm { tracks[2] }; // current track
    
    // sound effects
    std::vector<Sfx> sfxs { {"click.wav"}, {"note.wav"} };

    float volume { 0.5f };
    
    int periodsizeinframes { 256 };
    int periodcount { 3 };
    
    /* PUBLIC METHODS */
    bool init();
    
    void iterate();

    bool set_currentTrack(Track* track);
    void set_volume(float volume_new);

    void cleanup();
}; // AudioState

#endif // AUDIOSTATE_H