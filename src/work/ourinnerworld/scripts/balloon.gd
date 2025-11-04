extends CanvasLayer

@export var next_action: StringName = &"ui_accept"
@export var skip_action: StringName = &"ui_cancel"

var resource: DialogueResource
var temporary_game_states: Array = []
var is_waiting_for_input: bool = false
var will_hide_balloon: bool = false
var locals: Dictionary = {}
var _locale: String = TranslationServer.get_locale()

var emotion_bubbles: AnimatedSprite2D
var emotion_bubble_timer: Timer
var current_bubble_emotion: String = ""
var emotion_animations = {
	"blush": "blush",
	"love": "love", 
	"nerves": "nerves",
	"silent": "silent",
	"singing": "singing",
	"sparkles": "sparkles",
	"angry": "angry"  
}

var dialogue_line: DialogueLine:
	set(value):
		if value:
			dialogue_line = value
			apply_dialogue_line()
			trigger_emotion_for_line(value)
		else:
			queue_free()
	get:
		return dialogue_line

var mutation_cooldown: Timer = Timer.new()

@onready var balloon: Control = %Balloon
@onready var character_label: RichTextLabel = %CharacterLabel
@onready var portrait: TextureRect = %Portrait
@onready var dialogue_label: DialogueLabel = %DialogueLabel
@onready var talk_sound_1: AudioStreamPlayer = $"talk-sound1"
@onready var talk_sound_2: AudioStreamPlayer = $"talk-sound2"
@onready var talk_sound_3: AudioStreamPlayer = $"talk-sound3"
@onready var talk_sound_4: AudioStreamPlayer = $"talk-sound4"
@onready var talk_sound_5: AudioStreamPlayer = $"talk-sound5"
@onready var responses_menu: DialogueResponsesMenu = %ResponsesMenu

var talk_sounds: Array[AudioStreamPlayer] = []
var current_sound_index: int = 0
var last_sound_time: float = 0.0
var sound_interval: float = 0.03  # Reduced for more fluid sound
var base_pitch: float = 1.0
var pitch_variation: float = 0.1  # Reduced for smoother variation
var volume_variation: float = 1.5  # Reduced for consistency

var bubble_regex: RegEx
var color_regex: RegEx

var pastel_colors = {
	"YELLOW": "#FFE6A3",     # Pastel yellow for important information
	"ORANGE": "#FFD1A3",     # Pastel orange for objects
	"BLUE": "#A3D1FF",       # Pastel blue for abilities
	"PURPLE": "#D1A3FF"      # Pastel purple for places
}

# Animation variables
var balloon_tween: Tween
var is_animating: bool = false


func _ready() -> void:
	balloon.hide()
	# Set initial scale for animation
	balloon.scale = Vector2(1.0, 0.0)
	balloon.pivot_offset = balloon.size / 2.0
	
	Engine.get_singleton("DialogueManager").mutated.connect(_on_mutated)

	if responses_menu.next_action.is_empty():
		responses_menu.next_action = next_action

	mutation_cooldown.timeout.connect(_on_mutation_cooldown_timeout)
	add_child(mutation_cooldown)

	talk_sounds = [talk_sound_1, talk_sound_2, talk_sound_3, talk_sound_4, talk_sound_5]
	
	for sound in talk_sounds:
		sound.volume_db = -10.0  # Slightly louder for better presence
		sound.pitch_scale = 1.0
	
	_setup_emotion_system()
	_setup_color_system()

func _setup_emotion_system():
	bubble_regex = RegEx.new()
	bubble_regex.compile("\\[BUBBLE=[^\\]]+\\]")
	
	emotion_bubble_timer = Timer.new()
	emotion_bubble_timer.one_shot = true
	emotion_bubble_timer.timeout.connect(_hide_emotion_bubble)
	add_child(emotion_bubble_timer)
	
	_find_emotion_bubbles()

func _setup_color_system():
	color_regex = RegEx.new()
	color_regex.compile("\\{([^/]+)\\s*/\\s*color:\\s*(YELLOW|ORANGE|BLUE|PURPLE)\\s*\\}")

func _find_emotion_bubbles():
	var nodes = get_tree().get_nodes_in_group("emotion_bubbles")
	if nodes.size() > 0:
		emotion_bubbles = nodes[0] as AnimatedSprite2D

func _unhandled_input(_event: InputEvent) -> void:
	get_viewport().set_input_as_handled()

func _notification(what: int) -> void:
	if what == NOTIFICATION_TRANSLATION_CHANGED and _locale != TranslationServer.get_locale() and is_instance_valid(dialogue_label):
		_locale = TranslationServer.get_locale()
		var visible_ratio = dialogue_label.visible_ratio
		self.dialogue_line = await resource.get_next_dialogue_line(dialogue_line.id)
		if visible_ratio < 1:
			dialogue_label.skip_typing()

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

func apply_dialogue_line() -> void:
	mutation_cooldown.stop()
	is_waiting_for_input = false
	balloon.focus_mode = Control.FOCUS_ALL
	balloon.grab_focus()

	var is_narration = dialogue_line.character.to_upper() == "NONE"
	var is_mystery = dialogue_line.character == "???"
	
	character_label.visible = not dialogue_line.character.is_empty() and not is_narration
	portrait.visible = not is_narration and not is_mystery
	
	var character_container = balloon.get_node("MarginContainer2")
	var portrait_container = balloon.get_node("MarginContainer3")
	
	if character_container:
		character_container.visible = not is_narration
	if portrait_container:
		portrait_container.visible = not is_narration and not is_mystery
	
	if not is_narration:
		character_label.text = tr(dialogue_line.character, "dialogue")

	_reset_sound_system()
	_update_portrait()

	dialogue_label.hide()
	var filtered_line = _create_filtered_dialogue_line()
	dialogue_label.dialogue_line = filtered_line
	
	_configure_typing_speed()
	
	responses_menu.hide()
	responses_menu.responses = dialogue_line.responses

	# Animate balloon opening
	await _animate_balloon_open()
	will_hide_balloon = false

	dialogue_label.show()
	if not dialogue_line.text.is_empty():
		dialogue_label.type_out()
		await dialogue_label.finished_typing

	if dialogue_line.responses.size() > 0:
		balloon.focus_mode = Control.FOCUS_NONE
		responses_menu.show()
	elif dialogue_line.time != "":
		var time = _calculate_auto_advance_time()
		await get_tree().create_timer(time).timeout
		next(dialogue_line.next_id)
	else:
		is_waiting_for_input = true
		balloon.focus_mode = Control.FOCUS_ALL
		balloon.grab_focus()

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
	processed_text = _apply_color_formatting(processed_text)
	
	return processed_text

func _filter_bubble_tags(text: String) -> String:
	return bubble_regex.sub(text, "", true)

func _apply_color_formatting(text: String) -> String:
	var result = text
	var matches = color_regex.search_all(text)
	
	for i in range(matches.size() - 1, -1, -1):
		var match_obj = matches[i]
		var full_match = match_obj.get_string(0)
		var content = match_obj.get_string(1)
		var color_name = match_obj.get_string(2)
		
		if color_name in pastel_colors:
			var color_hex = pastel_colors[color_name]
			var colored_text = "[color=%s]%s[/color]" % [color_hex, content]
			result = result.substr(0, match_obj.get_start()) + colored_text + result.substr(match_obj.get_end())
	
	return result

func _update_portrait():
	if dialogue_line.character.is_empty() or dialogue_line.character.to_upper() == "NONE":
		portrait.texture = null
		return
	
	var emotion = "neutral"
	for tag in dialogue_line.tags:
		if tag.begins_with("emotion="):
			emotion = tag.split("=")[1]
			break

	var portrait_path: String = "res://Img/faces/%s%s.png" % [dialogue_line.character.to_lower(), emotion.to_lower()]

	if FileAccess.file_exists(portrait_path):
		portrait.texture = load(portrait_path)
	else:
		var fallback_path: String = "res://Img/faces/%sneutral.png" % dialogue_line.character.to_lower()
		if FileAccess.file_exists(fallback_path):
			portrait.texture = load(fallback_path)
		else:
			portrait.texture = null

func _reset_sound_system():
	current_sound_index = 0
	last_sound_time = 0.0
	
	# Ajustar pitch base según el personaje
	if dialogue_line.character == "???":
		base_pitch = 0.75  # Más grave pero suave para personaje misterioso
	else:
		base_pitch = 1.0  # Normal para otros personajes
	
	for sound in talk_sounds:
		if sound.playing:
			sound.stop()

func _configure_typing_speed():
	var typing_speed = 0.02  # Slightly faster for better flow
	sound_interval = 0.03
	
	# Velocidad más lenta y suave para "???"
	if dialogue_line.character == "???":
		typing_speed = 0.035  # Más lento para efecto pacífico
		sound_interval = 0.05  # Más espaciado para suavidad
	
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
		# Ajustar variación según el personaje
		var current_pitch_variation = pitch_variation
		var pitch_range_min = 0.85
		var pitch_range_max = 1.15
		var volume_adjustment = 0.0
		
		if dialogue_line.character == "???":
			current_pitch_variation = 0.03  # Muy poca variación para voz suave y uniforme
			pitch_range_min = 0.72
			pitch_range_max = 0.78  # Rango muy estrecho para mantener tono pacífico
			volume_adjustment = -2.0  # Un poco más suave
		
		var pitch_offset = randf_range(-current_pitch_variation, current_pitch_variation)
		var volume_offset = randf_range(-volume_variation, volume_variation)
		var final_pitch = clamp(base_pitch + pitch_offset, pitch_range_min, pitch_range_max)
		
		var current_audio = talk_sounds[current_sound_index]
		current_audio.pitch_scale = final_pitch
		current_audio.volume_db = clamp(-10.0 + volume_offset + volume_adjustment, -14.0, -8.0)
		
		# Use a smoother fade in/out for each sound
		if current_audio.has_method("set_stream_volume"):
			current_audio.play()
		else:
			current_audio.play()
		
		last_sound_time = current_time
		current_sound_index = (current_sound_index + 1) % talk_sounds.size()

func _handle_punctuation_pause(letter: String):
	var pause_time = 0.0
	
	match letter:
		",", ";":
			pause_time = 0.08  # Reduced for better flow
		".", "!", "?":
			pause_time = 0.15  # Reduced for better flow
		":":
			pause_time = 0.12
		"-":
			pause_time = 0.05
	
	if pause_time > 0.0:
		await get_tree().create_timer(pause_time).timeout

func next(next_id: String) -> void:
	# Stop all sounds smoothly
	for sound in talk_sounds:
		if sound.playing:
			var fade_tween = create_tween()
			fade_tween.tween_property(sound, "volume_db", -80.0, 0.1)
			fade_tween.tween_callback(sound.stop)
	
	# Animate balloon closing before moving to next line
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

	if not is_waiting_for_input: return
	if dialogue_line.responses.size() > 0: return

	get_viewport().set_input_as_handled()

	if event is InputEventMouseButton and event.is_pressed() and event.button_index == MOUSE_BUTTON_LEFT:
		next(dialogue_line.next_id)
	elif event.is_action_pressed(next_action) and get_viewport().gui_get_focus_owner() == balloon:
		next(dialogue_line.next_id)

func _on_responses_menu_response_selected(response: DialogueResponse) -> void:
	next(response.next_id)

func _on_dialogue_label_spoke(letter: String, letter_index: int, speed: float) -> void:
	# Skip spaces with reduced volume for smoother flow
	if letter == " ":
		var space_audio = talk_sounds[current_sound_index]
		var space_pitch = base_pitch * 0.95
		var space_volume = -16.0
		if dialogue_line.character == "???":
			space_pitch = base_pitch * 0.99  # Casi sin variación para voz pacífica
			space_volume = -18.0  # Más suave en los espacios
		space_audio.pitch_scale = space_pitch
		space_audio.volume_db = space_volume
		space_audio.play()
		current_sound_index = (current_sound_index + 1) % talk_sounds.size()
		return
	
	# Handle punctuation with smoother pauses
	if letter in [",", ".", "!", "?", ";", ":", "-"]:
		_play_smooth_typing_sound()
		await _handle_punctuation_pause(letter)
		return
	
	_play_smooth_typing_sound()

func _exit_tree():
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

func trigger_emotion_for_line(line: DialogueLine):
	if not emotion_bubbles or not line:
		return
	
	var result = bubble_regex.search(line.text)
	if result:
		var full_match = result.get_string(0)
		var emotion = full_match.substr(8, full_match.length() - 9).to_lower()
		_show_emotion_bubble(emotion)
		return
	
	for tag in line.tags:
		if tag.begins_with("BUBBLE="):
			var emotion = tag.split("=")[1].to_lower()
			_show_emotion_bubble(emotion)
			return

func _show_emotion_bubble(emotion: String):
	if not emotion_bubbles or emotion == current_bubble_emotion:
		return
	
	if emotion not in emotion_animations:
		return
	
	var animation_name = emotion_animations[emotion]
	
	if not emotion_bubbles.sprite_frames or not emotion_bubbles.sprite_frames.has_animation(animation_name):
		return
	
	if current_bubble_emotion != "":
		_hide_emotion_bubble()
	
	current_bubble_emotion = emotion
	emotion_bubbles.visible = true
	emotion_bubbles.play(animation_name)
	
	emotion_bubble_timer.start(4.5)

func _hide_emotion_bubble():
	if emotion_bubbles:
		emotion_bubbles.visible = false
		emotion_bubbles.stop()
	current_bubble_emotion = ""
	emotion_bubble_timer.stop()
