#ifndef TRACK_H
#define TRACK_H

#include <SDL3_mixer/SDL_mixer.h>

#include "utilities.h"

struct Track
{
    const char* bgm_path;

    Mix_Music* bgm { nullptr };
    
    double length { 0 }; // length in seconds 
    
    const char* title { nullptr };
    const char* artist { nullptr };
    const char* album { nullptr };
    
    bool playing { false };
    
    Track(const char* bgm_path) :
        bgm_path(bgm_path)
    {}
    
    bool init()
    {
        bgm = Mix_LoadMUS(util::get_fullPath(bgm_path).c_str());
        if( !bgm ) {
            printf("[Track::init] failed to load music '%s'!\n", bgm_path);
            return false;
        }
        
        length = Mix_MusicDuration(bgm);
        title = Mix_GetMusicTitleTag(bgm);
        artist = Mix_GetMusicArtistTag(bgm);
        album = Mix_GetMusicAlbumTag(bgm);

        return true;
    }
}; // Track

#endif // TRACK_H