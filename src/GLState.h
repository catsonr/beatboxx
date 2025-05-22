#ifndef GLSTATE_H
#define GLSTATE_H

#include <cstdio>

// glad
#include <glad/glad.h>

// bbxx
#include "utilities.h"
#include "WindowState.h"

// glm
#include <glm/glm.hpp>
#include <glm/ext/matrix_transform.hpp>
#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/string_cast.hpp>
#include <glm/gtc/type_ptr.hpp>

struct GLState
{
    WindowState* windowstate;

    /* QUAD PROGRAM STUFF */
    std::string quad_vert_src = util::load_file("assets/shaders/triangle.vert");
    std::string quad_frag_src = util::load_file("assets/shaders/chess.frag");

    GLuint quad_vao, quad_vbo;
    GLuint quad_program;
    
    GLint quad_u_t;

    int quad_vertices_stride = 3;
    float quad_vertices[18] = {
        // x,    y,    z
        -1.0f, -1.0f, 0.0f,
        1.0f, -1.0f, 0.0f,
        1.0f, 1.0f, 0.0f,

        1.0f, 1.0f, 0.0f,
        -1.0f, 1.0f, 0.0f,
        -1.0f, -1.0f, 0.0f
    };

    
    /* CUBE PROGRAM STUFF */
    std::string cube_vert_src = util::load_file("assets/shaders/cube.vert");
    std::string cube_frag_src = util::load_file("assets/shaders/cube.frag");
    
    GLuint cube_vao, cube_vbo;
    GLuint cube_program;

    int cube_vertices_stride = 3;
    float cube_vertices[3 * 6 * 6] = {
        // positions
        -0.5f, -0.5f, -0.5f,
        0.5f, -0.5f, -0.5f,
        0.5f, 0.5f, -0.5f,
        0.5f, 0.5f, -0.5f,
        -0.5f, 0.5f, -0.5f,
        -0.5f, -0.5f, -0.5f,

        -0.5f, -0.5f, 0.5f,
        0.5f, -0.5f, 0.5f,
        0.5f, 0.5f, 0.5f,
        0.5f, 0.5f, 0.5f,
        -0.5f, 0.5f, 0.5f,
        -0.5f, -0.5f, 0.5f,

        -0.5f, 0.5f, 0.5f,
        -0.5f, 0.5f, -0.5f,
        -0.5f, -0.5f, -0.5f,
        -0.5f, -0.5f, -0.5f,
        -0.5f, -0.5f, 0.5f,
        -0.5f, 0.5f, 0.5f,

        0.5f, 0.5f, 0.5f,
        0.5f, 0.5f, -0.5f,
        0.5f, -0.5f, -0.5f,
        0.5f, -0.5f, -0.5f,
        0.5f, -0.5f, 0.5f,
        0.5f, 0.5f, 0.5f,

        -0.5f, -0.5f, -0.5f,
        0.5f, -0.5f, -0.5f,
        0.5f, -0.5f, 0.5f,
        0.5f, -0.5f, 0.5f,
        -0.5f, -0.5f, 0.5f,
        -0.5f, -0.5f, -0.5f,

        -0.5f, 0.5f, -0.5f,
        0.5f, 0.5f, -0.5f,
        0.5f, 0.5f, 0.5f,
        0.5f, 0.5f, 0.5f,
        -0.5f, 0.5f, 0.5f,
        -0.5f, 0.5f, -0.5f
    };
    glm::mat4 m_model, m_view, m_proj, m_MVP;
    glm::vec3 camera_pos, camera_target, camera_up;
    
    float fov = 45.0f;
    float aspectRatio;
    float near = 0.1f;
    float far = 100.0f;

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        /* QUAD PROGRAM INITIALIZATION */
        quad_program = util::create_program(quad_vert_src.c_str(), quad_frag_src.c_str());
        if( quad_program == 0 ) {
            printf("[GLState::init] failed to create program!\n");
            return false;
        }
        glUseProgram(quad_program);

        glGenVertexArrays(1, &quad_vao);
        glBindVertexArray(quad_vao);

        glGenBuffers(1, &quad_vbo);
        glBindBuffer(GL_ARRAY_BUFFER, quad_vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(quad_vertices), quad_vertices, GL_STATIC_DRAW);
        
        glEnableVertexAttribArray(0); // a_location
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        
        quad_u_t = glGetUniformLocation(quad_program, "u_t");
        if( quad_u_t == -1 ) {
            printf("[GLState::init] unable to find u_t!\n");
            return false;
        }

        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
        
        /* CUBE PRGRAM INITIALIZATION */
        cube_program = util::create_program(cube_vert_src.c_str(), cube_frag_src.c_str());
        if( cube_program == 0 ) {
            printf("[GLState::init] failed to create program!\n");
            return false;
        }
        glUseProgram(cube_program);

        aspectRatio = windowstate->w / windowstate->h;

        // model matrix
        m_model = glm::mat4(1.0f); // identity
        m_model = glm::translate(m_model, glm::vec3(0, 1, 0));
        m_model = glm::rotate(m_model, glm::radians(45.0f), glm::vec3(0, 1, 1));
        m_model = glm::scale(m_model, glm::vec3(1, 1, 1));
        //printf("m_model: %s\n", glm::to_string(m_model).c_str());
        
        // view matrix
        camera_pos = glm::vec3(0, 0, -10);
        camera_target = glm::vec3(0, 0, 0);
        camera_up = glm::vec3(0, 1, 0);
        m_view = glm::lookAt(camera_pos, camera_target, camera_up);
        //printf("m_view: %s\n", glm::to_string(m_view).c_str());
        
        // projection matrix
        m_proj = glm::perspective(glm::radians(fov), aspectRatio, near, far);
        //printf("m_proj: %s\n", glm::to_string(m_proj).c_str());
        
        // final MVP
        m_MVP = m_proj * m_view * m_model;
        
        glGenVertexArrays(1, &cube_vao);
        glGenBuffers(1, &cube_vbo);
        
        glBindVertexArray(cube_vao);
        
        glBindBuffer(GL_ARRAY_BUFFER, cube_vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(cube_vertices), cube_vertices, GL_STATIC_DRAW);
        
        glEnableVertexAttribArray(0); // a_positions
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, cube_vertices_stride * sizeof(float), (void*)0);

        // set uniform m_MVP
        GLint mvpLoc = glGetUniformLocation(cube_program, "u_mMVP");
        glUniformMatrix4fv(mvpLoc, 1, GL_FALSE, glm::value_ptr(m_MVP));
        
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
        
        return true;
    }
    
    // t (seconds) is temporarily being passed in to make my life easier
    void iterate(float t)
    {
        glUseProgram(quad_program);
        glUniform1f(quad_u_t, t);
    }
    
    void draw()
    {
        glViewport(0, 0, windowstate->w, windowstate->h);

        // clear
        glClearColor(0.1, 0.1, 0.1, 1.0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        // draw quad
        glUseProgram(quad_program);
        glBindVertexArray(quad_vao);

        glDrawArrays(GL_TRIANGLE_STRIP, 0, sizeof(quad_vertices) / quad_vertices_stride);
        
        // draw cube
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        glUseProgram(cube_program);
        glBindVertexArray(cube_vao);
        
        glDrawArrays(GL_TRIANGLES, 0, 36);
        
        glDisable(GL_BLEND);
        glBindVertexArray(0);
        
        // once end of draw() is reached, all rendering should be complete and ready for imgui
    }

    ~GLState()
    {
        if( quad_program )
            glDeleteProgram(quad_program);
        if( quad_vbo )
            glDeleteBuffers(1, &quad_vbo);
        if( quad_vao)
            glDeleteVertexArrays(1, &quad_vao);
        
    }
}; // GLState

#endif // GLSTATE_H