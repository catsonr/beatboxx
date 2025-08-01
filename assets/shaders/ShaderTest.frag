#version 330 core

in vec2 v_uv; // texture coordinates

uniform sampler2D u_texture; // texture uniform

out vec4 fragColor; // output color

void main()
{
    float scale = 3.0;
    vec2 uv = v_uv * scale;
    uv = fract(uv);
    fragColor = vec4(uv, 0.0, 1.0);
}