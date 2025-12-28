extends PartyMember
## Hikiko - Character with multiple special abilities
## THROW (R): Throws random objects with physics
## SMASH: Powerful hammer attack with screen shake
## HEADBUTT (Q): Default head attack

# =============================================================================
# EXPORTS
# =============================================================================

@export_group("SMASH Ability")
@export var smash_range := 32.0
@export var smash_cooldown := 1.0
@export var smash_shake_intensity := 15.0
@export var smash_shake_duration := 0.3

@export_group("HEADBUTT Ability")
@export var headbutt_range := 24.0
@export var headbutt_cooldown := 0.7

@export_group("THROW Ability")
@export var throw_cooldown := 1.5
@export var throw_speed := 1200.0
@export var throw_vertical_boost := 300.0
@export var throwable_scene: PackedScene
@export var throw_shake_intensity := 12.0
@export var throw_shake_duration := 0.5

@export_group("Butterfly")
@export var butterfly_wait_time := 50.0

# =============================================================================
# NODE REFERENCES
# =============================================================================

@onready var sfx_smash: AudioStreamPlayer = $SFX/smash_sound

# =============================================================================
# ABILITY STATE
# =============================================================================

var _can_smash := true
var _can_headbutt := true
var _can_throw := true
var _is_throwing := false
var _is_smashing := false

var _smash_timer := 0.0
var _headbutt_timer := 0.0
var _throw_timer := 0.0

# Butterfly state
var _butterfly_idle_timer := 0.0
var _ready_for_butterfly := false
var _butterfly_on_head := false

# =============================================================================
# INITIALIZATION
# =============================================================================

func _ready() -> void:
	super._ready()
	
	member_name = "Hikiko"
	display_name = "Hikiko"
	has_ability = true
	special_ability_name = "SMASH"
	special_ability_description = "Hits hard in the direction facing"
	
	_load_portrait()
	_load_throwable_scene()
	_connect_to_character_menu()


func _load_portrait() -> void:
	const PORTRAIT_PATH := "res://assets/player/$HIKIKO_TAG.png"
	if ResourceLoader.exists(PORTRAIT_PATH):
		portrait_texture = load(PORTRAIT_PATH)


func _load_throwable_scene() -> void:
	if throwable_scene:
		return
	const THROWABLE_PATH := "res://scenes/effects/ThrowableObject.tscn"
	if ResourceLoader.exists(THROWABLE_PATH):
		throwable_scene = load(THROWABLE_PATH)


func _connect_to_character_menu() -> void:
	await get_tree().process_frame
	
	var menu: CanvasLayer = get_tree().get_first_node_in_group("CharacterMenu")
	if not menu:
		menu = get_node_or_null("/root/CharacterMenu")
	
	if menu and not menu.option_selected.is_connected(_on_menu_option_selected):
		menu.option_selected.connect(_on_menu_option_selected)

# =============================================================================
# PROCESS
# =============================================================================

func _process(delta: float) -> void:
	_update_cooldowns(delta)
	_process_butterfly_timer(delta)


func _update_cooldowns(delta: float) -> void:
	if not _can_smash:
		_smash_timer -= delta
		if _smash_timer <= 0:
			_can_smash = true
	
	if not _can_headbutt:
		_headbutt_timer -= delta
		if _headbutt_timer <= 0:
			_can_headbutt = true
	
	if not _can_throw:
		_throw_timer -= delta
		if _throw_timer <= 0:
			_can_throw = true


func _physics_process(delta: float) -> void:
	if _is_throwing or _is_smashing:
		return
	super._physics_process(delta)


func _unhandled_input(event: InputEvent) -> void:
	if not is_leader:
		return
	
	# R key - THROW (usando action_ability o KEY_R directamente)
	if event.is_action_pressed("action_ability"):
		if use_throw():
			get_viewport().set_input_as_handled()
		return
	
	# Fallback para KEY_R directo (compatibilidad)
	if event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_R:
				if use_throw():
					get_viewport().set_input_as_handled()
			KEY_Q:
				if use_headbutt():
					get_viewport().set_input_as_handled()

# =============================================================================
# MENU CALLBACK
# =============================================================================

func _on_menu_option_selected(option_name: String) -> void:
	if not is_leader:
		return
	
	match option_name:
		"THROW":
			await get_tree().create_timer(0.1).timeout
			use_throw_from_menu()
		"SMASH":
			await get_tree().create_timer(0.1).timeout
			use_smash_from_menu()
		"HEADBUTT":
			use_headbutt()

# =============================================================================
# BUTTERFLY SYSTEM
# =============================================================================

func _process_butterfly_timer(delta: float) -> void:
	if not is_leader or _butterfly_on_head:
		if not is_leader:
			_reset_butterfly_state()
		return
	
	var is_idle := get_animation() == "idle_down" and not moving and velocity.length() < 1.0
	
	if is_idle:
		_butterfly_idle_timer += delta
		if _butterfly_idle_timer >= butterfly_wait_time:
			_ready_for_butterfly = true
	else:
		_reset_butterfly_state()


func _reset_butterfly_state() -> void:
	_butterfly_idle_timer = 0.0
	_ready_for_butterfly = false


func is_ready_for_butterfly() -> bool:
	return _ready_for_butterfly and is_leader and not _butterfly_on_head


func _on_butterfly_landed() -> void:
	_butterfly_on_head = true
	
	if sprite and sprite.sprite_frames.has_animation("surprise_down"):
		sprite.play("surprise_down")
	
	if emotions and emotions.sprite_frames.has_animation("blush_bubble"):
		emotions.visible = true
		emotions.play("blush_bubble")


func _on_butterfly_left() -> void:
	_butterfly_on_head = false
	_reset_butterfly_state()
	
	if emotions:
		emotions.visible = false
		emotions.stop()
	
	_play_idle()

# =============================================================================
# SMASH ABILITY
# =============================================================================

func use_special_ability() -> bool:
	if not _can_smash or _is_smashing:
		return false
	
	ability_used.emit(special_ability_name)
	_play_smash_animation()
	return true


func use_smash_from_menu() -> void:
	if not is_leader or not _can_smash or _is_smashing:
		return
	
	ability_used.emit(special_ability_name)
	_play_smash_animation()


func _play_smash_animation() -> void:
	_is_smashing = true
	_can_smash = false
	_smash_timer = smash_cooldown
	
	_dismiss_butterfly()
	
	# Animation name: smash_{direction}_action
	var anim := "smash_%s_action" % direction
	
	if sprite and sprite.sprite_frames.has_animation(anim):
		var frame_count := sprite.sprite_frames.get_frame_count(anim)
		var anim_speed := sprite.sprite_frames.get_animation_speed(anim)
		var anim_length := frame_count / anim_speed
		
		sprite.play(anim)
		
		# Play sound at impact (around middle of animation)
		await get_tree().create_timer(anim_length * 0.5).timeout
		_execute_smash()
		
		# Wait for rest of animation
		await get_tree().create_timer(anim_length * 0.5).timeout
		
		_is_smashing = false
		_play_idle()
	else:
		# No animation found, execute immediately
		_execute_smash()
		_is_smashing = false
		_play_idle()


func _execute_smash() -> void:
	# Play smash sound
	if sfx_smash:
		sfx_smash.play()
	
	# Camera shake for impact
	_trigger_smash_camera_shake()
	
	# TODO: Add Area2D detection for buttons/breakable objects
	print("[Hikiko] SMASH!")


func _trigger_smash_camera_shake() -> void:
	var camera := get_viewport().get_camera_2d()
	if camera:
		_shake_camera(camera, smash_shake_intensity, smash_shake_duration)

# =============================================================================
# HEADBUTT ABILITY
# =============================================================================

func use_headbutt() -> bool:
	if not is_leader or not _can_headbutt:
		return false
	
	_can_headbutt = false
	_headbutt_timer = headbutt_cooldown
	
	_dismiss_butterfly()
	
	var anim := "headbutt_" + direction
	if sprite and sprite.sprite_frames.has_animation(anim):
		sprite.play(anim)
		sprite.animation_finished.connect(_on_headbutt_animation_finished, CONNECT_ONE_SHOT)
	else:
		_execute_headbutt()
	
	return true


func _on_headbutt_animation_finished() -> void:
	_execute_headbutt()
	_play_idle()


func _execute_headbutt() -> void:
	print("[Hikiko] HEADBUTT!")

# =============================================================================
# THROW ABILITY
# =============================================================================

func use_throw() -> bool:
	if not is_leader or not _can_throw or _is_throwing:
		return false
	
	_can_throw = false
	_throw_timer = throw_cooldown
	
	_dismiss_butterfly()
	_play_throw_animation()
	return true


func use_throw_from_menu() -> void:
	if not is_leader or not _can_throw or _is_throwing:
		return
	
	_can_throw = false
	_throw_timer = throw_cooldown
	
	_dismiss_butterfly()
	_play_throw_animation()


func _play_throw_animation() -> void:
	_is_throwing = true
	
	var anim := "throw_%s_action" % direction
	
	if sprite and sprite.sprite_frames.has_animation(anim):
		var frame_count := sprite.sprite_frames.get_frame_count(anim)
		var anim_speed := sprite.sprite_frames.get_animation_speed(anim)
		var anim_length := frame_count / anim_speed
		
		sprite.play(anim)
		await get_tree().create_timer(anim_length).timeout
		
		_execute_throw()
		_is_throwing = false
		_play_idle()
	else:
		_is_throwing = false
		_execute_throw()


func _execute_throw() -> void:
	if not throwable_scene:
		return
	
	var throw_dir := _get_direction_vector()
	var random_type: int = ThrowableObject.get_random_object_type()
	
	var throwable: RigidBody2D = throwable_scene.instantiate()
	throwable.global_position = global_position + throw_dir * 20.0
	
	get_tree().current_scene.add_child(throwable)
	
	if throwable.has_method("initialize"):
		throwable.initialize(random_type, throw_dir, throw_speed, throw_vertical_boost)
	
	_trigger_throw_camera_shake()


func _trigger_throw_camera_shake() -> void:
	var camera := get_viewport().get_camera_2d()
	if camera:
		_shake_camera(camera, throw_shake_intensity, throw_shake_duration)

# =============================================================================
# CAMERA SHAKE
# =============================================================================

func _shake_camera(camera: Camera2D, intensity: float, duration: float) -> void:
	var original_offset := camera.offset
	var tween := create_tween()
	var steps := int(duration / 0.05)
	
	for i in steps:
		var progress := float(i) / float(steps)
		var current_intensity := intensity * (1.0 - progress)
		var offset := Vector2(
			randf_range(-current_intensity, current_intensity),
			randf_range(-current_intensity, current_intensity)
		)
		tween.tween_property(camera, "offset", original_offset + offset, 0.05)
	
	tween.tween_property(camera, "offset", original_offset, 0.05)

# =============================================================================
# UTILITY
# =============================================================================

func _dismiss_butterfly() -> void:
	if _butterfly_on_head:
		_on_butterfly_left()


func _get_direction_vector() -> Vector2:
	const DIRECTION_MAP := {
		"up": Vector2.UP,
		"down": Vector2.DOWN,
		"left": Vector2.LEFT,
		"right": Vector2.RIGHT
	}
	return DIRECTION_MAP.get(direction, Vector2.DOWN)


func _get_input() -> Vector2:
	return super._get_input()


func has_special_ability() -> bool:
	return true


func get_current_mystery_ability() -> String:
	if PocketInventory:
		if PocketInventory.has_item("smash_hikiko"):
			return "SMASH"
		if PocketInventory.has_item("throw_hikiko"):
			return "THROW"
	return "HEADBUTT"


func _handle_sleep(_delta: float) -> void:
	pass


# Called from AnimatedSprite2D signal (connected in .tscn)
func _on_animated_sprite_2d_animation_finished() -> void:
	# Handle any animation finished callbacks if needed
	pass
