#ifndef MIKU_H
#define MIKU_H

#include "Track.h"
#include "AudioState.h"
#include "PaceMaker.h"

struct Miku
{
    AudioState* audiostate;

    Track track;
    PaceMaker pacemaker{ &track };

    bool init(AudioState* audiostate)
    {
        this->audiostate = audiostate;
        
        std::string trackpath { "assets/tracks/lamp.mp3" };
        if( !track.init(trackpath) ) {
            SDL_Log("[Miku::init] failed to initialize track!\n");
            return false;
        }
        
        printf("[Miku::init] loaded track '%s' off '%s' by '%s'\n", track.title, track.album, track.artist);
        
        return true;
    }
    
    void iterate()
    {
        
    }
}; // Miku

#endif // MIKU_H