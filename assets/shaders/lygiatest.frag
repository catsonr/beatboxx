#version 330 core

#include "lygia/draw/fill.glsl"
#include "lygia/space/ratio.glsl"
#include "lygia/space/rotate.glsl"

#include "lygia/sdf/circleSDF.glsl"
#include "lygia/sdf/flowerSDF.glsl"

out vec4 outColor;

in vec2 v_uv; // [-0.5, 0.5]^2 quad coords

uniform vec4 u_mouse; // (mouse_x [0, 1], mouse_y [0, 1], window_w, window_h)
uniform float u_t;

void main(void) {
    float throwaway = u_mouse.x;
    vec3 color = vec3(0.0);
    vec2 st = v_uv;
    //st = ratio(st, u_mouse.zw);

    float cols = 4.0 * sin(u_t * 0.25); 
    st *= cols;
    vec2 st_i = floor(st);
    vec2 st_f = fract(st);

    st_f = rotate(st_f, u_t * 0.4);

    float sdf = 0.0;
    float index = ( st_i.x + (cols-st_i.y - 1.0) * cols);
    
    if( mod(index, 2.0) <= 1.0 )
        sdf = circleSDF(st_f);
    else
        sdf = flowerSDF(st_f, 6);

    float fill_amount = fill(sdf, 0.5);
    color += normalize(gl_FragCoord.xyz) * fill_amount;
    
    outColor = vec4(color, 1.0);

    if(outColor.x <= 0.1 && outColor.y <= 0.1 && outColor.z <= 0.1) outColor.w = 0.0;
}