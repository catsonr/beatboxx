#ifndef UTILITIES_H
#define UTILITIES_H

#include <SDL3/SDL.h>

#include "glad/glad.h"

#include <fstream>
#include <sstream>
#include <string>
#include <stdio.h>

namespace util
{
    inline std::string get_fullPath(const char* path_fromRoot)
    {
        std::string sdl_basepath = SDL_GetBasePath();

        // running vscode debugger executes beatboxx inside the build/Debug folder,
        // this removes 'build/Debug' from the file path, if it exists
        // TODO: handle debug filesystem properly!
        std::string bbxx_root = "beatboxx/";
        std::size_t debugPos = sdl_basepath.find(bbxx_root);
        if (debugPos != std::string::npos)
            sdl_basepath = sdl_basepath.substr(0, debugPos + bbxx_root.length());

        std::string fullpath = std::string(sdl_basepath) + path_fromRoot;
        
        return fullpath;
    }

    inline std::string load_file(const char *path_fromRoot)
    {
        std::string fullpath = get_fullPath(path_fromRoot);
        std::ifstream file(fullpath);
        if (!file.is_open())
        {
            printf("[GLState::load_file] failed to open '%s'!!!\n", fullpath.c_str());
            return "";
        }

        printf("[GLState::load_file] loaded '%s'!\n", fullpath.c_str());

        std::stringstream ss;
        ss << file.rdbuf();
        return ss.str();
    }

    inline GLuint compile_shader(GLenum type, const char *src)
    {
        GLuint shader = glCreateShader(type);
        glShaderSource(shader, 1, &src, NULL);
        glCompileShader(shader);
        GLint success;
        glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
        if (!success)
        {
            char log[512];
            glGetShaderInfoLog(shader, 512, NULL, log);
            printf("shader compile error: %s\n", log);
        }

        return shader;
    }

    inline GLuint create_program(const char *vert_src, const char *frag_src)
    {
        GLuint vertex = compile_shader(GL_VERTEX_SHADER, vert_src);
        GLuint fragment = compile_shader(GL_FRAGMENT_SHADER, frag_src);

        GLuint program = glCreateProgram();
        glAttachShader(program, vertex);
        glAttachShader(program, fragment);
        glLinkProgram(program);

        GLint success;
        glGetProgramiv(program, GL_LINK_STATUS, &success);
        if (!success)
        {
            char log[512];
            glGetProgramInfoLog(program, 512, NULL, log);
            printf("program link error: %s\n", log);
        }

        glDeleteShader(vertex);
        glDeleteShader(fragment);

        return program;
    }
} // util

#endif // UTILITIES_H