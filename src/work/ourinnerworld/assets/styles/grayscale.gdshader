shader_type canvas_item;

uniform float grayscale_amount : hint_range(0.0, 1.0) = 0.0;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

void fragment() {
    vec4 tex = texture(TEXTURE, UV);
    float lum = dot(tex.rgb, LUMA);
    vec3 gray = vec3(lum);
    tex.rgb = mix(tex.rgb, gray, grayscale_amount);
    COLOR = tex;
}
