#version 330 core

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_atlas;
uniform vec4 u_color;
uniform vec4 u_color_bg;

float median(float r, float g, float b)
{
    return max(min(r, g), min(max(r, g), b));
}

float screenPxRange()
{
    return 1.0;
}

void main()
{
    vec3 sample = texture(u_atlas, v_uv).rgb;
    float sd = median(sample.r, sample.g, sample.b) - 0.5;
    //float screenPxDist = sd / fwidth(sd);
    float screenPxDistance = screenPxRange() * (sd - 0.5);
    float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);

    outColor = mix(u_color_bg, u_color, alpha);
}