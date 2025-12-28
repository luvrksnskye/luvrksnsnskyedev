extends PartyMember

## Rainy - El personaje principal/jugador
## Siempre comienza como líder por default
## Si está solo y duerme, una mariposa puede posarse con sleep_bubble animado
## BOOK (R): Abre el libro de memorias (si tiene el item)

# =============================================================================
# RAINY'S ABILITY (FOCUS / BOOK)
# =============================================================================

@export_group("Focus Ability")
@export var focus_duration: float = 3.0
@export var focus_speed_multiplier: float = 1.5

@export_group("Book Ability")
@export var book_cooldown: float = 0.5

var _is_focused: bool = false
var _focus_timer: float = 0.0
var _original_speed: float = 0.0

var _can_use_book: bool = true
var _book_timer: float = 0.0

# =============================================================================
# BUTTERFLY INTERACTION
# =============================================================================

var _butterfly_on_head: bool = false

# =============================================================================
# READY
# =============================================================================

func _ready() -> void:
	super._ready()
	
	# Configurar identidad
	member_name = "Rainy"
	display_name = "Rainy"
	
	# Configurar habilidad especial
	has_ability = true
	special_ability_name = "FOCUS"
	special_ability_description = "Aumenta la velocidad temporalmente"
	
	# Intentar cargar el portrait
	var portrait_path: String = "res://assets/player/$RAINY_TAG.png"
	if ResourceLoader.exists(portrait_path):
		portrait_texture = load(portrait_path)
	
	# Guardar velocidad original
	_original_speed = speed
	
	# Agregar al grupo Player
	add_to_group("Player")
	
	# Conectar al menú de personajes
	_connect_to_character_menu()


func _connect_to_character_menu() -> void:
	await get_tree().process_frame
	
	var menu: CanvasLayer = get_tree().get_first_node_in_group("CharacterMenu")
	if not menu:
		menu = get_node_or_null("/root/CharacterMenu")
	
	if menu and not menu.option_selected.is_connected(_on_menu_option_selected):
		menu.option_selected.connect(_on_menu_option_selected)


func _process(delta: float) -> void:
	# Manejar duración del focus
	if _is_focused:
		_focus_timer -= delta
		if _focus_timer <= 0:
			_end_focus()
	
	# Manejar cooldown del book
	if not _can_use_book:
		_book_timer -= delta
		if _book_timer <= 0:
			_can_use_book = true


# =============================================================================
# INPUT - R para BOOK
# =============================================================================

func _unhandled_input(event: InputEvent) -> void:
	if not is_leader:
		return
	
	# R key - BOOK (usando action_ability o KEY_R directamente)
	if event.is_action_pressed("action_ability"):
		if use_book():
			get_viewport().set_input_as_handled()
		return
	
	# Fallback para KEY_R directo (compatibilidad)
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_R:
			if use_book():
				get_viewport().set_input_as_handled()

# =============================================================================
# MENU CALLBACK
# =============================================================================

func _on_menu_option_selected(option_name: String) -> void:
	if not is_leader:
		return
	
	match option_name:
		"BOOK":
			await get_tree().create_timer(0.1).timeout
			use_book()
		"FOCUS":
			await get_tree().create_timer(0.1).timeout
			use_special_ability()

# =============================================================================
# BOOK ABILITY
# =============================================================================

func use_book() -> bool:
	if not is_leader or not _can_use_book:
		return false
	
	# Verificar si tiene el libro
	if PocketInventory and not PocketInventory.has_item("memory_book"):
		print("[Rainy] No tengo el libro de memorias...")
		return false
	
	_can_use_book = false
	_book_timer = book_cooldown
	
	print("[Rainy] *Abre el libro de memorias*")
	
	# TODO: Abrir la UI del libro de memorias
	# Por ahora solo imprime
	
	return true

# =============================================================================
# FOCUS IMPLEMENTATION
# =============================================================================

func _on_ability_used() -> void:
	## Override - Activa FOCUS
	if _is_focused:
		return
	
	_is_focused = true
	_focus_timer = focus_duration
	_original_speed = speed
	speed = _original_speed * focus_speed_multiplier
	
	print("[Rainy] FOCUS activado! Velocidad aumentada por %.1f segundos" % focus_duration)
	
	# Efecto visual
	if sprite:
		sprite.modulate = Color(1.2, 1.2, 1.0)


func _end_focus() -> void:
	_is_focused = false
	speed = _original_speed
	
	if sprite:
		sprite.modulate = Color.WHITE
	
	print("[Rainy] FOCUS terminado")


func has_special_ability() -> bool:
	return true


func use_special_ability() -> bool:
	if _is_focused:
		print("[Rainy] Ya está en FOCUS...")
		return false
	
	ability_used.emit(special_ability_name)
	_on_ability_used()
	return true

# =============================================================================
# BUTTERFLY CALLBACKS
# =============================================================================

func _on_butterfly_landed() -> void:
	## Llamado cuando una mariposa se posa en Rainy mientras duerme
	_butterfly_on_head = true
	# El sleep_bubble ya está visible por el sistema de sueño
	print("[Rainy] *Zzz... una mariposa se posó mientras duerme*")


func _on_butterfly_left() -> void:
	## Llamado cuando la mariposa se va
	_butterfly_on_head = false
	print("[Rainy] La mariposa se fue...")

# =============================================================================
# OVERRIDE - SOLO RAINY PUEDE DORMIR CUANDO ESTÁ SOLO
# =============================================================================

func _handle_sleep(delta: float) -> void:
	# Rainy puede dormir cuando está solo mirando hacia abajo
	if not can_sleep:
		_idle_timer = 0.0
		return
	
	# Solo puede dormir si está solo en el party
	if PartyManager and PartyManager.get_party_size() > 1:
		_idle_timer = 0.0
		return
	
	if not moving and direction == "down" and not is_sleeping and not _is_focused:
		_idle_timer += delta
		if _idle_timer >= sleep_time:
			_start_sleep()
	else:
		_idle_timer = 0.0

# =============================================================================
# OVERRIDE - Al despertar, la mariposa se va
# =============================================================================

func _wake_up() -> void:
	if _butterfly_on_head:
		_butterfly_on_head = false
	
	super._wake_up()

# =============================================================================
# UTILITY - Para determinar qué habilidad mostrar en el menú
# =============================================================================

func get_current_mystery_ability() -> String:
	if PocketInventory and PocketInventory.has_item("memory_book"):
		return "BOOK"
	return "FOCUS"
