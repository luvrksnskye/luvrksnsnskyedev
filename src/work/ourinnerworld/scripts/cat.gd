extends Area2D

const TALKINGTOCAT = preload("res://assets/dialogues/cat_I.dialogue")
const TALKINGTOCAT_II = preload("res://assets/dialogues/cat_II.dialogue")
const TALKINGTOCAT_III = preload("res://assets/dialogues/cat_III.dialogue")

@onready var cat_sound = $AudioStreamPlayer2D

# Track if player is inside the area
var player_inside = false
# Track dialogue progression (0 = no dialogue yet, 1 = first seen, 2 = second seen, 3 = third seen)
var dialogue_stage = 0
# Track if dialogue is currently active
var dialogue_active = false

func _ready():
	# Connect the area signals
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	
	# Connect to DialogueManager signals
	if not DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_dialogue_ended)

func _on_body_entered(body):
	print("Body entered area: ", body.name)
	if body.is_in_group("Player"):
		player_inside = true
		print("Player is now inside the area - press Enter to read")

func _on_body_exited(body):
	print("Body exited area: ", body.name)
	if body.is_in_group("Player"):
		player_inside = false
		print("Player left the area")

func _input(event):
	# Check if player is inside and Enter key is pressed
	# IMPORTANTE: Solo permitir interacción si NO hay diálogo activo
	if player_inside and event.is_action_pressed("ui_accept") and not dialogue_active:
		# Only trigger if we haven't reached the final dialogue yet
		if dialogue_stage < 3:
			print("Enter pressed - triggering dialogue stage: ", dialogue_stage + 1)
			trigger_dialogue()
		else:
			print("All dialogues completed - no more dialogues available")
	elif player_inside and event.is_action_pressed("ui_accept") and dialogue_active:
		print("Dialogue is already active - ignoring input")

func trigger_dialogue():
	# Marcar que el diálogo está activo
	dialogue_active = true
	
	# Get the player node and disable movement
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		player.set_movement_enabled(false)
		print("Player movement disabled for dialogue")
	
	# Select which dialogue to show based on current stage
	var dialogue_to_show
	match dialogue_stage:
		0:
			dialogue_to_show = TALKINGTOCAT
			print("Showing first dialogue")
		1:
			dialogue_to_show = TALKINGTOCAT_II
			print("Showing second dialogue")
		2:
			dialogue_to_show = TALKINGTOCAT_III
			print("Showing third dialogue")
	
	# IMPORTANTE: Pasamos 'self' (el gato) como extra_game_state para que sus funciones sean accesibles
	var balloon = DialogueManager.show_dialogue_balloon(dialogue_to_show, "start", [self])
	print("Dialogue triggered")

func _on_dialogue_ended(dialogue_resource):
	# Marcar que el diálogo ya no está activo
	dialogue_active = false
	
	# Increment dialogue stage when current dialogue ends
	dialogue_stage += 1
	print("Dialogue ended. New stage: ", dialogue_stage)
	
	# Re-enable player movement when dialogue ends
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		player.set_movement_enabled(true)
		print("Player movement re-enabled after dialogue")

# Esta función se llama desde el diálogo mediante do play_cat_meow()
func play_cat_meow():
	if cat_sound:
		cat_sound.play()
		print("Cat meow sound played!")
