extends Area2D

const READINGNEWSLETTER = preload("res://Player/dialogues/cat.dialogue")

# Track if player is inside the area
var player_inside = false
# Track if dialogue has been triggered to avoid repetition (only once ever)
var dialogue_triggered = false

func _ready():
	# Connect the area signals
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)

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
	# Check if player is inside, Enter key is pressed, and dialogue hasn't been triggered yet
	if player_inside and event.is_action_pressed("ui_accept") and not dialogue_triggered:
		print("Enter pressed while inside area - triggering dialogue")
		trigger_dialogue()
	elif player_inside and event.is_action_pressed("ui_accept") and dialogue_triggered:
		print("Dialogue already seen - ignoring Enter key")

func trigger_dialogue():
	# Mark dialogue as triggered (only once ever)
	dialogue_triggered = true
	
	# Get the player node and disable movement
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		player.set_movement_enabled(false)
		print("Player movement disabled for dialogue")
	
	# Connect to DialogueManager's dialogue_ended signal
	if not DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_dialogue_ended)
	
	# Show the dialogue balloon
	DialogueManager.show_dialogue_balloon(READINGNEWSLETTER, "start")
	print("Dialogue triggered")

func _on_dialogue_ended(dialogue_resource):
	# Re-enable player movement when dialogue ends
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		player.set_movement_enabled(true)
		print("Player movement re-enabled after dialogue")
	
	# Disconnect the signal to avoid multiple connections
	if DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_dialogue_ended)
