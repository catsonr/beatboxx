#ifndef SFX_H
#define SFX_H

// miniaudio 
#include "miniaudio.h"

struct Sfx
{
    ma_sound sound;
    bool loaded { false };
    
    std::string fullPath;

    // Construct with the filename relative to assets/sfx/
    Sfx(const char* filename) {
        std::string rel = std::string("assets/sfx/") + filename;
        fullPath = util::get_fullPath(rel.c_str());
    }
    
    bool init(ma_engine* engine)
    {
        if (ma_sound_init_from_file(
                engine,
                fullPath.c_str(),
                MA_SOUND_FLAG_DECODE,  // decode to PCM for fast start
                nullptr,               // no sound group
                nullptr,               // no done-fence
                &sound                 // pointer to your ma_sound
            ) != MA_SUCCESS) {
            return false;
        }
        ma_sound_set_looping(&sound, false);
        ma_sound_set_volume(&sound, 1.0f);
        loaded = true;
        return true;
    }
    
    void play()
    {
        if (!loaded) return;

        ma_sound_seek_to_pcm_frame(&sound, 0);
        ma_sound_start(&sound);
    }

    void cleanup()
    {
        if( loaded ) {
            ma_sound_uninit(&sound);
            loaded = false;
        }
    }
}; // Sfx

#endif // SFX_H