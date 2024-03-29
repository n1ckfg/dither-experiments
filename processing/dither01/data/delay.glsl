uniform sampler2D tex0, tex1;
uniform vec2 iResolution;

uniform float delaySpeed; //0.2;
uniform float lumaThreshold; //0.5;
uniform float alphaMax; //1.0;
uniform float alphaMin; //0.1;

float getLuminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    //uv = vec2(uv.x, abs(1.0 - uv.y));
    vec3 texColor0 = texture2D(tex0, uv).xyz;
    vec3 texColor1 = texture2D(tex1, uv).xyz;
    
    vec3 diff = texColor0 - texColor1;
    vec3 diff2 = texColor1 + diff * delaySpeed;
    

    float luma = getLuminance(texColor0);
    float alpha = luma < lumaThreshold ? alphaMin : alphaMax;

    fragColor = vec4(diff2, alpha);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
