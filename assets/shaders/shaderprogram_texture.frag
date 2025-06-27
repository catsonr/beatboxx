#version 330 core

in vec2 v_uv; // texture coordinates

uniform sampler2D u_texture; // texture uniform

out vec4 fragColor; // output color

void main()
{
    fragColor = texture2D(u_texture, v_uv);
}