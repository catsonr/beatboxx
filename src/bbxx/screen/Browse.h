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
    
    /* the index of the currently selected track */
    int selected { 0 };
    
    bool init() override
    {
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_texture.frag", ctx.audiostate.bgm->art.quad, 3, 2) ) {
            printf("[Welcome::init] failed to initialize shader program!\n");
            return false;
        }
        
        std::vector<Track*> tracks = ctx.audiostate.tracks;
        for( Track* track : tracks ) {
            track->init(ctx.audiostate.engine);
        }
        
        return true;
    }

    Command handle_event(const SDL_Event *event) override
    {
        if( ctx.inputstate.key_pressed(SDL_SCANCODE_UP) ) {
        ctx.audiostate.tracks[selected]->pause();
            selected++;
            if( selected >= ctx.audiostate.tracks.size() ) selected = 0;
        }
        else if( ctx.inputstate.key_pressed(SDL_SCANCODE_DOWN) ) {
        ctx.audiostate.tracks[selected]->pause();
            selected--;
            if( selected < 0) selected = ctx.audiostate.tracks.size() - 1;
        }

        return {};
    }

    void draw() override
    {
        std::vector<Track*> tracks = ctx.audiostate.tracks;
        for(int i = 0; i < tracks.size(); i++)
        {
            Track* track = tracks[i];
            
            track->art.model = glm::mat4(1.0f);
            track->art.model = glm::rotate(track->art.model, glm::radians(-10.0f), glm::vec3(0, 0, 1));
            track->art.model = glm::translate(track->art.model, glm::vec3(1.5, i - selected, 0));
            
            if( i == selected )
            {
                track->art.model = glm::rotate(track->art.model, glm::radians(10.0f), glm::vec3(0, 0, 1));
                track->art.model = glm::scale(track->art.model, glm::vec3(1.5, 1.5, 1));
                track->art.model = glm::translate(track->art.model, glm::vec3(0, 0, -0.1));
            }
        }
        
        tracks[selected]->play();
        
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