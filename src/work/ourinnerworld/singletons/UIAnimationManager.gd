class_name UIAnimationManager
extends RefCounted
## UIAnimationManager - Centralized UI animation system for the menu
## Handles all animations in an organized and efficient manner

# =============================================================================
# ENUMS
# =============================================================================

enum MainMenuAnim { OPEN, CLOSE }
enum HandAnim { ACTION, EQUIP, POCKET, SKILLS, OPTIONS }
enum PocketPanelAnim { POCKET_OPEN, POCKET_CLOSE, CATEGORY_OPEN, CATEGORY_CLOSE }
enum PocketHandAnim { SNACKS, TOYS, IMPORTANT }
enum SkillsPanelAnim { 
	LEADER_SELECTED, 
	LEADER_SELECTED_CLOSE,
	MEMBER_SELECTED,
	MEMBER_SELECTED_CLOSE,
	MEMBER2_SELECTED,
	MEMBER2_SELECTED_CLOSE
}

# =============================================================================
# ANIMATION NAME CONSTANTS
# =============================================================================

const MAIN_MENU_ANIMS: Dictionary = {
	MainMenuAnim.OPEN: "open_main_menu",
	MainMenuAnim.CLOSE: "close_main_menu"
}

const HAND_ANIMS: Dictionary = {
	HandAnim.ACTION: "action",
	HandAnim.EQUIP: "equip",
	HandAnim.POCKET: "pocket",
	HandAnim.SKILLS: "skills",
	HandAnim.OPTIONS: "options"
}

const POCKET_PANEL_ANIMS: Dictionary = {
	PocketPanelAnim.POCKET_OPEN: "pocket_selected",
	PocketPanelAnim.POCKET_CLOSE: "pocket_selected_close",
	PocketPanelAnim.CATEGORY_OPEN: "category_selected",
	PocketPanelAnim.CATEGORY_CLOSE: "category_selected_close"
}

const POCKET_HAND_ANIMS: Dictionary = {
	PocketHandAnim.SNACKS: "snacks",
	PocketHandAnim.TOYS: "toys",
	PocketHandAnim.IMPORTANT: "important"
}

const SKILLS_PANEL_ANIMS: Dictionary = {
	SkillsPanelAnim.LEADER_SELECTED: "leader_selected",
	SkillsPanelAnim.LEADER_SELECTED_CLOSE: "leader_selected_close",
	SkillsPanelAnim.MEMBER_SELECTED: "member_selected",
	SkillsPanelAnim.MEMBER_SELECTED_CLOSE: "member_selected_close",
	SkillsPanelAnim.MEMBER2_SELECTED: "member2_selected",
	SkillsPanelAnim.MEMBER2_SELECTED_CLOSE: "member2_selected_close"
}

## Maps category index to pocket hand animation
const CATEGORY_TO_HAND_MAP: Dictionary = {
	0: PocketHandAnim.SNACKS,
	1: PocketHandAnim.TOYS,
	2: PocketHandAnim.IMPORTANT
}

## Maps MenuOption index to hand animation
const MENU_OPTION_TO_HAND_MAP: Dictionary = {
	0: HandAnim.ACTION,
	1: HandAnim.EQUIP,
	2: HandAnim.POCKET,
	3: HandAnim.SKILLS,
	4: HandAnim.OPTIONS
}

## Maps character index to skills panel animation (open)
const CHARACTER_TO_SKILLS_OPEN_MAP: Dictionary = {
	0: SkillsPanelAnim.LEADER_SELECTED,
	1: SkillsPanelAnim.MEMBER_SELECTED,
	2: SkillsPanelAnim.MEMBER2_SELECTED
}

## Maps character index to skills panel animation (close)
const CHARACTER_TO_SKILLS_CLOSE_MAP: Dictionary = {
	0: SkillsPanelAnim.LEADER_SELECTED_CLOSE,
	1: SkillsPanelAnim.MEMBER_SELECTED_CLOSE,
	2: SkillsPanelAnim.MEMBER2_SELECTED_CLOSE
}

# =============================================================================
# ANIMATION PLAYER REFERENCES
# =============================================================================

var _main_menu_player: AnimationPlayer
var _hand_player: AnimationPlayer
var _pocket_panel_player: AnimationPlayer
var _pocket_hand_player: AnimationPlayer
var _skills_panel_player: AnimationPlayer

var _is_initialized := false
var _current_character_index := 0

# =============================================================================
# SIGNALS
# =============================================================================

signal animation_started(anim_name: String)
signal animation_finished(anim_name: String)

# =============================================================================
# INITIALIZATION
# =============================================================================

func initialize(
	main_menu_player: AnimationPlayer,
	hand_player: AnimationPlayer,
	pocket_panel_player: AnimationPlayer,
	pocket_hand_player: AnimationPlayer,
	skills_panel_player: AnimationPlayer = null
) -> bool:
	_main_menu_player = main_menu_player
	_hand_player = hand_player
	_pocket_panel_player = pocket_panel_player
	_pocket_hand_player = pocket_hand_player
	_skills_panel_player = skills_panel_player
	
	_is_initialized = _validate_players()
	
	if not _is_initialized:
		push_warning("[UIAnimationManager] Some AnimationPlayers are not configured correctly")
	
	return _is_initialized


func set_skills_player(player: AnimationPlayer) -> void:
	_skills_panel_player = player


func is_ready() -> bool:
	return _is_initialized

# =============================================================================
# MAIN MENU ANIMATIONS
# =============================================================================

func open_main_menu() -> void:
	_play_animation(_main_menu_player, MAIN_MENU_ANIMS[MainMenuAnim.OPEN])


func close_main_menu() -> Signal:
	return _play_and_await(_main_menu_player, MAIN_MENU_ANIMS[MainMenuAnim.CLOSE])

# =============================================================================
# HAND ANIMATIONS (Main Menu)
# =============================================================================

func play_hand_animation(anim: HandAnim) -> void:
	if HAND_ANIMS.has(anim):
		_play_animation(_hand_player, HAND_ANIMS[anim])


func play_hand_for_option(option_index: int) -> void:
	if MENU_OPTION_TO_HAND_MAP.has(option_index):
		play_hand_animation(MENU_OPTION_TO_HAND_MAP[option_index])


func stop_hand_animation() -> void:
	_stop_animation(_hand_player)

# =============================================================================
# POCKET PANEL ANIMATIONS
# =============================================================================

func open_pocket_selection() -> void:
	_play_animation(_pocket_panel_player, POCKET_PANEL_ANIMS[PocketPanelAnim.POCKET_OPEN])


func close_pocket_selection() -> Signal:
	return _play_and_await(_pocket_panel_player, POCKET_PANEL_ANIMS[PocketPanelAnim.POCKET_CLOSE])


func open_category_selection() -> void:
	_play_animation(_pocket_panel_player, POCKET_PANEL_ANIMS[PocketPanelAnim.CATEGORY_OPEN])


func close_category_selection() -> Signal:
	return _play_and_await(_pocket_panel_player, POCKET_PANEL_ANIMS[PocketPanelAnim.CATEGORY_CLOSE])

# =============================================================================
# POCKET HAND ANIMATIONS
# =============================================================================

func play_pocket_hand(anim: PocketHandAnim) -> void:
	if POCKET_HAND_ANIMS.has(anim):
		_play_animation(_pocket_hand_player, POCKET_HAND_ANIMS[anim])


func play_pocket_hand_for_category(category_index: int) -> void:
	if CATEGORY_TO_HAND_MAP.has(category_index):
		play_pocket_hand(CATEGORY_TO_HAND_MAP[category_index])


func stop_pocket_hand_animation() -> void:
	_stop_animation(_pocket_hand_player)

# =============================================================================
# SKILLS PANEL ANIMATIONS
# =============================================================================

## Opens the skills panel with the appropriate animation for the selected character
func open_skills_panel_for_character(character_index: int) -> void:
	if not _skills_panel_player:
		push_warning("[UIAnimationManager] skills_panel_player not configured")
		return
	
	_current_character_index = clampi(character_index, 0, 2)
	
	if CHARACTER_TO_SKILLS_OPEN_MAP.has(_current_character_index):
		var anim_enum: SkillsPanelAnim = CHARACTER_TO_SKILLS_OPEN_MAP[_current_character_index]
		_play_animation(_skills_panel_player, SKILLS_PANEL_ANIMS[anim_enum])


## Closes the skills panel with the appropriate animation for the current character
func close_skills_panel_for_character() -> Signal:
	if not _skills_panel_player:
		push_warning("[UIAnimationManager] skills_panel_player not configured")
		return Signal()
	
	if CHARACTER_TO_SKILLS_CLOSE_MAP.has(_current_character_index):
		var anim_enum: SkillsPanelAnim = CHARACTER_TO_SKILLS_CLOSE_MAP[_current_character_index]
		return _play_and_await(_skills_panel_player, SKILLS_PANEL_ANIMS[anim_enum])
	
	return Signal()


## Opens the skills panel for the leader (backwards compatibility)
func open_skills_panel() -> void:
	open_skills_panel_for_character(0)


## Closes the skills panel (backwards compatibility)
func close_skills_panel() -> Signal:
	return close_skills_panel_for_character()


## Alias for opening leader's skills panel (backwards compatibility)
func play_leader_selected() -> void:
	open_skills_panel_for_character(0)


## Alias for closing leader's skills panel (backwards compatibility)
func play_leader_selected_close() -> Signal:
	return close_skills_panel_for_character()


## Opens the skills panel for member (second party member)
func play_member_selected() -> void:
	open_skills_panel_for_character(1)


## Closes the skills panel for member
func play_member_selected_close() -> Signal:
	_current_character_index = 1
	return close_skills_panel_for_character()


## Opens the skills panel for member2 (third party member)
func play_member2_selected() -> void:
	open_skills_panel_for_character(2)


## Closes the skills panel for member2
func play_member2_selected_close() -> Signal:
	_current_character_index = 2
	return close_skills_panel_for_character()

# =============================================================================
# UTILITY METHODS
# =============================================================================

func has_animation(player: AnimationPlayer, anim_name: String) -> bool:
	return player != null and player.has_animation(anim_name)


func get_animation_length(player: AnimationPlayer, anim_name: String) -> float:
	if has_animation(player, anim_name):
		return player.get_animation(anim_name).length
	return 0.0


func reset_player(player: AnimationPlayer) -> void:
	if player and player.has_animation("RESET"):
		player.play("RESET")


func get_current_character_index() -> int:
	return _current_character_index

# =============================================================================
# PRIVATE METHODS
# =============================================================================

func _validate_players() -> bool:
	var required_players: Dictionary = {
		"main_menu_player": _main_menu_player,
		"hand_player": _hand_player,
		"pocket_panel_player": _pocket_panel_player,
		"pocket_hand_player": _pocket_hand_player
	}
	
	var all_valid := true
	
	for player_name in required_players:
		if not required_players[player_name]:
			push_warning("[UIAnimationManager] %s is null" % player_name)
			all_valid = false
	
	# skills_panel_player is optional
	return all_valid


func _play_animation(player: AnimationPlayer, anim_name: String) -> void:
	if not player:
		push_warning("[UIAnimationManager] Player is null when trying to play: %s" % anim_name)
		return
	
	if not player.has_animation(anim_name):
		push_warning("[UIAnimationManager] Animation not found: %s" % anim_name)
		return
	
	player.play(anim_name)
	animation_started.emit(anim_name)


func _play_and_await(player: AnimationPlayer, anim_name: String) -> Signal:
	_play_animation(player, anim_name)
	
	if player and player.has_animation(anim_name):
		return player.animation_finished
	
	return Signal()


func _stop_animation(player: AnimationPlayer) -> void:
	if player:
		player.stop()
