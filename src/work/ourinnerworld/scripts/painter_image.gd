extends Sprite2D

@export var paint_color: Color = Color.RED
@export var img_size := Vector2i(280, 230)  # Más ancho y más alto
@export var brush_size := 3
@export_range(0.0, 1.0) var blend_strength := 0.3  # Fuerza de mezcla (0 = opaco, 1 = muy transparente)

var img: Image
var is_painting := false

func _ready() -> void:
	# Crear imagen vacía con fondo blanco
	img = Image.create_empty(img_size.x, img_size.y, false, Image.FORMAT_RGBA8)
	img.fill(Color.WHITE)
	texture = ImageTexture.create_from_image(img)

func _paint_tex(pos: Vector2i) -> void:
	# Pintar con brocha circular suave y mezcla de colores
	var brush_radius := brush_size
	
	for x in range(-brush_radius, brush_radius + 1):
		for y in range(-brush_radius, brush_radius + 1):
			var paint_pos = pos + Vector2i(x, y)
			
			# Verificar que esté dentro de los límites
			if paint_pos.x < 0 or paint_pos.x >= img_size.x or paint_pos.y < 0 or paint_pos.y >= img_size.y:
				continue
			
			# Calcular distancia desde el centro para suavizado
			var distance = Vector2(x, y).length()
			
			# Pintar solo si está dentro del radio (brocha circular)
			if distance <= brush_radius:
				# Suavizado en los bordes
				var edge_alpha = 1.0
				if distance > brush_radius - 1.0:
					edge_alpha = 1.0 - (distance - (brush_radius - 1.0))
				
				# Combinar alpha del borde con la fuerza de mezcla
				var final_alpha = edge_alpha * blend_strength
				
				# Aplicar color con mezcla
				var final_color = paint_color
				final_color.a = final_alpha
				
				# Obtener color existente y mezclar suavemente
				var existing_color = img.get_pixelv(paint_pos)
				var blended_color = existing_color.lerp(final_color, final_alpha)
				
				img.set_pixelv(paint_pos, blended_color)
	
	# Actualizar textura
	texture.update(img)

func _input(event: InputEvent) -> void:
	# Click izquierdo presionado - iniciar pintado
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				is_painting = true
				var lpos = to_local(event.position)
				var impos = Vector2i(lpos + img_size / 2.0)
				_paint_tex(impos)
			else:
				is_painting = false
		
		# Click derecho - pipeta (tomar color)
		elif event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
			var lpos = to_local(event.position)
			var impos = Vector2i(lpos + img_size / 2.0)
			
			# Verificar límites
			if impos.x >= 0 and impos.x < img_size.x and impos.y >= 0 and impos.y < img_size.y:
				var picked_color = img.get_pixelv(impos)
				if picked_color.a > 0.1:  # Solo si no es transparente
					paint_color = picked_color
	
	# Movimiento del mouse mientras se pinta
	elif event is InputEventMouseMotion and is_painting:
		var lpos = to_local(event.position)
		var impos = Vector2i(lpos + img_size / 2.0)
		
		# Interpolación para pintura suave
		if event.relative.length_squared() > 0:
			var steps = ceili(event.relative.length())
			var start_pos_v2 = Vector2(impos - Vector2i(event.relative))
			var end_pos_v2 = Vector2(impos)
			
			for i in steps:
				var t = float(i) / float(steps)
				var interpolated_pos = start_pos_v2.lerp(end_pos_v2, t)
				_paint_tex(Vector2i(interpolated_pos))

func set_brush_size(value: int) -> void:
	brush_size = clampi(value, 1, 20)

func _on_h_slider_value_changed(value: float) -> void:
	set_brush_size(int(value))
