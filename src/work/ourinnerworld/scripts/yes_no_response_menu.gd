extends PanelContainer
class_name YesNoResponseMenu

signal response_selected(response)

@export var next_action: StringName = &"ui_accept"
@export var animation_duration: float = 0.2
@export var bounce_distance: float = 8.0
@export var bounce_duration: float = 1.2

var current_selection: int = 0

const BASE_WIDTH: float = 134.0
const BASE_HEIGHT: float = 110.0
const BASE_POS: Vector2 = Vector2(400.0, 129.0)

var responses: Array = []:
	set(value):
		responses = value
		if responses.size() > 0:
			_setup_response_labels()
			_adjust_panel_size()
			show()
			current_selection = 0
			_update_hand_position(false)
			_start_bounce_animation()
		else:
			hide()
			_stop_bounce_animation()

@onready var hand_pointer: Sprite2D = %HandPointer
@onready var response_label_1: Label = $MarginContainer/HBoxContainer/ResponsesContainer/ResponseLabel1
@onready var response_label_2: Label = $MarginContainer/HBoxContainer/ResponsesContainer/ResponseLabel2
@onready var response_label_3: Label = $MarginContainer/HBoxContainer/ResponsesContainer/ResponseLabel3
@onready var response_label_4: Label = $MarginContainer/HBoxContainer/ResponsesContainer/ResponseLabel4
@onready var response_label_5: Label = $MarginContainer/HBoxContainer/ResponsesContainer/ResponseLabel5

var response_labels: Array[Label] = []
var move_down_sound: AudioStreamPlayer
var move_up_sound: AudioStreamPlayer
var hand_tween: Tween
var bounce_tween: Tween
var base_hand_x: float = 0.0

func _ready() -> void:
	hide()
	position = BASE_POS
	_setup_audio()
	_setup_labels()
	_update_hand_position(false)
	await get_tree().process_frame
	if is_node_ready():
		base_hand_x = hand_pointer.position.x

func _setup_audio() -> void:
	move_down_sound = AudioStreamPlayer.new()
	move_down_sound.stream = load("res://music/continue.ogg")
	add_child(move_down_sound)
	move_up_sound = AudioStreamPlayer.new()
	move_up_sound.stream = load("res://music/go-back.ogg")
	add_child(move_up_sound)

func _setup_labels() -> void:
	response_labels = [
		response_label_1,
		response_label_2,
		response_label_3,
		response_label_4,
		response_label_5
	]
	for i in range(response_labels.size()):
		var label: Label = response_labels[i]
		if label:
			var idx: int = i
			label.mouse_filter = Control.MOUSE_FILTER_STOP
			label.gui_input.connect(func(event: InputEvent):
				_on_response_label_gui_input(event, idx)
			)

func _setup_response_labels() -> void:
	for i in range(response_labels.size()):
		var label: Label = response_labels[i]
		if i < responses.size():
			label.text = responses[i].text
			label.show()
		else:
			label.hide()

func _adjust_panel_size() -> void:
	if responses.size() == 0:
		return
	
	# FIX: Resetear tamaño al mínimo antes de calcular el nuevo
	size = Vector2(BASE_WIDTH, BASE_HEIGHT)
	custom_minimum_size = Vector2.ZERO
	
	await get_tree().process_frame

	var max_text_width: float = 0.0

	for i in range(responses.size()):
		var label: Label = response_labels[i]
		if label.visible:
			var t: Vector2 = label.get_theme_font("font").get_string_size(
				label.text,
				HORIZONTAL_ALIGNMENT_LEFT,
				-1,
				label.get_theme_font_size("font_size")
			)
			max_text_width = max(max_text_width, t.x)

	var used_width: float = max_text_width + 70.0
	var final_width: float = max(BASE_WIDTH, used_width)

	var label_height: float = 22.0
	var spacing: float = float(max(0, responses.size() - 1)) * 6.0
	var required_height: float = label_height * float(responses.size()) + spacing + 40.0
	var final_height: float = max(BASE_HEIGHT, required_height)

	var new_size: Vector2 = Vector2(final_width, final_height)
	size = new_size
	custom_minimum_size = new_size

	var dx: float = final_width - BASE_WIDTH
	var dy: float = final_height - BASE_HEIGHT

	var new_x: float = BASE_POS.x - max(0.0, dx)
	var new_y: float = BASE_POS.y - max(0.0, dy)

	position = Vector2(new_x, new_y)

func _process(_delta: float) -> void:
	if not visible or responses.size() == 0:
		return
	if Input.is_action_just_pressed("ui_up"):
		if current_selection > 0:
			current_selection -= 1
			move_up_sound.play()
			_update_hand_position(true)
	elif Input.is_action_just_pressed("ui_down"):
		if current_selection < responses.size() - 1:
			current_selection += 1
			move_down_sound.play()
			_update_hand_position(true)
	if Input.is_action_just_pressed(next_action):
		_select_current_response()

func _update_hand_position(animate: bool = true) -> void:
	if not is_node_ready() or responses.size() == 0:
		return

	_stop_bounce_animation()

	var target_label: Label = response_labels[current_selection]
	var label_pos: Vector2 = target_label.position
	var label_parent_pos: Vector2 = target_label.get_parent().position
	
	var target_y: float = label_pos.y + label_parent_pos.y + 7.0
	var target_x: float = -20.0

	if animate:
		if hand_tween:
			hand_tween.kill()
		hand_tween = create_tween()
		hand_tween.set_ease(Tween.EASE_OUT)
		hand_tween.set_trans(Tween.TRANS_CUBIC)
		hand_tween.tween_property(hand_pointer, "position", Vector2(target_x, target_y), animation_duration)
		hand_tween.finished.connect(func():
			base_hand_x = target_x
			_start_bounce_animation()
		, CONNECT_ONE_SHOT)
	else:
		hand_pointer.position = Vector2(target_x, target_y)
		base_hand_x = target_x
		_start_bounce_animation()

	for i in range(responses.size()):
		response_labels[i].modulate = Color.WHITE if i == current_selection else Color.GRAY

func _start_bounce_animation() -> void:
	if not is_node_ready() or not visible:
		return
	if bounce_tween:
		bounce_tween.kill()
	if base_hand_x == 0.0:
		base_hand_x = hand_pointer.position.x
	hand_pointer.position.x = base_hand_x
	bounce_tween = create_tween()
	bounce_tween.set_loops()
	bounce_tween.set_ease(Tween.EASE_IN_OUT)
	bounce_tween.set_trans(Tween.TRANS_SINE)
	bounce_tween.tween_property(hand_pointer, "position:x", base_hand_x - bounce_distance, bounce_duration / 2.0)
	bounce_tween.tween_property(hand_pointer, "position:x", base_hand_x, bounce_duration / 2.0)

func _stop_bounce_animation() -> void:
	if bounce_tween:
		bounce_tween.kill()
		bounce_tween = null

func _select_current_response() -> void:
	if responses.size() > current_selection:
		_stop_bounce_animation()
		response_selected.emit(responses[current_selection])

func _on_response_label_gui_input(event: InputEvent, index: int) -> void:
	if not visible or index >= responses.size():
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if current_selection != index:
			if index > current_selection:
				move_down_sound.play()
			else:
				move_up_sound.play()
		current_selection = index
		_update_hand_position(true)
		_select_current_response()
