precision mediump float;

uniform sampler2D tex0;

varying vec2 vTexCoord;

const vec3 white = vec3(0.937, 0.937, 0.937);
const vec3 lightGray = vec3(0.686, 0.686, 0.686);
const vec3 darkGray = vec3(0.376, 0.376, 0.376);
const vec3 black = vec3(0.066, 0.066, 0.066);

// https://stackoverflow.com/questions/12422407/monochrome-dithering-in-javascript-bayer-atkinson-floyd-steinberg
const mat4 ditherPattern = mat4(
    0.059, 0.529, 0.176, 0.647,
    0.765, 0.294, 0.882, 0.412,
    0.235, 0.706, 0.118, 0.588,
    0.941, 0.471, 0.824, 0.353
);

const float matrixSize = 4.0;
const float finalThreshold = 0.4;

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

// https://stackoverflow.com/questions/33908644/get-accurate-integer-modulo-in-webgl-shader
float modF(float a, float b) {
    float m = a - floor((a + 0.5) / b) * b;
    return floor(m + 0.5);
}

void main() {
    //vec2 uv = vTexCoord.xy;
    vec2 uv = vec2(vTexCoord.x, abs(1.0 - vTexCoord.y));
    vec3 texColor = texture2D(tex0, uv).xyz;
    
    float texGray = getLuminance(texColor);
    float paletteIndex = texGray * 15.0;
    
    int x = int(modF(uv.x, matrixSize));
    int y = int(modF(uv.y, matrixSize));
    float ditherIndex = 0.0;

    for (int i=0; i < 4; i++) {
        for (int j=0; j < 4; j++) {
            if (x == i && y == j) {
                ditherIndex = ditherPattern[i][j] * 15.0;
                break;
            }
        }
    }

    paletteIndex = min(paletteIndex + ditherIndex, 15.0);

    vec3 ditheredColor = vec3(
        step(3.5, mod(paletteIndex, 8.0)),    // Equivalent to (paletteIndex & 4) >> 2
        step(1.5, mod(paletteIndex, 4.0)),    // Equivalent to (paletteIndex & 2) >> 1
        mod(paletteIndex, 2.0)                // Equivalent to paletteIndex & 1
    );

    float texGray2 = texGray - 0.15 * getLuminance(ditheredColor);

    vec3 color;
    if (texGray2 < finalThreshold) {
        color = black;
    } else {
        color = white;
    }

    gl_FragColor = vec4(color, 1.0);
}
