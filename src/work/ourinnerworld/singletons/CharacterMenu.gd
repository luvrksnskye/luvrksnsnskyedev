extends CanvasLayer
## CharacterMenu - Character menu with POCKET inventory and SKILLS menu support
## Uses UIAnimationManager for centralized animation management

# =============================================================================
# SIGNALS
# =============================================================================

signal option_selected(option_name: String)
signal menu_opened
signal menu_closed
signal skill_selected(skill_id: String, character_name: String)

# =============================================================================
# CONSTANTS
# =============================================================================

const HAND_MOVE_SPEED := 0.15
const HAND_FLOAT_SPEED := 1.5
const HAND_FLOAT_DISTANCE := 8.0

const POCKET_CATEGORIES: Array[String] = ["SNACKS", "TOYS", "IMPORTANT"]
const VALID_MYSTERY_MODES: Array[String] = ["???", "STAB", "BOOK", "THROW", "SMASH", "HEADBUTT", "FOCUS"]

# =============================================================================
# ENUMS
# =============================================================================

enum MenuOption { MYSTERY, EQUIP, POCKET, SKILLS, OPTIONS }
enum MenuState { 
	MAIN_MENU, 
	POCKET_CATEGORY, 
	POCKET_ITEMS, 
	POCKET_DETAIL,
	SKILLS_CHARACTER_SELECT,
	SKILLS_LIST,
	SKILLS_DETAIL
}

# =============================================================================
# NODE REFERENCES - SFX
# =============================================================================

@onready var sfx_move: AudioStreamPlayer = $SFX/move
@onready var sfx_cancel: AudioStreamPlayer = $SFX/cancel
@onready var sfx_select: AudioStreamPlayer = $SFX/select
@onready var sfx_open_menu: AudioStreamPlayer = $SFX/open_menu
@onready var sfx_denied: AudioStreamPlayer = $SFX/denied

# =============================================================================
# NODE REFERENCES - UI CONTAINERS
# =============================================================================

@onready var blur_background: ColorRect = $BlurBackground
@onready var character_select: Control = $Character_Select
@onready var menu: Control = $Menu
@onready var who_select: Control = $WHO_SELECT

# =============================================================================
# NODE REFERENCES - ANIMATION PLAYERS
# =============================================================================

@onready var animation_player_main_menu: AnimationPlayer = $AnimationPlayerMainMenu
@onready var hand_animator: AnimationPlayer = $Hand_Animation
@onready var animation_player_pocket: AnimationPlayer = $POCKET_SELECTED/AnimationPlayerPocket
@onready var pocket_hand_animator: AnimationPlayer = $POCKET_SELECTED/Pocket_items/AnimationPlayerPOCKEThand
@onready var animation_player_skills: AnimationPlayer = $Skills_Menu/AnimationPlayerSkills

# =============================================================================
# NODE REFERENCES - LEADER STATS
# =============================================================================

@onready var leader_stats: MarginContainer = $Character_Select/LEADER/LEADER_STATS
@onready var leader_name_label: RichTextLabel = $Character_Select/LEADER/LEADER_STATS/PanelContainer/VBoxContainer/RichTextLabel
@onready var leader_stats_bar: MarginContainer = $Character_Select/LEADER/STATS_BAR_LEADER
@onready var leader_heart_bar: ProgressBar = $Character_Select/LEADER/STATS_BAR_LEADER/PanelContainer/VBoxContainer/Health
@onready var leader_juice_bar: ProgressBar = $Character_Select/LEADER/STATS_BAR_LEADER/PanelContainer/VBoxContainer/Juice
@onready var leader_lvl_bar: ProgressBar = $Character_Select/LEADER/LEADER_STATS/Stats_LVL/LEADER_LVL
@onready var leader_portrait: TextureRect = $Character_Select/LEADER/PORTRAITS/HBoxContainer/LEADER

# =============================================================================
# NODE REFERENCES - MEMBER STATS (Second Member)
# =============================================================================

@onready var member_stats: MarginContainer = $Character_Select/MEMBER/MEMBER_STATS
@onready var member_name_label: RichTextLabel = $Character_Select/MEMBER/MEMBER_STATS/PanelContainer/VBoxContainer/RichTextLabel
@onready var member_stats_bar: MarginContainer = $Character_Select/MEMBER/STATS_BAR_MEMBER
@onready var member_heart_bar: ProgressBar = $Character_Select/MEMBER/STATS_BAR_MEMBER/PanelContainer/VBoxContainer/Health
@onready var member_juice_bar: ProgressBar = $Character_Select/MEMBER/STATS_BAR_MEMBER/PanelContainer/VBoxContainer/Juice
@onready var member_lvl_bar: ProgressBar = $Character_Select/MEMBER/Stats_LVL/MEMBER_LVL
@onready var member_portrait: TextureRect = $Character_Select/MEMBER/PORTRAITS/HBoxContainer/MEMBER
@onready var member_cover: ColorRect = $Character_Select/MEMBER/CoverBack2

# =============================================================================
# NODE REFERENCES - MEMBER2 STATS (Third Member)
# =============================================================================

@onready var member2_stats: MarginContainer = $Character_Select/MEMBER2/MEMBER_STATS2
@onready var member2_name_label: RichTextLabel = $Character_Select/MEMBER2/MEMBER_STATS2/PanelContainer/VBoxContainer/RichTextLabel
@onready var member2_stats_bar: MarginContainer = $Character_Select/MEMBER2/STATS_BAR_MEMBER2
@onready var member2_heart_bar: ProgressBar = $Character_Select/MEMBER2/STATS_BAR_MEMBER2/PanelContainer/VBoxContainer/Health
@onready var member2_juice_bar: ProgressBar = $Character_Select/MEMBER2/STATS_BAR_MEMBER2/PanelContainer/VBoxContainer/Juice
@onready var member2_lvl_bar: ProgressBar = $Character_Select/MEMBER2/Stats_LVL/MEMBER_LVL2
@onready var member2_portrait: TextureRect = $Character_Select/MEMBER2/PORTRAITS/HBoxContainer/MEMBER2
@onready var member2_cover: ColorRect = $Character_Select/MEMBER2/CoverBack3

# =============================================================================
# NODE REFERENCES - MENU OPTIONS
# =============================================================================

@onready var options_container: HBoxContainer = $Menu/Options/PanelContainer2/PanelContainer/HBoxContainer
@onready var mystery_option: Label = $Menu/Options/PanelContainer2/PanelContainer/HBoxContainer/BOOK
@onready var equip_option: Label = $Menu/Options/PanelContainer2/PanelContainer/HBoxContainer/EQUIP
@onready var pocket_option: Label = $Menu/Options/PanelContainer2/PanelContainer/HBoxContainer/POCKET
@onready var skills_option: Label = $Menu/Options/PanelContainer2/PanelContainer/HBoxContainer/SKILLS
@onready var options_label: Label = get_node_or_null("Menu/Options/PanelContainer2/PanelContainer/HBoxContainer/OPTIONS")
@onready var hand: Sprite2D = $Menu/Hand
@onready var coins_label: RichTextLabel = $Menu/COINS_AMOUNT/currency_total/PanelContainer/HBoxContainer/RichTextLabel

# =============================================================================
# NODE REFERENCES - POCKET UI
# =============================================================================

@onready var pocket_selected: Control = $POCKET_SELECTED
@onready var pocket_items: Control = $POCKET_SELECTED/Pocket_items
@onready var pocket_hand: Sprite2D = $POCKET_SELECTED/Pocket_items/Options/PanelContainer2/PanelContainer/HBoxContainer/Hand_POCKET
@onready var category_selected_node: Control = $POCKET_SELECTED/CATEGORY_SELECTED
@onready var inventory_panel: MarginContainer = $POCKET_SELECTED/CATEGORY_SELECTED/inventory
@onready var inventory_hand: Sprite2D = $POCKET_SELECTED/CATEGORY_SELECTED/inventory/PanelContainer2/PanelContainer/HBoxContainer/Hand_inventory
@onready var item_list_container: VBoxContainer = $POCKET_SELECTED/CATEGORY_SELECTED/inventory/PanelContainer2/PanelContainer/HBoxContainer/VBoxContainer
@onready var spacer: Label = $POCKET_SELECTED/CATEGORY_SELECTED/inventory/PanelContainer2/PanelContainer/HBoxContainer/VBoxContainer/space_control10
@onready var item_list_label: RichTextLabel = $POCKET_SELECTED/CATEGORY_SELECTED/inventory/PanelContainer2/PanelContainer/HBoxContainer/VBoxContainer/ItemList

# =============================================================================
# NODE REFERENCES - ITEM DETAIL PANEL
# =============================================================================

@onready var item_selected_panel: Control = $POCKET_SELECTED/ITEM_SELECTED
@onready var item_detail_container: PanelContainer = $POCKET_SELECTED/ITEM_SELECTED/PanelContainer2
@onready var item_name_label: Label = $POCKET_SELECTED/ITEM_SELECTED/PanelContainer2/PanelContainer/HBoxContainer/VBoxContainer/Name
@onready var item_description_label: Label = $POCKET_SELECTED/ITEM_SELECTED/PanelContainer2/PanelContainer/HBoxContainer/VBoxContainer/Description
@onready var item_icon_rect: TextureRect = $POCKET_SELECTED/ITEM_SELECTED/PanelContainer2/PanelContainer/HBoxContainer/ICON_ITEM

# =============================================================================
# NODE REFERENCES - SKILLS UI
# =============================================================================

@onready var skills_menu: Control = $Skills_Menu
@onready var skills_box: PanelContainer = $Skills_Menu/skills_box
@onready var skills_list_label: RichTextLabel = $Skills_Menu/skills_box/PanelContainer/VBoxContainer/List
@onready var skills_hand: Sprite2D = $Skills_Menu/skills_box/PanelContainer/VBoxContainer/VSplitContainer/VSeparator/hand_skills
@onready var skills_description_panel: PanelContainer = $Skills_Menu/skills_description
@onready var skills_description_container: PanelContainer = $Skills_Menu/skills_description
@onready var skill_name_label: RichTextLabel = $Skills_Menu/skills_description/PanelContainer/HBoxContainer/VBoxContainer/skill_name
@onready var skill_description_label: RichTextLabel = $Skills_Menu/skills_description/PanelContainer/HBoxContainer/VBoxContainer/skill_description_and_juice_cost

# =============================================================================
# STATE VARIABLES
# =============================================================================

var is_open := false
var selected_option: MenuOption = MenuOption.MYSTERY
var current_menu_state: MenuState = MenuState.MAIN_MENU
var mystery_mode := "???"
var current_coins := 0

# Pocket State
var current_pocket_category := 0
var current_item_index := 0
var filtered_items: Array[Dictionary] = []

# Skills State
var current_skills_character_index := 0
var current_skill_index := 0
var current_character_skills: Array[Dictionary] = []
var showing_character_profile := false

# Animation
var _item_panel_tween: Tween
var _is_item_panel_animating := false
var _skills_desc_tween: Tween
var _is_skills_desc_animating := false
const ITEM_PANEL_OPEN_DURATION := 0.3
const ITEM_PANEL_CLOSE_DURATION := 0.2
const SKILLS_DESC_OPEN_DURATION := 0.3
const SKILLS_DESC_CLOSE_DURATION := 0.2

# Internal
var _anim_manager: UIAnimationManager

# =============================================================================
# INITIALIZATION
# =============================================================================

func _ready() -> void:
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	add_to_group("CharacterMenu")
	
	_initialize_animation_manager()
	_setup_blur_background()
	_hide_all_pocket_panels()
	_hide_all_skills_panels()
	_initialize_ui_defaults()


func _initialize_animation_manager() -> void:
	_anim_manager = UIAnimationManager.new()
	
	var success := _anim_manager.initialize(
		animation_player_main_menu,
		hand_animator,
		animation_player_pocket,
		pocket_hand_animator,
		animation_player_skills
	)
	
	if not success:
		push_warning("[CharacterMenu] UIAnimationManager failed to initialize completely")


func _setup_blur_background() -> void:
	if not blur_background:
		return
	
	const SHADER_PATH := "res://assets/styles/blur_background.gdshader"
	
	if ResourceLoader.exists(SHADER_PATH):
		var material := ShaderMaterial.new()
		material.shader = load(SHADER_PATH)
		material.set_shader_parameter("blur_amount", 2.0)
		material.set_shader_parameter("darkness", 0.0)
		blur_background.material = material
	else:
		blur_background.color = Color(0.05, 0.05, 0.1, 0.7)


func _initialize_ui_defaults() -> void:
	if who_select:
		who_select.visible = false
	if mystery_option:
		mystery_option.text = mystery_mode
	if hand:
		hand.visible = true


func _hide_all_pocket_panels() -> void:
	var panels: Array[Control] = [pocket_items, category_selected_node, inventory_panel, item_selected_panel]
	var hands: Array[Sprite2D] = [pocket_hand, inventory_hand]
	
	for panel in panels:
		if panel:
			panel.visible = false
	
	for h in hands:
		if h:
			h.visible = false
	
	# Initialize item detail container for scale animation
	if item_detail_container:
		item_detail_container.pivot_offset = item_detail_container.size / 2.0
		item_detail_container.scale = Vector2(1.0, 0.0)


func _hide_all_skills_panels() -> void:
	if skills_menu:
		skills_menu.visible = false
	if skills_box:
		skills_box.visible = false
	if skills_description_panel:
		skills_description_panel.visible = false
	if skills_hand:
		skills_hand.visible = false
	if who_select:
		who_select.visible = false
	
	# Initialize skills description container for scale animation
	if skills_description_container:
		skills_description_container.pivot_offset = skills_description_container.size / 2.0
		skills_description_container.scale = Vector2(1.0, 0.0)

# =============================================================================
# INPUT HANDLING
# =============================================================================

func _unhandled_input(event: InputEvent) -> void:
	if _handle_menu_toggle(event):
		return
	
	if not is_open:
		return
	
	_route_input_to_state(event)


func _handle_menu_toggle(event: InputEvent) -> bool:
	if not event.is_action_pressed("open_menu") and not event.is_action_pressed("ui_cancel"):
		return false
	
	if not is_open:
		if event.is_action_pressed("open_menu") and _can_open_menu():
			open_menu()
			get_viewport().set_input_as_handled()
			return true
	else:
		_handle_back_action()
		get_viewport().set_input_as_handled()
		return true
	
	return false


func _route_input_to_state(event: InputEvent) -> void:
	match current_menu_state:
		MenuState.MAIN_MENU:
			_handle_main_menu_input(event)
		MenuState.POCKET_CATEGORY:
			_handle_pocket_category_input(event)
		MenuState.POCKET_ITEMS:
			_handle_pocket_items_input(event)
		MenuState.POCKET_DETAIL:
			_handle_pocket_detail_input(event)
		MenuState.SKILLS_CHARACTER_SELECT:
			_handle_skills_character_select_input(event)
		MenuState.SKILLS_LIST:
			_handle_skills_list_input(event)
		MenuState.SKILLS_DETAIL:
			_handle_skills_detail_input(event)


func _handle_main_menu_input(event: InputEvent) -> void:
	var handled := true
	
	if event.is_action_pressed("ui_left"):
		_move_selection(-1)
	elif event.is_action_pressed("ui_right"):
		_move_selection(1)
	elif event.is_action_pressed("ui_accept"):
		_confirm_selection()
	else:
		handled = false
	
	if handled:
		get_viewport().set_input_as_handled()


func _handle_pocket_category_input(event: InputEvent) -> void:
	var handled := true
	
	if event.is_action_pressed("ui_left"):
		_move_pocket_category(-1)
	elif event.is_action_pressed("ui_right"):
		_move_pocket_category(1)
	elif event.is_action_pressed("ui_accept"):
		_select_pocket_category()
	else:
		handled = false
	
	if handled:
		get_viewport().set_input_as_handled()


func _handle_pocket_items_input(event: InputEvent) -> void:
	var handled := true
	
	if event.is_action_pressed("ui_up"):
		_move_pocket_item(-1)
	elif event.is_action_pressed("ui_down"):
		_move_pocket_item(1)
	elif event.is_action_pressed("ui_accept"):
		_select_pocket_item()
	else:
		handled = false
	
	if handled:
		get_viewport().set_input_as_handled()


func _handle_pocket_detail_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):
		_use_selected_item()
		get_viewport().set_input_as_handled()


func _handle_skills_character_select_input(event: InputEvent) -> void:
	var handled := true
	
	if event.is_action_pressed("ui_left"):
		_move_skills_character_selection(-1)
	elif event.is_action_pressed("ui_right"):
		_move_skills_character_selection(1)
	elif event.is_action_pressed("ui_accept"):
		_select_skills_character()
	else:
		handled = false
	
	if handled:
		get_viewport().set_input_as_handled()


func _handle_skills_list_input(event: InputEvent) -> void:
	var handled := true
	
	if event.is_action_pressed("ui_up"):
		_move_skill_selection(-1)
	elif event.is_action_pressed("ui_down"):
		_move_skill_selection(1)
	elif event.is_action_pressed("ui_accept"):
		_select_skill()
	else:
		handled = false
	
	if handled:
		get_viewport().set_input_as_handled()


func _handle_skills_detail_input(_event: InputEvent) -> void:
	pass


func _handle_back_action() -> void:
	match current_menu_state:
		MenuState.MAIN_MENU:
			close_menu()
		MenuState.POCKET_DETAIL:
			_close_item_detail()
		MenuState.POCKET_ITEMS:
			_close_pocket_items()
		MenuState.POCKET_CATEGORY:
			_close_pocket_category()
		MenuState.SKILLS_DETAIL:
			_close_skill_detail()
		MenuState.SKILLS_LIST:
			_close_skills_list()
		MenuState.SKILLS_CHARACTER_SELECT:
			_close_skills_character_select()

# =============================================================================
# MENU CONTROL
# =============================================================================

func _can_open_menu() -> bool:
	if not PartyManager or PartyManager.is_empty():
		return false
	
	var tag_menus := get_tree().get_nodes_in_group("TagMenu")
	for tag_menu in tag_menus:
		if tag_menu.has_method("is_open") and tag_menu.is_open:
			return false
		elif "is_open" in tag_menu and tag_menu.is_open:
			return false
	
	var root := get_tree().root
	if root:
		var tag_menu_node := _find_node_by_script_name(root, "TagMenu")
		if tag_menu_node and "is_open" in tag_menu_node and tag_menu_node.is_open:
			return false
	
	return true


func _find_node_by_script_name(node: Node, script_name: String) -> Node:
	if node.get_script():
		var script_path: String = node.get_script().resource_path
		if script_path.contains(script_name):
			return node
	
	for child in node.get_children():
		var found := _find_node_by_script_name(child, script_name)
		if found:
			return found
	
	return null


func open_menu() -> void:
	if is_open:
		return
	
	is_open = true
	visible = true
	current_menu_state = MenuState.MAIN_MENU
	
	get_tree().paused = true
	
	if PartyManager:
		PartyManager.freeze_party()
	
	_play_sfx(sfx_open_menu)
	_update_party_display()
	_update_mystery_option_for_leader()
	
	selected_option = MenuOption.MYSTERY
	_update_hand_position()
	
	_anim_manager.open_main_menu()
	_anim_manager.play_hand_for_option(selected_option)
	
	menu_opened.emit()


func close_menu() -> void:
	if not is_open:
		return
	
	_play_sfx(sfx_cancel)
	
	_anim_manager.stop_hand_animation()
	var finished_signal := _anim_manager.close_main_menu()
	if finished_signal:
		await finished_signal
	
	is_open = false
	visible = false
	current_menu_state = MenuState.MAIN_MENU
	
	_hide_all_pocket_panels()
	_hide_all_skills_panels()
	
	get_tree().paused = false
	
	if PartyManager:
		PartyManager.unfreeze_party()
	
	menu_closed.emit()

# =============================================================================
# MAIN MENU SELECTION
# =============================================================================

func _move_selection(direction: int) -> void:
	var old_option := selected_option
	var total_options := 5 if options_label else 4
	
	selected_option = wrapi(selected_option + direction, 0, total_options) as MenuOption
	
	if old_option != selected_option:
		_play_sfx(sfx_move)
		_update_hand_position()
		_anim_manager.play_hand_for_option(selected_option)


func _update_hand_position() -> void:
	if not hand or not options_container:
		return
	
	var option_nodes: Array[Label] = [mystery_option, equip_option, pocket_option, skills_option]
	if options_label:
		option_nodes.append(options_label)
	
	if selected_option >= option_nodes.size():
		selected_option = MenuOption.MYSTERY
	
	var target_node: Label = option_nodes[selected_option]
	if not target_node:
		return
	
	var target_x := target_node.global_position.x + target_node.size.x / 2.0
	var target_y := target_node.global_position.y - 20.0
	hand.global_position = Vector2(target_x, target_y)


func _confirm_selection() -> void:
	_play_sfx(sfx_select)
	
	match selected_option:
		MenuOption.MYSTERY:
			_activate_mystery_option()
		MenuOption.EQUIP:
			print("[CharacterMenu] EQUIP selected")
		MenuOption.POCKET:
			_open_pocket_category()
		MenuOption.SKILLS:
			_open_skills_character_select()
		MenuOption.OPTIONS:
			print("[CharacterMenu] OPTIONS selected")


func _activate_mystery_option() -> void:
	option_selected.emit(mystery_mode)
	close_menu()

# =============================================================================
# SKILLS SYSTEM - CHARACTER SELECTION
# =============================================================================

func _open_skills_character_select() -> void:
	current_menu_state = MenuState.SKILLS_CHARACTER_SELECT
	current_skills_character_index = 0
	
	if skills_menu:
		skills_menu.visible = true
	
	if skills_box:
		skills_box.visible = false
	if skills_description_panel:
		skills_description_panel.visible = false
	
	if who_select:
		who_select.visible = true
	
	_set_hand_inactive(hand)
	_update_who_select_position()


func _move_skills_character_selection(direction: int) -> void:
	if not PartyManager:
		return
	
	var party_size := PartyManager.get_party_size()
	if party_size <= 1:
		return
	
	var old_index := current_skills_character_index
	current_skills_character_index = wrapi(current_skills_character_index + direction, 0, party_size)
	
	if old_index != current_skills_character_index:
		_play_sfx(sfx_move)
		_update_who_select_position()


func _update_who_select_position() -> void:
	if not who_select or not PartyManager:
		return
	
	var target_portrait: TextureRect = null
	
	match current_skills_character_index:
		0:
			target_portrait = leader_portrait
		1:
			target_portrait = member_portrait
		2:
			target_portrait = member2_portrait
	
	if target_portrait and target_portrait.visible:
		var target_pos := target_portrait.global_position
		target_pos.y -= 180.0
		target_pos.x -= -20.0
		who_select.global_position = target_pos


func _select_skills_character() -> void:
	if not PartyManager:
		return
	
	var member: PartyMember = PartyManager.get_member_by_index(current_skills_character_index)
	if not member:
		_play_sfx(sfx_denied)
		return
	
	_play_sfx(sfx_select)
	
	_load_character_skills(member.member_name)
	
	if current_character_skills.is_empty():
		_play_sfx(sfx_denied)
		print("[CharacterMenu] %s has no combat skills" % member.member_name)
		return
	
	current_menu_state = MenuState.SKILLS_LIST
	current_skill_index = 0
	
	if skills_menu:
		skills_menu.visible = true
	if skills_box:
		skills_box.visible = true
	if skills_hand:
		skills_hand.visible = true
	
	if who_select:
		who_select.visible = false
	
	# Play the appropriate animation based on selected character
	_anim_manager.open_skills_panel_for_character(current_skills_character_index)
	
	_update_character_profile_ui(member.member_name)
	_update_skills_list_ui()
	_update_skills_hand_position()
	
	# Animate skills description panel
	_animate_skills_description_open()


func _load_character_skills(character_name: String) -> void:
	current_character_skills.clear()
	
	if SkillsManager and SkillsManager.is_loaded():
		current_character_skills = SkillsManager.get_character_combat_skills_data(character_name)
	else:
		push_warning("[CharacterMenu] SkillsManager not available or not loaded")

# =============================================================================
# SKILLS SYSTEM - SKILL LIST NAVIGATION
# =============================================================================

func _move_skill_selection(direction: int) -> void:
	if current_character_skills.is_empty():
		return
	
	var old_index := current_skill_index
	var max_index := current_character_skills.size() - 1
	
	current_skill_index = clampi(current_skill_index + direction, 0, max_index)
	
	if old_index != current_skill_index:
		_play_sfx(sfx_move)
		_update_skills_list_ui()
		_update_skills_hand_position()
		
		if showing_character_profile:
			showing_character_profile = false
		
		_update_skill_description_ui()


func _update_skills_list_ui() -> void:
	if not skills_list_label:
		return
	
	skills_list_label.clear()
	
	for i in range(current_character_skills.size()):
		var skill_data: Dictionary = current_character_skills[i]
		var skill_name: String = skill_data.get("name", "???")
		
		if i == current_skill_index:
			skills_list_label.push_color(Color.GRAY)
			skills_list_label.add_text(" " + skill_name)
			skills_list_label.pop()
		else:
			skills_list_label.add_text("  " + skill_name)
		
		if i < current_character_skills.size() - 1:
			skills_list_label.newline()
	
	# Fill remaining slots with dashes
	for i in range(current_character_skills.size(), 4):
		skills_list_label.newline()
		skills_list_label.push_color(Color(0.5, 0.5, 0.5))
		skills_list_label.add_text("  ------")
		skills_list_label.pop()


func _update_skills_hand_position() -> void:
	if not skills_hand or not skills_list_label:
		return
	
	if current_character_skills.is_empty():
		return
	
	var line_height := skills_list_label.get_theme_font_size("normal_font_size") + 4
	var base_y := 10.0
	var target_y := base_y + (current_skill_index * line_height)
	
	var tween := create_tween()
	tween.tween_property(skills_hand, "position:y", target_y, HAND_MOVE_SPEED)


func _select_skill() -> void:
	if current_character_skills.is_empty():
		return
	
	_play_sfx(sfx_select)
	current_menu_state = MenuState.SKILLS_DETAIL
	
	var skill_data: Dictionary = current_character_skills[current_skill_index]
	var skill_id: String = skill_data.get("id", "")
	var member: PartyMember = PartyManager.get_member_by_index(current_skills_character_index)
	
	if member:
		skill_selected.emit(skill_id, member.member_name)


func _update_skill_description_ui() -> void:
	if current_character_skills.is_empty():
		return
	
	var skill_data: Dictionary = current_character_skills[current_skill_index]
	
	if skill_name_label:
		skill_name_label.clear()
		skill_name_label.add_text(skill_data.get("name", "???"))
	
	if skill_description_label:
		skill_description_label.clear()
		var description: String = skill_data.get("description", "No description available.")
		var juice_cost: int = skill_data.get("juice_cost", 0)
		
		skill_description_label.add_text(description)
		skill_description_label.newline()
		skill_description_label.newline()
		skill_description_label.push_color(Color(1.0, 1.0, 1.0, 1.0))
		skill_description_label.add_text("Cost: %d JUICE" % juice_cost)
		skill_description_label.pop()


func _update_character_profile_ui(character_name: String) -> void:
	if skill_name_label == null or skill_description_label == null:
		push_warning("[CharacterMenu] Skill labels are null, can't show profile")
		return
	
	var profile: Dictionary = {}
	if SkillsManager and SkillsManager.has_method("get_character_profile"):
		profile = SkillsManager.get_character_profile(character_name)
	
	if profile.is_empty():
		push_warning("[CharacterMenu] No profile found for " + character_name)
		showing_character_profile = true
		
		skill_name_label.clear()
		skill_name_label.add_text(character_name.capitalize())
		
		skill_description_label.clear()
		skill_description_label.add_text("No profile information available for this character.")
		return
	
	showing_character_profile = true
	
	var name_text: String = profile.get("name", character_name)
	skill_name_label.clear()
	skill_name_label.add_text(name_text)
	
	skill_description_label.clear()
	
	var desc_text: String = profile.get("description", "")
	var likes: Array = profile.get("likes", [])
	var dislikes: Array = profile.get("dislikes", [])
	
	if not desc_text.is_empty():
		skill_description_label.add_text(desc_text)
	
	if not likes.is_empty():
		skill_description_label.newline()
		skill_description_label.newline()
		skill_description_label.add_text("Likes: ")
		for i in range(likes.size()):
			if i > 0:
				skill_description_label.add_text(", ")
			skill_description_label.add_text(str(likes[i]))
	
	if not dislikes.is_empty():
		skill_description_label.newline()
		skill_description_label.newline()
		skill_description_label.add_text("Dislikes: ")
		for j in range(dislikes.size()):
			if j > 0:
				skill_description_label.add_text(", ")
			skill_description_label.add_text(str(dislikes[j]))

# =============================================================================
# SKILLS SYSTEM - CLOSE HANDLERS
# =============================================================================

func _close_skill_detail() -> void:
	_play_sfx(sfx_cancel)
	
	# Description panel stays visible, just go back to list navigation
	current_menu_state = MenuState.SKILLS_LIST


func _close_skills_list() -> void:
	_play_sfx(sfx_cancel)
	
	# Animate skills description panel close
	await _animate_skills_description_close()
	
	# Play the appropriate close animation based on selected character
	var finished_signal := _anim_manager.close_skills_panel_for_character()
	if finished_signal:
		await finished_signal
	
	if skills_box:
		skills_box.visible = false
	if skills_hand:
		skills_hand.visible = false
	
	current_menu_state = MenuState.SKILLS_CHARACTER_SELECT
	
	if who_select:
		who_select.visible = true
	
	_update_who_select_position()


func _close_skills_character_select() -> void:
	_play_sfx(sfx_cancel)
	
	_hide_all_skills_panels()
	
	current_menu_state = MenuState.MAIN_MENU
	
	_set_hand_active(hand)
	_update_hand_position()
	_anim_manager.play_hand_for_option(selected_option)

# =============================================================================
# POCKET SYSTEM - CATEGORY NAVIGATION
# =============================================================================

func _open_pocket_category() -> void:
	current_menu_state = MenuState.POCKET_CATEGORY
	current_pocket_category = 0
	
	if pocket_items:
		pocket_items.visible = true
	if pocket_hand:
		pocket_hand.visible = true
	
	_set_hand_inactive(hand)
	_set_hand_active(pocket_hand)
	
	_update_pocket_category_hand()
	
	_anim_manager.open_pocket_selection()
	_anim_manager.play_pocket_hand_for_category(current_pocket_category)


func _move_pocket_category(direction: int) -> void:
	var old_category := current_pocket_category
	current_pocket_category = wrapi(current_pocket_category + direction, 0, POCKET_CATEGORIES.size())
	
	if old_category != current_pocket_category:
		_play_sfx(sfx_move)
		_update_pocket_category_hand()
		_anim_manager.play_pocket_hand_for_category(current_pocket_category)


func _update_pocket_category_hand() -> void:
	pass


func _select_pocket_category() -> void:
	_play_sfx(sfx_select)
	_filter_items_by_category()
	
	if filtered_items.is_empty():
		_play_sfx(sfx_denied)
		return
	
	current_menu_state = MenuState.POCKET_ITEMS
	current_item_index = 0
	
	if category_selected_node:
		category_selected_node.visible = true
	if inventory_panel:
		inventory_panel.visible = true
	if inventory_hand:
		inventory_hand.visible = true
	
	_set_hand_inactive(pocket_hand)
	_set_hand_active(inventory_hand)
	
	_update_item_list_ui()
	
	_anim_manager.stop_pocket_hand_animation()
	_anim_manager.open_category_selection()


func _filter_items_by_category() -> void:
	filtered_items.clear()
	
	if not PocketInventory:
		return
	
	var category: PocketInventory.Category = current_pocket_category as PocketInventory.Category
	var all_items: Array = PocketInventory.get_items_by_category(category)
	
	for item in all_items:
		if item is Dictionary:
			filtered_items.append(item)

# =============================================================================
# POCKET SYSTEM - ITEM NAVIGATION
# =============================================================================

func _move_pocket_item(direction: int) -> void:
	if filtered_items.is_empty():
		return
	
	var old_index := current_item_index
	var max_index := filtered_items.size() - 1
	
	current_item_index = clampi(current_item_index + direction, 0, max_index)
	
	if old_index != current_item_index:
		_play_sfx(sfx_move)
		_update_item_list_ui()


func _update_item_list_ui() -> void:
	if not item_list_label:
		return
	
	item_list_label.clear()
	
	for i in range(filtered_items.size()):
		var item_data: Dictionary = filtered_items[i]
		var definition: Dictionary = item_data.get("definition", {})
		var item_name: String = definition.get("name", item_data.get("item_id", "???"))
		var amount: int = item_data.get("amount", 1)
		
		var line := "%s x%d" % [item_name, amount]
		
		if i == current_item_index:
			item_list_label.push_color(Color.GRAY)
			item_list_label.add_text(line)
			item_list_label.pop()
		else:
			item_list_label.add_text(line)
		
		if i < filtered_items.size() - 1:
			item_list_label.newline()
	
	_scroll_to_selected_item()
	_update_inventory_hand_position()


func _scroll_to_selected_item() -> void:
	if not item_list_label:
		return
	
	var line_height := item_list_label.get_theme_font_size("normal_font_size") + 4
	var scroll_position := current_item_index * line_height
	var visible_height := item_list_label.size.y
	
	var target_scroll := scroll_position - (visible_height / 2.0) + (line_height / 2.0)
	target_scroll = maxf(0.0, target_scroll)
	
	item_list_label.get_v_scroll_bar().value = target_scroll


func _update_inventory_hand_position() -> void:
	if not inventory_hand or not item_list_label:
		return
	
	if filtered_items.is_empty():
		return
	
	var line_height := item_list_label.get_theme_font_size("normal_font_size") + 4
	var scroll_offset_px := item_list_label.get_v_scroll_bar().value
	
	var item_y_in_list: float = (current_item_index * line_height) + (line_height / 2.0) - scroll_offset_px
	
	var spacer_height: float = 0.0
	if spacer:
		spacer_height = spacer.size.y
	
	var target_x: float = 30.0
	var target_y: float = spacer_height + item_y_in_list - 5.0
	
	var tween := create_tween()
	tween.tween_property(inventory_hand, "position", Vector2(target_x, target_y), HAND_MOVE_SPEED)


func _select_pocket_item() -> void:
	if filtered_items.is_empty():
		return
	
	_play_sfx(sfx_select)
	current_menu_state = MenuState.POCKET_DETAIL
	
	_set_hand_inactive(inventory_hand)
	_update_item_detail_ui()
	
	await _animate_item_panel_open()


func _update_item_detail_ui() -> void:
	if filtered_items.is_empty():
		return
	
	var item_data: Dictionary = filtered_items[current_item_index]
	var definition: Dictionary = item_data.get("definition", {})
	
	if item_name_label:
		item_name_label.text = definition.get("name", item_data.get("item_id", "???"))
		item_name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	
	if item_description_label:
		item_description_label.text = definition.get("description", "...")
		item_description_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	
	if item_icon_rect:
		var icon = item_data.get("icon", null)
		item_icon_rect.texture = icon if icon is Texture2D else null


func _use_selected_item() -> void:
	if filtered_items.is_empty():
		return
	
	var item_data: Dictionary = filtered_items[current_item_index]
	var item_id: String = item_data.get("item_id", "")
	
	if PocketInventory and not item_id.is_empty():
		PocketInventory.use_item(item_id)
	
	_play_sfx(sfx_select)
	_filter_items_by_category()
	
	if filtered_items.is_empty():
		_close_item_detail()
		_close_pocket_items()
	else:
		current_item_index = clampi(current_item_index, 0, filtered_items.size() - 1)
		_update_item_list_ui()
		_update_item_detail_ui()

# =============================================================================
# POCKET SYSTEM - CLOSE HANDLERS
# =============================================================================

func _close_item_detail() -> void:
	_play_sfx(sfx_cancel)
	
	await _animate_item_panel_close()
	
	current_menu_state = MenuState.POCKET_ITEMS
	_set_hand_active(inventory_hand)


func _close_pocket_items() -> void:
	_play_sfx(sfx_cancel)
	
	var finished_signal := _anim_manager.close_category_selection()
	if finished_signal:
		await finished_signal
	
	if inventory_panel:
		inventory_panel.visible = false
	if category_selected_node:
		category_selected_node.visible = false
	
	_set_hand_invisible(inventory_hand)
	
	current_menu_state = MenuState.POCKET_CATEGORY
	_set_hand_active(pocket_hand)
	_update_pocket_category_hand()
	_anim_manager.play_pocket_hand_for_category(current_pocket_category)


func _close_pocket_category() -> void:
	_play_sfx(sfx_cancel)
	
	_anim_manager.stop_pocket_hand_animation()
	var finished_signal := _anim_manager.close_pocket_selection()
	if finished_signal:
		await finished_signal
	
	_hide_all_pocket_panels()
	current_menu_state = MenuState.MAIN_MENU
	
	_set_hand_active(hand)
	_update_hand_position()
	_anim_manager.play_hand_for_option(selected_option)

# =============================================================================
# ITEM PANEL ANIMATIONS
# =============================================================================

func _animate_item_panel_open() -> void:
	if _is_item_panel_animating or not item_detail_container:
		return
	
	_is_item_panel_animating = true
	
	# Show parent container first
	if item_selected_panel:
		item_selected_panel.visible = true
	
	# Setup initial state for the animated panel
	item_detail_container.pivot_offset = item_detail_container.size / 2.0
	item_detail_container.scale = Vector2(1.0, 0.0)
	
	# Kill existing tween
	if _item_panel_tween and _item_panel_tween.is_valid():
		_item_panel_tween.kill()
	
	# Create open animation with bouncy effect
	_item_panel_tween = create_tween()
	_item_panel_tween.set_ease(Tween.EASE_OUT)
	_item_panel_tween.set_trans(Tween.TRANS_BACK)
	_item_panel_tween.tween_property(item_detail_container, "scale", Vector2(1.0, 1.0), ITEM_PANEL_OPEN_DURATION)
	
	await _item_panel_tween.finished
	_is_item_panel_animating = false


func _animate_item_panel_close() -> void:
	if _is_item_panel_animating or not item_detail_container:
		return
	
	_is_item_panel_animating = true
	
	# Kill existing tween
	if _item_panel_tween and _item_panel_tween.is_valid():
		_item_panel_tween.kill()
	
	# Create close animation
	_item_panel_tween = create_tween()
	_item_panel_tween.set_ease(Tween.EASE_IN)
	_item_panel_tween.set_trans(Tween.TRANS_BACK)
	_item_panel_tween.tween_property(item_detail_container, "scale", Vector2(1.0, 0.0), ITEM_PANEL_CLOSE_DURATION)
	
	await _item_panel_tween.finished
	
	# Hide parent container after animation
	if item_selected_panel:
		item_selected_panel.visible = false
	_is_item_panel_animating = false


func _animate_skills_description_open() -> void:
	if _is_skills_desc_animating or not skills_description_container:
		return
	
	_is_skills_desc_animating = true
	
	# Delay for member and member2 (wait for their panel animation)
	if current_skills_character_index > 0:
		await get_tree().create_timer(0.25).timeout
	
	# Setup initial state
	skills_description_container.pivot_offset = skills_description_container.size / 2.0
	skills_description_container.scale = Vector2(1.0, 0.0)
	skills_description_container.visible = true
	
	# Kill existing tween
	if _skills_desc_tween and _skills_desc_tween.is_valid():
		_skills_desc_tween.kill()
	
	# Create open animation with bouncy effect
	_skills_desc_tween = create_tween()
	_skills_desc_tween.set_ease(Tween.EASE_OUT)
	_skills_desc_tween.set_trans(Tween.TRANS_BACK)
	_skills_desc_tween.tween_property(skills_description_container, "scale", Vector2(1.0, 1.0), SKILLS_DESC_OPEN_DURATION)
	
	await _skills_desc_tween.finished
	_is_skills_desc_animating = false


func _animate_skills_description_close() -> void:
	if _is_skills_desc_animating or not skills_description_container:
		return
	
	_is_skills_desc_animating = true
	
	# Kill existing tween
	if _skills_desc_tween and _skills_desc_tween.is_valid():
		_skills_desc_tween.kill()
	
	# Create close animation
	_skills_desc_tween = create_tween()
	_skills_desc_tween.set_ease(Tween.EASE_IN)
	_skills_desc_tween.set_trans(Tween.TRANS_BACK)
	_skills_desc_tween.tween_property(skills_description_container, "scale", Vector2(1.0, 0.0), SKILLS_DESC_CLOSE_DURATION)
	
	await _skills_desc_tween.finished
	
	skills_description_container.visible = false
	_is_skills_desc_animating = false

# =============================================================================
# HAND HELPERS
# =============================================================================

func _set_hand_active(target_hand: Sprite2D) -> void:
	if target_hand and is_instance_valid(target_hand):
		target_hand.modulate = Color.WHITE
		target_hand.visible = true


func _set_hand_inactive(target_hand: Sprite2D) -> void:
	if target_hand and is_instance_valid(target_hand):
		target_hand.modulate = Color(0.5, 0.5, 0.5, 1.0)
		if target_hand == hand:
			_anim_manager.stop_hand_animation()
		elif target_hand == pocket_hand:
			_anim_manager.stop_pocket_hand_animation()


func _set_hand_invisible(target_hand: Sprite2D) -> void:
	if target_hand and is_instance_valid(target_hand):
		target_hand.visible = false

# =============================================================================
# PARTY DISPLAY
# =============================================================================

func _update_party_display() -> void:
	if not PartyManager or PartyManager.is_empty():
		return
	
	var leader: PartyMember = PartyManager.get_leader()
	var members: Array[PartyMember] = PartyManager.members
	
	if leader:
		_update_leader_display(leader)
	
	var has_second := members.size() > 1
	var has_third := members.size() > 2
	
	_set_member_visibility(has_second)
	_set_member2_visibility(has_third)
	
	if has_second:
		_update_member_display(members[1])
	if has_third:
		_update_member2_display(members[2])
	
	_update_coins_display()


func _set_member_visibility(visible_state: bool) -> void:
	var nodes: Array[Node] = [member_stats, member_stats_bar, member_lvl_bar, member_portrait, member_cover]
	for node in nodes:
		if node:
			node.visible = visible_state


func _set_member2_visibility(visible_state: bool) -> void:
	var nodes: Array[Node] = [member2_stats, member2_stats_bar, member2_lvl_bar, member2_portrait, member2_cover]
	for node in nodes:
		if node:
			node.visible = visible_state


func _update_leader_display(leader: PartyMember) -> void:
	if leader_name_label:
		leader_name_label.text = leader.display_name.to_upper()
	if leader_portrait:
		_set_portrait(leader_portrait, leader)
	if leader_heart_bar:
		leader_heart_bar.max_value = leader.max_hp
		leader_heart_bar.value = leader.hp
	if leader_lvl_bar:
		leader_lvl_bar.value = 50


func _update_member_display(member: PartyMember) -> void:
	if member_name_label:
		member_name_label.text = member.display_name.to_upper()
	if member_portrait:
		_set_portrait(member_portrait, member)
	if member_heart_bar:
		member_heart_bar.max_value = member.max_hp
		member_heart_bar.value = member.hp
	if member_lvl_bar:
		member_lvl_bar.value = 50


func _update_member2_display(member: PartyMember) -> void:
	if member2_name_label:
		member2_name_label.text = member.display_name.to_upper()
	if member2_portrait:
		_set_portrait(member2_portrait, member)
	if member2_heart_bar:
		member2_heart_bar.max_value = member.max_hp
		member2_heart_bar.value = member.hp
	if member2_lvl_bar:
		member2_lvl_bar.value = 50


func _set_portrait(portrait_rect: TextureRect, member: PartyMember) -> void:
	if not portrait_rect or not member:
		return
	
	if member.portrait_texture:
		portrait_rect.texture = member.portrait_texture
		return
	
	var paths: Array[String] = [
		"res://assets/player/$%s_MENU.png" % member.member_name.to_upper(),
		"res://assets/player/$%s_TAG.png" % member.member_name.to_upper()
	]
	
	for path in paths:
		if ResourceLoader.exists(path):
			portrait_rect.texture = load(path)
			return


func _update_coins_display() -> void:
	if coins_label:
		coins_label.text = "%05d" % current_coins

# =============================================================================
# MYSTERY OPTION
# =============================================================================

func _update_mystery_option_for_leader() -> void:
	if not PartyManager or PartyManager.is_empty():
		return
	
	var leader: PartyMember = PartyManager.get_leader()
	if not leader:
		return
	
	var ability := _get_leader_ability(leader)
	set_mystery_mode(ability)


func _get_leader_ability(leader: PartyMember) -> String:
	match leader.member_name.to_lower():
		"hikiko":
			return _get_hikiko_ability(leader)
		"rainy":
			return "BOOK" if PocketInventory and PocketInventory.has_item("memory_book") else "FOCUS"
		"stranger":
			return "???"
	return "???"


func _get_hikiko_ability(leader: PartyMember) -> String:
	if leader.has_method("get_current_mystery_ability"):
		var custom: String = leader.get_current_mystery_ability()
		if not custom.is_empty():
			return custom
	
	if PocketInventory:
		if PocketInventory.has_item("smash_hikiko"):
			return "SMASH"
		if PocketInventory.has_item("throw_hikiko"):
			return "THROW"
	
	return "HEADBUTT"

# =============================================================================
# PUBLIC API
# =============================================================================

func set_mystery_mode(mode: String) -> void:
	if mode in VALID_MYSTERY_MODES:
		mystery_mode = mode
		if mystery_option:
			mystery_option.text = mystery_mode


func set_coins(amount: int) -> void:
	current_coins = maxi(0, amount)
	_update_coins_display()


func refresh_display() -> void:
	if is_open:
		_update_party_display()
		_update_mystery_option_for_leader()


func get_animation_manager() -> UIAnimationManager:
	return _anim_manager

# =============================================================================
# UTILITY HELPERS
# =============================================================================

func _play_sfx(player: AudioStreamPlayer) -> void:
	if player:
		player.play()
