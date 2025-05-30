#ifndef MIKU_H
#define MIKU_H

#include <vector>

#include "Track.h"
#include "AudioState.h"
#include "Pace.h"

#include "PaceMaker.h"

struct Miku
{
    AudioState* audiostate;
    
    PaceMaker pacemaker;

    Track lamp {
        "assets/tracks/lamp.mp3",
        "assets/tracks/lamp.pacemaker" 
    };
    Track kaede {
        "assets/tracks/kaede.mp3",
        "assets/tracks/kaede.pacemaker" 
    };
    Track hiposi {
        "assets/tracks/hi-posi.mp3",
        "assets/tracks/hi-posi.pacemaker" 
    };

    std::vector<Track*> tracks { &lamp, &kaede, &hiposi };
    int current_track_index { 0 };
    Track* current_track { tracks[current_track_index] };
    
    int click_channel { -1 };
    
    void set_current_track(int track_index)
    {
        // TODO: better error checking
        SDL_assert( track_index >= 0 && track_index < tracks.size() );
        
        current_track->stop();
        
        current_track_index = track_index;
        current_track = tracks[current_track_index];
        
        current_track->pace.reset();
        pacemaker.started = false;
    }

    bool init(AudioState* audiostate)
    {
        this->audiostate = audiostate;
        
        for(Track* track : tracks)
        {
            if (!track->init()) {
                SDL_Log("[Miku::init] failed to initialize track!\n");
                return false;
            }

            printf("[Miku::init] loaded track '%s' off '%s' by '%s'\n", track->title, track->album, track->artist);
        }

        
        click_channel = audiostate->load_sfx("assets/sfx/click.wav");
        if( click_channel < 0 ) {
            SDL_Log("[Miku::init] failed to load sfx!\n");
            return false;
        }
        
        return true;
    }
    
    void iterate()
    {
        // if new beat happens
        if( current_track->pace.iterate() ) {
            audiostate->play_sfx(click_channel);
        }
    }
    
    void cleanup()
    {
        for(Track* track : tracks)
        {
            track->destory();
        }
    }
}; // Miku

#endif // MIKU_H