#include "bbxx.h"

/*
    does all necessary SDL initialization
    returns SDL_APP_CONTINUE if successful
    returns SDL_APP_FAILURE if errors 
*/
SDL_AppResult BBXX::init()
{
    SDL_InitFlags initflags = 
        SDL_INIT_AUDIO;
        // TODO: support controllers!
        // SDL_INIT_GAMEPAD;
    if( !SDL_InitSubSystem(initflags) ) {
        SDL_Log("[BBXX::init] failed to initialize subsystem(s): %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    SDL_WindowFlags windowflags =
        //SDL_WINDOW_FULLSCREEN |
        SDL_WINDOW_OPENGL |
        SDL_WINDOW_HIGH_PIXEL_DENSITY |
        SDL_WINDOW_RESIZABLE |
        SDL_WINDOW_INPUT_FOCUS |
        //SDL_WINDOW_ALWAYS_ON_TOP |
        SDL_WINDOW_MOUSE_FOCUS;

    window = SDL_CreateWindow(WINDOW_TITLE, WINDOW_WIDTH, WINDOW_HEIGHT, windowflags);
    if( !window ) {
        SDL_Log("[BBXX::init] failed to create window: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    SDL_SetWindowMinimumSize(window, WINDOW_WIDTH_MIN, WINDOW_HEIGHT_MIN);

    #ifndef __EMSCRIPTEN__
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);
    #else
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    #endif
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    gl = SDL_GL_CreateContext(window);
    if ( !gl ) {
        SDL_Log("[BBXX::init] failed to create OpenGL context: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    
    if( !gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress) ) {
        SDL_Log("[BBXX::init] failed to initialize glad for OpenGL 3.2 core: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    // sets metadata about beatboxx. competely optional to have
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_NAME_STRING, WINDOW_TITLE);
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_VERSION_STRING, BBXVERSION);
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_TYPE_STRING, "game");

    if( !audiostate.init() ) {
        SDL_Log("[BBXX::init] failed to initialize audio state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !windowstate.init(window, &gl) ) {
        SDL_Log("[BBXX::init] failed to initialize window state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !glstate.init(&windowstate) ) {
        SDL_Log("[BBXX::init] failed to initialize gl state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !imguistate.init(&windowstate) ) {
        SDL_Log("[BBXX::init] failed to initialize imgui state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !miku.init(&audiostate) ) {
        SDL_Log("[BBXX::init] failed to initialize miku!\n");
        return SDL_APP_FAILURE;
    }
    
    printf("[BBXX::init] initialization complete!\n");
    fpscounter.start();
    return SDL_APP_CONTINUE;
}

/* does all the calculations in preparation for drawing next frame */
void BBXX::iterate()
{
    fpscounter.iterate();
    miku.iterate();
    
    glstate.iterate(fpscounter.seconds, fpscounter.dt, &inputstate);
}

/*
    does all drawing for beatboxx
*/
void BBXX::draw()
{
    glstate.draw();
    imguistate.draw(&fpscounter, &glstate, &miku);

    SDL_GL_SwapWindow(window);
}

/*
    handles all events (user input)
    returns SDL_APP_SUCCESS of user clicks exit button
    returns SDL_APP_CONTINUE otherwise
*/
// here are some other events that may be useful in the future <3
// SDL_EVENT_KEYBOARD_ADDED,          /**< A new keyboard has been inserted into the system */
// SDL_EVENT_KEYBOARD_REMOVED,
// SDL_EVENT_CLIPBOARD_UPDATE = 0x900, /**< The clipboard or primary selection changed */
// SDL_EVENT_DROP_FILE        = 0x1000, /**< The system requests a file open */
// SDL_EVENT_AUDIO_DEVICE_ADDED = 0x1100,  /**< A new audio device is available */
// SDL_EVENT_AUDIO_DEVICE_REMOVED,
// SDL_EVENT_AUDIO_DEVICE_FORMAT_CHANGED,  /**< An audio device's format has been changed by the system. */
SDL_AppResult BBXX::handle_event(SDL_Event *event)
{
    // application closed
    if(event->type == SDL_EVENT_QUIT || event->type == SDL_EVENT_WINDOW_CLOSE_REQUESTED)
    {
        printf("[BBXX::handle_event] window close requested!\n");
        return SDL_APP_SUCCESS;
    }

    inputstate.handle_event(event);
    windowstate.handle_event(event);
    glstate.handle_event(event);

    ImGui_ImplSDL3_ProcessEvent(event);

    return SDL_APP_CONTINUE;
}

void BBXX::quit()
{
    printf("[BBXX::quit] cleaning up ...\n");

    if( gl )
        SDL_GL_DestroyContext(gl);

    miku.cleanup();
    audiostate.cleanup();
}