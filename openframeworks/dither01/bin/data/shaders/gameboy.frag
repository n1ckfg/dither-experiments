#version 150

uniform sampler2D tex0;
uniform vec2 iResolution;
in vec2 texCoordVarying;
out vec4 fragColor;

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

void main() {
    vec2 uv = texCoordVarying;
    vec3 texColor = texture(tex0, uv).xyz;
    
    float texGray = getLuminance(texColor);
    int paletteIndex = int(texGray * 15.0);
    
    vec2 fragCoord = texCoordVarying * iResolution;
    int x = int(fragCoord.x) % 3;
    int y = int(fragCoord.y) % 3;
    
    // Accessing mat3 with integer indices might need a workaround for GLSL 150
    // Actually, ditherPattern[x][y] should work.
    float ditherVal = 0.0;
    if (x == 0) {
        if (y == 0) ditherVal = ditherPattern[0][0];
        else if (y == 1) ditherVal = ditherPattern[0][1];
        else ditherVal = ditherPattern[0][2];
    } else if (x == 1) {
        if (y == 0) ditherVal = ditherPattern[1][0];
        else if (y == 1) ditherVal = ditherPattern[1][1];
        else ditherVal = ditherPattern[1][2];
    } else {
        if (y == 0) ditherVal = ditherPattern[2][0];
        else if (y == 1) ditherVal = ditherPattern[2][1];
        else ditherVal = ditherPattern[2][2];
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
