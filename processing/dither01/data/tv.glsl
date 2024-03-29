uniform sampler2D tex0;
uniform vec2 iResolution;
uniform float time;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    //uv = vec2(uv.x, abs(1.0 - uv.y));

    vec3 col = texture2D(tex0, uv).xyz;

    float scanline = sin(uv.y * iResolution.y * 1.2) * 0.1;

    float noise = sin(time * 100.0) * 0.02;

    fragColor = vec4(col + noise - scanline, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}