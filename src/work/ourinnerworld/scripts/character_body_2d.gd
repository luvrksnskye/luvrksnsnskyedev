extends CharacterBody2D

@export var speed = 90.0
@onready var animated_sprite = $AnimatedSprite2D
@onready var emotions_sprite = $Emotions  # AnimatedSprite2D para las emociones

var last_direction = "down"  # Dirección por defecto para idle
var idle_timer = 0.0  # Timer para controlar el tiempo de inactividad
var is_sleeping = false  # Estado de sueño del personaje
var is_waking_up = false  # Estado de despertar
var movement_enabled = true  # Control de movimiento para diálogos

const SLEEP_TIME = 59.0  # Tiempo en segundos antes de dormir

func _ready():
	add_to_group("Player")
	emotions_sprite.visible = false
	print("Player ready, movement_enabled: ", movement_enabled)

func set_movement_enabled(enabled: bool):
	print("set_movement_enabled called with: ", enabled)
	movement_enabled = enabled
	if not enabled:
		velocity = Vector2.ZERO
		print("Movement disabled, velocity set to zero")
		if not is_sleeping and not is_waking_up:
			animated_sprite.play("idle_" + last_direction)
			print("Changed to idle animation: idle_", last_direction)
	else:
		print("Movement enabled")

func show_emotion(emotion_name: String):
	emotions_sprite.visible = true
	if emotions_sprite.sprite_frames.has_animation(emotion_name):
		emotions_sprite.play(emotion_name)
		print("Showing emotion: ", emotion_name)
	else:
		print("Warning: Emotion animation '", emotion_name, "' not found")
		if emotions_sprite.sprite_frames.has_animation("question"):
			emotions_sprite.play("question")
		elif emotions_sprite.sprite_frames.has_animation("default"):
			emotions_sprite.play("default")

func hide_emotion():
	emotions_sprite.visible = false
	emotions_sprite.stop()

@warning_ignore("unused_parameter")
func _physics_process(delta):
	if not movement_enabled:
		return
	
	var input_dir = Vector2()
	var has_input = false
	
	if Input.is_action_pressed("ui_left"):
		input_dir.x -= 1
		has_input = true
	if Input.is_action_pressed("ui_right"):
		input_dir.x += 1
		has_input = true
	if Input.is_action_pressed("ui_up"):
		input_dir.y -= 1
		has_input = true
	if Input.is_action_pressed("ui_down"):
		input_dir.y += 1
		has_input = true
	
	if has_input and is_sleeping:
		wake_up()
		return
	
	if is_waking_up:
		return
	
	input_dir = input_dir.normalized()
	velocity = input_dir * speed
	
	if input_dir == Vector2.ZERO and last_direction == "down" and not is_sleeping:
		idle_timer += delta
		if idle_timer >= SLEEP_TIME:
			start_sleeping()
	else:
		idle_timer = 0.0
	
	if not is_sleeping:
		if input_dir != Vector2.ZERO:
			if abs(input_dir.x) > abs(input_dir.y):
				if input_dir.x > 0:
					animated_sprite.play("right")
					last_direction = "right"
				else:
					animated_sprite.play("left")
					last_direction = "left"
			else:
				if input_dir.y > 0:
					animated_sprite.play("down")
					last_direction = "down"
				else:
					animated_sprite.play("up")
					last_direction = "up"
		else:
			animated_sprite.play("idle_" + last_direction)
	
	move_and_slide()

func start_sleeping():
	is_sleeping = true
	animated_sprite.play("sleepy")
	if not animated_sprite.animation_finished.is_connected(_on_sleepy_animation_finished):
		animated_sprite.animation_finished.connect(_on_sleepy_animation_finished)

func _on_sleepy_animation_finished():
	if animated_sprite.animation == "sleepy":
		animated_sprite.play("idle_sleep")
		emotions_sprite.visible = true
		emotions_sprite.play("sleep_bubble")

func wake_up():
	if not is_sleeping:
		return
	
	is_sleeping = false
	is_waking_up = true
	idle_timer = 0.0
	
	emotions_sprite.visible = false
	emotions_sprite.stop()
	
	animated_sprite.play("wake_up")
	
	if not animated_sprite.animation_finished.is_connected(_on_wake_up_animation_finished):
		animated_sprite.animation_finished.connect(_on_wake_up_animation_finished)

func _on_wake_up_animation_finished():
	if animated_sprite.animation == "wake_up":
		is_waking_up = false
		last_direction = "down"
		animated_sprite.play("idle_down")

# ============================================================
# 👇 AÑADE ESTAS DOS FUNCIONES (necesarias para la cinemática)
# ============================================================

func play_animation(anim_name: String) -> void:
	# Reproduce una animación directamente en el AnimatedSprite2D
	if animated_sprite and animated_sprite.sprite_frames.has_animation(anim_name):
		animated_sprite.play(anim_name)
	else:
		print("⚠️ No existe animación '%s' en AnimatedSprite2D" % anim_name)

func get_current_animation() -> String:
	if animated_sprite:
		return animated_sprite.animation
	return ""
