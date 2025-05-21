#ifndef GLSTATE_H
#define GLSTATE_H

#include <glad/glad.h>

#include "utilities.h"
#include "WindowState.h"

static GLuint compile_shader(GLenum type, const char* src)
{
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &src, NULL);
    glCompileShader(shader);
    GLint success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if( !success )
    {
        char log[512];
        glGetShaderInfoLog(shader, 512, NULL, log);
        printf("shader compile error: %s\n", log);
    }
    
    return shader;
}

static GLuint create_program(const char *vert_src, const char *frag_src)
{
    GLuint vertex = compile_shader(GL_VERTEX_SHADER, vert_src);
    GLuint fragment = compile_shader(GL_FRAGMENT_SHADER, frag_src);
    
    GLuint program = glCreateProgram();
    glAttachShader(program, vertex);
    glAttachShader(program, fragment);
    glLinkProgram(program);

    GLint success;
    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if( !success )
    {
        char log[512];
        glGetProgramInfoLog(program, 512, NULL, log);
        printf("program link error: %s\n", log);
    }
    
    glDeleteShader(vertex);
    glDeleteShader(fragment);

    return program;
}

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
        
        program = create_program(vertex_shader_src.c_str(), fragment_shader_src.c_str());

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