/*
    https://wiki.libsdl.org/SDL3_mixer/FrontPage

    AudioState manages a single instance of and SDL audio device, which is all handled with
    SDL_mixer's Mix_OpenAudio()
    SDL_mixer can manage playback of one music channel along with eight channels of
    16-bit stereo audio
    
    Track handles loading and playing music, so long as Mix_AudioOpen() is successfully called
    
    NOTES:
        midi soundfonts can be set with either FluidSynth or Timidity
*/

#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

// std
#include <cstdio>

// SDL
#include <SDL3/SDL.h>
#include <SDL3_mixer/SDL_mixer.h>

// bbxx
#include "utilities.h"

struct AudioState
{
    /* PUBLIC MEMBERS */
    Mix_Chunk *channels[MIX_DEFAULT_CHANNELS] {}; // the eight audio channels provided by SDL_mixer
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

    int load_sfx(const char* path)
    {
        if( !audio_open ) {
            SDL_Log("[AudioState::load_sfx] failed to load sound effect, audio not open!\n");
            return -1;
        }
        
        std::string fullpath = util::get_fullPath(path);
        Mix_Chunk* sfx = Mix_LoadWAV(fullpath.c_str());
        if( !sfx ) {
            SDL_Log("[AudioState::load_sfx] failed to load sound effect '%s': %s", fullpath.c_str(), SDL_GetError());
            return -1;
        }
        
        for(int i = 0; i < MIX_DEFAULT_CHANNELS; i++)
        {
            if( !channels[i] ) {
                channels[i] = sfx;
                return i;
            }
        }
        
        SDL_Log("[AudioState::load_sfx] failed to load '%s', all 8 channels already in use!\n", path);
        Mix_FreeChunk(sfx);
        return -1;
    }
    
    void play_sfx(int channel, int loops=0)
    {
        if(channel < 0 || channel >= MIX_DEFAULT_CHANNELS || !channels[channel]) {
            printf("[AudioState::play_sfx] could not play sfx -- no chunk in channel %i!\n", channel);
            return;
        }
        
        Mix_PlayChannel(channel, channels[channel], loops);
    }
    
    void cleanup()
    {
        for(int i = 0; i < MIX_DEFAULT_CHANNELS; i++)
        {
            if( channels[i] ) {
                Mix_FreeChunk(channels[i]);
                channels[i] = nullptr;
            }
        }

        if( audio_open )
        {
            Mix_CloseAudio();
            audio_open = false;
        }
    }
    
}; // AudioState

#endif // AUDIOSTATE_H