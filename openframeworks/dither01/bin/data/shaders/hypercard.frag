#version 150

uniform sampler2D tex0;
uniform vec2 iResolution;
in vec2 texCoordVarying;
out vec4 fragColor;

const vec3 white = vec3(0.937, 0.937, 0.937);
const vec3 black = vec3(0.066, 0.066, 0.066);

const mat4 ditherPattern = mat4(
    0.059, 0.529, 0.176, 0.647,
    0.765, 0.294, 0.882, 0.412,
    0.235, 0.706, 0.118, 0.588,
    0.941, 0.471, 0.824, 0.353
);

const int matrixSize = 4;
const float finalThreshold = 0.4;

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

void main() {
    vec2 uv = texCoordVarying;
    vec3 texColor = texture(tex0, uv).xyz;
    
    float texGray = getLuminance(texColor);
    int paletteIndex = int(texGray * 15.0);
    
    vec2 fragCoord = texCoordVarying * iResolution;
    int x = int(fragCoord.x) % matrixSize;
    int y = int(fragCoord.y) % matrixSize;
    
    float ditherVal = 0.0;
    if (x == 0) {
        if (y == 0) ditherVal = ditherPattern[0][0];
        else if (y == 1) ditherVal = ditherPattern[0][1];
        else if (y == 2) ditherVal = ditherPattern[0][2];
        else ditherVal = ditherPattern[0][3];
    } else if (x == 1) {
        if (y == 0) ditherVal = ditherPattern[1][0];
        else if (y == 1) ditherVal = ditherPattern[1][1];
        else if (y == 2) ditherVal = ditherPattern[1][2];
        else ditherVal = ditherPattern[1][3];
    } else if (x == 2) {
        if (y == 0) ditherVal = ditherPattern[2][0];
        else if (y == 1) ditherVal = ditherPattern[2][1];
        else if (y == 2) ditherVal = ditherPattern[2][2];
        else ditherVal = ditherPattern[2][3];
    } else {
        if (y == 0) ditherVal = ditherPattern[3][0];
        else if (y == 1) ditherVal = ditherPattern[3][1];
        else if (y == 2) ditherVal = ditherPattern[3][2];
        else ditherVal = ditherPattern[3][3];
    }

    int ditherIndex = int(ditherVal * 15.0);
    paletteIndex = min(paletteIndex + ditherIndex, 15);
    vec3 ditheredColor = vec3(
        float((paletteIndex & 4) >> 2),
        float((paletteIndex & 2) >> 1),
        float(paletteIndex & 1)
    );

    float texGray2 = texGray - 0.15 * getLuminance(ditheredColor);

    vec3 color;
    if (texGray2 < finalThreshold) {
        color = black;
    } else {
        color = white;
    }

    fragColor = vec4(color, 1.0);
}
