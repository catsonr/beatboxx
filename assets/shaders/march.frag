#version 330 core

out vec4 outColor;

uniform float u_t;

void main()
{
    float throwaway = u_t;
    vec3 finalColor = vec3(1.0, 0.65, 0.85);
    outColor = vec4(finalColor, 0.9);
}