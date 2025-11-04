extends Area2D

@onready var player = get_node("/root/HerStory/Player")
@onready var camera = get_node("/root/HerStory/Camera2D")
@onready var anim_player = get_node("/root/HerStory/AnimationPlayer")

var dialogue_started := false
var is_in_cinematic := false

const FIRST_DIALOGUE_PATH := "res://assets/dialogues/peaceafterall.dialogue"
const SECOND_DIALOGUE_PATH := "res://assets/dialogues/conversation.dialogue"

func _ready() -> void:
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if body.is_in_group("Player") and not dialogue_started:
		print("Player entered Her area, starting cinematic")
		dialogue_started = true
		start_cinematic()

func start_cinematic() -> void:
	is_in_cinematic = true
	print("Starting cinematic - disabling player movement")
	player.set_movement_enabled(false)

	# 1) Iniciar el primer diálogo inmediatamente (sin animación previa de cámara)
	var first_res: Resource = load(FIRST_DIALOGUE_PATH)
	if first_res == null:
		push_error("ERROR: Could not load first dialogue at %s" % FIRST_DIALOGUE_PATH)
		end_cinematic_failsafe()
		return

	# Conectar para detectar fin del primer diálogo
	if not DialogueManager.dialogue_ended.is_connected(_on_first_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_first_dialogue_ended)

	print("Showing FIRST dialogue (peaceafterall) -> start")
	DialogueManager.show_example_dialogue_balloon(first_res, "start")

func _on_first_dialogue_ended(resource: Resource) -> void:
	# Asegura que solo reaccione una vez
	if DialogueManager.dialogue_ended.is_connected(_on_first_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_first_dialogue_ended)

	# 2) Animación del jugador: sit_up
	print("First dialogue ended. Starting sit_up sequence")
	start_sit_up_then_camera_up()

func start_sit_up_then_camera_up() -> void:
	await get_tree().create_timer(0.2).timeout

	print("Playing sit_up animation")
	if player.has_node("AnimatedSprite2D"):
		var sprite := player.get_node("AnimatedSprite2D")
		if sprite and sprite.sprite_frames and sprite.sprite_frames.has_animation("sit_up"):
			sprite.play("sit_up")
			await sprite.animation_finished
		else:
			print("WARNING: sit_up animation not found on AnimatedSprite2D, simulating delay")
			await get_tree().create_timer(1.0).timeout
	elif player.has_method("animated_sprite"): # fallback si usas propiedad
		# Tu código original: player.animated_sprite.play("sit_up")
		if player.animated_sprite and player.animated_sprite.sprite_frames and player.animated_sprite.sprite_frames.has_animation("sit_up"):
			player.animated_sprite.play("sit_up")
			await player.animated_sprite.animation_finished
		else:
			print("WARNING: sit_up animation not found on player.animated_sprite, simulating delay")
			await get_tree().create_timer(1.0).timeout
	else:
		print("WARNING: Player has no AnimatedSprite2D path known, skipping sit_up")
		await get_tree().create_timer(0.6).timeout

	# 3) Luego camera_up
	if anim_player and anim_player.has_animation("camera_up"):
		print("Playing camera_up animation")
		anim_player.play("camera_up")
		await anim_player.animation_finished
	else:
		print("WARNING: camera_up animation not found, skipping")
		await get_tree().create_timer(0.6).timeout

	# 4) Empezar el segundo diálogo
	start_second_dialogue()

func start_second_dialogue() -> void:
	var second_res: Resource = load(SECOND_DIALOGUE_PATH)
	if second_res == null:
		push_error("ERROR: Could not load second dialogue at %s" % SECOND_DIALOGUE_PATH)
		end_cinematic_failsafe()
		return

	if not DialogueManager.dialogue_ended.is_connected(_on_second_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_second_dialogue_ended)

	print("Showing SECOND dialogue (conversation) -> start")
	DialogueManager.show_example_dialogue_balloon(second_res, "start")

func _on_second_dialogue_ended(resource: Resource) -> void:
	if DialogueManager.dialogue_ended.is_connected(_on_second_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_second_dialogue_ended)

	# 5) camera_down y terminar cinemática
	print("Second dialogue ended. Returning camera and enabling movement")
	if anim_player and anim_player.has_animation("camera_down"):
		print("Playing camera_down animation")
		anim_player.play("camera_down")
		await anim_player.animation_finished
	else:
		print("WARNING: camera_down animation not found, skipping")
		await get_tree().create_timer(0.6).timeout

	finalize_cinematic()

func finalize_cinematic() -> void:
	is_in_cinematic = false

	# Asegurar estado del jugador
	if player.has_method("set_movement_enabled"):
		player.set_movement_enabled(true)

	# Poner una animación/estado por defecto
	if player.has_node("AnimatedSprite2D"):
		var sprite := player.get_node("AnimatedSprite2D")
		if sprite and sprite.sprite_frames and sprite.sprite_frames.has_animation("idle_down"):
			sprite.play("idle_down")
	if "last_direction" in player:
		player.last_direction = "down"

	print("Player movement enabled, cinematic complete")

func end_cinematic_failsafe() -> void:
	# Failsafe por si algo falla en recursos/animaciones
	print("Failsafe: Ending cinematic due to errors")
	if DialogueManager.dialogue_ended.is_connected(_on_first_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_first_dialogue_ended)
	if DialogueManager.dialogue_ended.is_connected(_on_second_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_second_dialogue_ended)

	finalize_cinematic()
