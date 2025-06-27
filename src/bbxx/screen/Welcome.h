#ifndef WELCOME_H
#define WELCOME_H

#include "../ShaderProgram.h"

#include "Screen.h"

struct Welcome : Screen
{
    Welcome(WindowState& windowstate) :
        Screen(windowstate)
    {
        // do initialization code
    }

    void iterate() override
    {
        
    }
    
    void draw() override
    {
        
    }

}; // Welcome

#endif // WELCOME_H