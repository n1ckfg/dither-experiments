precision mediump float;

uniform sampler2D tex0, tex1;
uniform float delaySpeed;

varying vec2 vTexCoord;

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = vTexCoord.xy;
    vec2 uv2 = vec2(uv.x, abs(1.0 - uv.y));
    vec3 texColor0 = texture2D(tex0, uv2).xyz;
    vec3 texColor1 = texture2D(tex1, uv2).xyz;

    vec3 diff = texColor0 - texColor1;
    vec3 diff2 = texColor1 + diff * delaySpeed;
    fragColor = vec4(diff2, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
