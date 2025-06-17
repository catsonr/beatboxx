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
    
    // tracks
    std::vector<Track*> tracks { &hi_posi, &kaede, &lamp };
    Track* bgm { tracks[0] }; // current track
    
    // sound effects
    std::vector<Sfx> sfxs { {"click.wav"} };

    bool bgm_playing { false };
    float volume { 1.0f };
    
    int periodsizeinframes { 256 };
    int periodcount { 3 };
    
    /* PUBLIC METHODS */
    bool init();
    
    void iterate();

    bool set_currentTrack(Track* track);
    void set_volume(float volume_new);

    bool bgm_load();
    void bgm_play();
    void bgm_pause();

    uint64_t bgm_get_pos();
    void bgm_set_pos(uint64_t frame);

    void cleanup();
}; // AudioState

#endif // AUDIOSTATE_H