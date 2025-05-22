#version 330 core

in vec3 v_position;

out vec4 outColor;

uniform float u_t;

float radius = 0.5;
float circle(vec2 p, float r)
{
    return length(p) - r > 0 ? 1.0 : 0.0;
}

void main()
{
    float ignore = 0 + u_t;

    vec3 color = vec3(1.0);
    color *= circle(v_position.xy, radius);
    
    outColor = vec4(color, 1.0);
}