#version 330 core

in vec2 v_uv;

uniform float u_t;

out vec4 outColor;

float hexagon_dist(vec2 p)
{
    p = abs(p);

    float horiz = p.x;
    float diag = dot(p, normalize(vec2(1, 1.73)));
    
    return max(horiz, diag);
}

void main()
{
    vec3 color = vec3(0.0);

    // fold into 1st quadrant
    //vec2 uv = abs(v_uv) * 1.0;
    vec2 uv = v_uv;
    uv *= 10.0;

    vec2 a = fract(uv) - 0.5;
    vec2 b = fract(uv - 0.5) - 0.5;
    
    vec2 gv;
    if(length(a) < length(b))
        gv = a;
    else
        gv = b;
    
    color.rg = gv;
    
    outColor = vec4(color, 1.0);
}