extends CharacterBody2D

# ============================================================================
# NODES
# ============================================================================
@onready var animations = $animations

# ============================================================================
# EXPORTS
# ============================================================================
@export var float_speed = 15.0
@export var wander_change_time = 3.5
@export var drift_amplitude = 8.0
@export var vertical_float_strength = 0.3
@export var personal_space_radius = 30.0

# ============================================================================
# STATIC VARIABLES
# ============================================================================
static var all_fireflies: Array = []
static var firefly_count: int = 0
const MAX_FIREFLIES = 150

# ============================================================================
# VARIABLES
# ============================================================================
var target_direction = Vector2.ZERO
var wander_timer = 0.0
var drift_timer = 0.0
var base_position = Vector2.ZERO
var vertical_offset = 0.0
var horizontal_drift = 0.0

# Movimiento orgánico
var sine_time = 0.0
var cosine_time = 0.0
var perlin_offset = Vector2.ZERO

# ============================================================================
# LIFECYCLE
# ============================================================================
func _ready():
	if firefly_count >= MAX_FIREFLIES:
		queue_free()
		return
	
	randomize()
	base_position = global_position
	sine_time = randf() * TAU
	cosine_time = randf() * TAU
	perlin_offset = Vector2(randf() * 100, randf() * 100)
	
	_set_smooth_direction()
	animations.play("fly")
	
	all_fireflies.append(self)
	firefly_count += 1

func _exit_tree():
	all_fireflies.erase(self)
	firefly_count -= 1

func _physics_process(delta):
	_process_gentle_floating(delta)
	_add_organic_movement(delta)
	_avoid_other_fireflies()
	
	move_and_slide()

# ============================================================================
# MOVEMENT PROCESSING
# ============================================================================
func _process_gentle_floating(delta):
	# Cambiar dirección suavemente cada cierto tiempo
	wander_timer += delta
	if wander_timer >= wander_change_time:
		_set_smooth_direction()
		wander_timer = 0.0
	
	# Movimiento base muy suave
	var base_velocity = target_direction * float_speed
	
	# Deriva vertical (flotación)
	sine_time += delta * 0.8
	vertical_offset = sin(sine_time) * drift_amplitude * vertical_float_strength
	
	# Deriva horizontal suave
	cosine_time += delta * 0.6
	horizontal_drift = cos(cosine_time) * drift_amplitude * 0.4
	
	# Combinar movimientos
	var drift = Vector2(horizontal_drift, vertical_offset)
	velocity = base_velocity + drift

func _add_organic_movement(delta):
	# Movimiento de tipo perlin suave para hacerlas más naturales
	drift_timer += delta
	
	var perlin_x = sin(drift_timer * 0.5 + perlin_offset.x) * 3.0
	var perlin_y = cos(drift_timer * 0.7 + perlin_offset.y) * 3.0
	
	velocity += Vector2(perlin_x, perlin_y)
	
	# Limitar velocidad máxima para mantener movimiento suave
	var max_speed = float_speed * 1.5
	if velocity.length() > max_speed:
		velocity = velocity.normalized() * max_speed

# ============================================================================
# UTILITIES
# ============================================================================
func _set_smooth_direction():
	# Dirección aleatoria pero con preferencia hacia el movimiento horizontal
	var angle = randf() * TAU
	var horizontal_bias = 0.7
	
	var base_dir = Vector2(cos(angle), sin(angle) * (1.0 - horizontal_bias))
	target_direction = base_dir.normalized()
	
	# Interpolar suavemente desde la dirección actual
	if velocity.length() > 0:
		target_direction = velocity.normalized().lerp(target_direction, 0.3)

func _avoid_other_fireflies():
	# Evitar otras luciérnagas de forma muy suave
	var avoidance = Vector2.ZERO
	var nearby_count = 0
	
	for other in all_fireflies:
		if other == self or not is_instance_valid(other):
			continue
		
		var distance = global_position.distance_to(other.global_position)
		
		if distance < personal_space_radius and distance > 0:
			nearby_count += 1
			var push_direction = (global_position - other.global_position).normalized()
			var push_strength = (1.0 - distance / personal_space_radius)
			avoidance += push_direction * push_strength
	
	# Aplicar evitación de forma muy suave
	if nearby_count > 0:
		avoidance = avoidance.normalized() * float_speed * 0.15
		velocity += avoidance
