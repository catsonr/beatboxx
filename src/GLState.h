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
#include "InputState.h"
#include "ShaderProgram.h"

// glm
#include <glm/glm.hpp>
#include <glm/ext/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

struct GLState
{
    std::vector<float> unitsquare_vertices { -0.5f, -0.5f, 0.0f, 0.5f, -0.5f, 0.0f, 0.5f, 0.5f, 0.0f, 0.5f, 0.5f, 0.0f, -0.5f, 0.5f, 0.0f, -0.5f, -0.5f, 0.0f };
    std::vector<float> unitcube_vertices { -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f,  0.5f, -0.5f, 0.5f,  0.5f, -0.5f, -0.5f,  0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f,  0.5f, 0.5f, -0.5f,  0.5f, 0.5f,  0.5f,  0.5f, 0.5f,  0.5f,  0.5f, -0.5f,  0.5f,  0.5f, -0.5f, -0.5f,  0.5f, -0.5f,  0.5f,  0.5f, -0.5f,  0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f,  0.5f, -0.5f,  0.5f,  0.5f, 0.5f,  0.5f,  0.5f, 0.5f,  0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f,  0.5f, 0.5f,  0.5f,  0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f,  0.5f, 0.5f, -0.5f,  0.5f, -0.5f, -0.5f,  0.5f, -0.5f, -0.5f, -0.5f, -0.5f,  0.5f, -0.5f, 0.5f,  0.5f, -0.5f, 0.5f,  0.5f,  0.5f, 0.5f,  0.5f,  0.5f, -0.5f,  0.5f,  0.5f, -0.5f,  0.5f, -0.5f };

    WindowState* windowstate;
    
    ShaderProgram bg_img;
    ShaderProgram shader;
    ShaderProgram threeD;
    
    // projection matrix stuff
    glm::mat4 m_view, m_proj, m_VP;
    
    // quad and cube matrix stuff
    glm::mat4 bg_img_mModel, shader_mModel, threeD_mModel;
    
    // camera stuff
    float mouse_sensitivity { 0.002 };
    float camera_movementSpeed { 0.0000008 };
    float pitch { 0 }, yaw { M_PI_2 };

    glm::vec3 camera_pos { 0, 0, -40 };
    glm::vec3 camera_target { 0, 0, 0 };
    glm::vec3 camera_up { 0, 1, 0 };
    float fov = 15.0f;
    float aspectRatio;
    float near = 0.1f;
    float far = 100.0f;
    
    // raymarching parameters 
    glm::vec3 color_ambient { 0.5, 0.8, 1.0 };
    glm::vec3 color_diffuse { 1.0, 1.0, 1.0 };
    glm::vec3 color_specular { 1.0, 1.0, 1.0 };
    glm::vec4 color_none { 0.1, 0.1, 0.1, 0.1 };
    float shininess { 10.0f };
    
    void set_mVP()
    {
        aspectRatio = static_cast<float>(windowstate->w) / windowstate->h;

        m_view = glm::lookAt(camera_pos, camera_target, camera_up);
        m_proj = glm::perspective(glm::radians(fov), aspectRatio, near, far);

        m_VP = m_proj * m_view;
    }

    // the only reason for #include "InputState.h"
    void camera_move(InputState* inputstate, float dt)
    {
        if( !windowstate->focused ) return;

        glm::vec3 forward = glm::normalize(camera_target - camera_pos);
        glm::vec3 right = glm::normalize( glm::cross(forward, camera_up) );
        
        float v = camera_movementSpeed * dt;
        glm::vec3 delta {0, 0, 0};
        
        if(inputstate->key_down(SDL_SCANCODE_W)) delta += forward * v;
        if(inputstate->key_down(SDL_SCANCODE_A)) delta += -right * v;
        if(inputstate->key_down(SDL_SCANCODE_S)) delta += -forward * v;
        if(inputstate->key_down(SDL_SCANCODE_D)) delta += right * v;
        delta.y = 0;

        if(inputstate->key_down(SDL_SCANCODE_SPACE)) delta += camera_up * v;
        if(inputstate->key_down(SDL_SCANCODE_LSHIFT)) delta += -camera_up * v;
        
        camera_pos += delta;
        camera_target += delta;
        
        set_mVP();
    }

    void handle_event(SDL_Event* event)
    {
        if( !windowstate->focused ) return;

        // mouse movement
        if( event->type == SDL_EVENT_MOUSE_MOTION )
        {
            float dx = event->motion.xrel * mouse_sensitivity;
            float dy = event->motion.yrel * mouse_sensitivity;
            
            yaw += dx;
            pitch += -dy;
            if( pitch > M_PI_2 ) pitch = M_PI_2;
            else if( pitch < -M_PI_2 ) pitch = -M_PI_2;
            
            glm::vec3 look;
            look.x = cos(yaw) * cos(pitch);
            look.y = sin(pitch);
            look.z = sin(yaw) * cos(pitch);
            look = glm::normalize(look); // shouldn't be neccessary ?
            
            camera_target = camera_pos + look;
        }
    }

    bool init(WindowState* windowstate)
    {
        this->windowstate = windowstate;

        set_mVP();
        
        /* BG TRANSFORM */
        bg_img_mModel = glm::mat4(1.0f); // identity
        bg_img_mModel = glm::translate(bg_img_mModel, glm::vec3(0, 0, 10));
        bg_img_mModel = glm::rotate(bg_img_mModel, glm::radians(6.0f), glm::vec3(0, 0, 1));
        bg_img_mModel = glm::scale(bg_img_mModel, glm::vec3(100, 10, 1));

        bg_img.init("assets/shaders/triangle.vert", "assets/shaders/triangle.frag", unitsquare_vertices, 3);
        bg_img.set_uniform("u_mModel", bg_img_mModel);
        
        /* SHADER TRANSFORM */
        shader_mModel = glm::mat4(1.0f);
        //shader_mModel = glm::translate(shader_mModel, glm::vec3(0, 3, 0));
        //shader_mModel = glm::rotate(shader_mModel, glm::radians(-6.0f), glm::vec3(0, 0, 1));
        shader_mModel = glm::scale(shader_mModel, glm::vec3(4, 4, 1));

        shader.init("assets/shaders/triangle.vert", "assets/shaders/march.frag", unitsquare_vertices, 3);
        shader.set_uniform("u_mModel", shader_mModel);
        
        /* THREED TRANSFORM */
        threeD_mModel = glm::mat4(1.0f);
        threeD_mModel = glm::translate(threeD_mModel, glm::vec3(3, 3, 2));
        threeD_mModel = glm::scale(threeD_mModel, glm::vec3(2, 2, 2));

        threeD.init("assets/shaders/triangle.vert", "assets/shaders/cube.frag", unitcube_vertices, 3);
        threeD.set_uniform("u_mModel", threeD_mModel);
        
        return true;
    }
    
    // these are being passed temporarily -- there really shouldn't be anything passed to iterate()
    void iterate(float t, float dt, InputState* inputstate)
    {
        camera_move(inputstate, dt);

        bg_img.set_uniform("u_mVP", m_VP);
        shader.set_uniform("u_mVP", m_VP);
        threeD.set_uniform("u_mVP", m_VP);

        bg_img.set_uniform("u_t", t);
        bg_img.set_uniform("u_mModel", bg_img_mModel);
        
        shader.set_uniform("u_color_ambient", color_ambient);
        shader.set_uniform("u_color_diffuse", color_diffuse);
        shader.set_uniform("u_color_specular", color_specular);
        shader.set_uniform("u_color_none", color_none);
        shader.set_uniform("u_shininess", shininess);
        
        glm::mat4 shader_m_inv_model = glm::inverse(shader_mModel);
        glm::mat4 m_inv_proj = glm::inverse(m_proj);
        glm::mat4 m_inv_view = glm::inverse(m_view);
        glm::vec2 windowresolution = glm::vec2(windowstate->w, windowstate->h);

        shader.set_uniform("u_camera_pos", camera_pos);
        shader.set_uniform("u_m_inv_model", shader_m_inv_model);
        shader.set_uniform("u_m_inv_proj", m_inv_proj);
        shader.set_uniform("u_m_inv_view", m_inv_view);
        shader.set_uniform("u_windowresolution", windowresolution);

        //shader.set_uniform("u_mModel", shader_mModel);
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
        glDisable(GL_DEPTH_TEST);
        shader.draw();
        
        // once end of draw() is reached, all rendering should be complete and ready for imgui
    }
}; // GLState

#endif // GLSTATE_H