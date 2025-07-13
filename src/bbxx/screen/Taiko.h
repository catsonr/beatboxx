#ifndef TAIKO_H
#define TAIKO_H

#include "Screen.h"

struct Taiko : Screen
{
    Taiko(ScreenContext& ctx) :
        Screen(ctx)
    {}
    
    void draw() override
    {
        
    }
}; // Taiko

#endif // TAIKO_H