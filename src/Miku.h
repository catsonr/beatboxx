#ifndef MIKU_H
#define MIKU_H

#include "Track.h"
#include "AudioState.h"

struct Miku
{
    std::string trackpath { "assets/tracks/lamp.mp3" };
    Track track;
    AudioState* audiostate;

    bool init(AudioState* audiostate)
    {
        this->audiostate = audiostate;
        
        if( !track.init(trackpath) ) {
            SDL_Log("[Miku::init] failed to initialize track!\n");
            return false;
        }
        
        printf("[Miku::init] loaded track '%s' off '%s' by '%s'\n", track.title, track.album, track.artist);
        track.play();
        
        return true;
    }
    
    void iterate()
    {
        
    }
}; // Miku

#endif // MIKU_H