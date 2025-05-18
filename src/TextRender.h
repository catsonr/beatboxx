/*
    TextRender provides helper functions for interfacing with SDL_ttf.h
    TextRender can draw .ttf and .otf fonts to the screen
*/

#ifndef TEXTRENDER_H
#define TEXTRENDER_H

#include <cstdio>
#include <cstring>

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

struct Text
{
    SDL_Renderer *renderer;

    // the string of text
    const char *text{nullptr};
    int text_length;
    float pointsize;

    SDL_Color *color{nullptr};
    TTF_Font *font{nullptr};

    // the texture that contains the rasterized text
    SDL_Texture *texture{nullptr};
    // the SDL_FRect that dictates where and how much of the texture gets rendered
    SDL_FRect dst;

    // if wrap width is -1, there is no wrap
    int wrap_width = -1;

    /* PUBLIC METHODS */
    bool init(SDL_Renderer *renderer, const char *text, float pointsize, const char *font_path)
    {
        this->renderer = renderer;

        this->text = text;
        text_length = strlen(text);
        this->pointsize = pointsize;

        font = TTF_OpenFont(font_path, pointsize);

        SDL_Color tempcolor{0, 0, 0, SDL_ALPHA_OPAQUE};

        SDL_Surface *surface;
        if (wrap_width == -1)
            surface = TTF_RenderText_Blended(font, text, text_length, tempcolor);
        else
            surface = TTF_RenderText_Blended_Wrapped(font, text, text_length, tempcolor, wrap_width);

        texture = SDL_CreateTextureFromSurface(renderer, surface);
        SDL_GetTextureSize(texture, &dst.w, &dst.h);

        SDL_DestroySurface(surface);
        TTF_CloseFont(font);

        return true;
    }

    void set_pos(int x, int y)
    {
        dst.x = x;
        dst.y = y;
    }

    void set_extent(int width, int height)
    {
        dst.w = width;
        dst.h = height;
    }

    void draw()
    {
        SDL_RenderTexture(renderer, texture, NULL, &dst);
    }
}; // Text

struct TextRender
{
    /* PUBLIC MEMBERS */
    SDL_Renderer *renderer{nullptr};
    SDL_Texture *texture{nullptr};
    TTF_Font *font{nullptr};
    SDL_Surface *text;

    bool init(SDL_Renderer *renderer, SDL_Window *window)
    {
        if (!TTF_Init())
        {
            SDL_Log("Couldn't initialise SDL_ttf: %s\n", SDL_GetError());
            return false;
        }

        this->renderer = renderer;

        font = TTF_OpenFont("/Users/carson/Desktop/wrkspc/beatboxx/fonts/Exile/Exile-Regular.ttf", 200.0f);
        if (!font)
        {
            printf("unable to load font!\n");
            return false;
        }

        SDL_Color fontcolor = {255, 255, 255, SDL_ALPHA_OPAQUE / 2};
        text = TTF_RenderText_Blended(font, "beatboxx", 0, fontcolor);
        if (text)
        {
            texture = SDL_CreateTextureFromSurface(renderer, text);
            SDL_DestroySurface(text);
        }
        if (!texture)
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

        SDL_RenderTexture(renderer, texture, NULL, &dst);
    }

    void cleanup()
    {
        if (font)
            TTF_CloseFont(font);
        TTF_Quit();
    }

}; // TextRender

#endif // TEXTRENDER_H