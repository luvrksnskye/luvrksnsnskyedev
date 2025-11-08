extends Area2D

# =========================================================
# --- Dialogue Resources ---
# =========================================================
const REST_DIALOGUE = preload("res://assets/dialogues/rest.dialogue")
const REST_AFTER_DIALOGUE = preload("res://assets/dialogues/rest_after.dialogue")

# =========================================================
# --- Node References ---
# =========================================================
@onready var anim_player = $CinematicSleep
@onready var player = get_tree().get_first_node_in_group("Player")
@onready var music_root = get_tree().get_first_node_in_group("Music")
@onready var bgm = $"../music/bgm"
@onready var sfx = $"../music/Sfx"
@onready var ambience = $"../music/Ambience"
@onready var cinematic_music = $"music-cinematic"
@onready var fade_rect = $"../Animation_fade/FadeRect"
@onready var dialogue_balloon = $"../Player/Camera2D/ExampleBalloon"

# =========================================================
# --- State Variables ---
# =========================================================
var player_inside: bool = false
var rest_started: bool = false
var user_chose_yes: bool = false
var sleep_animation_active: bool = false
var current_dialogue_resource = null

# =========================================================
# --- Setup ---
# =========================================================
func _ready():
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)

	if dialogue_balloon:
		dialogue_balloon.visible = false

	if fade_rect:
		fade_rect.visible = true
		fade_rect.modulate.a = 0.0

	# Connect DialogueManager signals safely
	if not DialogueManager.passed_title.is_connected(_on_passed_title):
		DialogueManager.passed_title.connect(_on_passed_title)
	if not DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_dialogue_ended)

func _exit_tree():
	if DialogueManager.passed_title.is_connected(_on_passed_title):
		DialogueManager.passed_title.disconnect(_on_passed_title)
	if DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_dialogue_ended)

# =========================================================
# --- Area Events ---
# =========================================================
func _on_body_entered(body):
	if body.is_in_group("Player"):
		player_inside = true

func _on_body_exited(body):
	if body.is_in_group("Player"):
		player_inside = false

# =========================================================
# --- Process Loop ---
# =========================================================
func _process(_delta):
	# Start the rest dialogue when pressing "accept"
	if player_inside and Input.is_action_just_pressed("ui_accept") and not rest_started:
		start_rest_dialogue()

	# Keep looping the sleep animation while active
	if sleep_animation_active and player and player.has_method("play_animation"):
		player.play_animation("idle_sleep")

	if sleep_animation_active and anim_player and not anim_player.is_playing():
		anim_player.play("sleep-animation")

# =========================================================
# --- Dialogue Flow ---
# =========================================================
func start_rest_dialogue():
	rest_started = true
	user_chose_yes = false
	current_dialogue_resource = REST_DIALOGUE

	# Lock player movement globally
	ControlsLock.lock("rest")

	if player:
		player.set_movement_enabled(false)

	if dialogue_balloon:
		dialogue_balloon.visible = true

	# Start dialogue
	DialogueManager.show_dialogue_balloon(REST_DIALOGUE, "start", [])

func _on_passed_title(title: String):
	# Detect when player selects YES in dialogue
	if current_dialogue_resource == REST_DIALOGUE and title == "sleep_sequence":
		user_chose_yes = true
		print("✅ Player chose to rest.")

func _on_dialogue_ended(resource):
	if resource == REST_DIALOGUE:
		if user_chose_yes:
			start_rest_cinematic()
		else:
			cancel_rest_choice()
	elif resource == REST_AFTER_DIALOGUE:
		await transition_to_next_scene()

func cancel_rest_choice():
	print("❌ Player chose not to rest.")
	rest_started = false
	current_dialogue_resource = null
	user_chose_yes = false

	if dialogue_balloon:
		dialogue_balloon.visible = false

# =========================================================
# --- Rest Cinematic Sequence ---
# =========================================================
func start_rest_cinematic() -> void:
	await get_tree().process_frame
	print("=== STARTING REST CINEMATIC ===")

	if player:
		player.set_movement_enabled(false)

	# Fade out and stop music before resting
	await fade_screen(true)
	await fade_out_bgm()
	await fade_out_all_audio(true)
	await get_tree().create_timer(1.5).timeout

	# Play cinematic sleep animation
	anim_player.play("sleep-animation")
	sleep_animation_active = true
	await anim_player.animation_finished

	# Keep player in sleeping state
	if player:
		player.play_animation("idle_sleep")

	# Fade back in slightly and start ambience again
	await fade_screen(false)
	await fade_in_ambience()

	# Start soft cinematic music
	if cinematic_music:
		cinematic_music.volume_db = -30
		cinematic_music.play()
		var tween_music = create_tween()
		tween_music.tween_property(cinematic_music, "volume_db", -10, 1.5)
		await tween_music.finished

	# Start second (after rest) dialogue
	current_dialogue_resource = REST_AFTER_DIALOGUE
	sleep_animation_active = true

	if anim_player and anim_player.has_animation("sleep-animation"):
		anim_player.play("sleep-animation")

	if player:
		player.play_animation("idle_sleep")

	if dialogue_balloon:
		dialogue_balloon.visible = true

	DialogueManager.show_dialogue_balloon(REST_AFTER_DIALOGUE, "start", [])

# =========================================================
# --- Audio / Visual Fades ---
# =========================================================
func fade_screen(to_black: bool) -> void:
	if not fade_rect:
		return
	var tween := create_tween()
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(fade_rect, "modulate:a", (1.0 if to_black else 0.0), 1.5)
	await tween.finished

func fade_out_bgm() -> void:
	if bgm and bgm.playing:
		var tween := create_tween()
		tween.tween_property(bgm, "volume_db", -80, 2.5)
		await tween.finished
		bgm.stop()

func fade_out_all_audio(exclude_bgm: bool = false) -> void:
	if not music_root:
		return

	var audio_nodes: Array = []
	for node in music_root.get_children():
		if (node is AudioStreamPlayer or node is AudioStreamPlayer2D) and (not exclude_bgm or node != bgm):
			audio_nodes.append(node)

	if audio_nodes.is_empty():
		return

	var tween := create_tween()
	tween.set_parallel(true)
	for node in audio_nodes:
		tween.tween_property(node, "volume_db", -80, 1.8)
	await tween.finished

	for node in audio_nodes:
		node.stop()

func fade_in_ambience() -> void:
	if not music_root:
		return

	var ambience_nodes: Array = []
	for node in music_root.get_children():
		if node is AudioStreamPlayer or node is AudioStreamPlayer2D:
			if "ambience" in node.name.to_lower() or "sfx" in node.name.to_lower():
				ambience_nodes.append(node)

	if ambience_nodes.is_empty():
		return

	var tween := create_tween()
	tween.set_parallel(true)
	for node in ambience_nodes:
		node.play()
		node.volume_db = -40
		tween.tween_property(node, "volume_db", -15, 1.5)
	await tween.finished

# =========================================================
# --- Scene Transition ---
# =========================================================
func transition_to_next_scene() -> void:
	print("🌀 Transitioning to next scene: her.tscn")

	# Ensure the player stays in sleep state
	sleep_animation_active = true
	if player:
		player.play_animation("idle_sleep")
		player.set_movement_enabled(false)

	# Fade out audio (but NOT visual - let SceneManager handle that)
	var fade_audio = create_tween()
	fade_audio.set_parallel(true)
	for node in [bgm, sfx, ambience, cinematic_music]:
		if node and node.playing:
			fade_audio.tween_property(node, "volume_db", -80, 2.0)

	await fade_audio.finished

	# Stop all audio completely
	for node in [bgm, sfx, ambience, cinematic_music]:
		if node and node.playing:
			node.stop()

	await get_tree().create_timer(0.3).timeout

	# SOLO CAMBIO AQUÍ: Usar SceneManager
	var scene_manager = get_tree().get_root().get_node_or_null("SceneManager")
	if scene_manager:
		print("🎮 RestArea: Usando SceneManager para cargar her.tscn")
		await scene_manager.change_scene_with_loading("res://scenes/her.tscn")
	else:
		push_error("❌ SceneManager no encontrado - usando fallback directo")
		get_tree().change_scene_to_file("res://scenes/her.tscn")
