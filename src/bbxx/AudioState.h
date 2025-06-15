#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

// std
#include <cstdio>
#include <string>

// miniaudio
#include "miniaudio.h"

// bbxx
#include "utilities.h"

struct AudioState
{
    ma_context g_context {};
    ma_device g_device {};
    ma_decoder g_decoder {};
    
    std::string track_basepath { "assets/tracks/" };

    bool init();
    bool bgm_load(const char* path);
    void bgm_play();
    void bgm_pause();
    void bgm_resume();
    void cleanup();
}; // AudioState

#endif // AUDIOSTATE_H