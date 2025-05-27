/*
    https://wiki.libsdl.org/SDL3_mixer/FrontPage

    AudioState manages a single instance of and SDL audio device, which is all handled with
    SDL_mixer's Mix_OpenAudio()
    SDL_mixer can manage playback of one music channel along with eight channels of
    16-bit stereo audio
    
    NOTES:
        midi soundfonts can be set with either FluidSynth or Timidity
*/

#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

#include <SDL3/SDL.h>
#include <SDL3_mixer/SDL_mixer.h>

#include <cstdio>

#include "utilities.h"

struct AudioState
{
    /* PUBLIC MEMBERS */
    Mix_Chunk *channel[8] {}; // the eight audio channels provided by SDL_mixer
    bool audio_open { false };
    int audio_volume { MIX_MAX_VOLUME };

    SDL_AudioSpec spec;

    /* PUBLIC METHODS */
    bool init()
    {
        spec.freq = MIX_DEFAULT_FREQUENCY;
        spec.format = MIX_DEFAULT_FORMAT;
        spec.channels = MIX_DEFAULT_CHANNELS;

        if( !Mix_OpenAudio(0, &spec) )
        {
            SDL_Log("[AudioState::init] failed to open mixer! %s", SDL_GetError());
            
            return false;
        }
        
        Mix_QuerySpec(&spec.freq, &spec.format, &spec.channels);
        
        /*
        SDL_Log("[AudioState::init] opened audio at %d Hz %d bit%s %s audio buffer\n", spec.freq,
            (spec.format&0xFF),
            (SDL_AUDIO_ISFLOAT(spec.format) ? " (float)" : ""),
            (spec.channels > 2) ? "surround" : (spec.channels > 1) ? "stereo" : "mono");
        */

        audio_open = true;
        
        Mix_VolumeMusic(audio_volume);
        
        return true;
    }


    
    void cleanup()
    {
        if( audio_open )
        {
            Mix_CloseAudio();
            audio_open = false;
        }
    }
    
}; // AudioState

#endif // AUDIOSTATE_H