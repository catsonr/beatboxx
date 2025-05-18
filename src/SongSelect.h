#ifndef SONGSELECT_H
#define SONGSELECT_H

#include <SDL3/SDL.h>

#include "Util.h"

struct SongSelect : Util
{
    InputState *inputstate;

    bool init(RenderState *renderstate, InputState *inputstate, int xpos, int ypos)
    {
        (*this).renderstate = renderstate;
        (*this).inputstate = inputstate;
        
        u_x = xpos;
        u_y = ypos;
        u_width = 800;
        u_height = 600;

        return util_init();
    }
    
    void draw()
    {
        util_texture_clear();
        util_texture_drawBackground();
        util_texture_render();
    }
    
}; // SongSelect

#endif // SONGSELECT_H