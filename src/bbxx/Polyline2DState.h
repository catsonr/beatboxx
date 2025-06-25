#ifndef POLYLINE2DSTATE_H
#define POLYLINE2DSTATE_H

#include <Polyline2D.h>

#include "ShaderProgram.h"
#include "GLState.h"

using namespace crushedpixel;

struct Polyline2DState
{
    /* PUBLIC MEMBERS */
    std::vector<Vec2> points {
        {-0.25f, -0.5f},
        {-0.25f, 0.5f},
        {0.25f, 0.25f},
        {0.0f, 0.0f},
        {0.25f, -0.25f},
        {-0.4f, -0.25f}
    };
    
    /* GL STUFF */
    ShaderProgram program;
    glm::mat4 model { glm::mat4(1.0f) };
    float thickness { 0.1f };
    std::vector<Vec2> vertices { Polyline2D::create(points, thickness, Polyline2D::JointStyle::ROUND, Polyline2D::EndCapStyle::SQUARE) };
    std::vector<float> vertices_float { Vec2_to_float(vertices) };
    
    /* PUBLIC METHODS */
    // makes vector of vec2 work with triangle.vert
    std::vector<float> Vec2_to_float(std::vector<Vec2>& points)
    {
        std::vector<float> out;
        out.resize(points.size() * 3);
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
        
        return true;
    }
    
    void draw(GLState& glstate)
    {
        program.set_uniform("u_mModel", model);
        program.set_uniform("u_mVP", glstate.m_VP);
        
        program.draw();
    }
}; // Polyline2DState

#endif // POLYLINE2D_H