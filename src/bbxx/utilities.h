#ifndef UTILITIES_H
#define UTILITIES_H

// std
#include <fstream>
#include <sstream>
#include <string>
#include <stdio.h>
#include <vector>
#include <unordered_set>
#include <random>

// SDL
#include <SDL3/SDL.h>

// glad
#include <glad/glad.h>

// glm
#include <glm/glm.hpp>

namespace util
{
    struct Color
    {
        float r { 0.0f };
        float g { 0.0f };
        float b { 0.0f };
        float a { 0.0f };
        
        /* CONSTRUCTORS */
        Color(float r, float g, float b, float a=1.0f) :
            r(r),
            g(g),
            b(b),
            a(a)
        {}
        
        static constexpr int MAX_INT_VALUE = 255;
        static constexpr float ONE_OVER_MAX_INT_VALUE = 1.0f / MAX_INT_VALUE;
        Color(int r, int g, int b, int a=MAX_INT_VALUE, int maxvalue=MAX_INT_VALUE) :
            r(r * ONE_OVER_MAX_INT_VALUE),
            g(g * ONE_OVER_MAX_INT_VALUE),
            b(b * ONE_OVER_MAX_INT_VALUE),
            a(a * ONE_OVER_MAX_INT_VALUE)
        {}
        
        /* PUBLIC METHODS */
        glm::vec4 as_glmvec4() const
        {
            return { r, g, b, a };
        }
        
        glm::vec3 as_glmvec3(bool premultiplied=false) const
        {
            if( premultiplied )
                return { r*a, g*a, b*a };
            
            return { r, g, b };
        }
    }; // Color

    static uint32_t RNG_SEED = std::random_device{}();
    static std::mt19937 rng(/*RNG_SEED*/ 0);
    
    // returns a random float from [0, 1]
    static std::uniform_real_distribution<float> float_dist(0.0f, 1.0f);
    inline float rand()
    {
        return float_dist(rng);
    }

    inline std::string get_fullPath(const char *path_fromRoot)
    {
        // check if path is already full path
        std::string s(path_fromRoot);
#ifndef _WIN32
        if (!s.empty() && s[0] == '/')
        { // check for leading '/' (macos & linux)
            return s;
        }
#else
        if (s.size() >= 2 && ( // check for Windows drives (e.g., C:\)
            (isalpha(s[0]) && s[1] == ':') ||
            (s.rfind("\\\\", 0) == 0)))
        {
            return s;
        }
#endif

        std::string sdl_basepath = SDL_GetBasePath();

        // running vscode debugger executes beatboxx inside the build/Debug folder,
        // this removes 'build/Debug' from the file path, if it exists
        // or in general:
        //      beatboxx/path/to/location/of/beatboxx <- executable
        // becomes
        //      beatboxx/beatboxx <- executable
        // TODO: handle debug filesystem properly!
        std::string bbxx_root = "beatboxx/";
        std::size_t debugPos = sdl_basepath.find(bbxx_root);
        if (debugPos != std::string::npos)
            sdl_basepath = sdl_basepath.substr(0, debugPos + bbxx_root.length());

        std::string fullpath = std::string(sdl_basepath) + path_fromRoot;

        return fullpath;
    }

    inline std::string get_parentDirectory(const std::string &path)
    {
        auto slash = path.find_last_of("/\\");
        if (slash == std::string::npos)
        {
            printf("[util::get_parentDirectory] unable to find parent directory of '%s'!\n", path.c_str());
            return "";
        }

        return path.substr(0, slash);
    }

    inline std::string load_file(const char *path_fromRoot)
    {
        std::string fullpath = get_fullPath(path_fromRoot);
        std::ifstream file(fullpath);
        if (!file.is_open())
        {
            printf("[util::load_file] failed to open '%s'!!!\n", fullpath.c_str());
            return "";
        }

        // printf("[util::load_file] loaded '%s'!\n", fullpath.c_str());

        std::stringstream ss;
        ss << file.rdbuf();

        if (ss.str().empty())
        {
            printf("[util::load_file] warning! the file '%s' is empty!\n", path_fromRoot);
        }

        return ss.str();
    }

    inline std::string replace_includes_rec(const std::string &fullpath, std::unordered_set<std::string> &seen)
    {
        std::string code = load_file(fullpath.c_str());
        if (code.empty())
        {
            printf("[util::replace_includes_rec] failed to open file '%s'!\n", fullpath.c_str());
            return "<FILE LOAD FAILURE!!!!>";
        }
        std::string parentdir = get_parentDirectory(fullpath);

        std::stringstream lines(code);
        std::stringstream lines_out;
        std::string line;

        while (std::getline(lines, line))
        {
            size_t include_pos = line.find("#include");

            if (include_pos != std::string::npos)
            {
                size_t quote_first = line.find('"', include_pos);
                size_t quote_second = (quote_first == std::string::npos) ? std::string::npos : line.find('"', quote_first + 1);

                if (quote_first != std::string::npos && quote_second != std::string::npos)
                {
                    std::string include_path = line.substr(
                        quote_first + 1,
                        quote_second - quote_first - 1);

                    std::string resolved_path;
                    if (include_path.rfind("lygia/", 0) == 0)
                    {
                        resolved_path = "vendored/" + include_path;
                    }
                    else if (!parentdir.empty())
                    {
                        resolved_path = parentdir + "/" + include_path;
                    }
                    else
                    {
                        // fallback, assume it lives in vendored/
                        resolved_path = "vendored/" + include_path;
                    }

                    if (seen.insert(resolved_path).second)
                    {
                        std::string inlined = replace_includes_rec(resolved_path, seen);
                        lines_out << inlined << "\n";
                    }

                    continue;
                }
            }

            lines_out << line << "\n";
        }

        // printf("util::replace_includes] called. dumping output:\n<begin>\n%s\n<end>\n", lines_out.str().c_str());

        return lines_out.str();
    }
    inline std::string replace_includes(const char *path_fromRoot)
    {
        std::unordered_set<std::string> seen;

        std::string path = get_fullPath(path_fromRoot);
        std::string codeREPLACED = replace_includes_rec(path, seen);

        return codeREPLACED;
    }

    inline bool save_file_string(const char *path_fromRoot, const std::string &s)
    {
        std::string fullpath = get_fullPath(path_fromRoot);

        std::ofstream file(fullpath);
        if (!file.is_open())
        {
            printf("[util::save_file_string] failed to open '%s' for writing!\n",
                   fullpath.c_str());
            return false;
        }

        // write out the entire string
        file << s;
        if (!file.good())
        {
            printf("[util::save_file_string] error writing to '%s'\n",
                   fullpath.c_str());
            return false;
        }

        file.close();
        printf("[util::save_file_string] successfully wrote '%s'\n", path_fromRoot);
        return true;
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
            printf("[util::compile_shader] shader compile error in file '%s':\n> COMPILE ERROR START <\n%s\n> COMPILE ERROR END <\n", src, log);

            glDeleteShader(shader);

            return 0;
        }

        return shader;
    }

    inline GLuint create_program(const char *vert_src, const char *frag_src)
    {
        GLuint vertex = compile_shader(GL_VERTEX_SHADER, vert_src);
        if (vertex == 0)
            return 0;

        GLuint fragment = compile_shader(GL_FRAGMENT_SHADER, frag_src);
        if (fragment == 0)
            return 0;

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
            printf("[util::create_program] program link error: %s\n", log);

            return 0;
        }

        glDeleteShader(vertex);
        glDeleteShader(fragment);

        return program;
    }
} // util

#endif // UTILITIES_H