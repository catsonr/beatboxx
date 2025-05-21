#ifndef GLSTATE_H
#define GLSTATE_H

#include <fstream>
#include <sstream>
#include <string>

#include <stdio.h>
#include <glad/glad.h>

#include "WindowState.h"

static std::string load_file(const char* pathToAsset)
{
    std::string sdl_basepath = SDL_GetBasePath();
    std::string fullpath = std::string(sdl_basepath) + pathToAsset;

    std::ifstream file(fullpath);
    if( !file.is_open() )
    {
        printf("[GLState::load_file] failed to open '%s'!!!\n", fullpath.c_str());
        return "";
    }
    
    printf("[GLState::load_file] loaded '%s'!\n", fullpath.c_str());
    
    std::stringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

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
    WindowState windowstate;

    std::string vertex_shader_src = load_file("assets/shaders/triangle.vert");
    std::string fragment_shader_src = load_file("assets/shaders/triangle.frag");

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
        glDeleteProgram(program);
        glDeleteBuffers(1, &vbo);
        glDeleteVertexArrays(1, &vao);
    }

    bool init(SDL_Window *window)
    {
        windowstate.init(window);

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
        
        glViewport(0, 0, windowstate.w, windowstate.h);

        
        return true;
    }
    
    void draw()
    {
        glUseProgram(program);
        glDrawArrays(GL_TRIANGLES, 0, sizeof(vertices) / (6 * sizeof(float)));
    }
}; // GLState

#endif // GLSTATE_H