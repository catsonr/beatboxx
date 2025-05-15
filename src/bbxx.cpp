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
        //SDL_WINDOW_HIGH_PIXEL_DENSITY |
        //SDL_WINDOW_ALWAYS_ON_TOP |
        // TODO: support window resizing (!)
        //SDL_WINDOW_RESIZABLE |
        SDL_WINDOW_INPUT_FOCUS |
        SDL_WINDOW_MOUSE_FOCUS;

    if ( !SDL_CreateWindowAndRenderer(WINDOW_TITLE, WINDOW_WIDTH, WINDOW_HEIGHT, windowflags, &window, &renderer ))
    {
        SDL_Log("[BBXX::init] failed to create window and/or renderer: %s", SDL_GetError());

        return SDL_APP_FAILURE;
    }
    printf("[BBXX::init] created SDL window and renderer\n");
    
    SDL_InitFlags initflags = 
        SDL_INIT_AUDIO |
        SDL_INIT_GAMEPAD;
    if( !SDL_InitSubSystem(initflags) )
    {
        SDL_Log("[BBXX::init] failed to initialize subsystem(s): %s", SDL_GetError());

        return SDL_APP_FAILURE;
    }
    
    if (SDL_SetRenderVSync(renderer, SDL_RENDERER_VSYNC_ADAPTIVE))
    {
        SDL_Log("[BBXX::init] failed to enable vsync: %s", SDL_GetError());

        return SDL_APP_FAILURE;
    }
    
    if( !textrender.init(renderer, window) )
    {
        SDL_Log("[BBXX::init] failed to initialize text render! %s", SDL_GetError());
        
        return SDL_APP_FAILURE;
    }
    
    // sets metadata about beatboxx. competely optional to have
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_NAME_STRING, WINDOW_TITLE);
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_VERSION_STRING, BBXVERSION);
    SDL_SetAppMetadataProperty(SDL_PROP_APP_METADATA_TYPE_STRING, "game");

    const int keydisplaysize = 20;
    if( !keydisplay.init(renderer, &inputstate, 0, WINDOW_HEIGHT - keydisplay.height(keydisplaysize), keydisplaysize) )
    {
        SDL_Log("[BBXX::init] failed to initialize key display!\n");

        return SDL_APP_FAILURE;
    }
    
    if( !audiostate.init() )
    {
        SDL_Log("[BBXX::init] failed to initialize audio state!\n");

        return SDL_APP_FAILURE;
    }

    if( !songselect.init(renderer, &inputstate, 100, 100) )
    {
        SDL_Log("[BBXX::init] failed to initialize song select!\n");

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

    fpscounter.draw(renderer);
    keydisplay.draw();
    songselect.draw();
    textrender.draw();

    SDL_RenderPresent(renderer);
}

/*
    handles all events (user input)
    returns SDL_APP_SUCCESS of user clicks exit button
    returns SDL_APP_CONTINUE otherwise
*/
SDL_AppResult BBXX::handle_event(SDL_Event *event)
{
    if(event->type == SDL_EVENT_QUIT)
    {
        return SDL_APP_SUCCESS;
    }
    else
    {
        inputstate.handle_event(event);
        audiostate.handle_event(event);
    }

    return SDL_APP_CONTINUE;
}

void BBXX::quit()
{
    textrender.cleanup();
    audiostate.cleanup();
}