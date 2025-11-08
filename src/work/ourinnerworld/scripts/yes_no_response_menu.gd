extends PanelContainer
class_name YesNoResponseMenu

## Emitted when a response is selected.
signal response_selected(response)

## The action for accepting a response
@export var next_action: StringName = &"ui_accept"

## Animation duration for hand movement
@export var animation_duration: float = 0.2

## Current selection (0 = YES, 1 = NO)
var current_selection: int = 0

## The list of dialogue responses (should have exactly 2)
var responses: Array = []:
	set(value):
		responses = value
		if responses.size() > 0:
			show()
			current_selection = 0
			_update_hand_position(false)
		else:
			hide()

# References to UI elements
@onready var hand_pointer = %HandPointer
@onready var yes_label = %YesLabel
@onready var no_label = %NoLabel

# Audio players
var move_down_sound: AudioStreamPlayer
var move_up_sound: AudioStreamPlayer

# Tween for animation
var hand_tween: Tween


func _ready() -> void:
	hide()
	
	# Setup audio players
	move_down_sound = AudioStreamPlayer.new()
	move_down_sound.stream = load("res://music/continue.ogg")
	add_child(move_down_sound)
	
	move_up_sound = AudioStreamPlayer.new()
	move_up_sound.stream = load("res://music/go-back.ogg")
	add_child(move_up_sound)
	
	_update_hand_position(false)
	
	# Conectar señales para input del mouse en los labels
	if yes_label:
		yes_label.gui_input.connect(_on_yes_label_gui_input)
		yes_label.mouse_filter = Control.MOUSE_FILTER_STOP
	if no_label:
		no_label.gui_input.connect(_on_no_label_gui_input)
		no_label.mouse_filter = Control.MOUSE_FILTER_STOP


func _process(_delta: float) -> void:
	if not visible or responses.size() == 0:
		return
	
	# Handle input for selection (UP = YES, DOWN = NO)
	if Input.is_action_just_pressed("ui_up"):
		if current_selection == 1:  # Only move if we're at NO
			current_selection = 0
			move_up_sound.play()
			_update_hand_position(true)
	elif Input.is_action_just_pressed("ui_down"):
		if current_selection == 0:  # Only move if we're at YES
			current_selection = 1
			move_down_sound.play()
			_update_hand_position(true)
	
	# Handle confirmation
	if Input.is_action_just_pressed(next_action):
		_select_current_response()


func _update_hand_position(animate: bool = true) -> void:
	if not is_node_ready():
		return
	
	# Calculate target position
	var target_y: float
	if current_selection == 0:
		target_y = yes_label.global_position.y - hand_pointer.get_parent().global_position.y
	else:
		target_y = no_label.global_position.y - hand_pointer.get_parent().global_position.y
	
	# Animate or snap to position
	if animate and hand_tween:
		hand_tween.kill()
	
	if animate:
		hand_tween = create_tween()
		hand_tween.set_ease(Tween.EASE_OUT)
		hand_tween.set_trans(Tween.TRANS_CUBIC)
		hand_tween.tween_property(hand_pointer, "position:y", target_y, animation_duration)
	else:
		hand_pointer.position.y = target_y
	
	# Update label colors to show selection
	yes_label.modulate = Color.WHITE if current_selection == 0 else Color.GRAY
	no_label.modulate = Color.WHITE if current_selection == 1 else Color.GRAY


func _select_current_response() -> void:
	if responses.size() > current_selection:
		response_selected.emit(responses[current_selection])


## Allow mouse input on labels
func _on_yes_label_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if current_selection != 0:
			move_up_sound.play()
		current_selection = 0
		_update_hand_position(true)
		_select_current_response()


func _on_no_label_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if current_selection != 1:
			move_down_sound.play()
		current_selection = 1
		_update_hand_position(true)
		_select_current_response()
