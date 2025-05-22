#ifndef GLSTATE_H
#define GLSTATE_H

#include <glad/glad.h>

#include "utilities.h"
#include "WindowState.h"

struct GLState
{
    WindowState* windowstate;

    std::string vertex_shader_src = util::load_file("assets/shaders/triangle.vert");
    std::string fragment_shader_src = util::load_file("assets/shaders/triangle.frag");

    float vertices[36] = {
        -1.0f, 1.0f, 0.0f, 1.f, 0.f, 0.f,  // top-left
        -1.0f, -1.0f, 0.0f, 0.f, 1.f, 0.f, // bottom-left
        1.0f, -1.0f, 0.0f, 0.f, 0.f, 1.f,  // bottom-right

        -1.0f, 1.0f, 0.0f, 1.f, 0.f, 0.f, // top-left
        1.0f, -1.0f, 0.0f, 0.f, 0.f, 1.f, // bottom-right
        1.0f, 1.0f, 0.0f, 1.f, 1.f, 0.f   // top-right
    };

    GLuint vao, vbo;
    GLuint program;
    
    ~GLState()
    {
        if( program )
            glDeleteProgram(program);
        if( vbo )
            glDeleteBuffers(1, &vbo);
        if( vao)
            glDeleteVertexArrays(1, &vao);
        
    }

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        glGenVertexArrays(1, &vao);
        glBindVertexArray(vao);

        glGenBuffers(1, &vbo);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
        
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), nullptr);
        glEnableVertexAttribArray(0);
        
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
        glEnableVertexAttribArray(1);
        
        program = util::create_program(vertex_shader_src.c_str(), fragment_shader_src.c_str());

        return true;
    }
    
    void draw()
    {
        glUseProgram(program);
        glViewport(0, 0, windowstate->w, windowstate->h);

        glClearColor(0.1, 0.1, 0.1, 1.0);
        glClear(GL_COLOR_BUFFER_BIT);

        glDrawArrays(GL_TRIANGLES, 0, sizeof(vertices) / (6 * sizeof(float)));

        // once end of draw() is reached, all rendering should be complete and ready to display
    }
}; // GLState

#endif // GLSTATE_H