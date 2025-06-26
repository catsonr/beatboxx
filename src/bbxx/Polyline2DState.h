#ifndef POLYLINE2DSTATE_H
#define POLYLINE2DSTATE_H

#include <Polyline2D.h>

#include <FastNoiseLite.h>

#include "ShaderProgram.h"
#include "GLState.h"

#include "utilities.h"

using namespace crushedpixel;

struct Polyline2DState
{
    GLState& glstate;
    WindowState& windowstate;
    
    Polyline2DState(GLState& glstate, WindowState& windowstate) :
        glstate(glstate),
        windowstate(windowstate)
    {}

    ShaderProgram program;
    glm::mat4 model { glm::mat4(1.0f) }; // the model matrix used to transform the line
    glm::mat4 model_identity { glm::mat4(1.0f) }; // the model matrix passed to opengl
    float thickness { 0.001 };

    std::vector<Vec2> points;
    std::vector<Vec2> vertices;
    std::vector<float> vertices_float;

    FastNoiseLite noise;
    
    float t { 0.0f };
    
    /* PUBLIC METHODS */
    std::vector<Vec2> get_path3d(float t = 0.0f)
    {
        std::vector<glm::vec3> path;

        const int w = 40;
        const float scale = 1.0f / w;

        path.reserve(w*w);
        int j = -1;
        for(int i = 0; i < w; i++)
        {
            for(int _j = 0; _j < w; _j++)
            {
                int j = (i % 2 == 0) ? _j : (w - 1 - _j);
                
                float x = (float)i * scale;
                float y = (float)j * scale;
                
                float x_ = i;
                float y_ = noise.GetNoise((float)i, (float)j) + 10*t*util::sinc2d_dropoff(i - w/2, j - w/2);
                float z_ = j;

                path.emplace_back(x_, y_, z_);
            }
        }

        std::vector<Vec2> projected;
        projected.reserve(path.size());
        glm::mat4 MVP = glstate.m_VP * model;
        for (glm::vec3& point : path)
        {
            glm::vec4 clip = MVP * glm::vec4(point, 1.0f);
            
            if( clip.w <= 0.0f ) continue; // behind camera

            glm::vec3 ndc = glm::vec3(clip) / clip.w;

            projected.emplace_back(ndc.x, ndc.y);
        }

        return projected;
    }

    std::vector<float> Vec2_to_float(std::vector<Vec2>& points)
    {
        std::vector<float> out;
        out.reserve(points.size() * 3);
        for(const Vec2& point : points)
        {
            out.push_back(point.x);
            out.push_back(point.y);
            out.push_back(0);
        }
        
        return out;
    }

    bool init()
    {
        program.init("assets/shaders/triangle.vert", "assets/shaders/solidcolor.frag", vertices_float, 3);
        
        noise.SetNoiseType(FastNoiseLite::NoiseType_OpenSimplex2);
        noise.SetSeed(0);
        noise.SetFrequency(0.1);
        
        return true;
    }
    
    void draw()
    {
        //model = glm::rotate(model, glm::radians(0.1f), glm::vec3(0, 1, 0));
        
        points = get_path3d(t);
        vertices = Polyline2D::create(points, thickness, Polyline2D::JointStyle::ROUND, Polyline2D::EndCapStyle::ROUND);
        vertices_float = Vec2_to_float( vertices );
        program.set_vbo(vertices_float);

        // currently all transformations are being done on the CPU, so identity matrices are passed into opengl
        program.set_uniform("u_mModel", model_identity);
        program.set_uniform("u_mVP", model_identity);
        
        program.draw();
    }
}; // Polyline2DState

#endif // POLYLINE2D_H