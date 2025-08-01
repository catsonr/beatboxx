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
    
    Command iterate() override
    {

        return {};
    }
    
    bool init() override
    {
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_font.frag", fontstate.glyphs.find('a')->second->quad, 3, 2) ) {
            printf("[FontTest::init] failed to initialize shader program!\n");
            return false;
        }
        
        return true;
    }
    
    void draw() override
    {
        uint16_t codepoint = '%';
        
        for( uint16_t codepoint = 32; codepoint < 128; codepoint++)
        {
            Texture* glyph = fontstate.glyphs.find(codepoint)->second.get();
            if( !glyph ) return;
            
            program.set_uniform("u_mModel", glyph->model);
            program.set_uniform("u_mVP", ctx.glstate.m_VP);
            glyph->bind();
            program.draw();
        }
    }
}; // FontTest

#endif // FONTTEST_H