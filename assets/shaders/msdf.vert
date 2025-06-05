#version 330 core

layout(location = 0) in vec3 a_position; // vertex positions of quad
layout(location = 1) in vec2 a_uv; // atlas coords

uniform mat4 u_mModel;
uniform mat4 u_mVP;

out vec2 v_uv;

void main()
{
    gl_Position = u_mVP * u_mModel * vec4(a_position, 1.0);
    v_uv = vec2(1.0 - a_uv.x,1.0 -  a_uv.y); // a_uv assumes texture origin is top left, whereas opengl assumes its bottom left, and also it gets flipped vertically somwhere, so both x and y get flipped
}