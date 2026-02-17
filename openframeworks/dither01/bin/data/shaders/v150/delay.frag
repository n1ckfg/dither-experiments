#version 150

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform vec2 iResolution;
uniform float delaySpeed;
uniform float lumaThreshold;
uniform float alphaMax;
uniform float alphaMin;

in vec2 texCoordVarying;
out vec4 fragColor;

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

void main() {
    vec2 uv = texCoordVarying;
    vec3 texColor0 = texture2D(tex0, uv).xyz;
    vec3 texColor1 = texture2D(tex1, uv).xyz;
    
    vec3 diff = texColor0 - texColor1;
    vec3 diff2 = texColor1 + diff * delaySpeed;
    
    float luma = getLuminance(texColor0);
    float alpha = luma < lumaThreshold ? alphaMin : alphaMax;

    fragColor = vec4(diff2, alpha);
}
