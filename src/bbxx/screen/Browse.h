#ifndef BROWSE_H
#define BROWSE_H

#include "../ShaderProgram.h"

#include "Screen.h"

#include "../audio/Track.h"

struct Browse : Screen
{
    ShaderProgram program;

    std::vector<std::unique_ptr<Track>>& tracks;
    ma_engine& engine;
    
    Browse(ScreenContext& ctx) :
        Screen(ctx),
        tracks(ctx.audiostate.tracks),
        engine(ctx.audiostate.engine)
    {}
    
    /* the index of the currently selected track */
    int selected { 0 };
    
    bool init() override
    {
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_texture.frag", tracks.front()->art.quad, 3, 2) ) {
            printf("[Welcome::init] failed to initialize shader program!\n");
            return false;
        }
        
        tracks[selected]->init_sound(engine);

        return true;
    }

    Command handle_event(const SDL_Event *event) override
    {
        if( ctx.inputstate.key_pressed(SDL_SCANCODE_UP) ) {
            tracks[selected]->pause();
            selected++;
            if( selected >= tracks.size() ) selected = 0;
        }
        else if( ctx.inputstate.key_pressed(SDL_SCANCODE_DOWN) ) {
            tracks[selected]->pause();
            selected--;
            if( selected < 0) selected = tracks.size() - 1;
        }
        
        tracks[selected]->init_sound(engine);

        return {};
    }

    void draw() override
    {
        for(int i = 0; i < tracks.size(); i++)
        {
            Track* track = tracks[i].get();
            
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

        for( auto& track : tracks )
        {
            program.set_uniform("u_mModel", track->art.model);
            track->art.bind();
            program.draw();
        }
        
    }
}; // Browse

#endif // BROWSE_H