#include <bbxx/BBXX.h>

/*
    does all necessary SDL and beatboxx initialization
    returns SDL_APP_CONTINUE if successful
    returns SDL_APP_FAILURE if there are errors 
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

    window = SDL_CreateWindow(WINDOW_TITLE, WINDOW_WIDTH_INITIAL, WINDOW_HEIGHT_INITIAL, windowflags);
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
    //SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    //SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    gl = SDL_GL_CreateContext(window);
    if ( !gl ) {
        SDL_Log("[BBXX::init] failed to create OpenGL context: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    
    if( !gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress) ) {
        SDL_Log("[BBXX::init] failed to initialize glad: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    if( !audiostate.init() ) {
        printf("[BBXX::init] failed to initialize audio state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !windowstate.init(window, &gl) ) {
        printf("[BBXX::init] failed to initialize window state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !glstate.init(&windowstate) ) {
        printf("[BBXX::init] failed to initialize gl state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !imguistate.init(&windowstate) ) {
        printf("[BBXX::init] failed to initialize imgui state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !nanovgstate.init() ) {
        printf("[BBXX::init] failed to initialize nanovg state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !polyline2dstate.init() ) {
        printf("[BBXX::init] failed to initialize polyline2d state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !stb_imgstate.init() ) {
        printf("[BBXX::init] failed to initialize stb_img state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !screenstate.init() ) {
        printf("[BBXX::init] failed to initialize screen state!\n");
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
    inputstate.iterate();
    audiostate.iterate();

    // needs to be called for glstate to display anything
    glstate.iterate(fpscounter.seconds, fpscounter.d_seconds, &inputstate);

    screenstate.iterate();

    if( !screenstate.handle_commands(this) ) {
        printf("[BBXX::iterate] failed to handle screen state commands! ( ignoring ... ) \n");
    }
}

/* does all drawing for beatboxx */
void BBXX::draw()
{
    glstate.draw_begin();
    nanovgstate.draw_begin();
    imguistate.draw_begin();

    screenstate.draw();
    
    nanovgstate.draw_end();
    imguistate.draw_end();
    
    // present result (basically glstate.draw_end())
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
SDL_AppResult BBXX::handle_event(const SDL_Event* event)
{
    // application closed
    if( event->type == SDL_EVENT_QUIT || event->type == SDL_EVENT_WINDOW_CLOSE_REQUESTED )
    {
        printf("[BBXX::handle_event] window close requested!\n");
        return SDL_APP_SUCCESS;
    }

    inputstate.handle_event(event);
    windowstate.handle_event(event);
    glstate.handle_event(event);

    screenstate.handle_event(event);

    ImGui_ImplSDL3_ProcessEvent(event);

    return SDL_APP_CONTINUE;
}

void BBXX::quit()
{
    printf("[BBXX::quit] cleaning up ...\n");
    
    if( gl )
        SDL_GL_DestroyContext(gl);

    nanovgstate.cleanup();
    audiostate.cleanup();
}

void BBXX::request_quit()
{
    if( QUIT_REQUESTED ) {
        printf("[BBXX::request_quit] BBXX has already been requested to quit. ignoring ...\n");
        return;
    }
    
    QUIT_REQUESTED = true;
}