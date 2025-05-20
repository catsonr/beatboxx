#ifndef GLSTATE_H
#define GLSTATE_H

#include <stdio.h>

#include <glad/glad.h>

static GLuint compile_shader(GLenum type, const char *src)
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
    // vertex shader source
    const char* vertex_shader_src = "#version 330 core\n"
    "layout(location = 0) in vec3 aPos;\n"
    "layout(location = 1) in vec3 aColor;\n"
    "out vec3 vColor;\n"
    "void main() {\n"
    "  vColor = aColor;\n"
    "  gl_Position = vec4(aPos, 1.0);\n"
    "}\n";

    // fragment shader source
    const char* fragment_shader_src = "#version 330 core\n"
    "in vec3 vColor;\n"
    "out vec4 FragColor;\n"
    "void main() {\n"
    "  FragColor = vec4(vColor, 1.0);\n"
    "}\n";

    float vertices[18]{
        0.0f, 0.5f, 0.0f, 1.f, 0.f, 0.f,
        -0.5f, -0.5f, 0.0f, 0.f, 1.f, 0.f,
        0.5f, -0.5f, 0.0f, 0.f, 0.f, 1.f
    };

    GLuint vao, vbo;
    GLuint program;
    
    ~GLState()
    {
        glDeleteProgram(program);
        glDeleteBuffers(1, &vbo);
        glDeleteVertexArrays(1, &vao);
    }

    bool init()
    {
        glGenVertexArrays(1, &vao);
        glBindVertexArray(vao);

        glGenBuffers(1, &vbo);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
        
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), nullptr);
        glEnableVertexAttribArray(0);
        
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
        glEnableVertexAttribArray(1);
        
        program = create_program(vertex_shader_src, fragment_shader_src);
        
        return true;
    }
    
    void draw()
    {
        glUseProgram(program);
        glBindVertexArray(vao);
        glDrawArrays(GL_TRIANGLES, 0, 3);
    }
}; // GLState

#endif // GLSTATE_H