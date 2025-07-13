#ifndef BROWSE_H
#define BROWSE_H

#include "../ShaderProgram.h"

#include "Screen.h"

struct Browse : Screen
{
    ShaderProgram program;

    Browse(ScreenContext& ctx) :
        Screen(ctx)
    {}
    
    bool init() override
    {
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_texture.frag", ctx.audiostate.bgm->art.quad, 3, 2) ) {
            printf("[Welcome::init] failed to initialize shader program!\n");
            return false;
        }
        
        return true;
    }
    
    void draw() override
    {
        Track* bgm = ctx.audiostate.bgm;
        
        program.set_uniform("u_mModel", bgm->art.model);
        program.set_uniform("u_mVP", ctx.glstate.m_VP);
        bgm->art.bind();
        program.draw();
    }
}; // Browse

#endif // BROWSE_H