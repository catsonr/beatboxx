#include "Welcome.h"

#include "../BBXX.h"

Welcome::Welcome(WindowState& windowstate, InputState& inputstate, GLState& glstate, NanoVGState& nanovgstate) :
    Screen(windowstate),
    inputstate(inputstate),
    glstate(glstate),
    nanovgstate(nanovgstate)
{
    welcomeoptions = {
        {
            "browse tracks",
            Command { [this](BBXX*) {
                printf("browse tracks!\n");

                return true;
            }}
        },
        {
            "options",
            Command { [this](BBXX*) {
                printf("options!\n");

                return true;
            }}
        },
        {
            "exit",
            Command { [this](BBXX* bbxx) {
                bbxx->request_quit();
                
                return true;
            }}
        },
    };
}