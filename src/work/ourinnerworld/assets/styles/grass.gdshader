shader_type canvas_item;
uniform sampler2D overlay_tex: repeat_enable, filter_nearest;
uniform float scale: hint_range(0.001, 1.0) = 0.05;
uniform float blend_strength: hint_range(0.0, 1.0) = 0.5;
varying vec2 world_position;
void vertex(){
    world_position = (MODEL_MATRIX * vec4(VERTEX, 0.0, 1.0)).xy;
}
void fragment() {
    vec4 overlay_color = texture(overlay_tex, world_position * scale);
    
    // Multiplica para oscurecer/variar el pasto
    COLOR.rgb = mix(COLOR.rgb, COLOR.rgb * overlay_color.rgb, blend_strength);
}