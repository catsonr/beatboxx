#version 330 core

out vec4 outColor;

uniform float u_t;

void main()
{
  float scale = 50;
  float speed = 0.0125;

  vec2 uv = gl_FragCoord.xy / vec2(scale, scale);
  uv += vec2(u_t, u_t) * speed;

  vec2 c = round(uv * 1.0);
  float checker = mod(c.x + c.y, 2);

  vec3 darksquare = vec3(1.0 * cos(u_t*speed), 1.0 * sin(u_t*speed), 1.0 * sin(u_t*speed) * cos(u_t*speed));
  vec3 lightsquare = vec3(1.0);

  vec3 finalColor = mix(darksquare, lightsquare, checker);
  outColor = vec4(finalColor*0.05, 1.0);
}