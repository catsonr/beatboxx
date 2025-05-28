#ifndef SHADERPROGRAM_H
#define SHADERPROGRAM_H

#include <vector>

#include <glad/glad.h>

#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>

#include "utilities.h"

class ShaderProgram
{
    GLuint program { 0 };
    GLuint vao { 0 }, vbo { 0 };
    
    int stride { 0 };
    int vbo_length { 0 };
    
public:
    ShaderProgram() = default;
    
    std::string fix_headers(std::string& SHADERCODE)
    {
        #ifdef __EMSCRIPTEN__
            const std::string oldHeader = "#version 330 core";
            const std::string newHeader = "#version 300 es\nprecision highp float;";
            auto pos = SHADERCODE.find(oldHeader);
            if (pos != std::string::npos) {
                SHADERCODE.replace(pos, oldHeader.size(), newHeader);
            }
        #endif
            
        return SHADERCODE;
    }
    
    /* PUBLIC METHODS */
    bool init(const char* vert_src_path, const char* frag_src_path, std::vector<float>& vbo_data, int stride)
    {
        this->vbo_length = vbo_data.size();
        this->stride = stride;
        
        std::string vert_contents = util::load_file(vert_src_path);
        vert_contents = fix_headers(vert_contents);

        std::string frag_contents = util::load_file(frag_src_path);
        frag_contents = fix_headers(frag_contents);

        program = util::create_program(vert_contents.c_str(), frag_contents.c_str());
        if( program == 0 ) {
            printf("[ShaderProgram::init] failed to create shader program!\n");
            return false;
        }
        glUseProgram(program);
        
        glGenVertexArrays(1, &vao);
        glBindVertexArray(vao);
        
        glGenBuffers(1, &vbo);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, vbo_length * sizeof(float), vbo_data.data(), GL_STATIC_DRAW);
        
        glEnableVertexAttribArray(0); // attribute assumed to exist at location = 0
        glVertexAttribPointer(0, stride, GL_FLOAT, GL_FALSE, stride * sizeof(float), (void*)0);
        
        return true;
    }
    
    void use()
    {
        glUseProgram(program);
    }
    
    void draw()
    {
        glUseProgram(program);
        glBindVertexArray(vao);
        
        glDrawArrays(GL_TRIANGLES, 0, vbo_length / stride);
        
        glBindVertexArray(0);
    }
    
    bool set_uniform(const char* name, float value) const
    {
        glUseProgram(program);

        GLint location = glGetUniformLocation(program, name);
        
        if( location == -1 ) {
            printf("[ShaderProgram::set_uniform] could not find uniform float '%s'!\n", name);
            return false;
        }
        
        glUniform1f(location, value);
        
        return true;
    }

    bool set_uniform(const char *name, glm::vec2 value) const
    {
        glUseProgram(program);

        GLint location = glGetUniformLocation(program, name);

        if ( location == -1 ) {
            printf("[ShaderProgram::set_uniform] could not find uniform vec2 '%s'!\n", name);
            return false;
        }
        glUniform2fv(location, 1, glm::value_ptr(value));
        return true;
    }

    bool set_uniform(const char *name, glm::vec3 value) const
    {
        glUseProgram(program);

        GLint location = glGetUniformLocation(program, name);

        if ( location == -1 ) {
            printf("[ShaderProgram::set_uniform] could not find uniform vec3 '%s'!\n", name);
            return false;
        }
        glUniform3fv(location, 1, glm::value_ptr(value));
        return true;
    }

    bool set_uniform(const char *name, glm::vec4 value) const
    {
        glUseProgram(program);

        GLint location = glGetUniformLocation(program, name);

        if ( location == -1 ) {
            printf("[ShaderProgram::set_uniform] could not find uniform vec4 '%s'!\n", name);
            return false;
        }
        glUniform4fv(location, 1, glm::value_ptr(value));
        return true;
    }

    bool set_uniform(const char* name, glm::mat4& matrix) const
    {
        glUseProgram(program);

        GLint location = glGetUniformLocation(program, name);
        
        if( location == -1 ) {
            printf("[ShaderProgram::set_uniform] could not find uniform mat4 '%s'!\n", name);
            return false;
        }
        
        glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(matrix));
        
        return true;
    }
    
}; // ShaderProgram

#endif // SHADERPROGRAM_H