#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

#include <SDL3/SDL.h>

struct AudioState
{
    SDL_AudioStream *stream { nullptr };
    uint8_t *wav_data { nullptr };
    uint32_t wav_data_length { 0 };
    
    bool init()
    {
        SDL_AudioSpec spec;
        char *wav_path = NULL;
        
        SDL_asprintf(&wav_path, "%smusic.wav", SDL_GetBasePath());
        if( !SDL_LoadWAV(wav_path, &spec, &wav_data, &wav_data_length) )
        {
            SDL_Log("[AudioState::init] unable to load %s: %s", wav_path, SDL_GetError());
            return false;
        }
        printf("[AudioState::init] loaded %s\n", wav_path);
        SDL_free(wav_path);
        
        stream = SDL_OpenAudioDeviceStream(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, &spec, NULL, NULL);
        if( !stream )
        {
            SDL_Log("[AudioState::init] unable to create audio stream: %s", SDL_GetError());
            return false;
        }
        
        SDL_ResumeAudioStreamDevice(stream);

        return true;
    }
}; // AudioState

#endif // AUDIOSTATE_H