#ifndef FONTTEST_H
#define FONTTEST_H

#include "../ShaderProgram.h"

#include "Screen.h"

struct FontTest : Screen
{
    FontTest(ScreenContext& ctx) :
        Screen(ctx),
        fontstate(ctx.fontstate)
    {}
    
    ShaderProgram program;
    FontState& fontstate;
    glm::mat4 identity { glm::mat4(1.0) };
    
    bool init() override
    {
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_font.frag", fontstate.tempsingleglyphtexture.quad, 3, 2) ) {
            printf("[FontTest::init] failed to initialize shader program!\n");
            return false;
        }
        
        return true;
    }
    
    void draw() override
    {
        program.set_uniform("u_mModel", fontstate.tempsingleglyphtexture.model);
        program.set_uniform("u_mVP", ctx.glstate.m_VP);
        fontstate.tempsingleglyphtexture.bind();
        program.draw();
    }
}; // FontTest

#endif // FONTTEST_H