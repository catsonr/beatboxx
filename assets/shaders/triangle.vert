#version 330 core

layout(location = 0) in vec3 a_position;

uniform mat4 u_mModel;
uniform mat4 u_mVP;

out vec2 v_uv;

void main()
{
  vec4 clip = u_mVP * u_mModel * vec4(a_position, 1.0);

  gl_Position = clip;
  v_uv = vec2(-a_position.x, a_position.y); // had to be flipped because of unitsquare_vertices orientation
  //v_uv += vec2(0.5); // goes from [-0.5, 0.5]^2 to [0, 1]^2
}