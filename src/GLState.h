#ifndef GLSTATE_H
#define GLSTATE_H

#include <cstdio>

// SDL3
#include <SDL3/SDL.h>

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
    std::vector<float> unitsquare_vertices { -0.5f, -0.5f, 0.0f, 0.5f, -0.5f, 0.0f, 0.5f, 0.5f, 0.0f, 0.5f, 0.5f, 0.0f, -0.5f, 0.5f, 0.0f, -0.5f, -0.5f, 0.0f };
    std::vector<float> unitcube_vertices { -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f };

    WindowState* windowstate;
    
    ShaderProgram bg_img;
    ShaderProgram shader;
    ShaderProgram threeD;
    
    // projection matrix stuff
    glm::mat4 m_view, m_proj, m_VP;
    
    // quad and cube matrix stuff
    glm::mat4 bg_img_mModel, shader_mModel, threeD_mModel;
    
    // camera stuff
    float mouse_sensitivity { 0.0020 };
    float pitch { 0 }, yaw { M_PI_2 };

    glm::vec3 camera_pos, camera_target, camera_up;
    float fov = 45.0f;
    float aspectRatio;
    float near = 0.1f;
    float far = 100.0f;
    
    // raymarching parameters 
    glm::vec3 color_ambient, color_diffuse, color_specular;
    float shininess { 10.0f };
    
    void set_mVP()
    {
        m_view = glm::lookAt(camera_pos, camera_target, camera_up);
        m_proj = glm::perspective(glm::radians(fov), aspectRatio, near, far);
        m_VP = m_proj * m_view;
    }
    
    void handle_event(SDL_Event* event)
    {
        if( windowstate->focused && event->type == SDL_EVENT_MOUSE_MOTION )
        {
            float dx = event->motion.xrel * mouse_sensitivity;
            float dy = event->motion.yrel * mouse_sensitivity;
            
            yaw += dx;
            pitch += -dy;
            if( pitch > M_PI_2 ) pitch = M_2_PI;
            else if( pitch < -M_PI_2 ) pitch = -M_2_PI;
            
            glm::vec3 look;
            look.x = cos(yaw) * cos(pitch);
            look.y = sin(pitch);
            look.z = sin(yaw) * cos(pitch);
            // look = glm::normalize(look); // shouldn't be neccessary ?
            
            camera_target = camera_pos + look;
        }
    }

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        /* CAMERA STUFF */
        aspectRatio = static_cast<float>(windowstate->w) / windowstate->h;

        // view matrix
        camera_pos = glm::vec3(0, 0, -4);
        camera_target = glm::vec3(0, 0, 0);
        camera_up = glm::vec3(0, 1, 0);
        set_mVP();
        
        /* BG TRANSFORM */
        bg_img_mModel = glm::mat4(1.0f); // identity
        bg_img_mModel = glm::translate(bg_img_mModel, glm::vec3(0, 0, 10));
        bg_img_mModel = glm::rotate(bg_img_mModel, glm::radians(10.0f), glm::vec3(0, 0, 1));
        bg_img_mModel = glm::scale(bg_img_mModel, glm::vec3(100, 10, 1));
        
        /* SHADER TRANSFORM */
        shader_mModel = glm::mat4(1.0f);
        shader_mModel = glm::scale(shader_mModel, glm::vec3(10, 10, 1));
        
        /* THREED TRANSFORM */
        threeD_mModel = glm::mat4(1.0f);
        
        bg_img.init("assets/shaders/triangle.vert", "assets/shaders/triangle.frag", unitsquare_vertices, 3);
        bg_img.set_uniform("u_mModel", bg_img_mModel);

        shader.init("assets/shaders/triangle.vert", "assets/shaders/march.frag", unitsquare_vertices, 3);
        shader.set_uniform("u_mModel", shader_mModel);
        
        threeD.init("assets/shaders/triangle.vert", "assets/shaders/cube.frag", unitcube_vertices, 3);
        threeD.set_uniform("u_mModel", threeD_mModel);
        
        color_ambient = glm::vec3(0.5, 0.8, 1.0);
        color_diffuse = glm::vec3(1.0, 1.0, 1.0);
        color_specular = glm::vec3(1.0, 1.0, 1.0);
        
        return true;
    }
    
    // t (seconds) is temporarily being passed in to make my life easier
    void iterate(float t)
    {
        set_mVP();
        bg_img.set_uniform("u_mVP", m_VP);
        shader.set_uniform("u_mVP", m_VP);
        threeD.set_uniform("u_mVP", m_VP);

        bg_img.set_uniform("u_t", t);
        bg_img.set_uniform("u_mModel", bg_img_mModel);
        
        shader.set_uniform("u_color_ambient", color_ambient);
        shader.set_uniform("u_color_diffuse", color_diffuse);
        shader.set_uniform("u_color_specular", color_specular);
        shader.set_uniform("u_shininess", shininess);
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
        bg_img.draw();
        threeD.draw();

        // transparent
        //glDisable(GL_DEPTH_TEST);
        shader.draw();
        
        // once end of draw() is reached, all rendering should be complete and ready for imgui
    }
}; // GLState

#endif // GLSTATE_H