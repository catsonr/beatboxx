#include "Welcome.h"

#include "../BBXX.h"

Welcome::Welcome(ScreenContext& ctx) :
    Screen(ctx),
    inputstate(ctx.inputstate),
    glstate(ctx.glstate),
    nanovgstate(ctx.nanovgstate)
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