#ifndef SHADERPROGRAM_H
#define SHADERPROGRAM_H

// std
#include <vector>

// glad
#include <glad/glad.h>

// glm
#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>

// bxxx
#include "utilities.h"

class ShaderProgram
{
private:
    /* PRIVATE MEMBERS */

    GLuint program { 0 };
    GLuint vao { 0 }, vbo { 0 };
    
    int stride { 0 };
    int vbo_length { 0 };
    
public:
    ShaderProgram() = default;
    
    
    /* PUBLIC METHODS */

    /* replace shader code headers with correct version, depending on build target */
    std::string fix_headers(std::string& SHADERCODE);
    /* initialize with a single attribute */
    bool init(const char* vert_src_path, const char* frag_src_path, std::vector<float>& vbo_data, int stride);
    /* init with two (interwoven) attributes */
    bool init(const char* vert_src_path, const char* frag_src_path, std::vector<float>& vbo_data, int strideA, int strideB);

    /* attach this shader program to opengl (ironically, probably should not be used) */
    void use();
    /* bind vao && glDrawArrays() */
    void draw();
    /* upload vector of floats to shader program */
    bool set_vbo(std::vector<float>& vbo_data);
    
    /* PUBLIC METHODS - UNIFORMS */

    /* set uniform 'name' as integer 'value' */
    bool set_uniform(const char* name, int value);
    /* set uniform 'name' as float 'value' */
    bool set_uniform(const char *name, float value);
    /* set uniform 'name' as vec2 'value' */
    bool set_uniform(const char *name, glm::vec2 value);
    /* set uniform 'name' as vec3 'value' */
    bool set_uniform(const char* name, glm::vec3 value);
    /* set uniform 'name' as vec4 'value' */
    bool set_uniform(const char* name, glm::vec4 value);
    /* set uniform 'name' as mat4 'value' */
    bool set_uniform(const char* name, glm::mat4& matrix);
    
}; // ShaderProgram

#endif // SHADERPROGRAM_H