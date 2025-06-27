#ifndef WELCOME_H
#define WELCOME_H

#include "../GLState.h"
#include "../ShaderProgram.h"
#include "../Texture.h"
#include "../utilities.h"

#include "Screen.h"

struct Welcome : Screen
{
    std::vector<float> quad = {
      // x,    y,    z,    u,   v
      -0.5f, -0.5f, 0.0f, 0.0f, 0.0f,
       0.5f, -0.5f, 0.0f, 1.0f, 0.0f,
       0.5f,  0.5f, 0.0f, 1.0f, 1.0f,
       0.5f,  0.5f, 0.0f, 1.0f, 1.0f,
      -0.5f,  0.5f, 0.0f, 0.0f, 1.0f,
      -0.5f, -0.5f, 0.0f, 0.0f, 0.0f
    };

    ShaderProgram program;
    GLState& glstate;
    Texture diva;
    
    glm::mat4 model { glm::mat4(1.0f) };

    Welcome(WindowState& windowstate, GLState& glstate) :
        Screen(windowstate),
        glstate(glstate)
    {}

    bool init() override
    {
        if( !diva.init(util::get_fullPath("assets/textures/pkmn_font.png").c_str()) ) {
            printf("[Welcome::init] failed to load texture!\n");
            return false;
        }
        
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_texture.frag", quad, 3, 2) ) {
            printf("[Welcome::init] failed to initialize shader program!\n");
            return false;
        }

        return true;
    }

    void iterate() override
    {
        
    }
    
    void draw() override
    {
        program.use();

        diva.bind(0);
        program.set_uniform("u_texture", 0);

        program.set_uniform("u_mModel", model);
        program.set_uniform("u_mVP", glstate.m_VP);
        
        program.draw();
    }

}; // Welcome

#endif // WELCOME_H