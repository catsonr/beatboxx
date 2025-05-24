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
    // unit square in xy plane
    std::vector<float> unitsquare_vertices {
        -0.5f, -0.5f, 0.0f,
         0.5f, -0.5f, 0.0f,
         0.5f,  0.5f, 0.0f,

         0.5f,  0.5f, 0.0f,
        -0.5f,  0.5f, 0.0f,
        -0.5f, -0.5f, 0.0f
    };
    
    // unit cube
    std::vector<float> unitcube_vertices {
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
    
    ShaderProgram bg;
    ShaderProgram cube;
    ShaderProgram shader;
    
    // projection matrix stuff
    glm::mat4 m_view, m_proj, m_VP;
    
    // quad and cube matrix stuff
    glm::mat4 cube_mModel, bg_mModel, shader_mModel;
    
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

        /* BG TRANSFORM */
        bg_mModel = glm::mat4(1.0f); // identity
        bg_mModel = glm::translate(bg_mModel, glm::vec3(0, 0, 10));
        bg_mModel = glm::rotate(bg_mModel, glm::radians(10.0f), glm::vec3(0, 0, 1));
        bg_mModel = glm::scale(bg_mModel, glm::vec3(100, 10, 1));
        
        /* SHADER TRANSFORM */
        shader_mModel = glm::mat4(1.0f);
        shader_mModel = glm::scale(shader_mModel, glm::vec3(10, 10, 1));
        
        bg.init("assets/shaders/triangle.vert", "assets/shaders/triangle.frag", unitsquare_vertices, 3);
        bg.set_uniform("u_mModel", bg_mModel);
        bg.set_uniform("u_mVP", m_VP);
        
        shader.init("assets/shaders/triangle.vert", "assets/shaders/march.frag", unitsquare_vertices, 3);
        shader.set_uniform("u_mModel", shader_mModel);
        shader.set_uniform("u_mVP", m_VP);
        
        cube.init("assets/shaders/cube.vert", "assets/shaders/cube.frag", unitcube_vertices, 3);
        cube.set_uniform("u_mModel", cube_mModel);
        cube.set_uniform("u_mVP", m_VP);
        
        return true;
    }
    
    // t (seconds) is temporarily being passed in to make my life easier
    void iterate(float t)
    {
        bg.set_uniform("u_t", t);
        bg.set_uniform("u_mModel", bg_mModel);
        
        //shader.set_uniform("u_t", t);
    }
    
    void draw()
    {
        glEnable(GL_DEPTH_TEST);
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        glViewport(0, 0, windowstate->w, windowstate->h);

        glClearColor(0.1, 0.1, 0.1, 1.0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        // opaque
        cube.draw();
        bg.draw();

        // transparent
        //glDisable(GL_DEPTH_TEST);
        shader.draw();
        
        // once end of draw() is reached, all rendering should be complete and ready for imgui
    }
}; // GLState

#endif // GLSTATE_H