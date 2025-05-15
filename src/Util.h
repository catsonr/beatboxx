/*
    Util is a superclass to drawable utilities, like KeyDisplay
*/

#ifndef UTIL_H
#define UTIL_H

#include <SDL3/SDL.h>

struct Util
{
    SDL_Renderer *renderer { nullptr };
    SDL_Texture *u_texture { nullptr };
    
    // values that must be set
    const static int UTIL_INT_DEFAULT { -1 };
    int u_width { UTIL_INT_DEFAULT };
    int u_height { UTIL_INT_DEFAULT };
    int u_x { UTIL_INT_DEFAULT };
    int u_y { UTIL_INT_DEFAULT };

    // optional values, with sensible defaults 
    float u_opacity = 1.0;
    bool u_draggable = false;
    
    virtual ~Util()
    {
        if(u_texture) SDL_DestroyTexture(u_texture);
    }
    
    /*
        renderer, u_x, u_y, u_width, u_height
        must be set before util_init() is finally called by inherited class
    */
    bool util_init()
    {
        bool ready = true;
        if(renderer == nullptr)
        {
            SDL_Log("[util_init] renderer not set!");
            ready = false;
        }
        if(u_x == UTIL_INT_DEFAULT)
        {
            SDL_Log("[util_init] x position u_x not set!");
            ready = false;
        }
        if(u_y == UTIL_INT_DEFAULT)
        {
            SDL_Log("[util_init] y position u_y not set!");
            ready = false;
        }
        if(u_width == UTIL_INT_DEFAULT)
        {
            SDL_Log("[util_init] width u_width not set!");
            ready = false;
        }
        if(u_height == UTIL_INT_DEFAULT)
        {
            SDL_Log("[util_init] height u_height not set!");
            ready = false;
        }
        if( !ready )
        {
            SDL_Log("[Util::util_init] failed to initialize due to unset values!");

            return false;
        }

        u_texture = SDL_CreateTexture(
            renderer,
            SDL_PIXELFORMAT_RGBA8888,
            SDL_TEXTUREACCESS_TARGET,
            u_width,
            u_height
        );

        return !!u_texture;
    }

    constexpr void util_texture_clear() const
    {
        SDL_SetRenderTarget(renderer, u_texture);
        SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);
        SDL_RenderClear(renderer);
    }
    
    constexpr void util_texture_drawBackground() const
    {
        SDL_SetRenderDrawColor(renderer, 128, 128, 128, 255 * (u_opacity / 2.0f));
        SDL_FRect bg_rect = { 0, 0, (float)u_width, (float)u_height };
        SDL_RenderFillRect(renderer, &bg_rect);
    }

    constexpr void util_texture_render() const
    {
        SDL_SetRenderTarget(renderer, nullptr);

        SDL_FRect dst = {(float)u_x, (float)u_y, (float)u_width, (float)u_height};
        SDL_RenderTexture(renderer, u_texture, nullptr, &dst);
    }
    
    virtual void draw() = 0;

}; // Util

#endif // UTIL_H