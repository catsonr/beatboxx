#ifndef POLY_H
#define POLY_H

#include "../Polyline2DState.h"
#include "../GLState.h"
#include "Screen.h"

struct Poly : Screen
{
    Polyline2DState& polyline2dstate;
    GLState& glstate;

    Poly(WindowState& windowstate, Polyline2DState& polyline2dstate, GLState& glstate) :
        Screen(windowstate),
        polyline2dstate(polyline2dstate),
        glstate(glstate)
    {}
    
    void draw()
    {
        polyline2dstate.draw(glstate);
        //glstate.draw();
    }
}; // Poly

#endif // POLY_H