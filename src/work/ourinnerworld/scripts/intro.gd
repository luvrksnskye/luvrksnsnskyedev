extends Node2D

@onready var player = $Player
@onready var logo = $UI/Logo
@onready var anim_player = $CinematicAnimationPlayer

func _ready():
	print("=== CINEMATICA INICIADA ===")
	
	# ESTABLECER POSICIÓN INICIAL DEL JUGADOR
	if player:
		player.position = Vector2(313, 63)
		print("Posición del jugador establecida en: ", player.position)
	
	# Desactivar movimiento del jugador
	if player and player.has_method("set_movement_enabled"):
		player.set_movement_enabled(false)
	
	# Asegurarse que el logo esté visible al inicio
	if logo:
		logo.visible = true
		logo.modulate.a = 1.0
		if logo.has_node("AnimationPlayer"):
			logo.get_node("AnimationPlayer").stop()
	
	# Conectar señal del AnimationPlayer
	if anim_player:
		if not anim_player.is_connected("animation_finished", Callable(self, "_on_animation_finished")):
			anim_player.animation_finished.connect(_on_animation_finished)
		
		if anim_player.has_animation("intro_cinematic"):
			anim_player.play("intro_cinematic")
		else:
			push_error("No se encontró animación 'intro_cinematic'")
			_on_cinematic_finished()
	else:
		push_error("No se encontró AnimationPlayer")
		_on_cinematic_finished()

# Se ejecuta cuando cualquier animación termina
func _on_animation_finished(anim_name: String):
	if anim_name == "intro_cinematic":
		_on_cinematic_finished()

# Se llama cuando la cinemática termina
func _on_cinematic_finished():
	print("=== CINEMATICA TERMINADA ===")
	
	# Ocultar logo
	if logo:
		logo.visible = false
		logo.modulate.a = 1.0
	
	# Reactivar movimiento del jugador
	if player and player.has_method("set_movement_enabled"):
		player.set_movement_enabled(true)
		print("Movimiento del jugador reactivado")
