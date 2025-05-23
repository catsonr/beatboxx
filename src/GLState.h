#ifndef GLSTATE_H
#define GLSTATE_H

#include <cstdio>

// glad
#include <glad/glad.h>

// bbxx
#include "utilities.h"
#include "WindowState.h"
#include "ShaderProgram.h"

// glm
#include <glm/glm.hpp>
#include <glm/ext/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

struct GLState
{
    std::vector<float> shader_vertices {
        -0.5f, -0.5f, 0.0f,
         0.5f, -0.5f, 0.0f,
         0.5f,  0.5f, 0.0f,

         0.5f,  0.5f, 0.0f,
        -0.5f,  0.5f, 0.0f,
        -0.5f, -0.5f, 0.0f
    };
    
    std::vector<float> shapes_vertices {
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

    WindowState* windowstate;
    
    /* for drawing 'screens' of shaders in world space */
    ShaderProgram shader;

    /* for drawing traditional shapes in world space */
    ShaderProgram shapes;
    
    // projection matrix stuff
    glm::mat4 m_view, m_proj, m_VP;
    
    // quad and cube matrix stuff
    glm::mat4 cube_mModel, quad_mModel;
    
    // camera stuff
    glm::vec3 camera_pos, camera_target, camera_up;
    float fov = 45.0f;
    float aspectRatio;
    float near = 0.1f;
    float far = 100.0f;

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        /* CAMERA STUFF */
        aspectRatio = static_cast<float>(windowstate->w) / windowstate->h;

        // view matrix
        camera_pos = glm::vec3(0, 0, -4);
        camera_target = glm::vec3(0, 0, 0);
        camera_up = glm::vec3(0, 1, 0);
        m_view = glm::lookAt(camera_pos, camera_target, camera_up);
        
        // projection matrix
        m_proj = glm::perspective(glm::radians(fov), aspectRatio, near, far);
        
        // final mVP (used by both programs)
        m_VP = m_proj * m_view;

        /* CUBE TRANSFORM */
        cube_mModel = glm::mat4(1.0f); // identity
        cube_mModel = glm::translate(cube_mModel, glm::vec3(1, 1, 0));
        //cube_mModel = glm::rotate(cube_mModel, glm::radians(45.0f), glm::vec3(0, 1, 1));
        cube_mModel = glm::scale(cube_mModel, glm::vec3(1, 1, 1));

        /* QUAD TRANSFORM */
        quad_mModel = glm::mat4(1.0f); // identity
        quad_mModel = glm::translate(quad_mModel, glm::vec3(0, 0, 10));
        quad_mModel = glm::rotate(quad_mModel, glm::radians(45.0f), glm::vec3(0, 1, 0));
        quad_mModel = glm::scale(quad_mModel, glm::vec3(20, 10, 1));
        
        shader.init("assets/shaders/triangle.vert", "assets/shaders/triangle.frag", shader_vertices, 3);
        shader.set_uniform("u_mModel", quad_mModel);
        shader.set_uniform("u_mVP", m_VP);
        
        shapes.init("assets/shaders/cube.vert", "assets/shaders/cube.frag", shapes_vertices, 3);
        shapes.set_uniform("u_mModel", cube_mModel);
        shapes.set_uniform("u_mVP", m_VP);
        
        return true;
    }
    
    // t (seconds) is temporarily being passed in to make my life easier
    void iterate(float t)
    {
        shader.set_uniform("u_t", t);
    }
    
    void draw()
    {
        glEnable(GL_DEPTH_TEST);
        glViewport(0, 0, windowstate->w, windowstate->h);

        // clear
        glClearColor(0.1, 0.1, 0.1, 1.0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        shader.draw();
        shapes.draw();
        
        // once end of draw() is reached, all rendering should be complete and ready for imgui
    }
}; // GLState

#endif // GLSTATE_H