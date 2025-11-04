extends Area2D

@onready var player = get_node("/root/HerStory/Player")
@onready var camera = get_node("/root/HerStory/Camera2D")
@onready var anim_player = get_node("/root/HerStory/AnimationPlayer")
@onready var her_sprite = $CollisionShape2D/AnimatedSprite2D
@onready var background_sprite = get_node_or_null("/root/HerStory/ParallaxBackground/ParallaxLayer/Sprite2D")
@onready var snow_particles = get_node("/root/HerStory/SnowParticles")

var dialogue_started := false
var is_in_cinematic := false

const FIRST_DIALOGUE_PATH := "res://assets/dialogues/peaceafterall.dialogue"
const SECOND_DIALOGUE_PATH := "res://assets/dialogues/conversation.dialogue"

func _ready() -> void:
	body_entered.connect(_on_body_entered)

	if snow_particles:
		snow_particles.visible = false
		snow_particles.emitting = false

	# Asegura que el fondo empiece a color normal
	if background_sprite and background_sprite.material:
		background_sprite.material.set_shader_parameter("grayscale_amount", 0.0)

func _on_body_entered(body: Node) -> void:
	if body.is_in_group("Player") and not dialogue_started:
		dialogue_started = true
		start_cinematic()

func start_cinematic() -> void:
	is_in_cinematic = true
	player.set_movement_enabled(false)

	var first_res: Resource = load(FIRST_DIALOGUE_PATH)
	if first_res == null:
		push_error("ERROR: Could not load first dialogue at %s" % FIRST_DIALOGUE_PATH)
		end_cinematic_failsafe()
		return

	if not DialogueManager.dialogue_ended.is_connected(_on_first_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_first_dialogue_ended)

	DialogueManager.show_example_dialogue_balloon(first_res, "start")

func _on_first_dialogue_ended(resource: Resource) -> void:
	if DialogueManager.dialogue_ended.is_connected(_on_first_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_first_dialogue_ended)

	start_sit_up_then_camera_up()

func start_sit_up_then_camera_up() -> void:
	await get_tree().create_timer(0.2).timeout

	if player.has_node("AnimatedSprite2D"):
		var sprite := player.get_node("AnimatedSprite2D")
		if sprite and sprite.sprite_frames.has_animation("sit_up"):
			sprite.play("sit_up")
			await sprite.animation_finished
		else:
			await get_tree().create_timer(1.0).timeout
	else:
		await get_tree().create_timer(0.6).timeout

	if anim_player and anim_player.has_animation("camera_up"):
		anim_player.play("camera_up")
		await anim_player.animation_finished

	start_second_dialogue()

func start_second_dialogue() -> void:
	var second_res: Resource = load(SECOND_DIALOGUE_PATH)
	if second_res == null:
		push_error("ERROR: Could not load second dialogue at %s" % SECOND_DIALOGUE_PATH)
		end_cinematic_failsafe()
		return

	if not DialogueManager.dialogue_ended.is_connected(_on_second_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_second_dialogue_ended)

	DialogueManager.show_example_dialogue_balloon(second_res, "start")

func _on_second_dialogue_ended(resource: Resource) -> void:
	if DialogueManager.dialogue_ended.is_connected(_on_second_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_second_dialogue_ended)

	start_final_sequence()

# === SECUENCIA FINAL ===
func start_final_sequence() -> void:
	print("Starting final cinematic: camera_down -> fade -> grayscale -> snow")

	# 1️⃣ Bajar la cámara primero
	if anim_player and anim_player.has_animation("camera_down"):
		anim_player.play("camera_down")
		await anim_player.animation_finished
	else:
		await get_tree().create_timer(0.6).timeout

	# 2️⃣ Luego activar todos los efectos visuales juntos
	var tween = create_tween()
	tween.set_parallel(true)

	# Desvanecer sprite de Her
	if her_sprite:
		tween.tween_property(her_sprite, "modulate:a", 0.0, 2.5).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

	# Escala de grises en el fondo (fade-in suave)
	if background_sprite and background_sprite.material:
		tween.tween_property(background_sprite.material, "shader_parameter/grayscale_amount", 1.0, 3.0).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

	# Activar nieve
	if snow_particles:
		snow_particles.visible = true
		snow_particles.emitting = true

	await tween.finished
	finalize_cinematic()

func finalize_cinematic() -> void:
	is_in_cinematic = false
	if player.has_method("set_movement_enabled"):
		player.set_movement_enabled(true)

	if player.has_node("AnimatedSprite2D"):
		var sprite := player.get_node("AnimatedSprite2D")
		if sprite and sprite.sprite_frames.has_animation("idle_down"):
			sprite.play("idle_down")

	if "last_direction" in player:
		player.last_direction = "down"

	print("Cinematic complete")

func end_cinematic_failsafe() -> void:
	print("Failsafe: Ending cinematic due to errors")
	if DialogueManager.dialogue_ended.is_connected(_on_first_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_first_dialogue_ended)
	if DialogueManager.dialogue_ended.is_connected(_on_second_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_second_dialogue_ended)
	finalize_cinematic()
