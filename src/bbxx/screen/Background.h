#ifndef BACKGROUND_H
#define BACKGROUND_H

#include "Screen.h"

/*
    Background clears the entire screen to the windowstate shadow color
*/
struct Background : Screen
{
    Background(ScreenContext& ctx) :
        Screen(ctx)
    {}
    
    void draw() override
    {
        const util::Color& bg = ctx.windowstate.color_shadow;
        glClearColor( bg.r, bg.g, bg.b, bg.a );
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    }
}; // Background

#endif // BACKGROUND_H