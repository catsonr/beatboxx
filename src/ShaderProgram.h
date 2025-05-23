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
    
    /* PUBLIC METHODS */
    bool init(const char* vert_src_path, const char* frag_src_path, std::vector<float>& vbo_data, int stride)
    {
        this->vbo_length = vbo_data.size();
        this->stride = stride;
        
        std::string vert_contents = util::load_file(vert_src_path);
        std::string frag_contents = util::load_file(frag_src_path);

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