
#define MINIAUDIO_IMPLEMENTATION
#define MA_ENABLE_AUDIO_WORKLETS

#include "miniaudio.h"
#include "AudioState.h"

static void audio_data_callback(ma_device* pDevice, void* pOutput, const void* pInput, ma_uint32 frameCount) {
    ma_decoder* pDecoder = (ma_decoder*)pDevice->pUserData;
    ma_decoder_read_pcm_frames(pDecoder, pOutput, frameCount, NULL);
    (void)pInput;
}

bool AudioState::init()
{
    if( ma_context_init(NULL, 0, NULL, &g_context) != MA_SUCCESS ) {
        printf("[AudioState::init] failed to initialize miniaudio context! (ma_context_init())\n");
        return false;
    }
    
    ma_device_config deviceConfig = ma_device_config_init(ma_device_type_playback);
    deviceConfig.dataCallback = audio_data_callback;
    deviceConfig.pUserData     = &g_decoder;
    
    if( ma_device_init(&g_context, &deviceConfig, &g_device) != MA_SUCCESS ) {
        printf("[AudioState::init] failed to initialize miniaudio device! (ma_device_init())\n");
        ma_context_uninit(&g_context);
        return false;
    }

    return true;
}

bool AudioState::bgm_load(const char* path)
{
    std::string path_relative = track_basepath + path;
    std::string path_full = util::get_fullPath(path_relative.c_str());
    
    if( ma_decoder_init_file(path_full.c_str(), NULL, &g_decoder) != MA_SUCCESS ) {
        printf("[AudioState::load_bgm] failed to init decoder for file '%s'\n", path_full.c_str());
        ma_decoder_uninit(&g_decoder);
        return false;
    }
    
    printf("[AudioState::load_bgm] loaded '%s'!\n", path);
    
    ma_device_uninit(&g_device);

    const float playbackspeed = 1.0f;
    ma_device_config deviceConfig = ma_device_config_init(ma_device_type_playback);
    deviceConfig.playback.format = g_decoder.outputFormat;
    deviceConfig.playback.channels = g_decoder.outputChannels;
    deviceConfig.sampleRate = g_decoder.outputSampleRate * playbackspeed;
    deviceConfig.dataCallback = audio_data_callback;
    deviceConfig.pUserData = &g_decoder;

    if ( ma_device_init(&g_context, &deviceConfig, &g_device) != MA_SUCCESS ) {
        printf("[AudioState::load_bgm] failed to init device for file format!\n");
        ma_decoder_uninit(&g_decoder);
        return false;
    }

    return true;
}

void AudioState::bgm_play()
{
    printf("[AudioState::bgm_play] playing current bgm ...\n");
    ma_device_start(&g_device);
}

void AudioState::bgm_pause()
{
    if ( ma_device_stop(&g_device) != MA_SUCCESS ) {
        printf("[AudioState::bgm_pause] failed to pause playback\n");
    }
}

void AudioState::bgm_resume()
{
    if ( ma_device_start(&g_device) != MA_SUCCESS ) {
        printf("[AudioState::bgm_resume] failed to resume playback\n");
    }
}

void AudioState::cleanup()
{
    ma_device_uninit(&g_device);
    ma_decoder_uninit(&g_decoder);
    ma_context_uninit(&g_context); 
}