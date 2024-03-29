precision mediump float;

uniform sampler2D tex0;

varying vec2 vTexCoord;

const vec3 white = vec3(0.937, 0.937, 0.937);
const vec3 black = vec3(0.066, 0.066, 0.066);

const float finalThreshold = 0.4;

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

void main() {
    //vec2 uv = vTexCoord.xy;
    vec2 uv = vec2(vTexCoord.x, abs(1.0 - vTexCoord.y));
    vec3 texColor = texture2D(tex0, uv).xyz;
    
    float texGray = getLuminance(texColor);

    vec3 color;
    if (texGray < finalThreshold) {
        color = black;
    } else {
        color = white;
    }

    gl_FragColor = vec4(color, 1.0);
}
