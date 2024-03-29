precision mediump float;

uniform sampler2D tex0;
uniform vec2 texelSize;

varying vec2 vTexCoord;

const float posterizeLevels = 16.0;
const float sharpenAmount = 5.0;

void main() {
    vec2 uv = vTexCoord.xy;
    vec2 uv2 = vec2(uv.x, abs(1.0 - uv.y));
    
    vec3 centerColor = texture2D(tex0, uv2).xyz;   
    vec3 leftColor = texture2D(tex0, uv2 - vec2(texelSize.x, 0.0)).xyz;
    vec3 rightColor = texture2D(tex0, uv2 + vec2(texelSize.x, 0.0)).xyz;
    vec3 topColor = texture2D(tex0, uv2 + vec2(0.0, texelSize.y)).xyz;
    vec3 bottomColor = texture2D(tex0, uv2 - vec2(0.0, texelSize.y)).xyz;

    vec3 sharpenedColor = centerColor * sharpenAmount - (leftColor + rightColor + topColor + bottomColor);
    vec3 posterizedColor = floor(sharpenedColor * posterizeLevels) / posterizeLevels;

    gl_FragColor = vec4(posterizedColor, 1.0);
}
