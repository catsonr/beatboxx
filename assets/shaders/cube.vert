#version 330 core

in vec3 a_pos;

uniform mat4 u_mMVP;

void main()
{
    gl_Position = u_mMVP * vec4(a_pos, 1.0);
}