#version 330 core

out vec4 outColor;
uniform float u_t;

// must be from [0, 1]
float f(vec2 uv)
{
    float x = uv.x;
    float y = uv.y;
    float t = u_t;
    
    float dpi = 10;
    float skew = 2;
    return 0.5 * ( cos(dpi*x + dpi*skew*y) * cos(dpi*skew*x - dpi*y) + 1 );
    
    // smooth checkerboard
    //return 0.5 * (sin(x) * sin(y) + 1);

    // ripple
    //return 0.5 * (sin(10 * sqrt(x*x + y*y)) + 1);
}

void main()
{
    float scale = 1;
    float speed = 0.125;

    vec2 uv = gl_FragCoord.xy / vec2(50) + u_t*speed;
    
    vec3 colorON = vec3(1.0);
    vec3 colorOFF = vec3(0.8);
    vec3 colorFINAL;
    
    //float z = f(uv) - 0.1*sin(0.2*u_t + uv.x*uv.y);
    float z = f(uv);
    
    colorFINAL = mix(colorOFF, colorON, z);
    colorFINAL = colorOFF + z * colorON;
    
    outColor = vec4(colorFINAL, 1.0);
}