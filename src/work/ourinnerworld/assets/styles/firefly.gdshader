shader_type particles;

// Configuración del brillo
uniform vec4 glow_color : source_color = vec4(1.0, 0.95, 0.3, 1.0);
uniform float glow_intensity : hint_range(0.0, 20.0) = 8.0;
uniform float pulse_speed : hint_range(0.1, 10.0) = 2.5;
uniform float pulse_min : hint_range(0.0, 1.0) = 0.4;
uniform float pulse_max : hint_range(0.0, 1.0) = 1.0;

// Movimiento
uniform float flight_speed : hint_range(0.1, 5.0) = 1.2;
uniform float wander_strength : hint_range(0.0, 5.0) = 2.5;
uniform float vertical_bias : hint_range(-2.0, 2.0) = 0.3;

// Área de emisión
uniform vec2 emission_area = vec2(200.0, 200.0);

// Función para generar números pseudo-aleatorios
float hash(uint n) {
    n = (n << 13u) ^ n;
    n = n * (n * n * 15731u + 789221u) + 1376312589u;
    return float(n & 0x7fffffffu) / float(0x7fffffff);
}

void start() {
    // Posición inicial aleatoria
    TRANSFORM[3].xy = vec2(
        (hash(NUMBER) - 0.5) * emission_area.x,
        (hash(NUMBER + 1u) - 0.5) * emission_area.y
    );
    
    // Velocidad inicial aleatoria
    VELOCITY.xy = vec2(
        (hash(NUMBER + 2u) - 0.5) * flight_speed,
        (hash(NUMBER + 3u) - 0.5) * flight_speed + vertical_bias
    );
    
    // Fase de pulso aleatoria para cada partícula
    CUSTOM.x = hash(NUMBER + 4u) * 6.28318; // 2*PI
    
    // Tamaño variable para cada luciérnaga
    float size_variation = 0.8 + hash(NUMBER + 5u) * 0.4; // Entre 0.8 y 1.2
    CUSTOM.z = size_variation;
}

void process() {
    // Movimiento serpenteante (como una luciérnaga)
    float wobble_x = sin(TIME * pulse_speed + CUSTOM.x) * wander_strength;
    float wobble_y = cos(TIME * pulse_speed * 0.7 + CUSTOM.x) * wander_strength;
    
    VELOCITY.xy += vec2(wobble_x, wobble_y) * DELTA;
    
    // Aplicar velocidad a la posición
    TRANSFORM[3].xy += VELOCITY.xy * DELTA * flight_speed;
    
    // Pulso de brillo intenso (efecto de luciérnaga)
    float pulse = sin(TIME * pulse_speed + CUSTOM.x) * 0.5 + 0.5;
    pulse = mix(pulse_min, pulse_max, pulse);
    
    // Curva de pulso más dramática para mayor intensidad
    pulse = pow(pulse, 0.6); // Hace el brillo más pronunciado
    
    // COLOR controla el brillo de la partícula
    COLOR = glow_color * glow_intensity * pulse;
    COLOR.a = pulse; // Alpha también pulsa
    
    // Almacenar intensidad de brillo
    CUSTOM.y = pulse;
    
    // Mantener las partículas dentro del área
    if (abs(TRANSFORM[3].x) > emission_area.x * 0.5) {
        VELOCITY.x *= -1.0;
        TRANSFORM[3].x = clamp(TRANSFORM[3].x, -emission_area.x * 0.5, emission_area.x * 0.5);
    }
    if (abs(TRANSFORM[3].y) > emission_area.y * 0.5) {
        VELOCITY.y *= -1.0;
        TRANSFORM[3].y = clamp(TRANSFORM[3].y, -emission_area.y * 0.5, emission_area.y * 0.5);
    }
}