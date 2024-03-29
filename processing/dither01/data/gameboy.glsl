uniform sampler2D tex0;
uniform vec2 iResolution;

const vec3 white = vec3(0.937, 0.937, 0.937);
const vec3 lightGray = vec3(0.686, 0.686, 0.686);
const vec3 darkGray = vec3(0.376, 0.376, 0.376);
const vec3 black = vec3(0.066, 0.066, 0.066);

const mat3 ditherPattern = mat3(
    0.0, 0.5, 0.125,
    0.75, 0.25, 0.875,
    0.1875, 0.6875, 0.0625
);

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    //uv = vec2(uv.x, abs(1.0 - uv.y));
    vec3 texColor = texture2D(tex0, uv).xyz;
    
    float texGray = getLuminance(texColor);
    int paletteIndex = int(texGray * 15.0);
    int x = int(fragCoord.x) % 3;
    int y = int(fragCoord.y) % 3;
    int ditherIndex = int(ditherPattern[x][y] * 15.0);
    paletteIndex = min(paletteIndex + ditherIndex, 15);
    vec3 ditheredColor = vec3(
        float((paletteIndex & 4) >> 2),
        float((paletteIndex & 2) >> 1),
        float(paletteIndex & 1)
    );

    float texGray2 = texGray - 0.15 * getLuminance(ditheredColor);

    vec3 color;
    if (texGray2 <= 0.25) {
        color = black;
    } else if (texGray2 <= 0.5) {
        color = darkGray;
    } else if (texGray2 <= 0.75) {
        color = lightGray;
    } else {
        color = white;
    }

    fragColor = vec4(color, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
