extends CanvasLayer

@export var next_action: StringName = &"ui_accept"
@export var skip_action: StringName = &"ui_cancel"

var resource: DialogueResource
var temporary_game_states: Array = []
var is_waiting_for_input: bool = false
var will_hide_balloon: bool = false
var locals: Dictionary = {}
var _locale: String = TranslationServer.get_locale()

# Sistema de emotion bubbles (sobre el sprite del personaje en el mundo)
var active_character_node: Node = null
var current_bubble_emotion: String = ""
var emotion_bubble_timer: Timer

# Diccionario para cachear referencias a personajes
var character_cache: Dictionary = {}

var dialogue_line: DialogueLine:
	set(value):
		if value:
			dialogue_line = value
			apply_dialogue_line()
		else:
			queue_free()
	get:
		return dialogue_line

var mutation_cooldown: Timer = Timer.new()

@onready var balloon: Control = %Balloon
@onready var character_label: RichTextLabel = %CharacterLabel
@onready var portrait: TextureRect = %Portrait
@onready var dialogue_label: DialogueLabel = %DialogueLabel
@onready var progress_hand: Sprite2D =  %Progress

@onready var talk_sound_1: AudioStreamPlayer = $"talk-sound1"
@onready var talk_sound_2: AudioStreamPlayer = $"talk-sound2"
@onready var talk_sound_3: AudioStreamPlayer = $"talk-sound3"
@onready var talk_sound_4: AudioStreamPlayer = $"talk-sound4"
@onready var talk_sound_5: AudioStreamPlayer = $"talk-sound5"
@onready var responses_menu = %ResponsesMenu

var talk_sounds: Array[AudioStreamPlayer] = []
var current_sound_index: int = 0
var last_sound_time: float = 0.0
var sound_interval: float = 0.03
var base_pitch: float = 1.0
var pitch_variation: float = 0.1
var volume_variation: float = 1.5

var bubble_regex: RegEx
var color_regex: RegEx
var emotion_regex: RegEx
var no_portrait_regex: RegEx

var pastel_colors = {
	"YELLOW": "#FFE6A3",
	"ORANGE": "#FFD1A3",
	"BLUE": "#A3D1FF",
	"PURPLE": "#D1A3FF"
}

# Animation variables
var balloon_tween: Tween
var is_animating: bool = false

# =========================================================
# === SISTEMA DE ATLAS DE PORTRAITS =======================
# =========================================================

# Cache de texturas cargadas
var loaded_textures: Dictionary = {}

# Definición del atlas de portraits
var portrait_atlas: Dictionary = {
	"RAINY": {
		"texture": "res://assets/player/RAINY_DREAM_FACES.png",
		"sprite_size": Vector2(106, 106),  
		"columns": 5,
		"emotions": {
			# FILA 0 (0-4): 
			"funny": 0,       
			"question": 1,         
			"serious": 2,          
			"smile": 3,          
			"nerves": 4,       
			
			# FILA 1 (5-9): 
			"neutral": 5,           
			"doubtful": 6,        
			"surprised": 7,         
			"happy": 8,        
			"worried": 9,         
			
			# FILA 2 (10-14): 
			"sad": 10,   
			"miserable": 11,       
			"crying": 12,       
			"trauma": 13,       
			"furious": 14,  
			
			# FILA 3 (15-19): 
			"angry": 15,   
			"calm": 16,  
			"shocked": 17,     
			"silent": 18,    
			"scared": 19,      
		}
	},
	"SKYE": {
		"texture": "res://assets/portraits/skye_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0,
			"happy": 1,
			"confident": 2,
			"worried": 3,
			"sad": 4,
			"surprised": 5,
			"annoyed": 6,
			"smug": 7
		}
	},
	"HIKIKO": {
		"texture": "res://assets/portraits/hikiko_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0,
			"shy": 1,
			"embarrassed": 2,
			"happy": 3,
			"worried": 4,
			"surprised": 5,
			"sad": 6,
			"scared": 7
		}
	},
	"HER": {
		"texture": "res://assets/portraits/makomi_portraits.png",
		"sprite_size": Vector2(64, 64),
		"columns": 4,
		"emotions": {
			"neutral": 0,
			"happy": 1,
			"sad": 2,
			"angry": 3,
			"calm": 4,
			"surprised": 5,
			"worried": 6,
			"smug": 7
		}
	}
}

# =========================================================
# === PERSONAJES PREDEFINIDOS =============================
# =========================================================
var predefined_characters: Dictionary = {
	"RAINY": {
		"id": "char_rainy",
		"path": "res://scenes/Player.tscn"
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

# =========================================================
# === READY ===============================================
# =========================================================
func _ready() -> void:
	balloon.hide()
	balloon.scale = Vector2(1.0, 0.0)
	balloon.pivot_offset = balloon.size / 2.0
	
	Engine.get_singleton("DialogueManager").mutated.connect(_on_mutated)

	if responses_menu.next_action.is_empty():
		responses_menu.next_action = next_action

	mutation_cooldown.timeout.connect(_on_mutation_cooldown_timeout)
	add_child(mutation_cooldown)

	talk_sounds = [talk_sound_1, talk_sound_2, talk_sound_3, talk_sound_4, talk_sound_5]
	
	for sound in talk_sounds:
		sound.volume_db = -10.0
		sound.pitch_scale = 1.0
	
	# Ocultar la manita al inicio
	if progress_hand:
		progress_hand.hide()
	
	_setup_portrait_system()
	_setup_emotion_system()
	_setup_color_system()

func _setup_emotion_system():
	bubble_regex = RegEx.new()
	bubble_regex.compile("\\[BUBBLE=[^\\]]+\\]")
	
	emotion_regex = RegEx.new()
	emotion_regex.compile("\\[emotion=([^\\]]+)\\]")
	
	no_portrait_regex = RegEx.new()
	no_portrait_regex.compile("\\[no_portrait\\]")
	
	emotion_bubble_timer = Timer.new()
	emotion_bubble_timer.one_shot = true
	emotion_bubble_timer.timeout.connect(_hide_emotion_bubble)
	add_child(emotion_bubble_timer)

func _setup_portrait_system():
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_CENTERED
	portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	portrait.custom_minimum_size = Vector2(106, 106)
	
	# Pre-cargar texturas comunes para mejor performance
	_preload_common_textures()

func _preload_common_textures():
	# Pre-carga los personajes principales
	for character in ["RAINY", "SKYE", "HIKIKO"]:
		if character in portrait_atlas:
			_load_texture(character)

func _setup_color_system():
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

func _animate_balloon_open() -> void:
	if is_animating:
		return
		
	is_animating = true
	balloon.scale = Vector2(1.0, 0.0)
	balloon.show()
	
	if balloon_tween:
		balloon_tween.kill()
	
	balloon_tween = create_tween()
	balloon_tween.set_ease(Tween.EASE_IN_OUT)
	balloon_tween.set_trans(Tween.TRANS_LINEAR)
	
	balloon_tween.tween_property(balloon, "scale", Vector2(1.0, 1.0), 0.15)
	await balloon_tween.finished
	is_animating = false

func _animate_balloon_close() -> void:
	if is_animating:
		return
		
	is_animating = true
	
	if balloon_tween:
		balloon_tween.kill()
	
	balloon_tween = create_tween()
	balloon_tween.set_ease(Tween.EASE_IN_OUT)
	balloon_tween.set_trans(Tween.TRANS_LINEAR)
	
	balloon_tween.tween_property(balloon, "scale", Vector2(1.0, 0.0), 0.15)
	await balloon_tween.finished
	balloon.hide()
	is_animating = false

# =========================================================
# === SISTEMA DE PROGRESS HAND ============================
# =========================================================

func _show_progress_hand():
	"""Muestra la manita indicadora cuando el diálogo termina"""
	if progress_hand:
		progress_hand.show()
		# Si la manita tiene una animación, reproducirla
		if progress_hand.has_method("play"):
			progress_hand.play()
		print("✅ Progress hand mostrada")

func _hide_progress_hand():
	"""Oculta la manita indicadora"""
	if progress_hand:
		progress_hand.hide()
		# Si la manita tiene una animación, detenerla
		if progress_hand.has_method("stop"):
			progress_hand.stop()

# =========================================================
# === DIALOGUE LINE =======================================
# =========================================================
func apply_dialogue_line() -> void:
	mutation_cooldown.stop()
	is_waiting_for_input = false
	balloon.focus_mode = Control.FOCUS_ALL
	balloon.grab_focus()

	# Ocultar la manita al inicio de cada línea
	_hide_progress_hand()

	var is_narration = dialogue_line.character.to_upper() == "NONE"
	var is_mystery = dialogue_line.character == "???"
	
	# Verificar si hay tag [no_portrait] ANTES de mostrar contenedores
	var has_no_portrait_tag = no_portrait_regex.search(dialogue_line.text) != null
	var has_no_portrait_in_tags = "no_portrait" in dialogue_line.tags
	var should_hide_portrait = has_no_portrait_tag or has_no_portrait_in_tags or is_narration or is_mystery
	
	character_label.visible = not dialogue_line.character.is_empty() and not is_narration
	portrait.visible = not should_hide_portrait
	
	var character_container = balloon.get_node("MarginContainer2")
	var portrait_container = balloon.get_node("MarginContainer3")
	
	if character_container:
		character_container.visible = not is_narration
	if portrait_container:
		portrait_container.visible = not should_hide_portrait
	
	if not is_narration:
		character_label.text = tr(dialogue_line.character, "dialogue")

	_reset_sound_system()
	_update_portrait_from_atlas()
	_trigger_emotion_bubble()

	dialogue_label.hide()
	var filtered_line = _create_filtered_dialogue_line()
	dialogue_label.dialogue_line = filtered_line
	
	_configure_typing_speed()
	
	responses_menu.hide()
	responses_menu.responses = dialogue_line.responses

	await _animate_balloon_open()
	will_hide_balloon = false

	dialogue_label.show()
	if not dialogue_line.text.is_empty():
		dialogue_label.type_out()
		await dialogue_label.finished_typing

	if dialogue_line.responses.size() > 0:
		balloon.focus_mode = Control.FOCUS_NONE
		responses_menu.show()
		# No mostrar la manita cuando hay opciones de respuesta
	elif dialogue_line.time != "":
		var time = _calculate_auto_advance_time()
		await get_tree().create_timer(time).timeout
		next(dialogue_line.next_id)
	else:
		is_waiting_for_input = true
		balloon.focus_mode = Control.FOCUS_ALL
		balloon.grab_focus()
		# MOSTRAR LA MANITA cuando se espera input del jugador
		_show_progress_hand()

# =========================================================
# === FORMATO DE TEXTO ====================================
# =========================================================
func _create_filtered_dialogue_line() -> DialogueLine:
	var filtered_line = DialogueLine.new()
	filtered_line.id = dialogue_line.id
	filtered_line.next_id = dialogue_line.next_id
	filtered_line.character = dialogue_line.character
	filtered_line.text = _process_text_formatting(dialogue_line.text)
	filtered_line.tags = dialogue_line.tags
	filtered_line.responses = dialogue_line.responses
	filtered_line.time = dialogue_line.time
	filtered_line.mutation = dialogue_line.mutation
	return filtered_line

func _process_text_formatting(text: String) -> String:
	var processed_text = text
	processed_text = _filter_bubble_tags(processed_text)
	processed_text = _filter_emotion_tags(processed_text)
	processed_text = _filter_no_portrait_tag(processed_text)
	processed_text = _apply_color_formatting(processed_text)
	return processed_text

func _filter_bubble_tags(text: String) -> String:
	return bubble_regex.sub(text, "", true)

func _filter_emotion_tags(text: String) -> String:
	return emotion_regex.sub(text, "", true)

func _filter_no_portrait_tag(text: String) -> String:
	return no_portrait_regex.sub(text, "", true)

func _apply_color_formatting(text: String) -> String:
	var result = text
	var matches = color_regex.search_all(text)
	
	for i in range(matches.size() - 1, -1, -1):
		var match_obj = matches[i]
		@warning_ignore("unused_variable")
		var full_match = match_obj.get_string(0)
		var content = match_obj.get_string(1)
		var color_name = match_obj.get_string(2)
		
		if color_name in pastel_colors:
			var color_hex = pastel_colors[color_name]
			var colored_text = "[color=%s]%s[/color]" % [color_hex, content]
			result = result.substr(0, match_obj.get_start()) + colored_text + result.substr(match_obj.get_end())
	
	return result

# =========================================================
# === SISTEMA DE PORTRAITS CON ATLAS ======================
# =========================================================

func _load_texture(character: String) -> Texture2D:
	var char_upper = character.to_upper()
	
	# Retornar si ya está en cache
	if char_upper in loaded_textures:
		return loaded_textures[char_upper]
	
	# Validar que existe en el atlas
	if not char_upper in portrait_atlas:
		print("⚠️ No existe atlas para: ", character)
		return null
	
	var texture_path = portrait_atlas[char_upper]["texture"]
	var texture = load(texture_path)
	
	if texture:
		loaded_textures[char_upper] = texture
		print("✅ Textura cargada: ", character)
		return texture
	else:
		print("❌ No se pudo cargar textura: ", texture_path)
		return null

func _get_portrait_from_atlas(character: String, emotion: String) -> AtlasTexture:
	var char_upper = character.to_upper()
	
	# Validar que existe el personaje
	if not char_upper in portrait_atlas:
		print("⚠️ Personaje sin atlas: ", character)
		return null
	
	var char_data = portrait_atlas[char_upper]
	
	# Validar y obtener emoción (con fallback a neutral)
	var final_emotion = emotion
	if not emotion in char_data["emotions"]:
		print("⚠️ Emoción '", emotion, "' no existe para ", character, " - usando 'neutral'")
		final_emotion = "neutral"
		if not final_emotion in char_data["emotions"]:
			print("❌ Ni siquiera existe 'neutral' para ", character)
			return null
	
	# Cargar textura base
	var base_texture = _load_texture(char_upper)
	if not base_texture:
		return null
	
	# Crear AtlasTexture
	var atlas_texture = AtlasTexture.new()
	atlas_texture.atlas = base_texture
	
	# Obtener datos del sprite
	var emotion_index: int = char_data["emotions"][final_emotion]
	var sprite_size: Vector2 = char_data["sprite_size"]
	var columns: int = char_data.get("columns", 4)
	
	# Convertir índice a coordenadas de grid
	var grid_x = emotion_index % columns
	var grid_y = emotion_index / columns
	
	# Calcular región del atlas
	var region = Rect2(
		grid_x * sprite_size.x,
		grid_y * sprite_size.y,
		sprite_size.x,
		sprite_size.y
	)
	
	atlas_texture.region = region
	
	return atlas_texture

func _update_portrait_from_atlas():
	# Verificar si hay tag [no_portrait] (ya verificado en apply_dialogue_line, pero por seguridad)
	var has_no_portrait_tag = no_portrait_regex.search(dialogue_line.text) != null
	var has_no_portrait_in_tags = "no_portrait" in dialogue_line.tags
	
	if has_no_portrait_tag or has_no_portrait_in_tags:
		portrait.visible = false
		print("🚫 Portrait ocultado por tag [no_portrait]")
		return
	
	# Ocultar si es narración o personaje misterioso
	if dialogue_line.character.is_empty() or dialogue_line.character.to_upper() == "NONE":
		portrait.visible = false
		return
	
	if dialogue_line.character == "???":
		portrait.visible = false
		return
	
	var char_upper = dialogue_line.character.to_upper()
	
	# Validar que el personaje tiene atlas
	if not char_upper in portrait_atlas:
		portrait.visible = false
		print("⚠️ No hay atlas para: ", dialogue_line.character)
		return
	
	# Obtener emoción de tags o texto
	var emotion = _get_emotion_from_tags()
	
	# Obtener sprite del atlas
	var atlas_sprite = _get_portrait_from_atlas(char_upper, emotion)
	
	if atlas_sprite:
		portrait.texture = atlas_sprite
		portrait.visible = true
		
		# Ajustar tamaño del portrait
		var sprite_size = portrait_atlas[char_upper]["sprite_size"]
		portrait.custom_minimum_size = sprite_size
		portrait.size = sprite_size
		
		print("✅ Portrait: ", dialogue_line.character, " - ", emotion)
	else:
		portrait.visible = false
		print("❌ No se pudo cargar portrait: ", dialogue_line.character, " - ", emotion)

func _get_emotion_from_tags() -> String:
	# Buscar en tags primero (formato: emotion=happy)
	for tag in dialogue_line.tags:
		if tag.begins_with("emotion="):
			return tag.split("=")[1].to_lower()
	
	# Buscar inline en el texto [emotion=happy]
	var match_result = emotion_regex.search(dialogue_line.text)
	if match_result:
		return match_result.get_string(1).to_lower()
	
	# Default
	return "neutral"

# =========================================================
# === UTILIDADES DE ATLAS =================================
# =========================================================

func get_available_emotions(character: String) -> Array:
	"""Retorna todas las emociones disponibles para un personaje"""
	var char_upper = character.to_upper()
	if char_upper in portrait_atlas:
		return portrait_atlas[char_upper]["emotions"].keys()
	return []

func has_emotion(character: String, emotion: String) -> bool:
	"""Verifica si una emoción existe para un personaje"""
	var char_upper = character.to_upper()
	if char_upper in portrait_atlas:
		return emotion in portrait_atlas[char_upper]["emotions"]
	return false

func debug_print_atlas():
	"""Imprime toda la información del atlas (útil para debugging)"""
	print("\n=== PORTRAIT ATLAS DEBUG ===")
	for character in portrait_atlas.keys():
		print("\nCharacter: ", character)
		print("  Texture: ", portrait_atlas[character]["texture"])
		print("  Size: ", portrait_atlas[character]["sprite_size"])
		print("  Columns: ", portrait_atlas[character].get("columns", 4))
		print("  Emotions (", portrait_atlas[character]["emotions"].size(), "):")
		for emotion in portrait_atlas[character]["emotions"].keys():
			var idx = portrait_atlas[character]["emotions"][emotion]
			print("    - ", emotion, " (index ", idx, ")")
	print("=========================\n")

# =========================================================
# === SISTEMA DE PERSONAJES ===============================
# =========================================================
func _get_character_node(character_name: String) -> Node:
	var char_key = character_name.to_upper()

	# --- Buscar en personajes predefinidos ---
	if char_key in predefined_characters:
		var data = predefined_characters[char_key]
		if char_key in character_cache and is_instance_valid(character_cache[char_key]):
			return character_cache[char_key]
		
		var scene = load(data["path"])
		if scene:
			var instance = scene.instantiate()
			get_tree().root.add_child(instance)
			instance.name = data["id"]
			character_cache[char_key] = instance
			return instance

	# --- Métodos de búsqueda existentes ---
	var group_name = "character_" + character_name.to_lower()
	var nodes = get_tree().get_nodes_in_group(group_name)
	if nodes.size() > 0:
		character_cache[char_key] = nodes[0]
		return nodes[0]
	
	var common_names = [
		character_name,
		character_name.capitalize(),
		character_name.to_upper(),
		character_name.to_lower()
	]
	
	@warning_ignore("shadowed_variable_base_class")
	for name in common_names:
		var node = get_tree().get_first_node_in_group(name)
		if node:
			character_cache[char_key] = node
			return node
	
	var all_nodes = get_tree().get_nodes_in_group("Player")
	for node in all_nodes:
		if node.name.to_upper() == char_key:
			character_cache[char_key] = node
			return node
	
	return null

# =========================================================
# === SISTEMA DE EMOTION BUBBLES (REEMPLAZO) ==============
# =========================================================

func _trigger_emotion_bubble():
	# Si es narración, NO hacer nada (mantener burbuja activa si existe)
	if dialogue_line.character.is_empty() or dialogue_line.character.to_upper() == "NONE":
		return
	
	# Si es un personaje misterioso, ocultar burbuja
	if dialogue_line.character == "???":
		_hide_emotion_bubble()
		return
	
	# Buscar tag [BUBBLE=xxx] en el texto
	var bubble_match = bubble_regex.search(dialogue_line.text)
	var bubble_emotion = ""
	
	if bubble_match:
		var full_match = bubble_match.get_string(0)
		# Extraer el nombre de la emoción entre [BUBBLE= y ]
		bubble_emotion = full_match.substr(8, full_match.length() - 9).to_lower()
		print("🔍 Encontrado BUBBLE en texto: ", bubble_emotion)
	else:
		# Si no está en el texto, buscar en tags
		for tag in dialogue_line.tags:
			if tag.begins_with("BUBBLE="):
				bubble_emotion = tag.split("=")[1].to_lower()
				print("🔍 Encontrado BUBBLE en tags: ", bubble_emotion)
				break
	
	# Si no hay emoción de burbuja, ocultar cualquier burbuja activa
	if bubble_emotion.is_empty():
		_hide_emotion_bubble()
		return
	
	# Obtener el nodo del personaje
	var character_node = _get_character_node(dialogue_line.character)
	if not character_node:
		print("⚠️ No se encontró el nodo del personaje: ", dialogue_line.character)
		_hide_emotion_bubble()
		return
	
	# Si el personaje cambió, ocultar la burbuja anterior
	if active_character_node and active_character_node != character_node:
		_hide_emotion_bubble()
	
	active_character_node = character_node
	
	# Buscar el sprite de emociones
	var emotion_sprite = _find_emotion_sprite(character_node)
	if not emotion_sprite:
		print("⚠️ No se encontró emotion sprite para: ", dialogue_line.character)
		return
	
	# Intentar con el nombre directo primero (ej: "nerves_bubble")
	var animation_name = bubble_emotion + "_bubble"
	
	# Si no existe, intentar sin el sufijo "_bubble" (ej: "nerves")
	if not emotion_sprite.sprite_frames.has_animation(animation_name):
		animation_name = bubble_emotion
	
	# Verificar si existe la animación
	if emotion_sprite.sprite_frames.has_animation(animation_name):
		emotion_sprite.visible = true
		emotion_sprite.play(animation_name)
		current_bubble_emotion = bubble_emotion
		emotion_bubble_timer.start(4.5)
		print("✅ Emotion Bubble activada: ", dialogue_line.character, " - ", animation_name)
	else:
		print("❌ No existe animación de burbuja: '", bubble_emotion, "_bubble' ni '", bubble_emotion, "'")
		print("   Animaciones disponibles en Emotions:")
		for anim in emotion_sprite.sprite_frames.get_animation_names():
			print("   - ", anim)

func _find_emotion_sprite(character_node: Node) -> AnimatedSprite2D:
	# Lista de nombres comunes para el nodo de emociones
	var emotion_names = ["Emotions", "EmotionBubbles", "Bubbles", "EmotionSprite"]
	
	# Buscar por nombre exacto
	for name in emotion_names:
		var node = character_node.get_node_or_null(name)
		if node and node is AnimatedSprite2D:
			print("✅ Encontrado emotion sprite: ", node.name)
			return node
	
	# Buscar en los hijos por nombre que contenga "EMOTION"
	for child in character_node.get_children():
		if child.name.to_upper().contains("EMOTION") and child is AnimatedSprite2D:
			print("✅ Encontrado emotion sprite (búsqueda): ", child.name)
			return child
	
	print("❌ No se encontró ningún AnimatedSprite2D para emociones")
	return null

func _hide_emotion_bubble():
	print("⚠️ ⚠️ ⚠️ _hide_emotion_bubble() LLAMADA ⚠️ ⚠️ ⚠️")
	
	if not active_character_node:
		print("   -> No hay character_node activo, saliendo")
		return
	
	print("   -> Character activo: ", active_character_node.name)
	print("   -> Emotion actual: ", current_bubble_emotion)
	
	var emotion_sprite = _find_emotion_sprite(active_character_node)
	if emotion_sprite:
		print("   -> Ocultando sprite: ", emotion_sprite.name)
		emotion_sprite.visible = false
		emotion_sprite.stop()
	
	current_bubble_emotion = ""
	emotion_bubble_timer.stop()
	active_character_node = null
	print("   -> Bubble ocultada completamente")

# =========================================================
# === RESTO DEL CÓDIGO ====================================
# =========================================================
func _reset_sound_system():
	current_sound_index = 0
	last_sound_time = 0.0
	
	if dialogue_line.character == "???":
		base_pitch = 0.75
	else:
		base_pitch = 1.0
	
	for sound in talk_sounds:
		if sound.playing:
			sound.stop()

func _configure_typing_speed():
	var typing_speed = 0.02
	sound_interval = 0.03
	
	if dialogue_line.character == "???":
		typing_speed = 0.035
		sound_interval = 0.05
	
	if dialogue_label.has_method("set_typing_speed"):
		dialogue_label.set_typing_speed(typing_speed)

func _calculate_auto_advance_time() -> float:
	if dialogue_line.time == "auto":
		return dialogue_line.text.length() * 0.04
	else:
		return dialogue_line.time.to_float() * 0.75

func _play_smooth_typing_sound():
	var current_time = Time.get_ticks_msec() / 1000.0
	
	if (current_time - last_sound_time) >= sound_interval:
		var current_pitch_variation = pitch_variation
		var pitch_range_min = 0.85
		var pitch_range_max = 1.15
		var volume_adjustment = 0.0
		
		if dialogue_line.character == "???":
			current_pitch_variation = 0.03
			pitch_range_min = 0.72
			pitch_range_max = 0.78
			volume_adjustment = -2.0
		
		var pitch_offset = randf_range(-current_pitch_variation, current_pitch_variation)
		var volume_offset = randf_range(-volume_variation, volume_variation)
		var final_pitch = clamp(base_pitch + pitch_offset, pitch_range_min, pitch_range_max)
		
		var current_audio = talk_sounds[current_sound_index]
		current_audio.pitch_scale = final_pitch
		current_audio.volume_db = clamp(-10.0 + volume_offset + volume_adjustment, -14.0, -8.0)
		current_audio.play()
		
		last_sound_time = current_time
		current_sound_index = (current_sound_index + 1) % talk_sounds.size()

func _handle_punctuation_pause(letter: String):
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

func next(next_id: String) -> void:
	# Ocultar la manita al avanzar
	_hide_progress_hand()
	
	for sound in talk_sounds:
		if sound.playing:
			var fade_tween = create_tween()
			fade_tween.tween_property(sound, "volume_db", -80.0, 0.1)
			fade_tween.tween_callback(sound.stop)
	
	await _animate_balloon_close()
	self.dialogue_line = await resource.get_next_dialogue_line(next_id, temporary_game_states)

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
		var mouse_was_clicked: bool = event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed()
		var skip_button_was_pressed: bool = event.is_action_pressed(skip_action)
		if mouse_was_clicked or skip_button_was_pressed:
			get_viewport().set_input_as_handled()
			dialogue_label.skip_typing()
			
			for sound in talk_sounds:
				if sound.playing:
					sound.stop()
			return

	if not is_waiting_for_input:
		return
	if dialogue_line.responses.size() > 0:
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
	if letter == " ":
		var space_audio = talk_sounds[current_sound_index]
		var space_pitch = base_pitch * 0.95
		var space_volume = -16.0
		if dialogue_line.character == "???":
			space_pitch = base_pitch * 0.99
			space_volume = -18.0
		space_audio.pitch_scale = space_pitch
		space_audio.volume_db = space_volume
		space_audio.play()
		current_sound_index = (current_sound_index + 1) % talk_sounds.size()
		return
	
	if letter in [",", ".", "!", "?", ";", ":", "-"]:
		_play_smooth_typing_sound()
		await _handle_punctuation_pause(letter)
		return
	
	_play_smooth_typing_sound()

func _exit_tree():
	_hide_emotion_bubble()
	_hide_progress_hand()
	
	for sound in talk_sounds:
		if is_instance_valid(sound) and sound.playing:
			sound.stop()
	
	if is_instance_valid(balloon_tween):
		balloon_tween.kill()
	
	if is_instance_valid(mutation_cooldown):
		mutation_cooldown.queue_free()
	
	if is_instance_valid(emotion_bubble_timer):
		emotion_bubble_timer.queue_free()

func _on_dialogues_dialogue_finished() -> void:
	pass
