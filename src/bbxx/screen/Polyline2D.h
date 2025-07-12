#ifndef POLY_H
#define POLY_H

#include "../Polyline2DState.h"
#include "../GLState.h"
#include "Screen.h"

struct Poly : Screen
{
    Polyline2DState& polyline2dstate;
    GLState& glstate;

    Poly(ScreenContext& ctx) :
        Screen(ctx),
        polyline2dstate(ctx.polyline2dstate),
        glstate(ctx.glstate)
    {}
    
    void draw()
    {
        polyline2dstate.draw();
        //glstate.draw();
    }
}; // Poly

#endif // POLY_H