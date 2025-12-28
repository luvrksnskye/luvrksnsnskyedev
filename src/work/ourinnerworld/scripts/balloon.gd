extends CanvasLayer

# =========================================================
# === EXPORTS =============================================
# =========================================================
@export var next_action: StringName = &"ui_accept"
@export var skip_action: StringName = &"ui_cancel"

# =========================================================
# === VARIABLES PRINCIPALES ===============================
# =========================================================
var resource: DialogueResource
var temporary_game_states: Array = []
var is_waiting_for_input: bool = false
var will_hide_balloon: bool = false
var locals: Dictionary = {}
var _locale: String = TranslationServer.get_locale()

# Sistema de emotion bubbles
var active_character_node: Node = null
var current_bubble_emotion: String = ""
var emotion_bubble_timer: Timer

# Cache de personajes y texturas
var character_cache: Dictionary = {}
var loaded_textures: Dictionary = {}

# Timers
var mutation_cooldown: Timer = Timer.new()

# =========================================================
# === DIALOGUE LINE =======================================
# =========================================================
var dialogue_line: DialogueLine:
	set(value):
		if value:
			dialogue_line = value
			apply_dialogue_line()
		else:
			queue_free()
	get:
		return dialogue_line

# =========================================================
# === NODOS (ONREADY) =====================================
# =========================================================
@onready var balloon: Control = %Balloon
@onready var character_label: RichTextLabel = %CharacterLabel
@onready var portrait: TextureRect = %Portrait
@onready var dialogue_label: DialogueLabel = %DialogueLabel
@onready var progress_hand: Sprite2D = %Progress
@onready var responses_menu = %ResponsesMenu

# Containers para ocultar con NONE y ???
@onready var margin_container_2: MarginContainer = $Balloon/MarginContainer2
@onready var margin_container_3: MarginContainer = $Balloon/MarginContainer3

# Audio nodes
@onready var talk_sound_1: AudioStreamPlayer = $"talk-sound1"
@onready var talk_sound_2: AudioStreamPlayer = $"talk-sound2"
@onready var talk_sound_3: AudioStreamPlayer = $"talk-sound3"
@onready var talk_sound_4: AudioStreamPlayer = $"talk-sound4"
@onready var talk_sound_5: AudioStreamPlayer = $"talk-sound5"
@onready var talk_sound_unknown: AudioStreamPlayer = $talk_sound_unknown


# =========================================================
# === SISTEMA DE AUDIO ====================================
# =========================================================
var talk_sounds: Array[AudioStreamPlayer] = []
var current_sound_index: int = 0
var last_sound_time: float = 0.0
var sound_interval: float = 0.03
var base_pitch: float = 1.0
var pitch_variation: float = 0.1
var volume_variation: float = 1.5

# =========================================================
# === REGEX PATTERNS ======================================
# =========================================================
var bubble_regex: RegEx
var color_regex: RegEx
var emotion_regex: RegEx
var no_portrait_regex: RegEx

# =========================================================
# === CONSTANTES ==========================================
# =========================================================
const PASTEL_COLORS = {
	"YELLOW": "#FFE6A3",
	"ORANGE": "#FFD1A3",
	"BLUE": "#A3D1FF",
	"PURPLE": "#D1A3FF"
}

const EMOTION_BUBBLE_DURATION = 4.5
const SOUND_FADE_DURATION = 0.1

# =========================================================
# === ATLAS DE PORTRAITS ==================================
# =========================================================
const PORTRAIT_ATLAS = {
	"RAINY": {
		"texture": "res://assets/player/RAINY_DREAM_FACES.png",
		"sprite_size": Vector2(106, 106),
		"columns": 5,
		"emotions": {
			"funny": 0, "question": 1, "serious": 2, "smile": 3, "nerves": 4,
			"neutral": 5, "doubtful": 6, "surprised": 7, "happy": 8, "worried": 9,
			"sad": 10, "miserable": 11, "crying": 12, "trauma": 13, "furious": 14,
			"angry": 15, "calm": 16, "shocked": 17, "silent": 18, "scared": 19
		}
	},
	"STRANGER": {
		"texture": "res://assets/player/STRANGER_DREAM_FACES.png",
		"sprite_size": Vector2(106, 106),
		"columns": 4,
		"emotions": {
			# Fila 0 (0-3)
			"hurt": 0, "furious": 1, "angry": 2, "scared": 3,
			# Fila 1 (4-7)
			"neutral_spaceworld": 4, "nervous": 5, "neutral": 6, "doubtful": 7,
			# Fila 2 (8-11)
			"nervous_pumpkin": 8, "neutral_pumpkin": 9, "embarrassed": 10, "sad": 11,
			# Fila 3 (12-15)
			"neutral_colored": 12, "relaxed": 13, "irritated": 14, "sorry": 15,
			# Fila 4 (16-19)
			"neutral_chef": 16, "irritated_chef": 17, "stunned_chef": 18, "annoyed_chef": 19,
			# Fila 5 (20-23)
			"neutral_snowyworld": 20, "suspicious": 21, "tired": 22, "sadistic": 23,
			# Fila 6 (24-27)
			"intimidate": 24, "sadistic_smile": 25, "smile_snowyworld": 26, "silly_snowyworld": 27
		}
	},
	"HIKORI": {
		"texture": "res://assets/portraits/hikori_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0, "happy": 1, "excited": 2, "surprised": 3,
			"worried": 4, "sad": 5, "embarrassed": 6, "determined": 7
		}
	},
	"SKYE": {
		"texture": "res://assets/portraits/skye_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0, "happy": 1, "confident": 2, "worried": 3,
			"sad": 4, "surprised": 5, "annoyed": 6, "smug": 7
		}
	},
	"HIKIKO": {
		"texture": "res://assets/portraits/hikiko_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0, "shy": 1, "embarrassed": 2, "happy": 3,
			"worried": 4, "surprised": 5, "sad": 6, "scared": 7
		}
	},
	"HER": {
		"texture": "res://assets/portraits/makomi_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0, "happy": 1, "sad": 2, "angry": 3,
			"calm": 4, "surprised": 5, "worried": 6, "smug": 7
		}
	}
}

# =========================================================
# === PERSONAJES PREDEFINIDOS =============================
# =========================================================
const PREDEFINED_CHARACTERS = {
	"RAINY": {
		"id": "char_rainy",
		"path": "res://scenes/Player.tscn"
	},
	"STRANGER": {
		"id": "char_stranger",
		"path": "res://scenes/Stranger.tscn"
	},
	"HIKORI": {
		"id": "char_hikori",
		"path": "res://scenes/Hikori.tscn"
	},
	"SKYE": {
		"id": "char_skye",
		"path": "res://scenes/skye.tscn"
	},
	"HIKIKO": {
		"id": "char_hikiko",
		"path": "res://scenes/Hikiko.tscn"
	},
	"HER": {
		"id": "char_makomi",
		"path": "res://scenes/makomi.tscn"
	}
}

# Variables de animación
var balloon_tween: Tween
var is_animating: bool = false

# =========================================================
# === READY ===============================================
# =========================================================
func _ready() -> void:
	_setup_balloon()
	_setup_dialogue_manager()
	_setup_timers()
	_setup_audio_system()
	_setup_portrait_system()
	_setup_emotion_system()
	_setup_color_system()
	
	if progress_hand:
		progress_hand.hide()

func _setup_balloon() -> void:
	balloon.hide()
	balloon.scale = Vector2(1.0, 0.0)
	balloon.pivot_offset = balloon.size / 2.0

func _setup_dialogue_manager() -> void:
	Engine.get_singleton("DialogueManager").mutated.connect(_on_mutated)
	if responses_menu.next_action.is_empty():
		responses_menu.next_action = next_action

func _setup_timers() -> void:
	mutation_cooldown.timeout.connect(_on_mutation_cooldown_timeout)
	add_child(mutation_cooldown)
	
	emotion_bubble_timer = Timer.new()
	emotion_bubble_timer.one_shot = true
	emotion_bubble_timer.timeout.connect(_hide_emotion_bubble)
	add_child(emotion_bubble_timer)

func _setup_audio_system() -> void:
	talk_sounds = [talk_sound_1, talk_sound_2, talk_sound_3, talk_sound_4, talk_sound_5]
	
	for sound in talk_sounds:
		sound.volume_db = -10.0
		sound.pitch_scale = 1.0
	
	# Configurar sonidos especiales
	if talk_sound_unknown:
		talk_sound_unknown.volume_db = -12.0

func _setup_portrait_system() -> void:
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_CENTERED
	portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	portrait.custom_minimum_size = Vector2(106, 106)
	_preload_common_textures()

func _preload_common_textures() -> void:
	for character in ["RAINY", "STRANGER", "HIKORI", "SKYE", "HIKIKO"]:
		if character in PORTRAIT_ATLAS:
			_load_texture(character)

func _setup_emotion_system() -> void:
	bubble_regex = RegEx.new()
	bubble_regex.compile("\\[BUBBLE=[^\\]]+\\]")
	
	emotion_regex = RegEx.new()
	emotion_regex.compile("\\[emotion=([^\\]]+)\\]")
	
	no_portrait_regex = RegEx.new()
	no_portrait_regex.compile("\\[no_portrait\\]")

func _setup_color_system() -> void:
	color_regex = RegEx.new()
	color_regex.compile("\\{([^/]+)\\s*/\\s*color:\\s*(YELLOW|ORANGE|BLUE|PURPLE)\\s*\\}")

# =========================================================
# === INPUT / NOTIFICATION ================================
# =========================================================
func _unhandled_input(_event: InputEvent) -> void:
	get_viewport().set_input_as_handled()

func _notification(what: int) -> void:
	if what == NOTIFICATION_TRANSLATION_CHANGED and _locale != TranslationServer.get_locale() and is_instance_valid(dialogue_label):
		_locale = TranslationServer.get_locale()
		var visible_ratio = dialogue_label.visible_ratio
		self.dialogue_line = await resource.get_next_dialogue_line(dialogue_line.id)
		if visible_ratio < 1:
			dialogue_label.skip_typing()

# =========================================================
# === START / APPLY =======================================
# =========================================================
func start(dialogue_resource: DialogueResource, title: String, extra_game_states: Array = []) -> void:
	temporary_game_states = [self] + extra_game_states
	is_waiting_for_input = false
	resource = dialogue_resource
	self.dialogue_line = await resource.get_next_dialogue_line(title, temporary_game_states)

# =========================================================
# === ANIMACIONES =========================================
# =========================================================
func _animate_balloon_open() -> void:
	if is_animating:
		return
	
	is_animating = true
	balloon.show()
	
	if balloon_tween and balloon_tween.is_valid():
		balloon_tween.kill()
	
	balloon_tween = create_tween()
	balloon_tween.set_ease(Tween.EASE_OUT)
	balloon_tween.set_trans(Tween.TRANS_BACK)
	balloon_tween.tween_property(balloon, "scale", Vector2(1.0, 1.0), 0.3)
	await balloon_tween.finished
	
	is_animating = false

func _animate_balloon_close() -> void:
	if is_animating:
		return
	
	is_animating = true
	_hide_emotion_bubble()
	
	if balloon_tween and balloon_tween.is_valid():
		balloon_tween.kill()
	
	balloon_tween = create_tween()
	balloon_tween.set_ease(Tween.EASE_IN)
	balloon_tween.set_trans(Tween.TRANS_BACK)
	balloon_tween.tween_property(balloon, "scale", Vector2(1.0, 0.0), 0.2)
	await balloon_tween.finished
	
	balloon.hide()
	is_animating = false

# =========================================================
# === APPLY DIALOGUE LINE =================================
# =========================================================
func apply_dialogue_line() -> void:
	if not is_instance_valid(dialogue_line):
		return
	
	_animate_balloon_open()
	
	# Configurar texto y personaje
	var processed_text = _process_text_colors(dialogue_line.text)
	processed_text = _remove_bubble_tags(processed_text)
	processed_text = _remove_emotion_tags(processed_text)
	
	# Configurar nombre del personaje
	_setup_character_label()
	
	dialogue_label.hide()
	dialogue_label.dialogue_line = dialogue_line
	dialogue_label.custom_minimum_size = Vector2.ZERO
	
	# Manejar portrait
	_handle_portrait()
	
	# Configurar sistema de audio
	_reset_sound_system()
	_configure_typing_speed()
	
	# Configurar respuestas
	responses_menu.hide()
	
	# Manejar emotion bubbles
	_handle_emotion_bubbles()
	
	# Mostrar diálogo
	await get_tree().process_frame
	dialogue_label.show()
	dialogue_label.type_out()
	await dialogue_label.finished_typing
	
	# Auto-advance o esperar input
	if dialogue_line.responses.size() > 0:
		balloon.focus_mode = Control.FOCUS_NONE
		responses_menu.show()
		_configure_menu(dialogue_line.responses)
	elif dialogue_line.time != "":
		var time = _calculate_auto_advance_time()
		_show_progress_hand()
		await get_tree().create_timer(time).timeout
		next(dialogue_line.next_id)
	else:
		is_waiting_for_input = true
		balloon.focus_mode = Control.FOCUS_ALL
		balloon.grab_focus()
		_show_progress_hand()

# =========================================================
# === PORTRAIT SYSTEM =====================================
# =========================================================
func _handle_portrait() -> void:
	var no_portrait_match = no_portrait_regex.search(dialogue_line.text)
	if no_portrait_match:
		portrait.hide()
		return
	
	var character = dialogue_line.character.to_upper()
	
	# NONE no tiene portrait
	if character == "NONE" or character.is_empty():
		portrait.hide()
		return
	
	if not character in PORTRAIT_ATLAS:
		portrait.hide()
		return
	
	var emotion = _extract_emotion_from_line()
	_show_portrait_from_atlas(character, emotion)

func _setup_character_label() -> void:
	character_label.visible = not dialogue_line.character.is_empty()
	
	# Ocultar MarginContainers según el personaje
	var character_upper = dialogue_line.character.to_upper()
	
	# NONE: oculta ambos contenedores
	# ???: solo oculta MarginContainer3, MarginContainer2 permanece visible
	if character_upper == "NONE":
		if margin_container_2:
			margin_container_2.visible = false
		if margin_container_3:
			margin_container_3.visible = false
	elif character_upper == "???":
		if margin_container_2:
			margin_container_2.visible = true  # ??? tiene MarginContainer2
		if margin_container_3:
			margin_container_3.visible = false
	else:
		# Todos los demás personajes: mostrar ambos contenedores
		if margin_container_2:
			margin_container_2.visible = true
		if margin_container_3:
			margin_container_3.visible = true
	
	if dialogue_line.character.is_empty():
		return
	
	# Limpiar overrides previos
	character_label.remove_theme_color_override("default_color")
	character_label.remove_theme_color_override("font_color")
	
	# Forzar color blanco usando BBCode
	character_label.bbcode_enabled = true
	character_label.text = "[color=#FFFFFF]" + dialogue_line.character + "[/color]"
	
	# También aplicar theme override como respaldo
	character_label.add_theme_color_override("default_color", Color.WHITE)
	character_label.add_theme_color_override("font_color", Color.WHITE)

func _extract_emotion_from_line() -> String:
	var emotion_match = emotion_regex.search(dialogue_line.text)
	if emotion_match:
		return emotion_match.get_string(1).to_lower()
	
	for tag in dialogue_line.tags:
		if tag.begins_with("emotion="):
			return tag.split("=")[1].to_lower()
	
	return "neutral"

func _show_portrait_from_atlas(character: String, emotion: String) -> void:
	if not character in PORTRAIT_ATLAS:
		portrait.hide()
		return
	
	var atlas_data = PORTRAIT_ATLAS[character]
	var emotions = atlas_data["emotions"]
	
	if not emotion in emotions:
		emotion = "neutral"
	
	var sprite_index = emotions[emotion]
	var texture = _load_texture(character)
	
	if not texture:
		portrait.hide()
		return
	
	var atlas_texture = AtlasTexture.new()
	atlas_texture.atlas = texture
	
	var sprite_size = atlas_data["sprite_size"]
	var columns = atlas_data["columns"]
	var row = sprite_index / columns
	var col = sprite_index % columns
	
	atlas_texture.region = Rect2(
		col * sprite_size.x,
		row * sprite_size.y,
		sprite_size.x,
		sprite_size.y
	)
	
	portrait.texture = atlas_texture
	portrait.show()

func _load_texture(character: String) -> Texture2D:
	if character in loaded_textures:
		return loaded_textures[character]
	
	if not character in PORTRAIT_ATLAS:
		return null
	
	var texture_path = PORTRAIT_ATLAS[character]["texture"]
	if ResourceLoader.exists(texture_path):
		var texture = load(texture_path)
		loaded_textures[character] = texture
		return texture
	
	return null

# =========================================================
# === TEXT PROCESSING =====================================
# =========================================================
func _process_text_colors(text: String) -> String:
	var processed_text = text
	var matches = color_regex.search_all(text)
	
	for match_result in matches:
		var full_match = match_result.get_string(0)
		var content = match_result.get_string(1)
		var color_name = match_result.get_string(2)
		var color_code = PASTEL_COLORS[color_name]
		var replacement = "[color=%s]%s[/color]" % [color_code, content]
		processed_text = processed_text.replace(full_match, replacement)
	
	return processed_text

func _remove_bubble_tags(text: String) -> String:
	return bubble_regex.sub(text, "", true)

func _remove_emotion_tags(text: String) -> String:
	var processed = emotion_regex.sub(text, "", true)
	return no_portrait_regex.sub(processed, "", true)

# =========================================================
# === MENU CONFIGURATION ==================================
# =========================================================
func _configure_menu(responses: Array[DialogueResponse]) -> void:
	responses_menu.set_responses(responses)

# =========================================================
# === PROGRESS HAND =======================================
# =========================================================
func _show_progress_hand() -> void:
	if not progress_hand:
		return
	progress_hand.show()

func _hide_progress_hand() -> void:
	if not progress_hand:
		return
	progress_hand.hide()

# =========================================================
# === CHARACTER NODE ======================================
# =========================================================
func _get_character_node(character_name: String) -> Node:
	var upper_name = character_name.to_upper()
	
	if upper_name in character_cache:
		var cached = character_cache[upper_name]
		if is_instance_valid(cached):
			return cached
		else:
			character_cache.erase(upper_name)
	
	if upper_name in PREDEFINED_CHARACTERS:
		var char_id = PREDEFINED_CHARACTERS[upper_name]["id"]
		var node = get_tree().get_first_node_in_group(char_id)
		if node:
			character_cache[upper_name] = node
			return node
	
	return null

# =========================================================
# === EMOTION BUBBLES =====================================
# =========================================================
func _handle_emotion_bubbles() -> void:
	var bubble_emotion = ""
	
	var bubble_match = bubble_regex.search(dialogue_line.text)
	if bubble_match:
		var full_match = bubble_match.get_string(0)
		bubble_emotion = full_match.substr(8, full_match.length() - 9).to_lower()
	else:
		for tag in dialogue_line.tags:
			if tag.begins_with("BUBBLE="):
				bubble_emotion = tag.split("=")[1].to_lower()
				break
	
	if bubble_emotion.is_empty():
		_hide_emotion_bubble()
		return
	
	var character_node = _get_character_node(dialogue_line.character)
	if not character_node:
		_hide_emotion_bubble()
		return
	
	if active_character_node and active_character_node != character_node:
		_hide_emotion_bubble()
	
	active_character_node = character_node
	
	var emotion_sprite = _find_emotion_sprite(character_node)
	if not emotion_sprite:
		return
	
	var animation_name = bubble_emotion + "_bubble"
	if not emotion_sprite.sprite_frames.has_animation(animation_name):
		animation_name = bubble_emotion
	
	if emotion_sprite.sprite_frames.has_animation(animation_name):
		emotion_sprite.visible = true
		emotion_sprite.play(animation_name)
		current_bubble_emotion = bubble_emotion
		emotion_bubble_timer.start(EMOTION_BUBBLE_DURATION)

func _find_emotion_sprite(character_node: Node) -> AnimatedSprite2D:
	const EMOTION_NAMES = ["Emotions", "EmotionBubbles", "Bubbles", "EmotionSprite"]
	
	for name in EMOTION_NAMES:
		var node = character_node.get_node_or_null(name)
		if node and node is AnimatedSprite2D:
			return node
	
	for child in character_node.get_children():
		if child.name.to_upper().contains("EMOTION") and child is AnimatedSprite2D:
			return child
	
	return null

func _hide_emotion_bubble() -> void:
	if not active_character_node:
		return
	
	var emotion_sprite = _find_emotion_sprite(active_character_node)
	if emotion_sprite:
		emotion_sprite.visible = false
		emotion_sprite.stop()
	
	current_bubble_emotion = ""
	emotion_bubble_timer.stop()
	active_character_node = null

# =========================================================
# === AUDIO SYSTEM ========================================
# =========================================================
func _reset_sound_system() -> void:
	current_sound_index = 0
	last_sound_time = 0.0
	
	# Configurar pitch base según el personaje
	match dialogue_line.character:
		"???":
			base_pitch = 0.75
		"HIKORI":
			base_pitch = 1.0  # Pitch original para HIKORI
		"STRANGER":
			base_pitch = 1.0  # Pitch original para STRANGER
		_:
			base_pitch = 1.0
	
	# Detener todos los sonidos
	for sound in talk_sounds:
		if sound.playing:
			sound.stop()
	
	if talk_sound_unknown and talk_sound_unknown.playing:
		talk_sound_unknown.stop()
	

func _configure_typing_speed() -> void:
	var typing_speed = 0.02
	sound_interval = 0.03
	
	match dialogue_line.character:
		"???":
			typing_speed = 0.035
			sound_interval = 0.05
		"HIKORI":
			typing_speed = 0.02  # Velocidad normal
			sound_interval = 0.03
		"STRANGER":
			typing_speed = 0.02
			sound_interval = 0.03
	
	if dialogue_label.has_method("set_typing_speed"):
		dialogue_label.set_typing_speed(typing_speed)



func _calculate_auto_advance_time() -> float:
	if dialogue_line.time == "auto":
		return dialogue_line.text.length() * 0.04
	else:
		return dialogue_line.time.to_float() * 0.75

func _play_smooth_typing_sound() -> void:
	var current_time = Time.get_ticks_msec() / 1000.0
	
	if (current_time - last_sound_time) < sound_interval:
		return
	
	# Usar sonido especial para ??? y STRANGER
	match dialogue_line.character:
		"???":
			_play_unknown_sound()
		"STRANGER":
			_play_stranger_sound()
		_:
			_play_normal_sound()
	
	last_sound_time = current_time

func _play_unknown_sound() -> void:
	if not talk_sound_unknown:
		return
	
	# Variación de pitch muy pequeña para ???
	var pitch_offset = randf_range(-0.03, 0.03)
	var final_pitch = clamp(base_pitch + pitch_offset, 0.72, 0.78)
	
	talk_sound_unknown.pitch_scale = final_pitch
	talk_sound_unknown.volume_db = clamp(-12.0 + randf_range(-1.0, 1.0), -14.0, -10.0)
	talk_sound_unknown.play()

func _play_stranger_sound() -> void:
	if not talk_sound_unknown:
		return
	
	# Pitch original (1.0) con variación normal para STRANGER
	var pitch_offset = randf_range(-0.05, 0.05)
	var final_pitch = clamp(base_pitch + pitch_offset, 0.95, 1.05)
	
	talk_sound_unknown.pitch_scale = final_pitch
	talk_sound_unknown.volume_db = clamp(-12.0 + randf_range(-1.0, 1.0), -14.0, -10.0)
	talk_sound_unknown.play()

func _play_normal_sound() -> void:
	var pitch_offset = randf_range(-pitch_variation, pitch_variation)
	var volume_offset = randf_range(-volume_variation, volume_variation)
	var final_pitch = clamp(base_pitch + pitch_offset, 0.85, 1.15)
	
	var current_audio = talk_sounds[current_sound_index]
	current_audio.pitch_scale = final_pitch
	current_audio.volume_db = clamp(-10.0 + volume_offset, -14.0, -8.0)
	current_audio.play()
	
	current_sound_index = (current_sound_index + 1) % talk_sounds.size()

func _handle_punctuation_pause(letter: String) -> void:
	var pause_time = 0.0
	
	match letter:
		",", ";":
			pause_time = 0.08
		".", "!", "?":
			pause_time = 0.15
		":":
			pause_time = 0.12
		"-":
			pause_time = 0.05
	
	if pause_time > 0.0:
		await get_tree().create_timer(pause_time).timeout

# =========================================================
# === NAVIGATION ==========================================
# =========================================================
func next(next_id: String) -> void:
	_hide_progress_hand()
	
	# Fade out de todos los sonidos
	for sound in talk_sounds:
		if sound.playing:
			var fade_tween = create_tween()
			fade_tween.tween_property(sound, "volume_db", -80.0, SOUND_FADE_DURATION)
			fade_tween.tween_callback(sound.stop)
	
	if talk_sound_unknown and talk_sound_unknown.playing:
		var fade_tween = create_tween()
		fade_tween.tween_property(talk_sound_unknown, "volume_db", -80.0, SOUND_FADE_DURATION)
		fade_tween.tween_callback(talk_sound_unknown.stop)
	
	await _animate_balloon_close()
	self.dialogue_line = await resource.get_next_dialogue_line(next_id, temporary_game_states)

# =========================================================
# === CALLBACKS ===========================================
# =========================================================
func _on_mutation_cooldown_timeout() -> void:
	if will_hide_balloon:
		will_hide_balloon = false
		_animate_balloon_close()

func _on_mutated(_mutation: Dictionary) -> void:
	is_waiting_for_input = false
	will_hide_balloon = true
	mutation_cooldown.start(0.1)

func _on_balloon_gui_input(event: InputEvent) -> void:
	if is_animating:
		return
	
	if dialogue_label.is_typing:
		var mouse_was_clicked = event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed()
		var skip_button_was_pressed = event.is_action_pressed(skip_action)
		
		if mouse_was_clicked or skip_button_was_pressed:
			get_viewport().set_input_as_handled()
			dialogue_label.skip_typing()
			
			# Detener todos los sonidos
			for sound in talk_sounds:
				if sound.playing:
					sound.stop()
			if talk_sound_unknown and talk_sound_unknown.playing:
				talk_sound_unknown.stop()
			return
	
	if not is_waiting_for_input or dialogue_line.responses.size() > 0:
		return
	
	get_viewport().set_input_as_handled()
	
	if event is InputEventMouseButton and event.is_pressed() and event.button_index == MOUSE_BUTTON_LEFT:
		next(dialogue_line.next_id)
	elif event.is_action_pressed(next_action) and get_viewport().gui_get_focus_owner() == balloon:
		next(dialogue_line.next_id)

func _on_responses_menu_response_selected(response: DialogueResponse) -> void:
	next(response.next_id)

@warning_ignore("unused_parameter")
func _on_dialogue_label_spoke(letter: String, letter_index: int, speed: float) -> void:
	# Manejar espacios
	if letter == " ":
		_play_space_sound()
		return
	
	# Manejar puntuación
	if letter in [",", ".", "!", "?", ";", ":", "-"]:
		_play_smooth_typing_sound()
		await _handle_punctuation_pause(letter)
		return
	
	# Sonido normal
	_play_smooth_typing_sound()

func _play_space_sound() -> void:
	match dialogue_line.character:
		"???":
			if talk_sound_unknown:
				talk_sound_unknown.pitch_scale = base_pitch * 0.99
				talk_sound_unknown.volume_db = -18.0
				talk_sound_unknown.play()
		"STRANGER":
			if talk_sound_unknown:
				talk_sound_unknown.pitch_scale = base_pitch * 0.95
				talk_sound_unknown.volume_db = -16.0
				talk_sound_unknown.play()
		_:
			var space_audio = talk_sounds[current_sound_index]
			space_audio.pitch_scale = base_pitch * 0.95
			space_audio.volume_db = -16.0
			space_audio.play()
			current_sound_index = (current_sound_index + 1) % talk_sounds.size()

# =========================================================
# === CLEANUP =============================================
# =========================================================
func _exit_tree() -> void:
	_hide_emotion_bubble()
	_hide_progress_hand()
	
	# Detener todos los sonidos
	for sound in talk_sounds:
		if is_instance_valid(sound) and sound.playing:
			sound.stop()
	
	if is_instance_valid(talk_sound_unknown) and talk_sound_unknown.playing:
		talk_sound_unknown.stop()
	
	# Limpiar tweens
	if is_instance_valid(balloon_tween):
		balloon_tween.kill()
	
	# Limpiar timers
	if is_instance_valid(mutation_cooldown):
		mutation_cooldown.queue_free()
	
	if is_instance_valid(emotion_bubble_timer):
		emotion_bubble_timer.queue_free()

func _on_dialogues_dialogue_finished() -> void:
	pass
