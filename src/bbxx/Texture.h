#ifndef TEXTURE_H
#define TEXTURE_H

// std
#include <string>
#include <vector>

// glad
#include <glad/glad.h>

// glm
#include <glm/glm.hpp>
#include <glm/ext/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

// stb_img
#include <stb/stb_image.h>

struct Texture
{
    GLuint id { 0 };

    /* the width of the texture, in pixels */
    int w { 0 };
    /* the height of the texture, in pixels */
    int h { 0 };
    /* the number of color channels */
    int channels { 0 };
    
    /* the percent of the width of the texture to render, from 0.0 to 1.0 */
    float width;
    /* the percent of the height of the texture to render, from 0.0 to 1.0 */
    float height;
    /* if the section of the texture is centered */
    bool centered;
    
    /* the vertices of the two triangles of the rendered quad */
    std::vector<float> quad;

    /* the model matrix used to transform the quad */
    glm::mat4 model { 1.0 };

    Texture(float width = 1.0, float height = 1.0, bool centered = false) :
        width(width),
        height(height),
        centered(centered)
    {
        quad.resize((3 + 2) * 5);
        
        if( !centered ) {
            quad = {
                // x, y, z, u, v
                -0.5f, -0.5f, 0.0f, 1.0f*width, 1.0f - height,
                 0.5f, -0.5f, 0.0f, 0.0f*width, 1.0f - height,
                 0.5f,  0.5f, 0.0f, 0.0f*width, 1.0f,
                 0.5f,  0.5f, 0.0f, 0.0f*width, 1.0f,
                -0.5f,  0.5f, 0.0f, 1.0f*width, 1.0f,
                -0.5f, -0.5f, 0.0f, 1.0f*width, 1.0f - height
            };
        } else {
            float uMin = 0.5f - width * 0.5f;
            float uMax = 0.5f + width * 0.5f;
            float vMin = 0.5f - height * 0.5f;
            float vMax = 0.5f + height * 0.5f;

            quad = {
                // x, y, z, u, v
                -0.5f, -0.5f,  0.0f,  uMax,     vMin,
                 0.5f, -0.5f,  0.0f,  uMin,     vMin,
                 0.5f,  0.5f,  0.0f,  uMin,     vMax,
                 0.5f,  0.5f,  0.0f,  uMin,     vMax,
                -0.5f,  0.5f,  0.0f,  uMax,     vMax,
                -0.5f, -0.5f,  0.0f,  uMax,     vMin
            };
        }
    }

    bool init(const char* full_path, bool pixelperfect)
    {
        stbi_set_flip_vertically_on_load(true);
        
        unsigned char* data = stbi_load(full_path, &w, &h, &channels, 0);
        if( !data ) {
            printf("[Texture::init] failed to load texture '%s'!\n", full_path);
            return false;
        }
        
        GLenum format = (channels == 4 ? GL_RGBA : GL_RGB);
        
        glGenTextures(1, &id);
        glBindTexture(GL_TEXTURE_2D, id);
        
        // filtering + wrapping flags
        if( pixelperfect ) {
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,     GL_CLAMP_TO_EDGE);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,     GL_CLAMP_TO_EDGE);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        } else {
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,     GL_REPEAT);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,     GL_REPEAT);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        }
        
        // create mipmap
        glTexImage2D(
            GL_TEXTURE_2D,
            0,              // mip level
            format,         // internal format
            w,
            h,
            0,              // border
            format,         // source format
            GL_UNSIGNED_BYTE,
            data
        );

        if( !pixelperfect ) glGenerateMipmap(GL_TEXTURE_2D);
        
        glBindTexture(GL_TEXTURE_2D, 0);
        stbi_image_free(data);
        
        return true;
    }
    
    void bind(unsigned unit = 0)
    {
        glActiveTexture(GL_TEXTURE0 + unit);
        glBindTexture(GL_TEXTURE_2D, id);
    }
    
    void unbind(unsigned unit = 0)
    {
        glActiveTexture(GL_TEXTURE0 + unit);
        glBindTexture(GL_TEXTURE_2D, 0);
    }
    
    ~Texture() {
        if (id) glDeleteTextures(1, &id);
    }
}; // Texture

#endif // TEXTURE_H