#ifndef UTILITIES_H
#define UTILITIES_H

#include <SDL3/SDL.h>

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
} // util

#endif // UTILITIES_H