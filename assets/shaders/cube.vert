#version 330 core

in vec3 a_pos;

uniform mat4 u_mModel;
uniform mat4 u_mVP;

void main()
{
    gl_Position = u_mVP * u_mModel * vec4(a_pos, 1.0);
}