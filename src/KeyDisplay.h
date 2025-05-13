/*
    KeyDisplay procedurely creates a simple keyboard display based on the rectangular 85% layout
*/

#ifndef KEYDISPLAY_H
#define KEYDISPLAY_H

#include <SDL3/SDL.h>

#include "InputState.h"

constexpr SDL_Scancode keymap[6][16] {
    { SDL_SCANCODE_ESCAPE, SDL_SCANCODE_F1, SDL_SCANCODE_F2, SDL_SCANCODE_F3, SDL_SCANCODE_F4, SDL_SCANCODE_F5, SDL_SCANCODE_F6, SDL_SCANCODE_F7, SDL_SCANCODE_F8, SDL_SCANCODE_F9, SDL_SCANCODE_F10, SDL_SCANCODE_F11, SDL_SCANCODE_F12, SDL_SCANCODE_PRINTSCREEN, SDL_SCANCODE_PAUSE, SDL_SCANCODE_DELETE },
    { SDL_SCANCODE_GRAVE, SDL_SCANCODE_1, SDL_SCANCODE_2, SDL_SCANCODE_3, SDL_SCANCODE_4, SDL_SCANCODE_5, SDL_SCANCODE_6, SDL_SCANCODE_7, SDL_SCANCODE_8, SDL_SCANCODE_9, SDL_SCANCODE_0, SDL_SCANCODE_MINUS, SDL_SCANCODE_EQUALS, SDL_SCANCODE_BACKSPACE, SDL_SCANCODE_HOME },
    { SDL_SCANCODE_TAB, SDL_SCANCODE_Q, SDL_SCANCODE_W, SDL_SCANCODE_E, SDL_SCANCODE_R, SDL_SCANCODE_T, SDL_SCANCODE_Y, SDL_SCANCODE_U, SDL_SCANCODE_I, SDL_SCANCODE_O, SDL_SCANCODE_P, SDL_SCANCODE_LEFTBRACKET, SDL_SCANCODE_RIGHTBRACKET, SDL_SCANCODE_BACKSLASH, SDL_SCANCODE_PAGEUP },
    { SDL_SCANCODE_CAPSLOCK, SDL_SCANCODE_A, SDL_SCANCODE_S, SDL_SCANCODE_D, SDL_SCANCODE_F, SDL_SCANCODE_G, SDL_SCANCODE_H, SDL_SCANCODE_J, SDL_SCANCODE_K, SDL_SCANCODE_L, SDL_SCANCODE_SEMICOLON, SDL_SCANCODE_APOSTROPHE, SDL_SCANCODE_RETURN, SDL_SCANCODE_PAGEDOWN },
    { SDL_SCANCODE_LSHIFT, SDL_SCANCODE_Z, SDL_SCANCODE_X, SDL_SCANCODE_C, SDL_SCANCODE_V, SDL_SCANCODE_B, SDL_SCANCODE_N, SDL_SCANCODE_M, SDL_SCANCODE_COMMA, SDL_SCANCODE_PERIOD, SDL_SCANCODE_SLASH, SDL_SCANCODE_RSHIFT, SDL_SCANCODE_UP, SDL_SCANCODE_END },
    { SDL_SCANCODE_LCTRL, SDL_SCANCODE_LGUI, SDL_SCANCODE_LALT, SDL_SCANCODE_SPACE, SDL_SCANCODE_RALT, SDL_SCANCODE_UNKNOWN /*fn*/, SDL_SCANCODE_RCTRL, SDL_SCANCODE_LEFT, SDL_SCANCODE_DOWN, SDL_SCANCODE_RIGHT }
};

struct KeyDisplay
{
    /* PUBLIC MEMBERS */
    SDL_Texture *texture {nullptr};
    SDL_Renderer *renderer {nullptr};

    InputState *inputstate;

    int texture_width {0};
    int texture_height {0};
    int x {0}, y {0};
    
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
    // should be highly composite number, or at least divisible in halves and thirds
    int keysize = 12;
    // space inbetween keys (and border)
    static const int padding = 2;

    /* PUBLIC FUNCTIONS */
    bool init(SDL_Renderer *renderer, InputState *inputstate, int xpos, int ypos)
    {
        (*this).renderer = renderer;
        (*this).inputstate = inputstate;
        texture_height = padding + rowCount * (keysize + padding);
        texture_width = padding + 16 * (keysize + padding);
        x = xpos;
        y = ypos;

        texture = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_RGBA8888, SDL_TEXTUREACCESS_TARGET, texture_width, texture_height);
        if (!texture)
        {
            SDL_Log("[KeyDisplay] failed to create texture! %s\n", SDL_GetError());

            return false;
        }

        return true;
    }

    void draw()
    {
        if (!texture)
            return;

        SDL_SetRenderTarget(renderer, texture);
        SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);

        // clear texture
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);
        SDL_RenderClear(renderer);

        // draw background over entire texture
        SDL_SetRenderDrawColor(renderer, 128, 128, 128, 128);
        SDL_FRect bg_rect = {0, 0, (float)texture_width, (float)texture_height};
        SDL_RenderFillRect(renderer, &bg_rect);

        
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
                    SDL_SetRenderDrawColor(renderer, 10, 255, 20, 180);
                else
                    SDL_SetRenderDrawColor(renderer, 128, 128, 128, 180);
                
                // draw current key
                SDL_RenderFillRect(renderer, &keyrect);

                keyrect.x += keyrect.w + padding;
            }
        }

        SDL_SetRenderTarget(renderer, nullptr);

        SDL_FRect dst = {(float)x, (float)y, (float)texture_width, (float)texture_height};
        SDL_RenderTexture(renderer, texture, nullptr, &dst);
    }
}; // KeyDisplay

#endif // KEYDISPLAY_H