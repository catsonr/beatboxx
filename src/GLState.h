#ifndef GLSTATE_H
#define GLSTATE_H

#include <cstdio>

// glad
#include <glad/glad.h>

// bbxx
#include "utilities.h"
#include "WindowState.h"

#include <glm/glm.hpp>

struct GLState
{
    WindowState* windowstate;

    std::string vertex_shader_src = util::load_file("assets/shaders/triangle.vert");
    std::string fragment_shader_src = util::load_file("assets/shaders/sdf.frag");

    float vertices[18] = {
        // x,    y,    z
        -1.0f, -1.0f, 0.0f,
        1.0f, -1.0f, 0.0f,
        1.0f, 1.0f, 0.0f,

        1.0f, 1.0f, 0.0f,
        -1.0f, 1.0f, 0.0f,
        -1.0f, -1.0f, 0.0f
    };

    GLuint vao, vbo;
    GLuint program;
    
    GLint u_t;
    
    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        program = util::create_program(vertex_shader_src.c_str(), fragment_shader_src.c_str());
        if( program == 0 ) {
            printf("[GLState::init] failed to create program!\n");
            return false;
        }
        glUseProgram(program);

        glGenVertexArrays(1, &vao);
        glBindVertexArray(vao);

        glGenBuffers(1, &vbo);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
        
        glEnableVertexAttribArray(0); // a_location
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        
        u_t = glGetUniformLocation(program, "u_t");
        if( u_t == -1 ) {
            printf("[GLState::init] unable to find u_t!\n");
            return false;
        }

        return true;
    }
    
    void iterate(float t)
    {
        glUniform1f(u_t, t);
    }
    
    void draw()
    {
        glViewport(0, 0, windowstate->w, windowstate->h);

        glClearColor(0.1, 0.1, 0.1, 1.0);
        glClear(GL_COLOR_BUFFER_BIT);
        
        glDrawArrays(GL_TRIANGLES, 0, sizeof(vertices) / 6);
        
        // once end of draw() is reached, all rendering should be complete and ready for imgui
    }

    ~GLState()
    {
        if( program )
            glDeleteProgram(program);
        if( vbo )
            glDeleteBuffers(1, &vbo);
        if( vao)
            glDeleteVertexArrays(1, &vao);
        
    }
}; // GLState

#endif // GLSTATE_H