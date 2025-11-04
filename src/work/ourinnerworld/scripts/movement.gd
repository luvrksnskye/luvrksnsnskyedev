extends Node

func _ready():
	# Esperar un frame para asegurar que el player esté listo
	await get_tree().process_frame
	
	# Buscar el player
	var player = get_tree().get_first_node_in_group("Player")
	if player:
		print("Limitador horizontal activado para el jugador")
		# Conectar al proceso del player
		player.set_physics_process(false)
		set_physics_process(true)
	else:
		print("Warning: No se encontró el jugador en el grupo 'Player'")

func _physics_process(delta):
	var player = get_tree().get_first_node_in_group("Player")
	if not player or not player.movement_enabled:
		return
	
	# Solo permitir input horizontal
	var input_x = 0.0
	if Input.is_action_pressed("ui_left"):
		input_x -= 1
	if Input.is_action_pressed("ui_right"):
		input_x += 1
	
	# Aplicar velocidad solo en X
	player.velocity.x = input_x * player.speed
	player.velocity.y = 0
	
	# Manejar animaciones
	if input_x != 0:
		if input_x > 0:
			player.animated_sprite.play("right")
			player.last_direction = "right"
		else:
			player.animated_sprite.play("left")
			player.last_direction = "left"
	else:
		player.animated_sprite.play("idle_" + player.last_direction)
	
	# Mover el personaje
	player.move_and_slide()
