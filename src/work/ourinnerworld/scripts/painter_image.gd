extends Sprite2D

@export var paint_color: Color = Color.RED
@export var img_size := Vector2i(280, 230)
@export var brush_size := 3
@export_range(0.0, 1.0) var blend_strength := 0.3

var img: Image
var is_painting := false

# ============================================
# AUDIO
# ============================================
@onready var sfx_normal: AudioStreamPlayer = $"../../Sounds/sfx-strokes-paint"
@onready var sfx_large: AudioStreamPlayer = $"../../Sounds/sfx-strokes-paint2-large"
@onready var sfx_undo: AudioStreamPlayer = $"../../Sounds/sfx-undo-art"

var stroke_sound_timer := 0.0
const STROKE_SOUND_INTERVAL := 0.15

# ============================================
# UI REFERENCE
# ============================================
@onready var colors_grid: GridContainer = $"../../UI/MarginContainer2/Panel/GridContainer"

# ============================================
# UNDO/REDO SYSTEM (SESSION-BASED)
# ============================================
var undo_stack: Array[Image] = []
var redo_stack: Array[Image] = []
const MAX_UNDO_HISTORY := 50

var current_stroke_started := false
var current_session_id := 0

signal color_picked(color: Color)
signal history_changed(can_undo: bool, can_redo: bool)

# ============================================
# LIFECYCLE
# ============================================
func _ready() -> void:
	img = Image.create_empty(img_size.x, img_size.y, false, Image.FORMAT_RGBA8)
	img.fill(Color.WHITE)
	texture = ImageTexture.create_from_image(img)
	_save_state_to_undo()

# ============================================
# SESSION MANAGEMENT
# ============================================
func start_new_drawing_session() -> void:
	"""Start a new drawing session with clean canvas and isolated history"""
	current_session_id += 1
	
	undo_stack.clear()
	redo_stack.clear()
	
	img.fill(Color.WHITE)
	texture.update(img)
	
	_save_state_to_undo()
	
	print("🎨 New drawing session #%d started" % current_session_id)

# ============================================
# HISTORY MANAGEMENT
# ============================================
func _save_state_to_undo() -> void:
	var img_copy := Image.create_empty(img_size.x, img_size.y, false, Image.FORMAT_RGBA8)
	img_copy.copy_from(img)
	undo_stack.append(img_copy)
	
	if undo_stack.size() > MAX_UNDO_HISTORY:
		undo_stack.pop_front()
	
	redo_stack.clear()
	_emit_history_changed()

func undo() -> void:
	if not can_undo():
		return
	
	if sfx_undo:
		sfx_undo.pitch_scale = randf_range(0.95, 1.05)
		sfx_undo.play()
	
	var current_copy := Image.create_empty(img_size.x, img_size.y, false, Image.FORMAT_RGBA8)
	current_copy.copy_from(img)
	redo_stack.append(current_copy)
	
	var previous_state = undo_stack.pop_back()
	img.copy_from(previous_state)
	texture.update(img)
	
	_emit_history_changed()

func redo() -> void:
	if not can_redo():
		return
	
	var current_copy := Image.create_empty(img_size.x, img_size.y, false, Image.FORMAT_RGBA8)
	current_copy.copy_from(img)
	undo_stack.append(current_copy)
	
	var next_state = redo_stack.pop_back()
	img.copy_from(next_state)
	texture.update(img)
	
	_emit_history_changed()

func can_undo() -> bool:
	return undo_stack.size() > 1

func can_redo() -> bool:
	return redo_stack.size() > 0

func _emit_history_changed() -> void:
	emit_signal("history_changed", can_undo(), can_redo())

# ============================================
# CLEAR CANVAS
# ============================================
func clear_canvas() -> void:
	"""Clear canvas but keep history within current session"""
	_save_state_to_undo()
	img.fill(Color.WHITE)
	texture.update(img)

# ============================================
# PAINTING
# ============================================
func _paint_tex(pos: Vector2i) -> void:
	var brush_radius := brush_size
	
	for x in range(-brush_radius, brush_radius + 1):
		for y in range(-brush_radius, brush_radius + 1):
			var paint_pos = pos + Vector2i(x, y)
			
			if paint_pos.x < 0 or paint_pos.x >= img_size.x or paint_pos.y < 0 or paint_pos.y >= img_size.y:
				continue
			
			var distance := Vector2(x, y).length()
			if distance <= brush_radius:
				var edge_alpha := 1.0
				if distance > brush_radius - 1.0:
					edge_alpha = 1.0 - (distance - (brush_radius - 1.0))
				
				var final_alpha := edge_alpha * blend_strength
				var final_color := paint_color
				final_color.a = final_alpha
				
				var existing_color := img.get_pixelv(paint_pos)
				var blended_color := existing_color.lerp(final_color, final_alpha)
				
				img.set_pixelv(paint_pos, blended_color)
	
	texture.update(img)

# ============================================
# AUDIO
# ============================================
func _get_brush_sound() -> AudioStreamPlayer:
	return sfx_large if brush_size >= 10 else sfx_normal

func _play_stroke_sound() -> void:
	var player := _get_brush_sound()
	if not player:
		return
	
	player.pitch_scale = randf_range(0.90, 1.10)
	
	if not player.playing:
		player.play()

# ============================================
# INPUT
# ============================================
func _input(event: InputEvent) -> void:
	# Keyboard shortcuts
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_Z and event.ctrl_pressed:
			if event.shift_pressed:
				redo()
			else:
				undo()
			return
		elif event.keycode == KEY_SHIFT and not event.ctrl_pressed:
			if colors_grid and colors_grid.has_method("_close_color_picker_if_open"):
				colors_grid._close_color_picker_if_open()
			return
	
	# Mouse buttons
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			_handle_paint_input(event)
		elif event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
			_handle_color_pick(event)
	
	# Mouse motion while painting
	elif event is InputEventMouseMotion and is_painting:
		_handle_paint_motion(event)

func _handle_paint_input(event: InputEventMouseButton) -> void:
	if event.pressed:
		current_stroke_started = true
		is_painting = true
		stroke_sound_timer = STROKE_SOUND_INTERVAL
		
		var lpos := to_local(event.position)
		var impos := Vector2i(lpos + img_size / 2.0)
		_paint_tex(impos)
	else:
		is_painting = false
		if current_stroke_started:
			_save_state_to_undo()
			current_stroke_started = false

func _handle_color_pick(event: InputEventMouseButton) -> void:
	var lpos := to_local(event.position)
	var impos := Vector2i(lpos + img_size / 2.0)
	
	if impos.x >= 0 and impos.x < img_size.x and impos.y >= 0 and impos.y < img_size.y:
		var picked_color := img.get_pixelv(impos)
		if picked_color.a > 0.1:
			paint_color = picked_color
			emit_signal("color_picked", picked_color)

func _handle_paint_motion(event: InputEventMouseMotion) -> void:
	var lpos := to_local(event.position)
	var impos := Vector2i(lpos + img_size / 2.0)
	
	if event.relative.length_squared() > 0:
		var steps := ceili(event.relative.length())
		var start_pos_v2 := Vector2(impos - Vector2i(event.relative))
		var end_pos_v2 := Vector2(impos)
		
		for i in steps:
			var t := float(i) / float(steps)
			var interpolated_pos := start_pos_v2.lerp(end_pos_v2, t)
			_paint_tex(Vector2i(interpolated_pos))
	
	stroke_sound_timer -= get_process_delta_time()
	if stroke_sound_timer <= 0.0:
		_play_stroke_sound()
		stroke_sound_timer = STROKE_SOUND_INTERVAL

# ============================================
# UTILITIES
# ============================================
func set_brush_size(value: int) -> void:
	brush_size = clampi(value, 1, 20)

func set_paint_color(color: Color) -> void:
	paint_color = color

func get_image_copy() -> Image:
	var copy := Image.create_empty(img_size.x, img_size.y, false, Image.FORMAT_RGBA8)
	copy.copy_from(img)
	return copy

func _on_h_slider_value_changed(value: float) -> void:
	set_brush_size(int(value))
