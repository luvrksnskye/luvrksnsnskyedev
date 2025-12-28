extends Node

## InputSetup - Configuración de controles del juego
## ESC: Abrir menú principal
## Z: Tag (cambiar líder)
## WASD: Caminar
## Arrows: Navegación UI
## R: Habilidad de acción (THROW para Hikiko, BOOK para Rainy)

func _ready() -> void:
	setup_input_actions()


func setup_input_actions() -> void:
	# ==========================================================================
	# LIMPIAR ACCIONES EXISTENTES PARA RECONFIGURAR
	# ==========================================================================
	_clear_action_if_exists("tag_menu")
	_clear_action_if_exists("use_ability")
	_clear_action_if_exists("open_menu")
	_clear_action_if_exists("action_ability")
	_clear_action_if_exists("move_up")
	_clear_action_if_exists("move_down")
	_clear_action_if_exists("move_left")
	_clear_action_if_exists("move_right")
	
	# ==========================================================================
	# TAG MENU - Tecla Z
	# ==========================================================================
	InputMap.add_action("tag_menu")
	var event_z := InputEventKey.new()
	event_z.physical_keycode = KEY_Z
	InputMap.action_add_event("tag_menu", event_z)
	print("[InputSetup] Acción 'tag_menu' configurada (Tecla Z)")
	
	# ==========================================================================
	# OPEN MENU - Tecla ESC
	# ==========================================================================
	InputMap.add_action("open_menu")
	var event_esc := InputEventKey.new()
	event_esc.physical_keycode = KEY_ESCAPE
	InputMap.action_add_event("open_menu", event_esc)
	print("[InputSetup] Acción 'open_menu' configurada (Tecla ESC)")
	
	# ==========================================================================
	# ACTION ABILITY - Tecla R (THROW para Hikiko, BOOK para Rainy)
	# ==========================================================================
	InputMap.add_action("action_ability")
	var event_r := InputEventKey.new()
	event_r.physical_keycode = KEY_R
	InputMap.action_add_event("action_ability", event_r)
	print("[InputSetup] Acción 'action_ability' configurada (Tecla R)")
	
	# ==========================================================================
	# MOVEMENT - WASD
	# ==========================================================================
	InputMap.add_action("move_up")
	var event_w := InputEventKey.new()
	event_w.physical_keycode = KEY_W
	InputMap.action_add_event("move_up", event_w)
	
	InputMap.add_action("move_down")
	var event_s := InputEventKey.new()
	event_s.physical_keycode = KEY_S
	InputMap.action_add_event("move_down", event_s)
	
	InputMap.add_action("move_left")
	var event_a := InputEventKey.new()
	event_a.physical_keycode = KEY_A
	InputMap.action_add_event("move_left", event_a)
	
	InputMap.add_action("move_right")
	var event_d := InputEventKey.new()
	event_d.physical_keycode = KEY_D
	InputMap.action_add_event("move_right", event_d)
	
	print("[InputSetup] Movimiento WASD configurado")
	
	# ==========================================================================
	# UI NAVIGATION - Arrow Keys
	# ==========================================================================
	_setup_ui_action("ui_accept", KEY_ENTER)
	_setup_ui_action("ui_accept", KEY_SPACE)  # También espacio para aceptar
	_setup_ui_action("ui_cancel", KEY_ESCAPE)
	_setup_ui_action("ui_cancel", KEY_X)  # También X para cancelar
	_setup_ui_action("ui_left", KEY_LEFT)
	_setup_ui_action("ui_right", KEY_RIGHT)
	_setup_ui_action("ui_up", KEY_UP)
	_setup_ui_action("ui_down", KEY_DOWN)
	
	print("[InputSetup] Navegación UI (Arrows) configurada")


func _clear_action_if_exists(action_name: String) -> void:
	if InputMap.has_action(action_name):
		InputMap.erase_action(action_name)


func _setup_ui_action(action_name: String, key: Key) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	
	var event := InputEventKey.new()
	event.physical_keycode = key
	
	# Verificar si el evento ya existe para evitar duplicados
	var existing_events := InputMap.action_get_events(action_name)
	for existing in existing_events:
		if existing is InputEventKey and existing.physical_keycode == key:
			return
	
	InputMap.action_add_event(action_name, event)
