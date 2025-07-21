#include "Welcome.h"

#include "../BBXX.h"

Welcome::Welcome(ScreenContext& ctx) :
    Screen(ctx),
    inputstate(ctx.inputstate),
    glstate(ctx.glstate),
    nanovgstate(ctx.nanovgstate)
{
    master = true;

    welcomeoptions = {
        {
            "browse tracks",
            Command { [this](BBXX* bbxx) {
                bbxx->screenstate.push<Browse>();

                return true;
            }}
        },
        {
            "options",
            Command { [this](BBXX* bbxx) {
                bbxx->screenstate.push<SliceTest>();

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