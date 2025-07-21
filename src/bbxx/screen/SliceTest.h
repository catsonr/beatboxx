#ifndef SLICETEST_H
#define SLICETEST_H

#include "../ShaderProgram.h"
#include "../Texture.h"

#include "Screen.h"

struct SliceTest : Screen
{
    SliceTest(ScreenContext& ctx) :
        Screen(ctx, { false, true, true, 100, 100, 0.0, 0.0 })
    {}
    
    float t { 0.0 };
    ShaderProgram program;
    Texture texture;
    glm::mat4 identity { 1.0 };
    
    bool init() override
    {
        if( !texture.init(util::get_fullPath("assets/textures/wolf.jpg").c_str()) ) {
            printf("[SliceTest::init] failed to load texture\n");
            return false;
        }
        
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_texture.frag", texture.quad, 3, 2) ) {
            printf("[SliceTest::init] failed to initialize shader program!\n");
            return false;
        }
        
        texture.model = glm::scale(texture.model, glm::vec3(2, 2, 1));
        
        return true;
    }

    Command iterate() override
    {
        dim.x_ndc = cosf(t) * 0.9;
        dim.y_ndc = sinf(t) * 0.9;

        t += 1.0 / 4000;
        
        return {};
    }
    
    void draw() override
    {
        program.set_uniform("u_mModel", texture.model);
        program.set_uniform("u_mVP", identity);
        texture.bind();
        program.draw();
    }
}; // SliceTest

#endif // SLICETEST_H