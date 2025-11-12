extends Control

@onready var painter_image: Sprite2D = $Canvas/PainterImage
@onready var dialogue_balloon = $Makomi_Dialogue/ExampleBalloon
@onready var sfx_paint: AudioStreamPlayer = $"Sound&Music/sfx-paint"

const INTRO_DIALOGUE = preload("res://assets/dialogues/paint_guide/intro.dialogue")
const TURN_DIALOGUE = preload("res://assets/dialogues/paint_guide/turn.dialogue")

var is_drawing_demo := false
var draw_progress := 0.0
var current_step := 0

# Configuración de pasos con duración (reducida para acelerar la animación)
var steps = [
	{"name": "background", "duration": 0.6},
	{"name": "sun", "duration": 0.5},
	{"name": "snow_ground", "duration": 0.4},
	{"name": "bottom_body", "duration": 0.6},
	{"name": "bottom_shadow", "duration": 0.3},
	{"name": "middle_body", "duration": 0.5},
	{"name": "middle_shadow", "duration": 0.3},
	{"name": "head", "duration": 0.4},
	{"name": "head_shadow", "duration": 0.2},
	{"name": "hat_brim", "duration": 0.3},
	{"name": "hat_body", "duration": 0.4},
	{"name": "hat_top", "duration": 0.3},
	{"name": "hat_band", "duration": 0.3},
	{"name": "left_eye", "duration": 0.2},
	{"name": "left_eye_shine", "duration": 0.2},
	{"name": "right_eye", "duration": 0.2},
	{"name": "right_eye_shine", "duration": 0.2},
	{"name": "carrot_nose", "duration": 0.4},
	{"name": "nose_shadow", "duration": 0.2},
	{"name": "mouth", "duration": 0.5},
	{"name": "scarf_body", "duration": 0.4},
	{"name": "scarf_shadows", "duration": 0.2},
	{"name": "left_scarf_tail", "duration": 0.3},
	{"name": "left_scarf_fringe", "duration": 0.3},
	{"name": "right_scarf_tail", "duration": 0.3},
	{"name": "right_scarf_fringe", "duration": 0.3},
	{"name": "buttons", "duration": 0.4},
	{"name": "left_arm", "duration": 0.4},
	{"name": "right_arm", "duration": 0.4},
	{"name": "snowfall", "duration": 0.7},
	{"name": "wait", "duration": 1.0}
]

func _ready() -> void:
	await get_tree().process_frame
	start_intro_dialogue()

func start_intro_dialogue() -> void:
	if dialogue_balloon:
		dialogue_balloon.visible = true
	DialogueManager.show_dialogue_balloon(INTRO_DIALOGUE, "start", [])
	if not DialogueManager.dialogue_ended.is_connected(_on_intro_ended):
		DialogueManager.dialogue_ended.connect(_on_intro_ended)

func _on_intro_ended(dialogue_resource) -> void:
	if DialogueManager.dialogue_ended.is_connected(_on_intro_ended):
		DialogueManager.dialogue_ended.disconnect(_on_intro_ended)
	is_drawing_demo = true
	current_step = 0
	draw_progress = 0.0

func _process(delta: float) -> void:
	if not is_drawing_demo:
		return
	
	if current_step >= steps.size():
		is_drawing_demo = false
		start_final_dialogue()
		return
	
	var step = steps[current_step]
	draw_progress += delta
	
	var t = clamp(draw_progress / step["duration"], 0.0, 1.0)
	
	# Reproducir sonido de pintura durante el dibujo (excepto en el paso de espera)
	if step["name"] != "wait" and t > 0.0 and t < 1.0:
		if !sfx_paint.playing:
			play_paint_sound()
	
	# Dibujar el paso actual con progreso suave
	match step["name"]:
		"background": draw_background(t)
		"sun": draw_sun(t)
		"snow_ground": draw_snow_ground(t)
		"bottom_body": draw_bottom_body(t)
		"bottom_shadow": draw_bottom_shadow(t)
		"middle_body": draw_middle_body(t)
		"middle_shadow": draw_middle_shadow(t)
		"head": draw_head(t)
		"head_shadow": draw_head_shadow(t)
		"hat_brim": draw_hat_brim(t)
		"hat_body": draw_hat_body(t)
		"hat_top": draw_hat_top(t)
		"hat_band": draw_hat_band(t)
		"left_eye": draw_left_eye(t)
		"left_eye_shine": draw_left_eye_shine(t)
		"right_eye": draw_right_eye(t)
		"right_eye_shine": draw_right_eye_shine(t)
		"carrot_nose": draw_carrot_nose(t)
		"nose_shadow": draw_nose_shadow(t)
		"mouth": draw_mouth(t)
		"scarf_body": draw_scarf_body(t)
		"scarf_shadows": draw_scarf_shadows(t)
		"left_scarf_tail": draw_left_scarf_tail(t)
		"left_scarf_fringe": draw_left_scarf_fringe(t)
		"right_scarf_tail": draw_right_scarf_tail(t)
		"right_scarf_fringe": draw_right_scarf_fringe(t)
		"buttons": draw_buttons(t)
		"left_arm": draw_left_arm(t)
		"right_arm": draw_right_arm(t)
		"snowfall": draw_snowfall(t)
		"wait": pass
	
	# Avanzar al siguiente paso
	if t >= 1.0:
		current_step += 1
		draw_progress = 0.0
		if step["name"] != "wait":
			play_paint_sound()

func play_paint_sound():
	if sfx_paint:
		sfx_paint.pitch_scale = randf_range(0.95, 1.05)
		sfx_paint.play()

# === FONDO Y AMBIENTE ===
func draw_background(t: float) -> void:
	var img = painter_image.img
	var sz = img.get_size()
	var max_y = int(sz.y * t)
	
	for y in range(max_y):
		var progress = float(y) / sz.y
		# Gradiente sky azul verdoso suave
		var col = Color("#91a5a6").lerp(Color("#8a9b8b"), progress * 0.2)
		col = col.lerp(Color("#8dabab"), progress * 0.3)
		col = col.lerp(Color("#889a80"), progress * 0.2)
		col = col.lerp(Color("#6d969c"), progress * 0.3)
		
		for x in range(sz.x):
			# Viñeta suave en los bordes
			var dist_x = abs(x - sz.x/2) / float(sz.x/2)
			var dist_y = abs(y - sz.y/2) / float(sz.y/2)
			var vignette = 1.0 - (dist_x * dist_x + dist_y * dist_y) * 0.15
			img.set_pixel(x, y, col * vignette)
	
	painter_image.texture.update(img)

func draw_sun(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(60, -70)
	var max_radius = 28
	
	painter_image.brush_size = 10
	
	# Núcleo brillante
	for r in range(0, int(max_radius * t)):
		for angle in range(0, 360, 4):
			var rad = deg_to_rad(angle)
			var pos = center + Vector2i(cos(rad) * r, sin(rad) * r)
			var dist_factor = float(r) / max_radius
			painter_image.paint_color = Color("#ecc56b").lerp(Color("#e4ddb7"), dist_factor * 0.7)
			painter_image._paint_tex(pos)
	
	# Resplandor externo suave
	painter_image.brush_size = 15
	painter_image.blend_strength = 0.15
	for r in range(int(max_radius * 0.8 * t), int(max_radius * 1.4 * t)):
		for angle in range(0, 360, 8):
			var rad = deg_to_rad(angle)
			var pos = center + Vector2i(cos(rad) * r, sin(rad) * r)
			painter_image.paint_color = Color("#e4ddb7")
			painter_image._paint_tex(pos)
	painter_image.blend_strength = 0.3

func draw_snow_ground(t: float) -> void:
	var sz = painter_image.img_size
	var ground_y = int(sz.y * 0.82)
	var height = int((sz.y - ground_y) * t)
	
	painter_image.brush_size = 12
	
	for y in range(ground_y, min(ground_y + height, sz.y)):
		var progress = float(y - ground_y) / (sz.y - ground_y)
		for x in range(sz.x):
			# Gradiente de nieve: claro arriba, más oscuro abajo
			var col = Color("#cdcdcf").lerp(Color("#a7bac6"), progress * 0.4)
			col = col.lerp(Color("#528b9d"), progress * 0.5)
			painter_image.paint_color = col
			painter_image._paint_tex(Vector2i(x, y))

# === CUERPO DEL MUÑECO ===
func draw_bottom_body(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, 65)
	var radius_x = 52
	var radius_y = 40
	var max_angle = 360 * t
	
	painter_image.brush_size = 12
	
	for angle in range(0, int(max_angle), 2):
		for r in range(0, radius_x, 3):
			var rad = deg_to_rad(angle)
			var x_pos = cos(rad) * r
			var y_pos = sin(rad) * r * (float(radius_y) / radius_x)
			var pos = center + Vector2i(x_pos, y_pos)
			
			var dist_factor = float(r) / radius_x
			# Base color con gradiente suave
			var base_col = Color("#96afa8").lerp(Color("#c6c7c9"), dist_factor * 0.4)
			base_col = base_col.lerp(Color("#a9b5c3"), (1.0 - cos(rad)) * 0.2)
			painter_image.paint_color = base_col
			painter_image._paint_tex(pos)

func draw_bottom_shadow(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, 65)
	painter_image.brush_size = 10
	painter_image.blend_strength = 0.2
	
	# Sombra derecha
	for y in range(-30, 35):
		var width = int(25 * t) - abs(y) * 0.3
		for x in range(int(width * 0.5), int(width)):
			painter_image.paint_color = Color("#7d9798")
			painter_image._paint_tex(center + Vector2i(x + 20, y))
	
	painter_image.blend_strength = 0.3

func draw_middle_body(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, 15)
	var radius_x = 42
	var radius_y = 34
	var max_angle = 360 * t
	
	painter_image.brush_size = 11
	
	for angle in range(0, int(max_angle), 2):
		for r in range(0, radius_x, 3):
			var rad = deg_to_rad(angle)
			var x_pos = cos(rad) * r
			var y_pos = sin(rad) * r * (float(radius_y) / radius_x)
			var pos = center + Vector2i(x_pos, y_pos)
			
			var dist_factor = float(r) / radius_x
			var base_col = Color("#96afa8").lerp(Color("#c6c7c9"), dist_factor * 0.5)
			base_col = base_col.lerp(Color("#8babba"), (1.0 - cos(rad)) * 0.15)
			painter_image.paint_color = base_col
			painter_image._paint_tex(pos)

func draw_middle_shadow(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, 15)
	painter_image.brush_size = 9
	painter_image.blend_strength = 0.18
	
	for y in range(-25, 30):
		var width = int(20 * t) - abs(y) * 0.25
		for x in range(int(width * 0.6), int(width)):
			painter_image.paint_color = Color("#8babba")
			painter_image._paint_tex(center + Vector2i(x + 15, y))
	
	painter_image.blend_strength = 0.3

func draw_head(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -38)
	var radius = 35
	var max_angle = 360 * t
	
	painter_image.brush_size = 10
	
	for angle in range(0, int(max_angle), 2):
		for r in range(0, radius, 3):
			var rad = deg_to_rad(angle)
			var pos = center + Vector2i(cos(rad) * r, sin(rad) * r)
			
			var dist_factor = float(r) / radius
			var base_col = Color("#96afa8").lerp(Color("#c6c7c9"), dist_factor * 0.6)
			# Iluminación desde arriba izquierda
			var light = (cos(rad - PI/4) + 1.0) * 0.5
			base_col = base_col.lerp(Color("#c0cccc"), light * 0.2)
			painter_image.paint_color = base_col
			painter_image._paint_tex(pos)

func draw_head_shadow(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -38)
	painter_image.brush_size = 8
	painter_image.blend_strength = 0.15
	
	for y in range(-20, 25):
		var width = int(18 * t) - abs(y) * 0.3
		for x in range(int(width * 0.7), int(width)):
			painter_image.paint_color = Color("#a9b5c3")
			painter_image._paint_tex(center + Vector2i(x + 10, y))
	
	painter_image.blend_strength = 0.3

# === SOMBRERO ===
func draw_hat_brim(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -70)
	var width = int(50 * t)
	var height = 8
	
	painter_image.brush_size = 8
	
	for y in range(-height, height):
		var current_width = width * (1.0 - abs(y) / float(height) * 0.2)
		for x in range(-int(current_width), int(current_width)):
			var x_factor = abs(x) / current_width
			var y_factor = (y + height) / float(height * 2)
			# Degradado radial metalizado
			var col = Color("#6f6e76").lerp(Color("#918593"), x_factor * 0.3)
			col = col.lerp(Color("#889395"), y_factor * 0.2)
			col = col.lerp(Color("#707068"), (x_factor + y_factor) * 0.15)
			painter_image.paint_color = col
			painter_image._paint_tex(center + Vector2i(x, y))

func draw_hat_body(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -92)
	var width = 32
	var height = int(22 * t)
	
	painter_image.brush_size = 7
	
	for y in range(0, height):
		for x in range(-width, width):
			var x_factor = abs(x) / float(width)
			var y_factor = y / float(height)
			# Gradiente gris oscuro
			var col = Color("#364e4e").lerp(Color("#3a494e"), x_factor * 0.2)
			col = col.lerp(Color("#59646a"), y_factor * 0.4)
			col = col.lerp(Color("#7d848a"), x_factor * y_factor * 0.3)
			painter_image.paint_color = col
			painter_image._paint_tex(center + Vector2i(x, y))

func draw_hat_top(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -112)
	var width = int(32 * t)
	var height = 8
	
	painter_image.brush_size = 6
	
	for y in range(-height, 0):
		var curve = 1.0 - abs(y) / float(height)
		var current_width = width * (0.6 + curve * 0.4)
		for x in range(-int(current_width), int(current_width)):
			var x_factor = abs(x) / current_width
			# Top redondeado con brillo
			var col = Color("#9b9d8f").lerp(Color("#667177"), x_factor * 0.4)
			col = col.lerp(Color("#000000"), (1.0 - curve) * 0.3)
			painter_image.paint_color = col
			painter_image._paint_tex(center + Vector2i(x, y))

func draw_hat_band(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -77)
	var width = int(38 * t)
	var height = 7
	
	painter_image.brush_size = 6
	
	for y in range(-height, height):
		for x in range(-width, width):
			var x_factor = abs(x) / float(width)
			var y_factor = abs(y) / float(height)
			# Banda roja con degradado intenso
			var col = Color("#630408").lerp(Color("#820f14"), x_factor * 0.3)
			col = col.lerp(Color("#9e1723"), (1.0 - x_factor) * 0.4)
			col = col.lerp(Color("#af2228"), x_factor * (1.0 - y_factor) * 0.2)
			painter_image.paint_color = col
			painter_image._paint_tex(center + Vector2i(x, y))

# === CARA ===
func draw_left_eye(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(-13, -43)
	var radius = int(5 * t)
	
	painter_image.brush_size = 4
	
	for r in range(0, radius + 1):
		for angle in range(0, 360, 15):
			var rad = deg_to_rad(angle)
			var pos = center + Vector2i(cos(rad) * r, sin(rad) * r)
			var dist = float(r) / radius
			painter_image.paint_color = Color("#666666").lerp(Color("#000000"), dist)
			painter_image._paint_tex(pos)

func draw_left_eye_shine(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(-15, -45)
	painter_image.brush_size = 2
	painter_image.paint_color = Color("#999999")
	
	for i in range(int(2 * t)):
		painter_image._paint_tex(center + Vector2i(i, i))

func draw_right_eye(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(13, -43)
	var radius = int(5 * t)
	
	painter_image.brush_size = 4
	
	for r in range(0, radius + 1):
		for angle in range(0, 360, 15):
			var rad = deg_to_rad(angle)
			var pos = center + Vector2i(cos(rad) * r, sin(rad) * r)
			var dist = float(r) / radius
			painter_image.paint_color = Color("#666666").lerp(Color("#000000"), dist)
			painter_image._paint_tex(pos)

func draw_right_eye_shine(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(11, -45)
	painter_image.brush_size = 2
	painter_image.paint_color = Color("#999999")
	
	for i in range(int(2 * t)):
		painter_image._paint_tex(center + Vector2i(i, i))

func draw_carrot_nose(t: float) -> void:
	var start = painter_image.img_size / 2 + Vector2i(0, -35)
	var length = int(20 * t)
	
	painter_image.brush_size = 5
	
	for i in range(0, length):
		var progress = float(i) / 20.0
		var width = (1.0 - progress) * 5
		
		# Rotación diagonal
		var angle = 76 * PI / 180.0
		var pos = start + Vector2i(cos(angle) * i, sin(angle) * i)
		
		for w in range(-int(width), int(width) + 1):
			# Gradiente naranja a marrón
			var col = Color("#eab4a7").lerp(Color("#ca7f68"), progress * 0.5)
			col = col.lerp(Color("#b94b34"), progress * 0.8)
			painter_image.paint_color = col
			
			var offset = Vector2i(-sin(angle) * w, cos(angle) * w)
			painter_image._paint_tex(pos + offset)

func draw_nose_shadow(t: float) -> void:
	var start = painter_image.img_size / 2 + Vector2i(5, -30)
	painter_image.brush_size = 4
	painter_image.blend_strength = 0.2
	
	for i in range(int(12 * t)):
		painter_image.paint_color = Color("#8babba")
		painter_image._paint_tex(start + Vector2i(i, int(i * 0.8)))
	
	painter_image.blend_strength = 0.3

func draw_mouth(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -23)
	
	# Cambio: Sonrisa hacia arriba en lugar de invertida
	var mouth_positions = [
		Vector2i(-15, 2), Vector2i(-9, 0), Vector2i(-3, -1),
		Vector2i(3, -1), Vector2i(9, 0), Vector2i(15, 2)
	]
	
	var num_coals = int(mouth_positions.size() * t)
	painter_image.brush_size = 3
	
	for i in range(num_coals):
		var pos = center + mouth_positions[i]
		for x in range(-2, 3):
			for y in range(-2, 3):
				if x*x + y*y <= 4:
					painter_image.paint_color = Color("#333333").lerp(Color("#000000"), (x*x + y*y) / 4.0)
					painter_image._paint_tex(pos + Vector2i(x, y))
	
	# Agregar algunos puntos más para una sonrisa más definida
	if t > 0.8:
		painter_image.brush_size = 2
		var extra_points = [
			Vector2i(-12, 1), Vector2i(-6, -1), Vector2i(0, -2),
			Vector2i(6, -1), Vector2i(12, 1)
		]
		for point in extra_points:
			painter_image.paint_color = Color("#000000")
			painter_image._paint_tex(center + point)

# === BUFANDA ===
func draw_scarf_body(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -12)
	var width = int(45 * t)
	var height = 10
	
	painter_image.brush_size = 7
	
	# Forma elíptica enrollada
	for y in range(-height, height):
		var ellipse_width = width * sqrt(1.0 - (y * y) / float(height * height))
		for x in range(-int(ellipse_width), int(ellipse_width)):
			var x_factor = abs(x) / ellipse_width
			var y_factor = (y + height) / float(height * 2)
			
			# Degradado rojo cálido
			var col = Color("#d3d3b5").lerp(Color("#c73f44"), x_factor * 0.6)
			col = col.lerp(Color("#8c0d0f"), y_factor * 0.3)
			painter_image.paint_color = col
			painter_image._paint_tex(center + Vector2i(x, y))

func draw_scarf_shadows(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, -12)
	painter_image.brush_size = 6
	painter_image.blend_strength = 0.2
	
	# Sombras para dar profundidad
	for y in range(-8, 8):
		var width = int(12 * t)
		for x in range(-width, 0):
			painter_image.paint_color = Color("#500106")
			painter_image._paint_tex(center + Vector2i(x - 30, y))
	
	painter_image.blend_strength = 0.3

func draw_left_scarf_tail(t: float) -> void:
	var start = painter_image.img_size / 2 + Vector2i(-35, -8)
	var length = int(40 * t)
	
	painter_image.brush_size = 5
	
	for i in range(0, length):
		var progress = float(i) / 40.0
		var width = 8 - progress * 3
		
		for w in range(-int(width), int(width) + 1):
			# Forma triangular de bufanda cayendo
			var col = Color("#ab1a27").lerp(Color("#630408"), progress * 0.7)
			painter_image.paint_color = col
			painter_image._paint_tex(start + Vector2i(w * 0.3, i))

func draw_left_scarf_fringe(t: float) -> void:
	var base = painter_image.img_size / 2 + Vector2i(-35, 32)
	painter_image.brush_size = 2
	
	var num_tassels = int(8 * t)
	var tassel_heights = [12, 10, 12, 8, 10, 12, 8, 9]
	
	for i in range(num_tassels):
		var x_offset = i * 2 - 7
		var height = tassel_heights[i]
		
		for h in range(height):
			var progress = float(h) / height
			painter_image.paint_color = Color("#cdcdcf").lerp(Color("#999999"), progress * 0.3)
			painter_image._paint_tex(base + Vector2i(x_offset, h))

func draw_right_scarf_tail(t: float) -> void:
	var start = painter_image.img_size / 2 + Vector2i(35, -8)
	var length = int(35 * t)
	
	painter_image.brush_size = 5
	
	for i in range(0, length):
		var progress = float(i) / 35.0
		var width = 7 - progress * 2.5
		
		for w in range(-int(width), int(width) + 1):
			var col = Color("#ab1a27").lerp(Color("#630408"), progress * 0.7)
			painter_image.paint_color = col
			painter_image._paint_tex(start + Vector2i(w * -0.3, i))

func draw_right_scarf_fringe(t: float) -> void:
	var base = painter_image.img_size / 2 + Vector2i(35, 27)
	painter_image.brush_size = 2
	
	var num_tassels = int(7 * t)
	var tassel_heights = [10, 8, 11, 7, 9, 11, 8]
	
	for i in range(num_tassels):
		var x_offset = i * 2 - 6
		var height = tassel_heights[i]
		
		for h in range(height):
			var progress = float(h) / height
			painter_image.paint_color = Color("#cdcdcf").lerp(Color("#999999"), progress * 0.3)
			painter_image._paint_tex(base + Vector2i(x_offset, h))

# === BOTONES ===
func draw_buttons(t: float) -> void:
	var center = painter_image.img_size / 2 + Vector2i(0, 15)
	var button_positions = [Vector2i(0, -18), Vector2i(0, 0), Vector2i(0, 18)]
	var num_buttons = int(3 * t)
	
	painter_image.brush_size = 4
	
	for i in range(num_buttons):
		var pos = center + button_positions[i]
		for x in range(-4, 5):
			for y in range(-4, 5):
				if x*x + y*y <= 16:
					var dist = sqrt(x*x + y*y) / 4.0
					painter_image.paint_color = Color("#555555").lerp(Color("#000000"), dist)
					painter_image._paint_tex(pos + Vector2i(x, y))

# === BRAZOS ===
func draw_left_arm(t: float) -> void:
	var shoulder = painter_image.img_size / 2 + Vector2i(-38, 8)
	var length = int(40 * t)
	
	painter_image.brush_size = 4
	painter_image.paint_color = Color("#6f3316")
	
	# Brazo principal inclinado
	for i in range(0, length):
		var angle = -50 - (i * 0.3)
		var rad = deg_to_rad(angle)
		var pos = shoulder + Vector2i(cos(rad) * i * 0.8, sin(rad) * i * 0.8)
		
		# Grosor variable (más grueso en la base)
		var thickness = 4 - (i / float(length)) * 2
		for w in range(-int(thickness), int(thickness) + 1):
			var offset = Vector2i(-sin(rad) * w, cos(rad) * w)
			painter_image._paint_tex(pos + offset)
	
	# Ramitas al final del brazo
	if t >= 0.7:
		var hand_pos = shoulder + Vector2i(cos(deg_to_rad(-50)) * length * 0.8, sin(deg_to_rad(-50)) * length * 0.8)
		painter_image.brush_size = 2
		
		# Ramita superior
		for i in range(12):
			var angle = -15
			var rad = deg_to_rad(angle)
			var pos = hand_pos + Vector2i(cos(rad) * i, sin(rad) * i)
			painter_image._paint_tex(pos)
		
		# Ramita inferior
		for i in range(10):
			var angle = -80
			var rad = deg_to_rad(angle)
			var pos = hand_pos + Vector2i(cos(rad) * i, sin(rad) * i)
			painter_image._paint_tex(pos)

func draw_right_arm(t: float) -> void:
	var shoulder = painter_image.img_size / 2 + Vector2i(38, 8)
	var length = int(40 * t)
	
	painter_image.brush_size = 4
	painter_image.paint_color = Color("#6f3316")
	
	# Brazo principal inclinado (espejo del izquierdo)
	for i in range(0, length):
		var angle = -130 + (i * 0.3)
		var rad = deg_to_rad(angle)
		var pos = shoulder + Vector2i(cos(rad) * i * 0.8, sin(rad) * i * 0.8)
		
		var thickness = 4 - (i / float(length)) * 2
		for w in range(-int(thickness), int(thickness) + 1):
			var offset = Vector2i(-sin(rad) * w, cos(rad) * w)
			painter_image._paint_tex(pos + offset)
	
	# Ramitas al final del brazo
	if t >= 0.7:
		var hand_pos = shoulder + Vector2i(cos(deg_to_rad(-130)) * length * 0.8, sin(deg_to_rad(-130)) * length * 0.8)
		painter_image.brush_size = 2
		
		# Ramita superior
		for i in range(12):
			var angle = -165
			var rad = deg_to_rad(angle)
			var pos = hand_pos + Vector2i(cos(rad) * i, sin(rad) * i)
			painter_image._paint_tex(pos)
		
		# Ramita inferior
		for i in range(10):
			var angle = -100
			var rad = deg_to_rad(angle)
			var pos = hand_pos + Vector2i(cos(rad) * i, sin(rad) * i)
			painter_image._paint_tex(pos)

# === NIEVE CAYENDO ===
func draw_snowfall(t: float) -> void:
	var rng = RandomNumberGenerator.new()
	rng.seed = 12345
	var num_flakes = int(200 * t)
	
	painter_image.brush_size = 2
	
	for i in range(num_flakes):
		var x = rng.randi_range(0, painter_image.img_size.x - 1)
		var y = rng.randi_range(0, painter_image.img_size.y - 1)
		var size = rng.randf_range(0.5, 1.0)
		var brightness = rng.randf_range(0.8, 1.0)
		
		painter_image.paint_color = Color(brightness, brightness, brightness + 0.1, 0.9)
		painter_image.brush_size = int(2 * size)
		painter_image._paint_tex(Vector2i(x, y))

func start_final_dialogue() -> void:
	if dialogue_balloon:
		dialogue_balloon.visible = true
	DialogueManager.show_dialogue_balloon(TURN_DIALOGUE, "start", [])
	if not DialogueManager.dialogue_ended.is_connected(_on_final_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_final_dialogue_ended)

func _on_final_dialogue_ended(dialogue_resource) -> void:
	if dialogue_balloon:
		dialogue_balloon.visible = false
	if DialogueManager.dialogue_ended.is_connected(_on_final_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_final_dialogue_ended)
	print("☃️ ¡Muñeco de nieve completo! Ahora puedes pintar libremente.")
