#version 330 core

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_atlas;
uniform vec4 u_color;
uniform float u_pxRange;

float median(float r, float g, float b)
{
    return max(min(r, g), min(max(r, g), b));
}

void main()
{
    vec3 sample = texture(u_atlas, v_uv).rgb;
    float sd = median(sample.r, sample.g, sample.b) - 0.5;
    float screenPxDist = sd / fwidth(sd);
    float alpha = clamp(screenPxDist + 0.5, 0.0, 1.0);
    
    outColor = vec4(u_color.rgb, u_color.a * alpha);
}