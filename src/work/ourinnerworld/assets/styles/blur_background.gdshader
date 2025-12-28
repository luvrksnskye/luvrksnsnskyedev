shader_type canvas_item;

// Blur shader para el fondo del Tag Menu
uniform float blur_amount : hint_range(0.0, 5.0) = 2.0;
uniform float darkness : hint_range(0.0, 1.0) = 0.4;
uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

void fragment() {
	vec2 pixel_size = 1.0 / vec2(textureSize(SCREEN_TEXTURE, 0));
	vec4 color = vec4(0.0);
	
	// Sample en patrón de 9 puntos para blur gaussiano simple
	float total_weight = 0.0;
	
	for (int x = -2; x <= 2; x++) {
		for (int y = -2; y <= 2; y++) {
			vec2 offset = vec2(float(x), float(y)) * pixel_size * blur_amount;
			float weight = 1.0 / (1.0 + float(abs(x) + abs(y)));
			color += texture(SCREEN_TEXTURE, SCREEN_UV + offset) * weight;
			total_weight += weight;
		}
	}
	
	color /= total_weight;
	
	// Oscurecer
	color.rgb *= (1.0 - darkness);
	color.a = 1.0;
	
	COLOR = color;
}
