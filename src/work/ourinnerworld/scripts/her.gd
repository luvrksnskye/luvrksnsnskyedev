extends Area2D

# Node references
@onready var player = get_node("/root/HerStory/Player")
@onready var camera = get_node("/root/HerStory/Camera2D")
@onready var anim_player = get_node("/root/HerStory/AnimationPlayer")
@onready var her_sprite = $CollisionShape2D/AnimatedSprite2D
@onready var background_sprite = get_node_or_null("/root/HerStory/ParallaxBackground/ParallaxLayer/Sprite2D")
@onready var snow_particles = get_node("/root/HerStory/SnowParticles")

# State variables
var dialogue_started := false
var is_in_cinematic := false

# Constants
const FIRST_DIALOGUE_PATH := "res://assets/dialogues/peaceafterall.dialogue"
const SECOND_DIALOGUE_PATH := "res://assets/dialogues/conversation.dialogue"


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	_initialize_effects()


func _initialize_effects() -> void:
	"""Initialize visual effects to default state"""
	if snow_particles:
		snow_particles.visible = false
		snow_particles.emitting = false
	
	if background_sprite and background_sprite.material:
		background_sprite.material.set_shader_parameter("grayscale_amount", 0.0)


# ========== TRIGGER ==========
func _on_body_entered(body: Node) -> void:
	if body.is_in_group("Player") and not dialogue_started:
		dialogue_started = true
		start_cinematic()


# ========== CINEMATIC FLOW ==========
func start_cinematic() -> void:
	is_in_cinematic = true
	player.set_movement_enabled(false)
	_load_and_show_dialogue(FIRST_DIALOGUE_PATH, _on_first_dialogue_ended)


func _on_first_dialogue_ended(resource: Resource) -> void:
	_disconnect_dialogue_signal(_on_first_dialogue_ended)
	_play_sit_up_animation()


func _play_sit_up_animation() -> void:
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
	
	_play_camera_up_animation()


func _play_camera_up_animation() -> void:
	if anim_player and anim_player.has_animation("camera_up"):
		anim_player.play("camera_up")
		await anim_player.animation_finished
	
	_load_and_show_dialogue(SECOND_DIALOGUE_PATH, _on_second_dialogue_ended)


func _on_second_dialogue_ended(resource: Resource) -> void:
	_disconnect_dialogue_signal(_on_second_dialogue_ended)
	start_final_sequence()


# ========== FINAL SEQUENCE ==========
func start_final_sequence() -> void:
	print("Starting final cinematic: camera_down -> fade -> grayscale -> snow")
	
	# Step 1: Camera down
	if anim_player and anim_player.has_animation("camera_down"):
		anim_player.play("camera_down")
		await anim_player.animation_finished
	else:
		await get_tree().create_timer(0.6).timeout
	
	# Step 2: Immediate visual effects (no delay)
	_apply_final_effects()


func _apply_final_effects() -> void:
	"""Apply fade, grayscale, and snow effects simultaneously"""
	var tween = create_tween()
	tween.set_parallel(true)
	
	# Fade out Her sprite
	if her_sprite:
		tween.tween_property(her_sprite, "modulate:a", 0.0, 2.5) \
			.set_trans(Tween.TRANS_SINE) \
			.set_ease(Tween.EASE_IN_OUT)
	
	# Grayscale background
	if background_sprite and background_sprite.material:
		tween.tween_property(background_sprite.material, "shader_parameter/grayscale_amount", 1.0, 3.0) \
			.set_trans(Tween.TRANS_SINE) \
			.set_ease(Tween.EASE_IN_OUT)
	
	# Enable snow particles
	if snow_particles:
		snow_particles.visible = true
		snow_particles.emitting = true
	
	await tween.finished
	finalize_cinematic()


# ========== CLEANUP ==========
func finalize_cinematic() -> void:
	"""Restore player control and reset state"""
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
	"""Emergency cleanup in case of errors"""
	print("Failsafe: Ending cinematic due to errors")
	_disconnect_dialogue_signal(_on_first_dialogue_ended)
	_disconnect_dialogue_signal(_on_second_dialogue_ended)
	finalize_cinematic()


# ========== HELPER FUNCTIONS ==========
func _load_and_show_dialogue(path: String, callback: Callable) -> void:
	"""Load and display dialogue resource"""
	var dialogue_res: Resource = load(path)
	if dialogue_res == null:
		push_error("ERROR: Could not load dialogue at %s" % path)
		end_cinematic_failsafe()
		return
	
	if not DialogueManager.dialogue_ended.is_connected(callback):
		DialogueManager.dialogue_ended.connect(callback)
	
	DialogueManager.show_example_dialogue_balloon(dialogue_res, "start")


func _disconnect_dialogue_signal(callback: Callable) -> void:
	"""Safely disconnect dialogue signal"""
	if DialogueManager.dialogue_ended.is_connected(callback):
		DialogueManager.dialogue_ended.disconnect(callback)
