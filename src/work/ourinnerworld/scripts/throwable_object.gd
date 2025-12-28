extends RigidBody2D
class_name ThrowableObject

## Throwable object for Hikiko - Interactive version (no combat)
## Features: physics, varied sounds, and visual effects

# =============================================================================
# TYPES
# =============================================================================

enum ObjectType {
	TENNIS_BALL,
	BASKETBALL,
	BLACK_SMALL_BALL,
	BROWN_TENNIS_BALL,
	GREEN_TENNIS_BALL,
	FOOTBALL,
	BEACH_BALL,
	GOLF_BALL,
	SNOWBALL,
	SOCCER_BALL,
	VOLLEYBALL,
	BOWLING_BALL
}

# =============================================================================
# CONSTANTS
# =============================================================================

const OBJECT_DATA: Dictionary = {
	ObjectType.TENNIS_BALL: {
		"name": "Tennis Ball",
		"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "tennis_ball",
		"sfx_type": "light"
	},
	ObjectType.BASKETBALL: {
		"name": "Basketball",
		"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "basketball",
		"sfx_type": "alt"
	},
	ObjectType.BLACK_SMALL_BALL: {
		"name": "Small Black Ball",
		"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "black_small_ball",
		"sfx_type": "light"
	},
	ObjectType.BROWN_TENNIS_BALL: {
		"name": "Brown Tennis Ball",
		"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "brown_tennis_ball",
		"sfx_type": "light"
	},
	ObjectType.GREEN_TENNIS_BALL: {
		"name": "Green Tennis Ball",
			"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "green_tennis_ball",
		"sfx_type": "light"
	},
	ObjectType.FOOTBALL: {
		"name": "Football",
		"mass": 0.42,
		"bounce": 0.5,
		"friction": 0.5,
		"animation": "football",
		"sfx_type": "alt"
	},
	ObjectType.BEACH_BALL: {
		"name": "Beach Ball",
		"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "beach_ball",
		"sfx_type": "light"
	},
	ObjectType.GOLF_BALL: {
		"name": "Golf Ball",
			"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "golf_ball",
		"sfx_type": "light"
	},
	ObjectType.SNOWBALL: {
		"name": "Snowball",
		"mass": 0.6,
		"bounce": 0.8,
		"friction": 0.4,
		"animation": "snowball",
		"sfx_type": "alt"
	},
	ObjectType.SOCCER_BALL: {
		"name": "Soccer Ball",
		"mass": 0.43,
		"bounce": 0.7,
		"friction": 0.4,
		"animation": "soccer_ball",
		"sfx_type": "alt"
	},
	ObjectType.VOLLEYBALL: {
		"name": "Volleyball",
		"mass": 0.27,
		"bounce": 0.75,
		"friction": 0.3,
		"animation": "voleyball",
		"sfx_type": "light"
	},
	ObjectType.BOWLING_BALL: {
		"name": "Bowling Ball",
		"mass": 7.0,
		"bounce": 0.1,
		"friction": 0.7,
		"animation": "bowling_ball",
		"sfx_type": "strong"
	}
}

const OBJECT_PROBABILITIES: Dictionary = {
	ObjectType.TENNIS_BALL: 15,
	ObjectType.BASKETBALL: 12,
	ObjectType.BLACK_SMALL_BALL: 10,
	ObjectType.BROWN_TENNIS_BALL: 10,
	ObjectType.GREEN_TENNIS_BALL: 10,
	ObjectType.FOOTBALL: 10,
	ObjectType.BEACH_BALL: 8,
	ObjectType.GOLF_BALL: 8,
	ObjectType.SNOWBALL: 7,
	ObjectType.SOCCER_BALL: 5,
	ObjectType.VOLLEYBALL: 3,
	ObjectType.BOWLING_BALL: 2
}

# =============================================================================
# VARIABLES
# =============================================================================

var object_type: ObjectType = ObjectType.BASKETBALL
var lifetime: float = 0.0

@export var despawn_time: float = 10.0

# =============================================================================
# NODES
# =============================================================================

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var sfx_strong: AudioStreamPlayer = $SFX/Throw_strong
@onready var sfx_light: AudioStreamPlayer = $SFX/Throw_light
@onready var sfx_alt: AudioStreamPlayer = $SFX/Throw_Alt

# =============================================================================
# LIFECYCLE
# =============================================================================

func _ready() -> void:
	_setup_physics()
	_setup_sprite()
	_add_spin()

func _process(delta: float) -> void:
	lifetime += delta
	
	if lifetime >= despawn_time:
		_despawn()
	
	if linear_velocity.length() > 10:
		sprite.rotation += linear_velocity.length() * delta * 0.01

# =============================================================================
# INITIALIZATION
# =============================================================================

func initialize(type: ObjectType, direction: Vector2, speed: float, vertical_boost: float = 0.0) -> void:
	object_type = type
	
	_setup_sprite()
	_setup_physics()
	_play_throw_sound()
	
	# 80% de probabilidad de lanzamiento PODEROSO, 20% normal
	var roll: int = randi() % 100
	var power_multiplier: float = 1.0
	var vertical_multiplier: float = 1.0
	var throw_type: String = "NORMAL"
	
	if roll < 80:  # 80% - Lanzamiento PODEROSO
		power_multiplier = 1.0  # Fuerza completa
		vertical_multiplier = 1.0  # Impulso vertical completo
		throw_type = "¡PODEROSO!"
	else:  # 20% - Lanzamiento normal (más suave)
		power_multiplier = 0.5  # Mitad de fuerza
		vertical_multiplier = 0.3  # Menos altura
		throw_type = "Normal"
	
	# Impulso horizontal en la dirección del lanzamiento
	var horizontal_impulse: Vector2 = direction.normalized() * speed * mass * power_multiplier
	
	# Impulso vertical
	var vertical_impulse: Vector2 = Vector2.UP * vertical_boost * mass * vertical_multiplier
	
	# Aplicar ambos impulsos combinados
	var total_impulse: Vector2 = horizontal_impulse + vertical_impulse
	apply_central_impulse(total_impulse)
	
	var data: Dictionary = OBJECT_DATA.get(object_type, {})
	print("[ThrowableObject] %s - %s" % [throw_type, data.get("name", "Unknown")])

# =============================================================================
# SETUP
# =============================================================================

func _setup_sprite() -> void:
	if not sprite or not sprite.sprite_frames:
		return
	
	var data: Dictionary = OBJECT_DATA.get(object_type, {})
	var animation_name: String = data.get("animation", "tennis_ball")
	
	if sprite.sprite_frames.has_animation(animation_name):
		sprite.play(animation_name)

func _setup_physics() -> void:
	var data: Dictionary = OBJECT_DATA.get(object_type, {})
	
	mass = data.get("mass", 1.0)
	physics_material_override = PhysicsMaterial.new()
	physics_material_override.bounce = data.get("bounce", 0.5)
	physics_material_override.friction = data.get("friction", 0.5)

func _add_spin() -> void:
	angular_velocity = randf_range(-5, 5) * mass

# =============================================================================
# AUDIO
# =============================================================================

func _play_throw_sound() -> void:
	# 80% de probabilidad de lanzamiento FUERTE con sonido fuerte
	var roll: int = randi() % 100
	
	if roll < 80:  # 80% - Lanzamiento PODEROSO
		if sfx_strong:
			sfx_strong.play()
	else:  # 20% - Lanzamiento normal con sonidos variados
		var normal_sounds: Array = [sfx_light, sfx_alt]
		var random_sound = normal_sounds[randi() % normal_sounds.size()]
		if random_sound:
			random_sound.play()

# =============================================================================
# CLEANUP
# =============================================================================

func _despawn() -> void:
	if sprite:
		var tween: Tween = create_tween()
		tween.tween_property(sprite, "modulate:a", 0.0, 0.5)
		tween.tween_callback(queue_free)
	else:
		queue_free()

# =============================================================================
# STATIC
# =============================================================================

static func get_random_object_type() -> ObjectType:
	var total: int = 100
	var roll: int = randi() % total
	var accumulated: int = 0
	
	for type in OBJECT_PROBABILITIES:
		accumulated += OBJECT_PROBABILITIES[type]
		if roll < accumulated:
			return type
	
	return ObjectType.BASKETBALL
