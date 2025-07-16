#ifndef GLSTATE_H
#define GLSTATE_H

// std
#include <cstdio>

// SDL
#include <SDL3/SDL.h>

// glad
#include <glad/glad.h>

// glm
#include <glm/glm.hpp>
#include <glm/ext/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

// bbxx
#include "utilities.h"
#include "WindowState.h"
#include "InputState.h"
#include "ShaderProgram.h"

struct GLState
{
    bool DRAW_HAS_BEGUN { false };
    std::vector<float> unitsquare_vertices { -0.5f, -0.5f, 0.0f, 0.5f, -0.5f, 0.0f, 0.5f, 0.5f, 0.0f, 0.5f, 0.5f, 0.0f, -0.5f, 0.5f, 0.0f, -0.5f, -0.5f, 0.0f };
    std::vector<float> unitcube_vertices { -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f,  0.5f, -0.5f, 0.5f,  0.5f, -0.5f, -0.5f,  0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f,  0.5f, 0.5f, -0.5f,  0.5f, 0.5f,  0.5f,  0.5f, 0.5f,  0.5f,  0.5f, -0.5f,  0.5f,  0.5f, -0.5f, -0.5f,  0.5f, -0.5f,  0.5f,  0.5f, -0.5f,  0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f,  0.5f, -0.5f,  0.5f,  0.5f, 0.5f,  0.5f,  0.5f, 0.5f,  0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f,  0.5f, 0.5f,  0.5f,  0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f,  0.5f, 0.5f, -0.5f,  0.5f, -0.5f, -0.5f,  0.5f, -0.5f, -0.5f, -0.5f, -0.5f,  0.5f, -0.5f, 0.5f,  0.5f, -0.5f, 0.5f,  0.5f,  0.5f, 0.5f,  0.5f,  0.5f, -0.5f,  0.5f,  0.5f, -0.5f,  0.5f, -0.5f };

    WindowState* windowstate;
    
    // projection matrix stuff
    glm::mat4 m_view, m_proj, m_VP;
    
    // camera stuff
    float mouse_sensitivity { 0.002 };
    float camera_movementSpeed { 10.0 };
    float pitch { 0 }, yaw { M_PI_2 };
    glm::vec3 camera_pos { 0, 0, -4 };
    glm::vec3 camera_target { 0, 0, 0 };
    glm::vec3 camera_up { 0, 1, 0 };
    float fov = 45.0f;
    float aspectRatio;
    float near = 0.1f;
    float far = 100.0f;
    
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

    void handle_event(const SDL_Event* event)
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
        
        return true;
    }
    
    // these are being passed temporarily -- there really shouldn't be anything passed to iterate()
    void iterate( float t, float dt, InputState* inputstate )
    {
        camera_move(inputstate, dt);
        
        DRAW_HAS_BEGUN = false;
    }
    
    void draw_begin()
    {
        if( DRAW_HAS_BEGUN ) {
            printf("[GLState::draw_begin] draw_begin() has already been called this frame. skipping this call!\n");
            return;
        }

        glEnable(GL_DEPTH_TEST);
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        // TODO: update MVP with new aspect ratio
        glViewport(0, 0, windowstate->w, windowstate->h);

        glClearColor(0.1, 0.1, 0.1, 1.0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        DRAW_HAS_BEGUN = true;
    }
}; // GLState

#endif // GLSTATE_H