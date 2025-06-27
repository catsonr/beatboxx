/*
    this is not actually neccessary, since nanovg comes with an instance of stb_img

    if nanovg is ever removed, stb can simply be instantiated with #define STB_IMAGE_IMPLEMENTATION
*/

#ifndef STB_IMGSTATE_H
#define STB_IMGSTATE_H

#include <stb/stb_image.h>

struct Stb_imgState
{
    bool init()
    {
        //stbi_set_flip_vertically_on_load(true);

        return true;
    }
}; // Stb_imgState

#endif // STB_IMGSTATE_H