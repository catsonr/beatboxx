#version 330 core

in vec2 v_uv;

out vec4 outColor;

//uniform float u_t;
uniform vec4 u_mouse;

float hexagon_dist(vec2 p)
{
    p = abs(p);

    float horiz = p.x;
    float diag = dot(p, normalize(vec2(1, 1.73)));
    
    return max(horiz, diag);
}

vec4 hexagon_coords(vec2 uv)
{
    vec2 repeat = vec2(1.0, 1.73);
    vec2 h = 0.5 * repeat;
    vec2 a = mod(uv, repeat) - h;
    vec2 b = mod(uv - h, repeat) - h;
    
    vec2 gv;
    if(length(a) < length(b))
        gv = a;
    else
        gv = b;
    
    float x = atan(gv.x, gv.y); // radial distance around hexagon
    float dist_to_edge = 0.5 - hexagon_dist(gv);
    vec2 id = uv - gv;
    
    return vec4(x, dist_to_edge, id);
}

void main()
{
    vec3 basecolor = vec3(0.49, 0.63, 1.0);

    vec2 uv = v_uv;
    uv *= 7.0;
    
    float d = hexagon_dist(uv);
    float radius = u_mouse.x / u_mouse.z;
    float edge = smoothstep(radius, radius + 0.001, d);
    
    vec4 c_inside = vec4(basecolor, 1.0);
    vec4 c_outside = vec4(basecolor * 0.5, 0.0);
    
    outColor = mix(c_inside, c_outside, edge);
}