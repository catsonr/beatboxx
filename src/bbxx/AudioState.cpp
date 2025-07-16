#define MINIAUDIO_IMPLEMENTATION
//#define MA_ENABLE_AUDIO_WORKLETS

/*
   audio worklets work correctly, however they require a cross origin isolated context, which
   static sites like neocites don't serve, so for not audio worklets will not be used
   this should be only a minor, unnoticable performance hit
*/

#include "AudioState.h"
#include "miniaudio.h"

bool AudioState::init()
{
    ma_engine_config config = ma_engine_config_init();
    config.periodSizeInFrames = periodsizeinframes;
    if( ma_engine_init(&config, &engine) != MA_SUCCESS ) {
        printf("[AudioState::init] failed to initialize mini audio engine!\n");
        return false;
    }
    
    set_volume(volume);
    
    for(Sfx& sfx : sfxs)
    {
        if( !sfx.loaded )
            sfx.init(&engine);
    }
    
    source_tracks();
    
    return true;
}

bool AudioState::source_tracks()
{
    for( auto& folder : std::filesystem::directory_iterator( util::get_fullPath(Track::tracks_folder)) )
    {
        if( !folder.is_directory() ) continue;

        std::string folder_name = folder.path().filename().string();
        std::unique_ptr<Track> track = std::make_unique<Track>(folder_name.c_str());
        printf("[AudioState::source_tracks] found '%s'\n", folder_name.c_str());

        if( !track->init() ) {
            printf("[AudioState::source_tracks] failed to initialize track '%s'!\n", folder_name.c_str());
            return false;
        }
        
        tracks.push_back( std::move(track) );
    }
    
    return true;
}

void AudioState::set_volume(float volume_new)
{
    volume = volume_new;
    
    ma_engine_set_volume(&engine, volume);
}

void AudioState::cleanup()
{
    for( auto& track : tracks )
    {
        track->cleanup();
    }
    for( Sfx& sfx : sfxs )
    {
        sfx.cleanup();
    }
    ma_engine_uninit(&engine);
}