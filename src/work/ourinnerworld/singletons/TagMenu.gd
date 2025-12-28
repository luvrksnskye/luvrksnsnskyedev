extends CanvasLayer

## TagMenu - Menú de selección de líder del party

# =============================================================================
# SIGNALS
# =============================================================================

signal tag_confirmed(new_leader: PartyMember)
signal tag_cancelled

# =============================================================================
# CONSTANTS
# =============================================================================

const BLINK_SPEED: float = 0.1
const SELECTION_COLOR: Color = Color("90c2ffff")  # Azul pastel claro

# =============================================================================
# NODE REFERENCES
# =============================================================================

@onready var blur_background: ColorRect = $BlurBackground
@onready var control: Control = $Control

# Paneles de retratos
@onready var leader_panel: MarginContainer = $Control/WHO_LEADER
@onready var member_left_panel: MarginContainer = $Control/Member_WHO
@onready var member_right_panel: MarginContainer = $Control/Member_WHO2

# Portraits
@onready var leader_portrait: TextureRect = $Control/WHO_LEADER/PanelContainer/HBoxContainer/Portrait
@onready var member_left_portrait: TextureRect = $Control/Member_WHO/PanelContainer/HBoxContainer/Portrait
@onready var member_right_portrait: TextureRect = $Control/Member_WHO2/PanelContainer/HBoxContainer/Portrait

# Labels
@onready var tag_who_label: PanelContainer = $Control/Tag_WHO
@onready var leader_label: PanelContainer = $Control/Leader_tag

# Sound
@onready var tag_sound: AudioStreamPlayer = $SFX/tag_sound

# Animation
@onready var animation_player: AnimationPlayer = $AnimationPlayer

# =============================================================================
# STATE
# =============================================================================

var is_open: bool = false
var selected_index: int = 0
var blink_timer: float = 0.0
var blink_visible: bool = true

var visual_to_party: Array[int] = []
var panel_count: int = 0

var selection_borders: Array[Panel] = []
var blur_shader: Shader

# =============================================================================
# READY
# =============================================================================

func _ready() -> void:
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	add_to_group("TagMenu")
	
	_setup_blur_background()
	
	# Esperar un frame para que los nodos estén listos
	await get_tree().process_frame
	_create_selection_borders()


func _setup_blur_background() -> void:
	if not blur_background:
		return
	
	# Intentar cargar el shader de blur
	var shader_path: String = "res://assets/styles/blur_background.gdshader"
	if ResourceLoader.exists(shader_path):
		blur_shader = load(shader_path)
		var material := ShaderMaterial.new()
		material.shader = blur_shader
		material.set_shader_parameter("blur_amount", 2.5)
		material.set_shader_parameter("darkness", 0.0)
		blur_background.material = material
	else:
		# Si no existe el shader, usar color semi-transparente
		blur_background.color = Color(0.05, 0.05, 0.1, 0.7)


func _create_selection_borders() -> void:
	selection_borders.clear()
	
	var panels: Array = [member_left_panel, leader_panel, member_right_panel]
	
	for panel in panels:
		if panel:
			# Verificar si ya existe un borde
			var existing: Node = panel.get_node_or_null("SelectionBorder")
			if existing:
				existing.queue_free()
			
			var border := Panel.new()
			border.name = "SelectionBorder"
			border.visible = false
			border.mouse_filter = Control.MOUSE_FILTER_IGNORE
			
			var style := StyleBoxFlat.new()
			style.bg_color = Color.TRANSPARENT
			style.border_color = SELECTION_COLOR
			style.set_border_width_all(4)
			style.set_corner_radius_all(6)
			border.add_theme_stylebox_override("panel", style)
			
			border.set_anchors_preset(Control.PRESET_FULL_RECT)
			panel.add_child(border)
			selection_borders.append(border)
		else:
			selection_borders.append(null)

# =============================================================================
# PROCESS
# =============================================================================

func _process(delta: float) -> void:
	if not is_open:
		return
	
	blink_timer += delta
	if blink_timer >= BLINK_SPEED:
		blink_timer = 0.0
		blink_visible = not blink_visible
		_update_selection_visual()


func _unhandled_input(event: InputEvent) -> void:
	# Abrir el menú con tag_menu
	if event.is_action_pressed("tag_menu") and not is_open:
		if _can_open_menu():
			open_menu()
			get_viewport().set_input_as_handled()
		return
	
	if not is_open:
		return
	
	# Navegación dentro del menú
	if event.is_action_pressed("ui_left"):
		_move_selection(-1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_right"):
		_move_selection(1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_accept"):
		_confirm_selection()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_cancel"):
		# Consumir el evento ANTES de cerrar para evitar que CharacterMenu lo capture
		get_viewport().set_input_as_handled()
		close_menu()

# =============================================================================
# MENU CONTROL
# =============================================================================

func _can_open_menu() -> bool:
	return PartyManager and PartyManager.get_party_size() > 1


func open_menu() -> void:
	if is_open:
		return
	
	is_open = true
	visible = true
	
	# Pausar el juego
	get_tree().paused = true
	
	# Congelar el party (jugador)
	if PartyManager:
		PartyManager.freeze_party()
	
	# Configurar los paneles
	_setup_panels()
	
	# Establecer la selección inicial
	selected_index = _get_leader_visual_index()
	blink_timer = 0.0
	blink_visible = true
	_update_selection_visual()
	
	# Reproducir la animación de apertura
	if animation_player and animation_player.has_animation("open"):
		animation_player.play("open")


func close_menu() -> void:
	if not is_open:
		return
	
	# Reproducir la animación de cierre
	if animation_player and animation_player.has_animation("closed"):
		animation_player.play("closed")
		# Esperar a que termine la animación
		await animation_player.animation_finished
	
	is_open = false
	visible = false
	
	# Despausar el juego
	get_tree().paused = false
	
	# Descongelar el party (jugador)
	if PartyManager:
		PartyManager.unfreeze_party()
	

	tag_cancelled.emit()


func _confirm_selection() -> void:
	if visual_to_party.is_empty() or selected_index >= visual_to_party.size():
		close_menu()
		return
	
	var party_index: int = visual_to_party[selected_index]
	var selected_member: PartyMember = PartyManager.get_member_by_index(party_index)
	
	if selected_member and selected_member != PartyManager.leader:
		var old_leader: PartyMember = PartyManager.leader
		
		# Reproducir sonido específico según quién hace tag a quién
		_play_tag_sound(old_leader, selected_member)
		
		print("%s TAGGED %s." % [old_leader.display_name.to_upper(), selected_member.display_name.to_upper()])
		
		PartyManager.set_leader(selected_member)
		
		tag_confirmed.emit(selected_member)
		
		await get_tree().create_timer(0.4).timeout
	
	close_menu()

# =============================================================================
# PANEL SETUP
# =============================================================================

func _setup_panels() -> void:
	visual_to_party.clear()
	
	if not PartyManager or PartyManager.is_empty():
		return
	
	var members: Array[PartyMember] = PartyManager.members
	var total: int = members.size()
	
	# Ocultar todos primero
	if leader_panel: leader_panel.visible = false
	if member_left_panel: member_left_panel.visible = false
	if member_right_panel: member_right_panel.visible = false
	
	if total == 0:
		return
	
	if total == 1:
		# Solo líder (no debería pasar, pero por seguridad)
		if leader_panel: leader_panel.visible = true
		_set_portrait(leader_portrait, members[0])
		visual_to_party = [0]
		panel_count = 1
		
	elif total == 2:
		# Líder en centro, seguidor a la IZQUIERDA (no derecha)
		if member_left_panel: member_left_panel.visible = true
		if leader_panel: leader_panel.visible = true
		# member_right_panel permanece oculto
		
		_set_portrait(member_left_portrait, members[1])  # Seguidor izquierda
		_set_portrait(leader_portrait, members[0])        # Líder centro
		
		# visual_to_party: índice visual -> índice en party
		# [0] = izquierda = members[1], [1] = centro = members[0]
		visual_to_party = [1, 0]
		panel_count = 2
		
	elif total == 3:
		# Todos visibles
		if member_left_panel: member_left_panel.visible = true
		if leader_panel: leader_panel.visible = true
		if member_right_panel: member_right_panel.visible = true
		
		_set_portrait(member_left_portrait, members[1])   # Seguidor 1 izquierda
		_set_portrait(leader_portrait, members[0])         # Líder centro
		_set_portrait(member_right_portrait, members[2])   # Seguidor 2 derecha
		
		visual_to_party = [1, 0, 2]
		panel_count = 3
		
	elif total == 4:
		# Mostramos 3 paneles (líder + 2 primeros seguidores)
		if member_left_panel: member_left_panel.visible = true
		if leader_panel: leader_panel.visible = true
		if member_right_panel: member_right_panel.visible = true
		
		_set_portrait(member_left_portrait, members[1])
		_set_portrait(leader_portrait, members[0])
		_set_portrait(member_right_portrait, members[2])
		
		# Nota: members[3] no se muestra visualmente pero se puede navegar
		visual_to_party = [1, 0, 2]
		panel_count = 3
		
	else:  # 5 o más
		if member_left_panel: member_left_panel.visible = true
		if leader_panel: leader_panel.visible = true
		if member_right_panel: member_right_panel.visible = true
		
		_set_portrait(member_left_portrait, members[1])
		_set_portrait(leader_portrait, members[0])
		_set_portrait(member_right_portrait, members[2])
		
		visual_to_party = [1, 0, 2]
		panel_count = 3


func _set_portrait(portrait_rect: TextureRect, member: PartyMember) -> void:
	if not portrait_rect or not member:
		return
	
	if member.portrait_texture:
		portrait_rect.texture = member.portrait_texture
	else:
		var path: String = "res://assets/player/$%s_TAG.png" % member.member_name.to_upper()
		if ResourceLoader.exists(path):
			portrait_rect.texture = load(path)
		else:
			push_warning("[TagMenu] No se encontró portrait: %s" % path)

# =============================================================================
# SELECTION
# =============================================================================

func _play_tag_sound(old_leader: PartyMember, new_leader: PartyMember) -> void:
	"""
	Reproduce el sonido apropiado según quién hace tag a quién.
	Siempre reproduce el sonido genérico primero, luego el específico si aplica.
	"""
	if not old_leader or not new_leader:
		return
	
	# Reproducir el sonido genérico primero
	if tag_sound:
		tag_sound.play()
	
	# Normalizar los nombres a minúsculas para comparación
	var old_name: String = old_leader.member_name.to_lower()
	var new_name: String = new_leader.member_name.to_lower()
	
	# Casos específicos - se reproducen DESPUÉS del sonido genérico
	if old_name == "hikiko" and new_name == "rainy":
		# Hikiko hace tag a Rainy
		var special_sound: AudioStreamPlayer = get_node_or_null("SFX/hikiko_tagged_rainy")
		if special_sound:
			special_sound.play()
	
	elif old_name == "rainy" and new_name == "hikiko":
		# Rainy hace tag a Hikiko
		var special_sound: AudioStreamPlayer = get_node_or_null("SFX/rainy_tagged_hikiko")
		if special_sound:
			special_sound.play()
	
	elif old_name == "rainy" and new_name == "stranger":
		# Rainy hace tag a Stranger
		var special_sound: AudioStreamPlayer = get_node_or_null("SFX/rainy_tagged_stranger")
		if special_sound:
			special_sound.play()
	
	elif old_name == "hikiko" and new_name == "stranger":
		# Hikiko hace tag a Stranger
		var special_sound: AudioStreamPlayer = get_node_or_null("SFX/hikiko_tagged_stranger")
		if special_sound:
			special_sound.play()


func _move_selection(direction: int) -> void:
	if panel_count <= 1:
		return
	
	selected_index = wrapi(selected_index + direction, 0, panel_count)
	blink_visible = true
	blink_timer = 0.0
	_update_selection_visual()


func _get_leader_visual_index() -> int:
	for i in range(visual_to_party.size()):
		if visual_to_party[i] == 0:
			return i
	return 0


func _update_selection_visual() -> void:
	# Mapeo: visual index -> border index
	# borders: [0]=left, [1]=center, [2]=right
	var visual_to_border: Array[int] = []
	
	if panel_count == 1:
		visual_to_border = [1]  # Solo centro
	elif panel_count == 2:
		visual_to_border = [0, 1]  # Izquierda, Centro
	else:
		visual_to_border = [0, 1, 2]  # Izquierda, Centro, Derecha
	
	# Ocultar todos
	for border in selection_borders:
		if border:
			border.visible = false
	
	# Mostrar el seleccionado
	if selected_index < visual_to_border.size():
		var border_idx: int = visual_to_border[selected_index]
		if border_idx < selection_borders.size() and selection_borders[border_idx]:
			selection_borders[border_idx].visible = blink_visible
