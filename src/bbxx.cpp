#include "bbxx.h"

/*
    does all necessary SDL initialization
    returns SDL_APP_CONTINUE if successful
    returns SDL_APP_FAILURE if errors 
*/
SDL_AppResult BBXX::init()
{
    SDL_WindowFlags windowflags =
        // TODO: support high pixel density displays
        SDL_WINDOW_HIGH_PIXEL_DENSITY |
        //SDL_WINDOW_ALWAYS_ON_TOP |
        // TODO: support window resizing
        SDL_WINDOW_RESIZABLE |
        SDL_WINDOW_INPUT_FOCUS |
        SDL_WINDOW_MOUSE_FOCUS;

    if ( !SDL_CreateWindowAndRenderer(WINDOW_TITLE, WINDOW_WIDTH, WINDOW_HEIGHT, windowflags, &window, &renderer )) {
        SDL_Log("[BBXX::init] failed to create window and/or renderer: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    printf("[BBXX::init] created SDL window and renderer\n");
    
    SDL_InitFlags initflags = 
        SDL_INIT_AUDIO;
        // TODO: support controllers!
        // SDL_INIT_GAMEPAD;
    if( !SDL_InitSubSystem(initflags) ) {
        SDL_Log("[BBXX::init] failed to initialize subsystem(s): %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    
    if (SDL_SetRenderVSync(renderer, SDL_RENDERER_VSYNC_ADAPTIVE)) {
        SDL_Log("[BBXX::init] failed to enable vsync: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    
    // sets metadata about beatboxx. competely optional to have
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_NAME_STRING, WINDOW_TITLE);
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_VERSION_STRING, BBXVERSION);
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_TYPE_STRING, "game");
    
    // sets the minimum size the window can be reisized to
    SDL_SetWindowMinimumSize(window, WINDOW_WIDTH_MIN, WINDOW_HEIGHT_MIN);
    

    if( !audiostate.init() ) {
        SDL_Log("[BBXX::init] failed to initialize audio state!\n");
        return SDL_APP_FAILURE;
    }
    
    if( !renderstate.init(window, renderer) ) {
        SDL_Log("[BBXX::init] failed to initialize render state!\n");
        return SDL_APP_FAILURE;
    }
    //
    // RmlUi initialization
    /*
    if( !Rml::Initialise() ) {
        printf("[BBXX::init] failed to initialize RmlUi!\n");
        return SDL_APP_FAILURE;
    }
    Rml::Context* context = Rml::CreateContext("default", Rml::Vector2i(renderstate.w, renderstate.h));
    */

    if( !songselect.init(&renderstate, &inputstate, 100, 100) ) {
        SDL_Log("[BBXX::init] failed to initialize song select!\n");
        return SDL_APP_FAILURE;
    }
    
    const int keydisplaysize = 20;
    if( !keydisplay.init(&renderstate, &inputstate, 0, WINDOW_HEIGHT - keydisplay.height(keydisplaysize), keydisplaysize) ) {
        SDL_Log("[BBXX::init] failed to initialize key display!\n");
        return SDL_APP_FAILURE;
    }

    fpscounter.start();
    return SDL_APP_CONTINUE;
}

/* does all the calculations in preparation for drawing next frame */
void BBXX::iterate()
{

}

/*
    does all drawing for beatboxx
*/
void BBXX::draw()
{
    fpscounter.iterate();

    SDL_SetRenderDrawColor(renderer, 211, 255, 233, 255);
    SDL_RenderClear(renderer);

    //textrender.draw();
    fpscounter.draw(renderer);
    keydisplay.draw();
    songselect.draw();

    SDL_RenderPresent(renderer);
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
        return SDL_APP_SUCCESS;
    }
    else
    {
        // there is also :
        inputstate.handle_event(event);
        audiostate.handle_event(event);
        renderstate.handle_event(event);
    }

    return SDL_APP_CONTINUE;
}

void BBXX::quit()
{
    //Rml::RemoveContext(rmlctx->GetName());
    audiostate.cleanup();
}