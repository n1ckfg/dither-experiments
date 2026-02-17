#version 150

uniform sampler2D tex0;
uniform vec2 iResolution;
uniform float time;
in vec2 texCoordVarying;
out vec4 fragColor;

void main() {
    vec2 uv = texCoordVarying;
    vec3 col = texture(tex0, uv).xyz;

    float scanline = sin(uv.y * iResolution.y * 1.2) * 0.1;
    float noise = sin(time * 100.0) * 0.02;

    fragColor = vec4(col + noise - scanline, 1.0);
}
