#version 330 core

layout(location = 0) in vec3 a_position;

uniform mat4 u_mModel;
uniform mat4 u_mVP;

void main()
{
  gl_Position = u_mVP * u_mModel * vec4(a_position, 1.0);
}