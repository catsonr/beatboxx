/*
    these are functions that are able to be called from the web browser
    they function the same on desktop and web, and are simply exposed to
    web assembly to be called externally
*/

#ifndef WEB_FUNCTIONS_H
#define WEB_FUNCTIONS_H

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#include "WindowState.h"

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    bool web__fullscreen(WindowState* windowstate, bool request_open)
    {
        return windowstate->fullscreen(request_open);
    }
}

#endif // WEB_FUNCTIONS_H