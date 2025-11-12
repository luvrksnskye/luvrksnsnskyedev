shader_type canvas_item;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void fragment() {
    vec2 uv = UV - 0.5;
    float dist = length(uv);
    
    // Añadir irregularidades a la forma
    float angle = atan(uv.y, uv.x);
    float noise = random(vec2(angle * 3.0, 0.0)) * 0.15;
    
    float radius = 0.45 + noise;
    float edge = smoothstep(radius + 0.05, radius, dist);
    
    COLOR.a *= edge;
}