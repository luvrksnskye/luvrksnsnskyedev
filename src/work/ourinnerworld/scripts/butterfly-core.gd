extends CharacterBody2D

# ============================================================================
# NODES
# ============================================================================
@onready var animations: AnimatedSprite2D = $animations

# ============================================================================
# EXPORTS
# ============================================================================
@export var fly_speed: float = 40.0
@export var flee_speed: float = 120.0
@export var wander_change_time: float = 2.0
@export var personal_space_radius: float = 25.0

# ============================================================================
# PERSONALITY LEVELS
# ============================================================================
enum PersonalityType { VERY_SHY, SHY, NEUTRAL, BOLD, VERY_BOLD }

const PERSONALITY_CONFIG: Dictionary = {
	PersonalityType.VERY_SHY: {
		"detection_radius": 80.0,
		"safe_distance": 90.0,
		"approach_chance": 0.1,
		"rest_chance": 0.95,
		"flee_threshold": 30.0,
		"approach_speed": 0.4
	},
	PersonalityType.SHY: {
		"detection_radius": 65.0,
		"safe_distance": 75.0,
		"approach_chance": 0.3,
		"rest_chance": 0.85,
		"flee_threshold": 50.0,
		"approach_speed": 0.5
	},
	PersonalityType.NEUTRAL: {
		"detection_radius": 50.0,
		"safe_distance": 70.0,
		"approach_chance": 0.5,
		"rest_chance": 0.75,
		"flee_threshold": 70.0,
		"approach_speed": 0.6
	},
	PersonalityType.BOLD: {
		"detection_radius": 40.0,
		"safe_distance": 60.0,
		"approach_chance": 0.7,
		"rest_chance": 0.65,
		"flee_threshold": 90.0,
		"approach_speed": 0.75
	},
	PersonalityType.VERY_BOLD: {
		"detection_radius": 30.0,
		"safe_distance": 50.0,
		"approach_chance": 0.9,
		"rest_chance": 0.5,
		"flee_threshold": 110.0,
		"approach_speed": 0.9
	}
}

# ============================================================================
# STATE
# ============================================================================
enum State { WANDERING, FLEEING, APPROACHING, WAITING_FOR_REST, RESTING_ON_PLAYER }
var current_state: State = State.WANDERING

# ============================================================================
# STATIC VARIABLES
# ============================================================================
static var butterfly_resting_on_player: CharacterBody2D = null
static var all_butterflies: Array = []
static var butterfly_count: int = 0
const MAX_BUTTERFLIES: int = 190

# ============================================================================
# VARIABLES
# ============================================================================
var target_direction: Vector2 = Vector2.ZERO
var wander_timer: float = 0.0
var player: Node2D = null  # Puede ser Rainy o Hikiko
var is_distracted: bool = false
var distraction_timer: float = 0.0
var waiting_timer: float = 0.0

var personality_type: PersonalityType
var detection_radius: float
var safe_distance: float
var approach_chance: float
var rest_chance: float
var flee_threshold: float
var approach_speed: float

# Para saber en quién estamos descansando
var resting_on_character: String = ""  # "Rainy" o "Hikiko"

# ============================================================================
# LIFECYCLE
# ============================================================================
func _ready() -> void:
	if butterfly_count >= MAX_BUTTERFLIES:
		queue_free()
		return
	
	randomize()
	_assign_personality()
	_set_random_direction()
	animations.play("iddle_front")
	
	all_butterflies.append(self)
	butterfly_count += 1
	
	call_deferred("_find_player")


func _exit_tree() -> void:
	all_butterflies.erase(self)
	butterfly_count -= 1
	
	if butterfly_resting_on_player == self:
		butterfly_resting_on_player = null
		# Notificar al personaje que la mariposa se fue
		if is_instance_valid(player) and player.has_method("_on_butterfly_left"):
			player._on_butterfly_left()


func _physics_process(delta: float) -> void:
	if not player:
		_find_player()
		return
	
	match current_state:
		State.WANDERING:
			_process_wandering(delta)
		State.FLEEING:
			_process_fleeing(delta)
		State.APPROACHING:
			_process_approaching(delta)
		State.WAITING_FOR_REST:
			_process_waiting_for_rest(delta)
		State.RESTING_ON_PLAYER:
			_process_resting(delta)
	
	_avoid_other_butterflies()
	move_and_slide()

# ============================================================================
# PERSONALITY SYSTEM
# ============================================================================
func _assign_personality() -> void:
	var rand: float = randf()
	
	if rand < 0.15:
		personality_type = PersonalityType.VERY_SHY
	elif rand < 0.35:
		personality_type = PersonalityType.SHY
	elif rand < 0.65:
		personality_type = PersonalityType.NEUTRAL
	elif rand < 0.85:
		personality_type = PersonalityType.BOLD
	else:
		personality_type = PersonalityType.VERY_BOLD
	
	var config: Dictionary = PERSONALITY_CONFIG[personality_type]
	detection_radius = config.get("detection_radius", 50.0)
	safe_distance = config.get("safe_distance", 70.0)
	approach_chance = config.get("approach_chance", 0.5)
	rest_chance = config.get("rest_chance", 0.75)
	flee_threshold = config.get("flee_threshold", 70.0)
	approach_speed = config.get("approach_speed", 0.6)

# ============================================================================
# STATE PROCESSING
# ============================================================================
func _process_wandering(delta: float) -> void:
	var distance_to_player: float = global_position.distance_to(player.global_position)
	var player_velocity: float = player.velocity.length()
	
	if distance_to_player < detection_radius or (player_velocity > flee_threshold and distance_to_player < detection_radius * 1.3):
		_start_fleeing()
		return
	
	if player_velocity < 5:
		var can_rest: bool = _check_can_rest_on_player()
		
		if can_rest and distance_to_player < safe_distance * 0.8:
			if randf() < rest_chance:
				if butterfly_resting_on_player == null:
					_try_claim_resting_spot()
				else:
					_wait_for_resting_spot()
				return
		
		if distance_to_player < safe_distance and distance_to_player > detection_radius:
			distraction_timer += delta
			if distraction_timer > 2.0 and not is_distracted:
				is_distracted = randf() < approach_chance
				if is_distracted:
					current_state = State.APPROACHING
					return
	else:
		distraction_timer = 0.0
		is_distracted = false
	
	wander_timer += delta
	if wander_timer >= wander_change_time:
		_set_random_direction()
		wander_timer = 0.0
	
	velocity = target_direction * fly_speed
	_update_animation()


func _check_can_rest_on_player() -> bool:
	## Verifica si la mariposa puede descansar en el jugador actual
	## Rainy: debe estar en "idle_sleep"
	## Hikiko: debe estar en "idle_down" y ser líder por 50+ segundos
	
	if not is_instance_valid(player):
		return false
	
	# Verificar si es un PartyMember
	if player is PartyMember:
		var member: PartyMember = player as PartyMember
		
		# Solo funciona si es el líder
		if not member.is_leader:
			return false
		
		var player_anim: String = member.get_animation()
		
		# Rainy - debe estar durmiendo
		if member.member_name == "Rainy":
			return player_anim == "idle_sleep" or player_anim == "sleepy"
		
		# Hikiko - debe estar en idle_down y tener el flag de espera cumplido
		elif member.member_name == "Hikiko":
			if player_anim == "idle_down" and member.has_method("is_ready_for_butterfly"):
				return member.is_ready_for_butterfly()
	
	# Fallback para el player_controller antiguo
	if player.has_method("get_current_animation"):
		var anim: String = player.get_current_animation()
		return anim == "idle_sleep" or anim == "sleepy"
	
	return false


func _process_fleeing(delta: float) -> void:
	var distance_to_player: float = global_position.distance_to(player.global_position)
	
	var flee_direction: Vector2 = (global_position - player.global_position).normalized()
	velocity = flee_direction * flee_speed
	
	if distance_to_player > safe_distance * 1.5:
		current_state = State.WANDERING
		_set_random_direction()
		distraction_timer = 0.0
		is_distracted = false
	
	_update_animation()


func _process_approaching(delta: float) -> void:
	var distance_to_player: float = global_position.distance_to(player.global_position)
	var player_velocity: float = player.velocity.length()
	
	if player_velocity > flee_threshold * 0.5:
		_start_fleeing()
		return
	
	var approach_direction: Vector2 = (player.global_position - global_position).normalized()
	velocity = approach_direction * (fly_speed * approach_speed)
	
	if distance_to_player < detection_radius * 0.6:
		current_state = State.WANDERING
		is_distracted = false
		_set_random_direction()
	
	_update_animation()


func _process_waiting_for_rest(delta: float) -> void:
	var distance_to_player: float = global_position.distance_to(player.global_position)
	var player_velocity: float = player.velocity.length()
	
	if player_velocity > flee_threshold * 0.5 or not _check_can_rest_on_player():
		_start_fleeing()
		return
	
	if butterfly_resting_on_player == null:
		_try_claim_resting_spot()
		return
	
	waiting_timer += delta
	var orbit_angle: float = waiting_timer * 0.5
	var orbit_radius: float = safe_distance * 0.5
	var orbit_offset: Vector2 = Vector2(cos(orbit_angle), sin(orbit_angle)) * orbit_radius
	var target_pos: Vector2 = player.global_position + orbit_offset
	
	var dir: Vector2 = (target_pos - global_position).normalized()
	velocity = dir * (fly_speed * 0.5)
	
	if waiting_timer > 20.0:
		current_state = State.WANDERING
		waiting_timer = 0.0
		_set_random_direction()
	
	_update_animation()


func _process_resting(delta: float) -> void:
	# Posición encima de la cabeza del personaje
	global_position = player.global_position + Vector2(0, -20)
	velocity = Vector2.ZERO
	animations.play("iddle_front")
	
	# Verificar si debemos irnos
	if not _check_can_rest_on_player():
		_release_resting_spot()
		_start_fleeing()

# ============================================================================
# STATE TRANSITIONS
# ============================================================================
func _start_fleeing() -> void:
	current_state = State.FLEEING
	is_distracted = false
	distraction_timer = 0.0
	waiting_timer = 0.0


func _try_claim_resting_spot() -> void:
	if butterfly_resting_on_player == null:
		butterfly_resting_on_player = self
		current_state = State.RESTING_ON_PLAYER
		global_position = player.global_position + Vector2(0, -20)
		
		# Determinar en quién estamos descansando y notificar
		if player is PartyMember:
			var member: PartyMember = player as PartyMember
			resting_on_character = member.member_name
			
			# Notificar al personaje que una mariposa llegó
			if member.has_method("_on_butterfly_landed"):
				member._on_butterfly_landed()
	else:
		_wait_for_resting_spot()


func _wait_for_resting_spot() -> void:
	current_state = State.WAITING_FOR_REST
	waiting_timer = 0.0


func _release_resting_spot() -> void:
	if butterfly_resting_on_player == self:
		butterfly_resting_on_player = null
		
		# Notificar al personaje que la mariposa se fue
		if is_instance_valid(player) and player.has_method("_on_butterfly_left"):
			player._on_butterfly_left()
		
		resting_on_character = ""

# ============================================================================
# UTILITIES
# ============================================================================
func _find_player() -> void:
	## Busca al líder actual del party
	if PartyManager and PartyManager.leader:
		player = PartyManager.leader
		return
	
	# Fallback: buscar en el grupo Player
	var players: Array[Node] = get_tree().get_nodes_in_group("Player")
	if players.size() > 0:
		player = players[0]


func _set_random_direction() -> void:
	var angle: float = randf() * TAU
	target_direction = Vector2(cos(angle), sin(angle))


func _avoid_other_butterflies() -> void:
	if velocity.length() < 5:
		return
	
	var check_radius: float = personal_space_radius * 1.5
	var nearby_count: int = 0
	
	for other in all_butterflies:
		if other == self or not is_instance_valid(other):
			continue
		
		var distance: float = global_position.distance_to(other.global_position)
		
		if distance < check_radius:
			nearby_count += 1
			if nearby_count > 3:
				break
		
		if distance < personal_space_radius and distance > 0:
			var push_direction: Vector2 = (global_position - other.global_position).normalized()
			var push_strength: float = (1.0 - distance / personal_space_radius) * 0.3
			velocity += push_direction * fly_speed * push_strength


func _update_animation() -> void:
	if velocity.length() < 10:
		animations.play("iddle_front")
		return
	
	var dir: Vector2 = velocity.normalized()
	
	if abs(dir.x) > abs(dir.y):
		if dir.x > 0:
			animations.play("right")
		else:
			animations.play("left")
	else:
		if dir.y > 0:
			animations.play("front")
		else:
			animations.play("back")
