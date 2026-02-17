#version 150

uniform sampler2D tex0;
uniform vec2 iResolution;
in vec2 texCoordVarying;
out vec4 fragColor;

const float posterizeLevels = 90.0;
const float kernel[5] = float[](0.10, 0.20, 0.40, 0.20, 0.10);

void main() {
    vec2 uv = texCoordVarying;
    vec2 texelSize = 1.0 / iResolution;
    
    vec3 centerColor = texture(tex0, uv).xyz;   
    vec3 leftColor = texture(tex0, uv - vec2(texelSize.x, 0.0)).xyz;
    vec3 rightColor = texture(tex0, uv + vec2(texelSize.x, 0.0)).xyz;
    vec3 topColor = texture(tex0, uv + vec2(0.0, texelSize.y)).xyz;
    vec3 bottomColor = texture(tex0, uv - vec2(0.0, texelSize.y)).xyz;

    vec3 blurredColor = topColor * kernel[0] + leftColor * kernel[1] + centerColor * kernel[2] + rightColor * kernel[3] + bottomColor * kernel[4];
    vec3 sharpenedColor = blurredColor * 5.0 - (leftColor + rightColor + topColor + bottomColor);
    vec3 posterizedColor = floor(sharpenedColor * posterizeLevels) / posterizeLevels;

    fragColor = vec4(posterizedColor, 1.0);
}
