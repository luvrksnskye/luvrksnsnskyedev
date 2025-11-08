extends PanelContainer

## Emitted when a response is selected.
signal response_selected(response)

## The action for accepting a response
@export var next_action: StringName = &"ui_accept"

## Current selection (0 = YES, 1 = NO)
var current_selection: int = 0

## The list of dialogue responses (should have exactly 2)
var responses: Array = []:
	set(value):
		responses = value
		if responses.size() > 0:
			show()
			current_selection = 0
			_update_hand_position()
		else:
			hide()

# References to UI elements
@onready var hand_pointer = %HandPointer
@onready var yes_label = %YesLabel
@onready var no_label = %NoLabel


func _ready() -> void:
	hide()
	_update_hand_position()
	
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
		current_selection = 0
		_update_hand_position()
	elif Input.is_action_just_pressed("ui_down"):
		current_selection = 1
		_update_hand_position()
	
	# Handle confirmation
	if Input.is_action_just_pressed(next_action):
		_select_current_response()


func _update_hand_position() -> void:
	if not is_node_ready():
		return
	
	# Move hand to point at current selection
	if current_selection == 0:
		# Point at YES
		hand_pointer.get_parent().move_child(hand_pointer, 0)
	else:
		# Point at NO
		hand_pointer.get_parent().move_child(hand_pointer, 2)
	
	# Update label colors to show selection
	yes_label.modulate = Color.WHITE if current_selection == 0 else Color.GRAY
	no_label.modulate = Color.WHITE if current_selection == 1 else Color.GRAY


func _select_current_response() -> void:
	if responses.size() > current_selection:
		response_selected.emit(responses[current_selection])


## Allow mouse input on labels
func _on_yes_label_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		current_selection = 0
		_select_current_response()


func _on_no_label_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		current_selection = 1
		_select_current_response()
