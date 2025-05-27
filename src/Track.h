#ifndef TRACK_H
#define TRACK_H

#include "AudioState.h"

struct Track
{
    AudioState* audiostate;

    std::string path;
    Mix_Music* music { nullptr };
    
    // the length of the song, in seconds
    double length { 0 };
    int sample_rate { 0 };
    int channels { 0 };
    
    const char* type { nullptr };
    const char* title { nullptr };
    const char* artist { nullptr };
    const char* album { nullptr };
    const char* copyright { nullptr };
    
    bool playing { false };
    
    /* PUBLIC METHODS */
    bool init(std::string& path)
    {
        this->path = path;
        
        music = Mix_LoadMUS(util::get_fullPath(path.c_str()).c_str());
        if( music == NULL ) {
            SDL_Log("[Track::init] failed to load music!\n");
            return false;
        }
        
        switch( Mix_GetMusicType(music))
        {
            case MUS_WAV: type = "WAV"; break;
            case MUS_MOD: type = "MOD"; break;
            case MUS_FLAC: type = "FLAC"; break;
            case MUS_MID: type = "MIDI"; break;
            case MUS_OGG: type = "OGG Vorbis"; break;
            case MUS_MP3: type = "MP3"; break;
            case MUS_OPUS: type = "OPUS"; break;
            case MUS_WAVPACK: type = "WavPack"; break;
            default: type = "NONE (file type not detected!)"; break;
        }
        
        title = Mix_GetMusicTitleTag(music);
        artist = Mix_GetMusicArtistTag(music);
        album = Mix_GetMusicAlbumTag(music);
        copyright = Mix_GetMusicCopyrightTag(music);
        
        return true;
    }

    void play(int fadeInTime_ms = 0)
    {
        if(playing) return;
        
        Mix_FadeInMusic(music, 0, fadeInTime_ms);
        playing = true;
    }

    /* DECONSTRUCTORS */
    ~Track()
    {
        //if( music ) Mix_FreeMusic(music);
        //music = nullptr;
    }

}; // Track

#endif // TRACK_H