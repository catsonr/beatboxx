/*
    KeyDisplay procedurely creates a simple keyboard display based on the rectangular 85% layout
*/

#ifndef KEYDISPLAY_H
#define KEYDISPLAY_H

#include <SDL3/SDL.h>

#include "Util.h"

constexpr SDL_Scancode keymap[6][16] {
    { SDL_SCANCODE_ESCAPE, SDL_SCANCODE_F1, SDL_SCANCODE_F2, SDL_SCANCODE_F3, SDL_SCANCODE_F4, SDL_SCANCODE_F5, SDL_SCANCODE_F6, SDL_SCANCODE_F7, SDL_SCANCODE_F8, SDL_SCANCODE_F9, SDL_SCANCODE_F10, SDL_SCANCODE_F11, SDL_SCANCODE_F12, SDL_SCANCODE_PRINTSCREEN, SDL_SCANCODE_PAUSE, SDL_SCANCODE_DELETE },
    { SDL_SCANCODE_GRAVE, SDL_SCANCODE_1, SDL_SCANCODE_2, SDL_SCANCODE_3, SDL_SCANCODE_4, SDL_SCANCODE_5, SDL_SCANCODE_6, SDL_SCANCODE_7, SDL_SCANCODE_8, SDL_SCANCODE_9, SDL_SCANCODE_0, SDL_SCANCODE_MINUS, SDL_SCANCODE_EQUALS, SDL_SCANCODE_BACKSPACE, SDL_SCANCODE_HOME },
    { SDL_SCANCODE_TAB, SDL_SCANCODE_Q, SDL_SCANCODE_W, SDL_SCANCODE_E, SDL_SCANCODE_R, SDL_SCANCODE_T, SDL_SCANCODE_Y, SDL_SCANCODE_U, SDL_SCANCODE_I, SDL_SCANCODE_O, SDL_SCANCODE_P, SDL_SCANCODE_LEFTBRACKET, SDL_SCANCODE_RIGHTBRACKET, SDL_SCANCODE_BACKSLASH, SDL_SCANCODE_PAGEUP },
    { SDL_SCANCODE_CAPSLOCK, SDL_SCANCODE_A, SDL_SCANCODE_S, SDL_SCANCODE_D, SDL_SCANCODE_F, SDL_SCANCODE_G, SDL_SCANCODE_H, SDL_SCANCODE_J, SDL_SCANCODE_K, SDL_SCANCODE_L, SDL_SCANCODE_SEMICOLON, SDL_SCANCODE_APOSTROPHE, SDL_SCANCODE_RETURN, SDL_SCANCODE_PAGEDOWN },
    { SDL_SCANCODE_LSHIFT, SDL_SCANCODE_Z, SDL_SCANCODE_X, SDL_SCANCODE_C, SDL_SCANCODE_V, SDL_SCANCODE_B, SDL_SCANCODE_N, SDL_SCANCODE_M, SDL_SCANCODE_COMMA, SDL_SCANCODE_PERIOD, SDL_SCANCODE_SLASH, SDL_SCANCODE_RSHIFT, SDL_SCANCODE_UP, SDL_SCANCODE_END },
    { SDL_SCANCODE_LCTRL, SDL_SCANCODE_LGUI, SDL_SCANCODE_LALT, SDL_SCANCODE_SPACE, SDL_SCANCODE_RALT, SDL_SCANCODE_UNKNOWN /*fn*/, SDL_SCANCODE_RCTRL, SDL_SCANCODE_LEFT, SDL_SCANCODE_DOWN, SDL_SCANCODE_RIGHT }
};

struct KeyDisplay : Util
{
    /* PUBLIC MEMBERS */
    static const int rowCount = 6;

    // top key row (escape, function keys, print screen, pause break, delete)
    static const int row0_keycount { 16 };
    const float row0_widths[row0_keycount] { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 };
    
    static const int row1_keycount { 15 };
    const float row1_widths[row1_keycount] { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1 };

    static const int row2_keycount { 15 };
    const float row2_widths[row2_keycount] { 1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1 };
    
    static const int row3_keycount { 14 };
    const float row3_widths[row3_keycount] { 1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1 };
    
    static const int row4_keycount { 14 };
    const float row4_widths[row4_keycount] { 2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1 };
    
    static const int row5_keycount { 10 };
    const float row5_widths[row5_keycount] { 1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1 };
    
    const float *row_widths[rowCount] = {
        row0_widths,
        row1_widths,
        row2_widths,
        row3_widths,
        row4_widths,
        row5_widths,
    };
    const float row_keycounts[rowCount] = {
        row0_keycount,
        row1_keycount,
        row2_keycount,
        row3_keycount,
        row4_keycount,
        row5_keycount,
    };
    
    // size in pixels of a single key
    int keysize;
    // space inbetween keys (and border)
    static const int padding = 2;

    /* PUBLIC FUNCTIONS */
    int height(int size) const { return padding + rowCount * (size + padding); }

    bool init(RenderState *renderstate, InputState *inputstate, int xpos, int ypos, int keysize)
    {
        (*this).renderstate = renderstate;
        (*this).keysize = keysize;
        (*this).inputstate = inputstate;

        u_x = xpos;
        u_y = ypos;
        u_height = height(keysize);
        u_width = padding + 16 * (keysize + padding);
        u_opacity = 0.2;
        
        return util_init();
    }

    // TODO: make width be fixed and progressively fill with keys, to ensure things are same width
    void draw()
    {
        util_texture_clear();
        util_texture_drawBackground();
        
        SDL_FRect keyrect = {0, 0, (float)keysize, (float)keysize};
        for(int row = 0; row < rowCount; row++)
        {
            keyrect.x = padding;
            keyrect.y = padding + row * (keysize + padding);
            for(int i = 0; i < row_keycounts[row]; i++)
            {
                SDL_Scancode sc = keymap[row][i];
                keyrect.w = keysize * row_widths[row][i];
                
                if(inputstate->key_down(sc))
                    SDL_SetRenderDrawColor(renderstate->renderer, 240, 240, 240, 255*(u_opacity*0.5f));
                else
                    SDL_SetRenderDrawColor(renderstate->renderer, 90, 90, 90, 255*u_opacity);
                
                // draw current key
                SDL_RenderFillRect(renderstate->renderer, &keyrect);

                keyrect.x += keyrect.w + padding * row_widths[row][i];
            }
        }

        util_texture_render();
    }
}; // KeyDisplay

#endif // KEYDISPLAY_H