#version 330 core

out vec4 outColor;

in vec2 v_uv;

uniform vec4 u_mouse;
uniform float u_t;

#include "sdf/circleSDF.glsl"

void main()
{
    float d = circleSDF(v_uv);
    float r = 1.0;

    if(d < r) { // hit
        outColor = vec4(0.0, 0.5, 1.0, 1.0);
        return;
    }
    else {
        outColor = vec4(0.0);
        return;
    }
}