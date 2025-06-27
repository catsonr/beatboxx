#ifndef TEXTURE_H
#define TEXTURE_H

// std
#include <string>

// glad
#include <glad/glad.h>

// stb_img
#include <stb/stb_image.h>

struct Texture
{
    GLuint id { 0 };

    int w { 0 };
    int h { 0 };
    int channels { 0 };
    
    Texture() = default;

    bool init(const char* full_path, bool flipY = true)
    {
        stbi_set_flip_vertically_on_load(flipY);
        
        unsigned char* data = stbi_load(full_path, &w, &h, &channels, 0);
        if( !data ) {
            printf("[Texture::init] failed to load texture '%s'!\n", full_path);
            return false;
        }
        
        GLenum format = (channels == 4 ? GL_RGBA : GL_RGB);
        
        glGenTextures(1, &id);
        glBindTexture(GL_TEXTURE_2D, id);
        
        // filtering + wrapping flags
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,     GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,     GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        
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
        glGenerateMipmap(GL_TEXTURE_2D);
        
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