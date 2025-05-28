#version 330 core

/*
   this fragment shader performs the raymarch algorithm on an arbitrary surface
   this surface will contain all points from [-1, 1] in R^2
    that is, transforming the model will not change how the raymarching looks, it will only
    change where on screen the result is placed, and how it is streched and rotated
*/

out vec4 outColor;

// aesthetic values
uniform vec3 u_color_ambient;
uniform vec3 u_color_diffuse;
uniform vec3 u_color_specular;
uniform vec4 u_color_none;
uniform float u_shininess;

// camera stuffs
uniform vec3 u_camera_pos;
uniform mat4 u_m_inv_model;
uniform mat4 u_m_inv_proj;
uniform mat4 u_m_inv_view;
uniform vec2 u_windowresolution;

// constants
const int MAX_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

// variables
// TODO: remove these!
vec3 color_ambient;
vec3 color_diffuse;
vec3 color_specular;
float shininess;

vec3 camera_pos;

vec3 repeat_x(vec3 p)
{
    // spacing
    float s = 2.0;
    p.x = p.x - s*round(p.x / s);
    return p;
}

/*
    returns distance from point p and the surface of the unit sphere
*/
float sphereSDF(vec3 p, vec3 center)
{
    return length(p - center) - 0.5;
}

/*
    returns distance from point p and the nearest scene surface
*/
float sceneSDF(vec3 p)
{
    float sphere = sphereSDF(repeat_x(p), vec3(0.0, 0.0, 0.0));
    
    return sphere;
}

/*
    returns the approximate normal of the scene at point p
*/
vec3 sceneNormal(vec3 p)
{
    return normalize(vec3(
        sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
        sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
        sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
    ));
}

/*
    gets the light contribution from a single light source
*/
vec3 lightContribution(vec3 p, vec3 light_pos, vec3 light_intensity)
{
    vec3 n = sceneNormal(p);
    vec3 l = normalize(light_pos - p);
    vec3 v = normalize(u_camera_pos - p);
    vec3 r = normalize( reflect(-l, n) );
    
    float ln_dot = dot(l, n);
    float rv_dot = dot(r,v);
    
    if(ln_dot < 0.0) return vec3(0.0);
    if(rv_dot < 0.0) return light_intensity * (color_diffuse * ln_dot);
    
    return light_intensity * (color_diffuse * ln_dot + color_specular * pow(rv_dot, shininess));
}

/*
    gets the total illumination at a point p
*/
vec3 phongIllumination(vec3 p)
{
    const vec3 ambientLight = 0.5 * vec3(1.0);
    vec3 color = ambientLight * color_ambient;
    
    vec3 light_pos = vec3(0.0, 10.0, -1.0);
    vec3 light_intensity = vec3(0.4, 0.4, 0.4);
    
    color += lightContribution(p, light_pos, light_intensity);
    
    return color;
}

/*
    returns the distance to the nearest scene surface for the given ray
*/
float march(vec3 ray_origin, vec3 ray_direction)
{
    float t = MIN_DIST;

    for(int i = 0; i < MAX_STEPS; i++)
    {
        float dist = sceneSDF(ray_origin + ray_direction*t);
        
        if(dist < EPSILON) return t; // hit!

        t += dist; // march

        if(t >= MAX_DIST) return MAX_DIST; // didn't hit anything
    }
    
    return MAX_DIST;
}

/*
    finds the direction of the ray
*/
vec3 rayDirection(vec2 fragCoord)
{
    vec2 ndc = (fragCoord / u_windowresolution) * 2.0 - 1.0;
    vec4 clip = vec4(ndc, -1.0, 1.0);
    vec4 eye = u_m_inv_proj * clip;
    eye /= eye.w;
    
    vec4 raydir_wrldspc = u_m_inv_view * vec4(eye.xyz, 0.0);
    
    return normalize(raydir_wrldspc.xyz);
}

void main()
{
    // TODO: remove these!
    color_ambient = u_color_ambient;
    color_diffuse = u_color_diffuse;
    color_specular = u_color_specular;
    shininess = u_shininess;

    camera_pos = u_camera_pos;

    // find ray in world space
    vec3 ray_origin_wrldspc    = u_camera_pos;
    vec3 ray_direction_wrldspc = rayDirection(gl_FragCoord.xy);
    
    // transform to object space
    vec3 ray_origin    = (u_m_inv_model * vec4(ray_origin_wrldspc, 1.0)).xyz;
    vec3 ray_direction = normalize( (u_m_inv_model * vec4(ray_direction_wrldspc, 0.0)).xyz );

    float dist = march(ray_origin, ray_direction);

    // ray didnt hit anything
    if(dist > MAX_DIST - EPSILON)
    {
        outColor = u_color_none;
        return;
    }
    
    // ray hit something

    // get hit location
    vec3 hit_pos = ray_origin + ray_direction*dist;
    
    // find illumination at point
    vec3 finalColor = phongIllumination(hit_pos);

    // return color
    outColor = vec4(finalColor, 0.9);
}