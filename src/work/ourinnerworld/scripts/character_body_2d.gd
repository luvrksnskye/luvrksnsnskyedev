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
	"""Inicializar el sprite de emociones y añadir a grupo Player"""
	add_to_group("Player")  # Añadir el player al grupo "Player"
	emotions_sprite.visible = false  # Ocultar por defecto
	print("Player ready, movement_enabled: ", movement_enabled)

func set_movement_enabled(enabled: bool):
	"""Función para habilitar/deshabilitar el movimiento del jugador"""
	print("set_movement_enabled called with: ", enabled)
	movement_enabled = enabled
	if not enabled:
		# Detener movimiento inmediatamente
		velocity = Vector2.ZERO
		print("Movement disabled, velocity set to zero")
		# Si está en movimiento, cambiar a idle
		if not is_sleeping and not is_waking_up:
			animated_sprite.play("idle_" + last_direction)
			print("Changed to idle animation: idle_", last_direction)
	else:
		print("Movement enabled")

func show_emotion(emotion_name: String):
	"""Mostrar una emoción encima de la cabeza del jugador"""
	emotions_sprite.visible = true
	if emotions_sprite.sprite_frames.has_animation(emotion_name):
		emotions_sprite.play(emotion_name)
		print("Showing emotion: ", emotion_name)
	else:
		print("Warning: Emotion animation '", emotion_name, "' not found")
		# Try some common fallbacks
		if emotions_sprite.sprite_frames.has_animation("question"):
			emotions_sprite.play("question")
		elif emotions_sprite.sprite_frames.has_animation("default"):
			emotions_sprite.play("default")

func hide_emotion():
	"""Ocultar la emoción del jugador"""
	emotions_sprite.visible = false
	emotions_sprite.stop()

@warning_ignore("unused_parameter")
func _physics_process(delta):
	# Si el movimiento está deshabilitado (durante diálogos), no procesar input
	if not movement_enabled:
		# Add debug print to see if this is being called
		# print("Movement disabled, skipping input processing")
		return
	
	# Obtener input del jugador
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
	
	# Detectar cualquier tecla presionada para despertar
	if has_input and is_sleeping:
		wake_up()
		return
	
	# Si está despertando, no procesar movimiento hasta que termine la animación
	if is_waking_up:
		return
	
	# Normalizar el vector para movimiento diagonal consistente
	input_dir = input_dir.normalized()
	
	# Aplicar velocidad
	velocity = input_dir * speed
	
	# Manejar sistema de sueño
	if input_dir == Vector2.ZERO and last_direction == "down" and not is_sleeping:
		idle_timer += delta
		if idle_timer >= SLEEP_TIME:
			start_sleeping()
	else:
		idle_timer = 0.0
	
	# Manejar animaciones solo si no está durmiendo
	if not is_sleeping:
		if input_dir != Vector2.ZERO:
			# Determinar qué animación reproducir basado en la dirección
			if abs(input_dir.x) > abs(input_dir.y):
				# Movimiento horizontal predominante
				if input_dir.x > 0:
					animated_sprite.play("right")
					last_direction = "right"
				else:
					animated_sprite.play("left")
					last_direction = "left"
			else:
				# Movimiento vertical predominante
				if input_dir.y > 0:
					animated_sprite.play("down")
					last_direction = "down"
				else:
					animated_sprite.play("up")
					last_direction = "up"
		else:
			# Reproducir animación idle basada en la última dirección
			animated_sprite.play("idle_" + last_direction)
	
	# Mover el personaje
	move_and_slide()
	
func start_sleeping():
	"""Inicia el proceso de dormir del personaje"""
	is_sleeping = true
	animated_sprite.play("sleepy")
	# Conectar señal para saber cuando termina la animación sleepy
	if not animated_sprite.animation_finished.is_connected(_on_sleepy_animation_finished):
		animated_sprite.animation_finished.connect(_on_sleepy_animation_finished)

func _on_sleepy_animation_finished():
	"""Se ejecuta cuando termina la animación sleepy"""
	if animated_sprite.animation == "sleepy":
		animated_sprite.play("idle_sleep")
		# Mostrar y reproducir la burbuja de sueño
		emotions_sprite.visible = true
		emotions_sprite.play("sleep_bubble")

func wake_up():
	"""Inicia el proceso de despertar del personaje"""
	if not is_sleeping:
		return
	
	is_sleeping = false
	is_waking_up = true
	idle_timer = 0.0
	
	# Ocultar la burbuja de sueño
	emotions_sprite.visible = false
	emotions_sprite.stop()
	
	animated_sprite.play("wake_up")
	
	# Conectar señal para saber cuando termina la animación wake_up
	if not animated_sprite.animation_finished.is_connected(_on_wake_up_animation_finished):
		animated_sprite.animation_finished.connect(_on_wake_up_animation_finished)

func _on_wake_up_animation_finished():
	"""Se ejecuta cuando termina la animación wake_up"""
	if animated_sprite.animation == "wake_up":
		is_waking_up = false
		last_direction = "down"
		animated_sprite.play("idle_down")
