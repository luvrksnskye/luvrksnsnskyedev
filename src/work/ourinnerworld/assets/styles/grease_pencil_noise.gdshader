shader_type canvas_item;

// Intensidad del ruido (como en Grease Pencil)
uniform float noise_scale : hint_range(0.0, 0.02) = 0.005;
uniform float noise_frequency : hint_range(1.0, 50.0) = 15.0;

// Frames por segundo del efecto (saltos discretos)
uniform float step_fps : hint_range(1.0, 24.0) = 8.0;

// Aleatorio por posición
uniform float position_randomness : hint_range(0.0, 1.0) = 0.5;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void fragment() {
    // Frame discreto (como Grease Pencil)
    float frame = floor(TIME * step_fps);
    
    // Semilla que cambia por frame
    float seed = random(vec2(frame, frame * 0.7));
    
    // Ruido basado en posición UV + seed del frame
    vec2 noise_coord = UV * noise_frequency;
    
    // Mezcla entre ruido por posición y ruido uniforme por frame
    float noise_x = noise(noise_coord + seed * 100.0);
    float noise_y = noise(noise_coord + seed * 100.0 + vec2(50.0, 50.0));
    
    // Componente que varía por posición vs uniforme
    float uniform_x = random(vec2(seed, seed * 2.0));
    float uniform_y = random(vec2(seed * 3.0, seed));
    
    float final_x = mix(uniform_x, noise_x, position_randomness);
    float final_y = mix(uniform_y, noise_y, position_randomness);
    
    // Aplicar desplazamiento
    vec2 displaced_uv = UV;
    displaced_uv.x += (final_x - 0.5) * noise_scale;
    displaced_uv.y += (final_y - 0.5) * noise_scale;
    
    COLOR = texture(TEXTURE, displaced_uv);
}
