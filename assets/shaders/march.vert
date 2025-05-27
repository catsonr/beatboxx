#version 330 core

layout(location = 0) in vec3 a_position;

uniform mat4 u_mModel;
uniform mat4 u_mVP;

out vec3 v_worldpos;

void main()
{
    vec4 worldpos = ( u_mModel * vec4(a_position, 1.0) );

    v_worldpos = worldpos.xyz;
    gl_Position = u_mVP * worldpos;
}