#ifndef MAINMENU_H
#define MAINMENU_H

#include "Screen.h"

struct MainMenu : Screen
{
    float t { 0 };
    MainMenu(WindowState& windowstate) :
        Screen(windowstate)
    {}
    
    void iterate() override
    {
        t += 0.01;
    }

    void draw() override
    {

    }
}; // MainMenu

#endif // MAINMENU_H