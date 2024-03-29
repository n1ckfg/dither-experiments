precision mediump float;

uniform sampler2D tex0;

varying vec2 vTexCoord;

void main() {
    vec2 uv = vTexCoord.xy;
    vec2 uv2 = vec2(uv.x, abs(1.0 - uv.y));
    gl_FragColor = texture2D(tex0, uv2);    
}