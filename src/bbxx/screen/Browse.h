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
        
        int i = 0;
        for( Track* track : ctx.audiostate.tracks )
        {
            track->init(ctx.audiostate.engine); // TEMP! initializes all tracks, so that their art is initialized
            track->art.model = glm::translate(track->art.model, glm::vec3(i, i/2.0f, i/3.0f));
            i++;
        }
        
        return true;
    }
    
    void draw() override
    {
        std::vector<Track*> tracks = ctx.audiostate.tracks;
        
        program.set_uniform("u_mVP", ctx.glstate.m_VP);

        for( Track* track : tracks )
        {
            program.set_uniform("u_mModel", track->art.model);
            track->art.bind();
            program.draw();
        }
        
    }
}; // Browse

#endif // BROWSE_H