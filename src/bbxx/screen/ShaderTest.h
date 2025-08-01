#ifndef SHADERTEST_H
#define SHADERTEST_H

#include "Screen.h"

#include "../ShaderProgram.h"

struct ShaderTest : Screen
{
    ShaderProgram program; 
    Texture texture;

    ShaderTest(ScreenContext& ctx) :
        Screen(ctx)
    {
        imgui_draw_call = [this]() {
            ImGui::Begin("ShaderTest", nullptr, ImGuiWindowFlags_AlwaysAutoResize);
            ImGui::Text("some text");
            ImGui::End();
        };
    }
    
    bool init() override
    {
        program.init("assets/shaders/shaderprogram.vert", "assets/shaders/ShaderTest.frag", texture.quad, 3, 2);

        return true;
    }
    
    void draw() override
    {
        program.set_uniform("u_mModel", texture.model);
        program.set_uniform("u_mVP", ctx.glstate.m_VP);
        program.draw();
    }
}; // ShaderTest

#endif // SHADERTEST_H