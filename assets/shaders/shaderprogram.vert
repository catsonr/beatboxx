#version 330 core

layout(location = 0) in vec3 a_pos; // 3d positions
layout(location = 1) in vec2 a_uv; // texture coordinates

uniform mat4 u_mModel; // individual model matrix
uniform mat4 u_mVP; // shared, view-projection matrix

out vec2 v_uv; // pass texture coordiantes to fragment shader

void main()
{
    v_uv = a_uv;

    gl_Position = u_mVP * u_mModel * vec4(a_pos, 1.0);
}