#ifndef TEXTRENDER_H
#define TEXTRENDER_H

#include <cstdio>

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

struct TextRender
{
    /* PUBLIC MEMBERS */
    SDL_Renderer *renderer { nullptr };
    SDL_Window *window { nullptr };
    SDL_Texture *texture { nullptr };
    TTF_Font *font { nullptr };
    SDL_Surface *text;

    bool init(SDL_Renderer *renderer, SDL_Window *window)
    {
        if (!TTF_Init())
        {
            SDL_Log("Couldn't initialise SDL_ttf: %s\n", SDL_GetError());
            return false;
        }

        this->renderer = renderer;
        this->window = window;
        
        font = TTF_OpenFont("/Users/carson/Desktop/wrkspc/beatboxx/fonts/splatoon3/AsiaKCUBE-R.ttf", 20.0f);
        if( !font ) 
        {
            printf("unable to load font!\n");
            return false;
        }
        
        SDL_Color fontcolor = { 255, 255, 255, SDL_ALPHA_OPAQUE };
        text = TTF_RenderText_Blended(font, "SPLATOON3 FONT YEAH!!!!", 0, fontcolor);
        if( text )
        {
            texture = SDL_CreateTextureFromSurface(renderer, text);
            SDL_DestroySurface(text);
        }
        if( !texture )
        {
            SDL_Log("unable to create text texture: %s", SDL_GetError());
            
            return false;
        }
        
        return true;
    }
    
    void draw()
    {
        int w = 0, h = 0;
        SDL_FRect dst;

        SDL_GetRenderOutputSize(renderer, &w, &h);
        SDL_GetTextureSize(texture, &dst.w, &dst.h);
        dst.x = (w - dst.w) / 2;
        dst.y = (h - dst.h) / 2;
        
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
        SDL_RenderTexture(renderer, texture, NULL, &dst);
    }
    
    void cleanup()
    {
        if( font ) TTF_CloseFont(font);
        TTF_Quit();
    }
}; // TextRender

#endif // TEXTRENDER_H