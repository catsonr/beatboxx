#ifndef MIKU_H
#define MIKU_H

#include "Track.h"
#include "AudioState.h"
#include "Pace.h"
#include "PaceMaker.h"

struct Miku
{
    AudioState* audiostate;

    Track track;
    PaceMaker pacemaker{ &track };
    
    int click_channel { -1 };

    bool init(AudioState* audiostate)
    {
        this->audiostate = audiostate;
        
        std::string trackpath { "assets/tracks/lamp.mp3" };
        if( !track.init(trackpath) ) {
            SDL_Log("[Miku::init] failed to initialize track!\n");
            return false;
        }
        
        printf("[Miku::init] loaded track '%s' off '%s' by '%s'\n", track.title, track.album, track.artist);
        
        click_channel = audiostate->load_sfx("assets/sfx/click.wav");
        if( click_channel < 0 ) {
            SDL_Log("[Miku::init] failed to load sfx!\n");
            return false;
        }
        
        return true;
    }
    
    void iterate()
    {
        //return;
        if( track.pace.iterate(track.get_pos()) ) {
            audiostate->play_sfx(click_channel);
        }
    }
}; // Miku

#endif // MIKU_H