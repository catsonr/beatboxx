#ifndef WELCOME_H
#define WELCOME_H

#include "../GLState.h"
#include "../NanoVGState.h"
#include "../ShaderProgram.h"
#include "../Texture.h"
#include "../utilities.h"

#include "Screen.h"

class BBXX;

struct WelcomeOption
{
    const char* text;
    Command command;

    WelcomeOption(const char* text, Command command) :
        text(text),
        command(std::move(command))
    {}
}; // WelcomeOption

struct Welcome : Screen
{
    ShaderProgram program;
    InputState& inputstate;
    GLState& glstate;
    NanoVGState& nanovgstate;
    Texture wolf {};
    
    int welcomeoptions_index { 0 };
    std::vector<WelcomeOption> welcomeoptions;
    float fontsize { 100.0f };
    
    Welcome(ScreenContext& ctx);

    bool init() override
    {
        if( !wolf.init(util::get_fullPath("assets/textures/wolf.jpg").c_str(), true) ) {
            printf("[Welcome::init] failed to load wolf texture!\n");
            return false;
        }
        
        if( !program.init("assets/shaders/shaderprogram.vert", "assets/shaders/shaderprogram_texture.frag", wolf.quad, 3, 2) ) {
            printf("[Welcome::init] failed to initialize shader program!\n");
            return false;
        }
        
        wolf.model = glm::scale(wolf.model, glm::vec3(1, 1, 1));
        wolf.model = glm::translate(wolf.model, glm::vec3(-5/3, -2/3, 0));

        wolf.bind();
        program.set_uniform("u_texture", 0);
        program.set_uniform("u_mModel", wolf.model);
        program.set_uniform("u_mVP", glstate.m_VP);

        return true;
    }

    Command iterate() override
    {
        wolf.model = glm::rotate(wolf.model, glm::radians(1.0f / 12), glm::vec3(0, 1, 0));
        wolf.model = glm::rotate(wolf.model, glm::radians(1.0f / 24), glm::vec3(0, 0, 1));
        
        return {};
    }

    Command handle_event(const SDL_Event* event) override
    {
        if( inputstate.key_pressed(SDL_SCANCODE_DOWN) ) {
            welcomeoptions_index = (welcomeoptions_index + 1) % welcomeoptions.size();
        }
        else if( inputstate.key_pressed(SDL_SCANCODE_UP) ) {
            welcomeoptions_index = welcomeoptions_index == 0 ? welcomeoptions.size() - 1 : welcomeoptions_index - 1;
        }
        else if( inputstate.key_pressed(SDL_SCANCODE_RETURN) ) {
            return welcomeoptions[welcomeoptions_index].command;
        }
        
        return {};
    }
    
    void draw() override
    {
        NVGcontext* vg = nanovgstate.vg;
        
        nvgFontSize(vg, fontsize);

        nvgFontFace(vg, nanovgstate.fonts.back());
        nvgTextAlign(vg, NVG_ALIGN_LEFT | NVG_ALIGN_TOP);
        
        for( int i = 0; i < welcomeoptions.size(); i++ )
        {
            if( welcomeoptions_index == i )
                nvgFillColor(vg, nvgRGBA(255,255,255,255));
            else
                nvgFillColor(vg, nvgRGBA(255 / 2,255 / 2,255 / 2,255));

            nvgText(vg, 0, fontsize * i, welcomeoptions[i].text, nullptr);
        }

        program.set_uniform("u_mModel", wolf.model);
        program.set_uniform("u_mVP", glstate.m_VP);
        wolf.bind();
        program.draw();
    }

}; // Welcome

#endif // WELCOME_H