#version 330 core

in vec3 vColor;
out vec4 outColor;

uniform float u_t;

void main()
{
  float scale = 800;
  float speed = 0.0125;

  vec2 uv = gl_FragCoord.xy / vec2(scale, scale);
  uv += vec2(u_t, u_t) * speed;

  vec2 c = floor(uv * 8.0);

  float checker = mod(c.x + c.y, 2.0);

  vec3 colorA = vec3(1.0 * cos(u_t*speed), 1.0 * sin(u_t*speed), 1.0 * sin(u_t*speed) * cos(u_t*speed)); // black square color
  vec3 colorB = vec3(1.0); // white square color

  vec3 finalColor = mix(colorA, colorB, checker);
  outColor = vec4(finalColor, 1.0);
}