#ifndef AUDIOSTATE_H
#define AUDIOSTATE_H

#include <SDL3/SDL.h>
#include <SDL3_mixer/SDL_mixer.h>

struct AudioState
{
    /* PUBLIC MEMBERS */
    Mix_Music *BGM { nullptr };
    Mix_Chunk *sfx { nullptr };
    
    int audio_open = 0;
    int next_track = 0;
    
    int audio_volume = MIX_MAX_VOLUME;
    int looping = 0;
    bool interactive = false;
    bool use_io = false;
    int i;
    
    const char *typ; // audio file type
    const char *tag_title = NULL;
    const char *tag_artist = NULL;
    const char *tag_album = NULL;
    const char *tag_copyright = NULL;

    double loop_start, loop_end, loop_length, current_position;
    
    SDL_AudioSpec spec;

    void playBGM()
    {
        SDL_Log("Playing w duration %f\n", Mix_MusicDuration(BGM));
        if (loop_start > 0.0 && loop_end > 0.0 && loop_length > 0.0)
        {
            SDL_Log("Loop points: start %g s, end %g s, length %g s\n", loop_start, loop_end, loop_length);
        }
        
        Mix_FadeInMusic(BGM, looping, 2000);
    }

    /* PUBLIC METHODS */
    bool loadBGM()
    {
        BGM = Mix_LoadMUS("/Users/carson/Desktop/wrkspc/beatboxx/music.mp3");
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

        loop_start = Mix_GetMusicLoopStartTime(BGM);
        loop_end = Mix_GetMusicLoopEndTime(BGM);
        loop_length = Mix_GetMusicLoopLengthTime(BGM);
        
        playBGM();
        
        return true;
    }

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
        
        SDL_Log("[AudioState::init] opened audio at %d Hz %d bit%s %s audio buffer\n", spec.freq,
            (spec.format&0xFF),
            (SDL_AUDIO_ISFLOAT(spec.format) ? " (float)" : ""),
            (spec.channels > 2) ? "surround" : (spec.channels > 1) ? "stereo" : "mono");

        audio_open = 1;
        
        Mix_VolumeMusic(audio_volume);
        
        return loadBGM();
    }
    
    void cleanup()
    {
        printf("[AudioState::cleanup] cleaning up audio :)\n");

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
        if( sfx )
        {
            Mix_FreeChunk(sfx);
            sfx = NULL;
        }
        if( audio_open )
        {
            Mix_CloseAudio();
            audio_open = 0;
        }
    }
    
}; // AudioState

#endif // AUDIOSTATE_H