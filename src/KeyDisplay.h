#ifndef KEYDISPLAY_H
#define KEYDISPLAY_H

#include <SDL3/SDL.h>

struct KeyDisplay
{
    /* PUBLIC MEMBERS */
    SDL_Texture *texture { nullptr };
    SDL_Renderer *renderer { nullptr };
    int texture_width;
    int texture_height;
    int x, y;
    
    /* CONSTRUCTORS */
    KeyDisplay(SDL_Renderer *renderer, int width, int height, int xpos, int ypos) :
        renderer(renderer),
        texture_width(width),
        texture_height(height),
        x(xpos),
        y(ypos),
        // TODO: handle when textures fail to be created
        texture( SDL_CreateTexture(renderer, SDL_PIXELFORMAT_RGBA8888, SDL_TEXTUREACCESS_TARGET, texture_width, texture_height) )
    {}
    
    /* PUBLIC FUNCTIONS */
    void drawToTexture()
    {
        
    }
}; // KeyDisplay

#endif // KEYDISPLAY_H