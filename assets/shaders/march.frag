#version 330 core

out vec4 outColor;

uniform float u_t;

uniform vec3 u_color_ambient;
uniform vec3 u_color_diffuse;
uniform vec3 u_color_specular;
uniform float u_shininess;

// constants
const int MAX_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

// variables
vec3 color_ambient = u_color_ambient;
vec3 color_diffuse = u_color_diffuse;
vec3 color_specular = u_color_specular;
float shininess = u_shininess;

vec3 repeat_x(vec3 p)
{
    // spacing
    float s = 2.0;
    p.x = p.x - s*round(p.x / s);
    return p;
}

vec3 repeat_y(vec3 p)
{
    p.y = p.y - round(p.y);
    return p;
}

vec3 repeat_z(vec3 p)
{
    p.z = p.z - round(p.z);
    return p;
}

float sdf_intersect(float distA, float distB)
{
    return max(distA, distB);
}

float sdf_union(float distA, float distB)
{
    return min(distA, distB);
}

float sdf_difference(float distA, float distB)
{
    return max(distA, -distB);
}

/*
    returns distance from point p and the surface of the unit sphere
*/
float sphereSDF(vec3 p, vec3 center)
{
    return length(p - center) - 0.5;
}

float boxSDF(vec3 p, vec3 size)
{
    vec3 q = abs(p) - size;

    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

/*
    returns distance from point p and the nearest scene surface
*/
float sceneSDF(vec3 p)
{
    float sphere = sphereSDF(repeat_x(p), vec3(0, 0, 0));
    
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
vec3 lightContribution(vec3 p, vec3 camera_pos, vec3 light_pos, vec3 light_intensity)
{
    
    vec3 n = sceneNormal(p);
    vec3 l = normalize(light_pos - p);
    vec3 v = normalize(camera_pos - p);
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
vec3 phongIllumination(vec3 p, vec3 camera_pos)
{
    const vec3 ambientLight = 0.5 * vec3(1.0);
    vec3 color = ambientLight * color_ambient;
    
    vec3 light_pos = vec3(0.0, 10.0, -1.0);
    vec3 light_intensity = vec3(0.4, 0.4, 0.4);
    
    color += lightContribution(p, camera_pos, light_pos, light_intensity);
    
    return color;
}

/*
    returns the distance to the nearest scene surface for the given ray
*/
float distanceToSurface(vec3 camera_pos, vec3 dir, float start, float end)
{
    float depth = start;

    for(int i = 0; i < MAX_STEPS; i++)
    {
        float dist = sceneSDF(camera_pos + depth * dir);
        
        if(dist < EPSILON) return depth; // hit!

        depth += dist; // march

        if(depth >= end) return end; // didn't hit anything
    }
    
    return end;
}

/*
    finds the direction of the ray
*/
vec3 rayDirection(float fov, vec2 size, vec2 fragCoord)
{
    vec2 xy = (fragCoord / size) * 2.0 - 1.0;
    xy.x *= size.x / size.y;
    float z = 1.0 / tan(radians(fov) / 2.0);
    
    return normalize(vec3(xy, z));
}

void main()
{
    float throwaway = u_t;
    
    vec3 raydir = rayDirection(45.0, vec2(1280, 720), gl_FragCoord.xy);
    vec3 camera_pos = vec3(0.0, 0.0, -4.0);
    float dist = distanceToSurface(camera_pos, raydir, MIN_DIST, MAX_DIST);

    // ray didnt hit anything
    if(dist > MAX_DIST - EPSILON)
    {
        outColor = vec4(0.0); // return nothing
        return;
    }
    
    // ray hit something

    // get hit location
    vec3 p = camera_pos + dist * raydir;
    
    // find illumination at point
    vec3 finalColor = phongIllumination(p, camera_pos);

    // return color
    outColor = vec4(finalColor, 0.9);
}