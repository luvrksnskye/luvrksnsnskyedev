extends PartyMember

# =============================================================================
# STRANGER'S ABILITY (???)
# =============================================================================

@export_group("??? Ability")
@export var ability_cooldown: float = 2.0
@export var ability_duration: float = 1.5

var _can_use_ability := true
var _ability_timer := 0.0
var _is_using_ability := false

# =============================================================================
# READY
# =============================================================================

func _ready() -> void:
	super._ready()
	
	# Configurar identidad
	member_name = "Stranger"
	display_name = "Stranger"
	
	# Configurar stats base (ser de sombras - resistente pero no agresivo)
	max_hp = 80
	hp = 80
	attack = 8
	defense = 15
	speed = 70.0  
	
	# Configurar habilidad especial
	has_ability = true
	special_ability_name = "???"
	special_ability_description = "..."
	

	can_sleep = false
	
	# Intentar cargar el portrait
	var portrait_path: String = "res://assets/player/$STRANGER_TAG.png"
	if ResourceLoader.exists(portrait_path):
		portrait_texture = load(portrait_path)
	
	# Conectar al menú de personajes
	_connect_to_character_menu()


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


func _update_cooldowns(delta: float) -> void:
	if not _can_use_ability:
		_ability_timer -= delta
		if _ability_timer <= 0:
			_can_use_ability = true


func _physics_process(delta: float) -> void:
	if _is_using_ability:
		return
	super._physics_process(delta)


# =============================================================================
# MENU CALLBACK
# =============================================================================

func _on_menu_option_selected(option_name: String) -> void:
	if not is_leader:
		return
	
	match option_name:
		"???":
			await get_tree().create_timer(0.1).timeout
			use_special_ability()


# =============================================================================
# SPECIAL ABILITY IMPLEMENTATION
# =============================================================================

func use_special_ability() -> bool:
	if not _can_use_ability or _is_using_ability:
		return false
	
	_can_use_ability = false
	_ability_timer = ability_cooldown
	_is_using_ability = true
	
	ability_used.emit(special_ability_name)
	_execute_mystery_ability()
	
	return true


func _execute_mystery_ability() -> void:
	# Por ahora, la habilidad es desconocida

	print("[Stranger] ...???...")
	
	
	if sprite:
		var original_modulate := sprite.modulate
		sprite.modulate = Color(0.3, 0.3, 0.4, 0.7)
		
		await get_tree().create_timer(ability_duration).timeout
		
		sprite.modulate = original_modulate
	else:
		await get_tree().create_timer(ability_duration).timeout
	
	_is_using_ability = false
	_play_idle()


func has_special_ability() -> bool:
	return true


# =============================================================================
# STRANGER NO DUERME
# =============================================================================

func _handle_sleep(_delta: float) -> void:

	pass
