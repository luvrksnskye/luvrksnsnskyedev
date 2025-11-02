extends Area2D

const TRAIN_DIALOGUE = preload("res://assets/dialogues/makomi&skye.dialogue")

var dialogue_triggered = false
@onready var dialogue_balloon = $"../Node2D/ExampleBalloon"
@onready var animation_player = $AnimationPlayer

func _ready():
	body_entered.connect(_on_body_entered)
	animation_player.animation_finished.connect(_on_animation_finished)
	
	if dialogue_balloon:
		dialogue_balloon.visible = false

func _on_body_entered(body):
	if body.is_in_group("Player") and not dialogue_triggered:
		trigger_cinematic()

func trigger_cinematic():
	dialogue_triggered = true
	
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		player.set_movement_enabled(false)
	
	# Primera animación: acercar la cámara a los personajes
	animation_player.play("camera_to_characters")

func _on_animation_finished(anim_name):
	if anim_name == "camera_to_characters":
		# Después de llegar a los personajes, regresamos al jugador
		animation_player.play("camera_to_player")
	
	elif anim_name == "camera_to_player":
		# Cuando vuelve al jugador, inicia el diálogo
		start_dialogue()

func start_dialogue():
	if not DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_dialogue_ended)
	
	if dialogue_balloon:
		dialogue_balloon.visible = true
	
	DialogueManager.show_dialogue_balloon(TRAIN_DIALOGUE, "start", [])

func _on_dialogue_ended(dialogue_resource):
	if dialogue_balloon:
		dialogue_balloon.visible = false
	
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		player.set_movement_enabled(true)
	
	if DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_dialogue_ended)
