extends CharacterBody2D

class_name PartyMember

## PartyMember - Base para todos los personajes del party

# =============================================================================
# SIGNALS
# =============================================================================

signal hp_changed(new_hp: int, max_hp: int)
signal died
signal revived
signal ability_used(ability_name: String)

# =============================================================================
# EXPORTS - IDENTITY
# =============================================================================

@export_group("Identity")
@export var member_name := "Unknown"
@export var display_name := "Unknown"
@export var portrait_texture: Texture2D  ## Textura para el menú de Tag

# =============================================================================
# EXPORTS - SPECIAL ABILITY
# =============================================================================

@export_group("Special Ability")
@export var special_ability_name := ""  ## Nombre de la habilidad (ej: "SMASH")
@export var special_ability_description := ""  ## Descripción de la habilidad
@export var has_ability := false  ## Si tiene habilidad especial

# =============================================================================
# EXPORTS - STATS
# =============================================================================

@export_group("Stats")
@export var max_hp := 100
@export var hp := 100
@export var attack := 10
@export var defense := 5

# =============================================================================
# EXPORTS - MOVEMENT
# =============================================================================

@export_group("Movement")
@export var speed := 90.0
@export var acceleration := 12.0
@export var friction := 15.0

# =============================================================================
# EXPORTS - SLEEP
# =============================================================================

@export_group("Sleep")
@export var can_sleep := true
@export var sleep_time := 59.0

# =============================================================================
# NODES
# =============================================================================

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var emotions: AnimatedSprite2D = $Emotions

# =============================================================================
# STATE
# =============================================================================

var direction := "down"
var moving := false
var movement_enabled := true
var is_leader := false
var in_party := false

# Sleep state
var is_sleeping := false
var is_waking_up := false
var _idle_timer := 0.0

# =============================================================================
# READY
# =============================================================================

func _ready() -> void:
	_target_pos = global_position
	
	if emotions:
		emotions.visible = false
	
	if member_name == "Unknown":
		member_name = name

# =============================================================================
# PHYSICS
# =============================================================================

var _target_pos := Vector2.ZERO

func _physics_process(delta: float) -> void:
	if is_leader:
		_process_leader(delta)
	# Los seguidores son actualizados por PartyManager

# =============================================================================
# LEADER MOVEMENT
# =============================================================================

func _process_leader(delta: float) -> void:
	if not movement_enabled:
		return
	
	# Despertar si está durmiendo y hay input
	if is_sleeping and _has_input():
		_wake_up()
		return
	
	if is_waking_up:
		return
	
	# Obtener input
	var input := _get_input()
	moving = input != Vector2.ZERO
	
	# Aplicar velocidad con aceleración/fricción
	if moving:
		velocity = velocity.lerp(input * speed, 1.0 - exp(-acceleration * delta))
		direction = _get_direction(input)
	else:
		velocity = velocity.lerp(Vector2.ZERO, 1.0 - exp(-friction * delta))
		# Detener completamente si la velocidad es muy baja
		if velocity.length() < 1.0:
			velocity = Vector2.ZERO
	
	# Animación
	if not is_sleeping:
		_update_animation()
	
	move_and_slide()
	
	# Sistema de sueño (solo si está solo)
	_handle_sleep(delta)


func _get_input() -> Vector2:
	var input := Vector2.ZERO
	if Input.is_action_pressed("ui_left"): input.x -= 1
	if Input.is_action_pressed("ui_right"): input.x += 1
	if Input.is_action_pressed("ui_up"): input.y -= 1
	if Input.is_action_pressed("ui_down"): input.y += 1
	return input.normalized()


func _has_input() -> bool:
	return _get_input() != Vector2.ZERO


func _get_direction(input: Vector2) -> String:
	if abs(input.x) > abs(input.y):
		return "right" if input.x > 0 else "left"
	return "down" if input.y > 0 else "up"

# =============================================================================
# FOLLOWER METHODS (Called by PartyManager)
# =============================================================================

func _set_direction_from_movement(move_dir: Vector2) -> void:
	## Establece la dirección basada en el vector de movimiento
	if move_dir.length() < 0.1:
		return
	
	if abs(move_dir.x) > abs(move_dir.y):
		direction = "right" if move_dir.x > 0 else "left"
	else:
		direction = "down" if move_dir.y > 0 else "up"


func _set_moving(is_moving: bool) -> void:
	## Establece si el seguidor está en movimiento
	moving = is_moving
	_update_animation()


func _match_direction(dir: String) -> void:
	## Hace que el seguidor mire en la misma dirección
	if dir in ["up", "down", "left", "right"]:
		direction = dir
		if not moving:
			_play_idle()

# =============================================================================
# ANIMATION
# =============================================================================

func _update_animation() -> void:
	if moving:
		_play_walk()
	else:
		_play_idle()


func _play_walk() -> void:
	if sprite and sprite.sprite_frames:
		if sprite.sprite_frames.has_animation(direction):
			if sprite.animation != direction:
				sprite.play(direction)


func _play_idle() -> void:
	if sprite and sprite.sprite_frames:
		var anim := "idle_" + direction
		if sprite.sprite_frames.has_animation(anim):
			if sprite.animation != anim:
				sprite.play(anim)


func play_animation(anim: String) -> void:
	if sprite and sprite.sprite_frames.has_animation(anim):
		sprite.play(anim)


func get_animation() -> String:
	return sprite.animation if sprite else ""

# =============================================================================
# ROLE MANAGEMENT
# =============================================================================

func _join_party() -> void:
	in_party = true
	visible = true


func _leave_party() -> void:
	in_party = false
	is_leader = false
	_play_idle()


func _set_leader_mode() -> void:
	is_leader = true
	is_sleeping = false
	is_waking_up = false
	_idle_timer = 0.0


func _set_follower_mode() -> void:
	is_leader = false
	is_sleeping = false
	is_waking_up = false
	_idle_timer = 0.0
	moving = false
	if emotions:
		emotions.visible = false

# =============================================================================
# SLEEP SYSTEM
# =============================================================================

func _handle_sleep(delta: float) -> void:
	if not can_sleep or PartyManager.get_party_size() > 1:
		_idle_timer = 0.0
		return
	
	if not moving and direction == "down" and not is_sleeping:
		_idle_timer += delta
		if _idle_timer >= sleep_time:
			_start_sleep()
	else:
		_idle_timer = 0.0


func _start_sleep() -> void:
	is_sleeping = true
	if sprite and sprite.sprite_frames.has_animation("sleepy"):
		sprite.play("sleepy")
		sprite.animation_finished.connect(_on_sleepy_done, CONNECT_ONE_SHOT)
	else:
		_on_sleepy_done()


func _on_sleepy_done() -> void:
	if sprite and sprite.sprite_frames.has_animation("idle_sleep"):
		sprite.play("idle_sleep")
	if emotions and emotions.sprite_frames.has_animation("sleep_bubble"):
		emotions.visible = true
		emotions.play("sleep_bubble")


func _wake_up() -> void:
	if not is_sleeping:
		return
	
	is_sleeping = false
	is_waking_up = true
	_idle_timer = 0.0
	
	if emotions:
		emotions.visible = false
		emotions.stop()
	
	if sprite and sprite.sprite_frames.has_animation("wake_up"):
		sprite.play("wake_up")
		sprite.animation_finished.connect(_on_wake_done, CONNECT_ONE_SHOT)
	else:
		_on_wake_done()


func _on_wake_done() -> void:
	is_waking_up = false
	direction = "down"
	_play_idle()

# =============================================================================
# EMOTIONS
# =============================================================================

func show_emotion(emotion_name: String) -> void:
	if emotions and emotions.sprite_frames.has_animation(emotion_name):
		emotions.visible = true
		emotions.play(emotion_name)


func hide_emotion() -> void:
	if emotions:
		emotions.visible = false
		emotions.stop()

# =============================================================================
# SPECIAL ABILITIES
# =============================================================================

func has_special_ability() -> bool:
	return has_ability and special_ability_name != ""


func use_special_ability() -> bool:
	## Override en clases hijas para implementar la habilidad
	if not has_special_ability():
		return false
	
	ability_used.emit(special_ability_name)
	_on_ability_used()
	return true


func _on_ability_used() -> void:
	## Override en clases hijas para la lógica específica de la habilidad
	pass


func get_ability_info() -> Dictionary:
	return {
		"name": special_ability_name,
		"description": special_ability_description,
		"available": has_special_ability()
	}

# =============================================================================
# STATS
# =============================================================================

func take_damage(amount: int) -> void:
	var actual := maxi(amount - defense, 1)
	hp = maxi(hp - actual, 0)
	hp_changed.emit(hp, max_hp)
	if hp <= 0:
		died.emit()


func heal(amount: int) -> void:
	hp = mini(hp + amount, max_hp)
	hp_changed.emit(hp, max_hp)


func full_heal() -> void:
	hp = max_hp
	hp_changed.emit(hp, max_hp)


func is_alive() -> bool:
	return hp > 0


func revive(hp_amount: int = 1) -> void:
	if not is_alive():
		hp = mini(hp_amount, max_hp)
		hp_changed.emit(hp, max_hp)
		revived.emit()

# =============================================================================
# UTILITY
# =============================================================================

func set_direction(dir: String) -> void:
	if dir in ["up", "down", "left", "right"]:
		direction = dir
		_play_idle()


func teleport(pos: Vector2) -> void:
	global_position = pos
	_target_pos = pos
