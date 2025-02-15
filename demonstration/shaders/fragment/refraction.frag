/*
  (C) 2019 David Lettier
  lettier.com
*/

#version 150

uniform vec2 pi;
uniform vec2 gamma;

uniform sampler2D uvTexture;
uniform sampler2D maskTexture;
uniform sampler2D positionFromTexture;
uniform sampler2D positionToTexture;
uniform sampler2D backgroundColorTexture;

uniform vec2 sunPosition;

out vec4 fragColor;

void main() {
  vec4  tintColor = vec4(0.262, 0.426, 0.562, 0.5);
  float depthMax  = 2.0;

  vec2 texSize  = textureSize(backgroundColorTexture, 0).xy;
  vec2 texCoord = gl_FragCoord.xy / texSize;

  vec4 mask = texture(maskTexture, texCoord);
  if (mask.r <= 0) { fragColor = vec4(0); return; }
  vec4 uv   = texture(uvTexture, texCoord);
  if (uv.b   <= 0) { fragColor = vec4(0); return; }

  tintColor.rgb  = pow(tintColor.rgb, vec3(gamma.x));
  tintColor.rgb *= max(0.2, -1 * sin(sunPosition.x * pi.y));

  vec4 positionFrom    = texture(positionFromTexture,    texCoord);
  vec4 positionTo      = texture(positionToTexture,      texCoord);
  vec4 backgroundColor = texture(backgroundColorTexture, uv.xy);

  float depth   = length(positionTo.xyz - positionFrom.xyz);
  float mixture = clamp(depth / depthMax, 0, 1);

  vec3 shallowColor    = backgroundColor.rgb;
  vec3 deepColor       = mix(shallowColor, tintColor.rgb, tintColor.a);
  vec3 foregroundColor = mix(shallowColor, deepColor,     mixture);

  fragColor = mix(vec4(0), vec4(foregroundColor, 1), uv.b);
}
