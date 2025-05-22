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
    Mix_Music *BGM { nullptr }; // the single music channel provided by SDL_mixer

    Mix_Chunk *channel[8] {}; // the eight audio channels provided by SDL_mixer
    
    int audio_open = 0;
    int next_track = 0;
    
    int audio_volume = MIX_MAX_VOLUME;
    /*
        number of times music channel loops
        -1 for infinity (~45,000)
        1 doesnt loop for some reason? nor does 0
        2 loops once
    */
    int loops = 0;
    
    const char *typ; // audio file type
    const char *tag_title = NULL;
    const char *tag_artist = NULL;
    const char *tag_album = NULL;
    const char *tag_copyright = NULL;

    SDL_AudioSpec spec;

    void playBGM(int fadeInTime_ms = 0)
    {
        //SDL_Log("[AudioState::playBGM] playing w duration %f seconds", Mix_MusicDuration(BGM));
        Mix_FadeInMusic(BGM, loops, fadeInTime_ms);
    }

    /* PUBLIC METHODS */
    bool loadBGM()
    {
        BGM = Mix_LoadMUS(util::get_fullPath("assets/tracks/kaede.mp3").c_str());
        if( BGM == NULL )
        {
            SDL_Log("[AudioState::loadBGM] failed to load BGM! %s", SDL_GetError());
            
            return false;
        }
        
        switch (Mix_GetMusicType(BGM)) {
            case MUS_WAV:
                typ = "WAV";
                break;
            case MUS_MOD:
                typ = "MOD";
                break;
            case MUS_FLAC:
                typ = "FLAC";
                break;
            case MUS_MID:
                typ = "MIDI";
                break;
            case MUS_OGG:
                typ = "OGG Vorbis";
                break;
            case MUS_MP3:
                typ = "MP3";
                break;
            case MUS_OPUS:
                typ = "OPUS";
                break;
            case MUS_WAVPACK:
                typ = "WavPack";
                break;
            case MUS_NONE:
            default:
                typ = "NONE";
                break;
        }
        SDL_Log("[AudioState::loadBGM] detected music type: %s", typ);
        
        /*
        tag_title = Mix_GetMusicTitleTag(BGM);
        if (tag_title && SDL_strlen(tag_title) > 0) {
            SDL_Log("Title: %s", tag_title);
        }

        tag_artist = Mix_GetMusicArtistTag(BGM);
        if (tag_artist && SDL_strlen(tag_artist) > 0) {
            SDL_Log("Artist: %s", tag_artist);
        }

        tag_album = Mix_GetMusicAlbumTag(BGM);
        if (tag_album && SDL_strlen(tag_album) > 0) {
            SDL_Log("Album: %s", tag_album);
        }

        tag_copyright = Mix_GetMusicCopyrightTag(BGM);
        if (tag_copyright && SDL_strlen(tag_copyright) > 0) {
            SDL_Log("Copyright: %s", tag_copyright);
        }
        */
        
        playBGM();
        
        return true;
    }
    
    void handle_event(const SDL_Event *event)
    {
        if( event->type == SDL_EVENT_KEY_UP && event->key.scancode == SDL_SCANCODE_SPACE)
        {
            if(Mix_PausedMusic()) {
                printf("[AudioState::handle_event] music resume!\n");
                Mix_ResumeMusic();
            }
            else {
                printf("[AudioState::handle_event] music pause!\n");
                Mix_PauseMusic();
            }
        }
    }

    bool init()
    {
        spec.freq = MIX_DEFAULT_FREQUENCY;
        spec.format = MIX_DEFAULT_FORMAT;
        spec.channels = MIX_DEFAULT_CHANNELS;

        // can also pass NULL for spec to get "sensible" defaults, but setting the default here
        // gives a standard for the rest of BBXX to use
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

        audio_open = 1;
        
        Mix_VolumeMusic(audio_volume);
        
        return loadBGM();
    }


    
    void cleanup()
    {
        if(Mix_PlayingMusic())
        {
            //Mix_FadeOutMusic(1000); // miliseconds 
            //SDL_Delay(1000);
        }
        if( BGM )
        {
            Mix_FreeMusic(BGM);
            BGM = NULL;
        }
        /*
        if( sfx )
        {
            Mix_FreeChunk(sfx);
            sfx = NULL;
        }
        */
        if( audio_open )
        {
            Mix_CloseAudio();
            audio_open = 0;
        }
    }
    
}; // AudioState

#endif // AUDIOSTATE_H