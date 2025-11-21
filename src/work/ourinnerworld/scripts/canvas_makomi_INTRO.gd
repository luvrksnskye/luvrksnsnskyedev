extends Control

# ============================================
# NODE REFERENCES
# ============================================
@onready var painter_image: Sprite2D = $Canvas/PainterImage
@onready var dialogue_balloon = $Makomi_Dialogue/ExampleBalloon
@onready var timer_label: Label = $UI/TimerLabel 
@onready var paint_ui_vbox: Node = $UI
@onready var paint_ui_grid: Control = $UI/MarginContainer2/Panel/GridContainer
@onready var finish_button: Button = $UI/VBoxContainer/FINISH

# ============================================
# AUDIO
# ============================================
@onready var sfx_challenge_start: AudioStreamPlayer = $"Sounds/sfx-challenge-start"
@onready var sfx_challenge_complete: AudioStreamPlayer = $"Sounds/sfx-challenge-complete"
@onready var sfx_timer_warning: AudioStreamPlayer = $"Sounds/sfx-timer-warning"
@onready var sfx_timer_tick: AudioStreamPlayer = $"Sounds/sfx-timer-tick"

# ============================================
# DIALOGUE RESOURCES
# ============================================
const INTRO_DIALOGUE = preload("res://assets/dialogues/paint_guide/intro.dialogue")
const TURN_DIALOGUE = preload("res://assets/dialogues/paint_guide/turn.dialogue")
const GREETINGS_DIALOGUE = preload("res://assets/dialogues/paint_guide/makomi_greetings.dialogue")
const RESULTS_DIALOGUE = preload("res://assets/dialogues/paint_guide/challenge_results.dialogue")

# ============================================
# STATE
# ============================================
var current_challenge: Dictionary = {}
var challenge_active: bool = false
var challenge_timer: float = 0.0
var timer_warning_played: bool = false
var is_first_time_session: bool = false
var evaluator = preload("res://scripts/ChallengeEvaluator.gd").new()

# ============================================
# LIFECYCLE
# ============================================
func _ready() -> void:
	if timer_label:
		timer_label.hide()
	
	_hide_paint_ui()
	add_child(evaluator)
	
	if finish_button:
		finish_button.pressed.connect(_on_finish_button_pressed)
	
	await get_tree().process_frame
	
	is_first_time_session = SaveManager.is_first_time_canvas()
	
	if is_first_time_session:
		start_intro_dialogue()
	else:
		start_greetings_dialogue()

func _process(delta: float) -> void:
	if not challenge_active or not current_challenge.has("time_limit"):
		return
	
	challenge_timer -= delta
	
	if timer_label and timer_label.visible:
		_update_timer_display()
		_handle_timer_warnings()
	
	if challenge_timer <= 0.0:
		end_challenge()

# ============================================
# TIMER LOGIC
# ============================================
func _update_timer_display() -> void:
	var minutes = int(challenge_timer) / 60
	var seconds = int(challenge_timer) % 60
	timer_label.text = "%02d:%02d" % [minutes, seconds]

func _handle_timer_warnings() -> void:
	if challenge_timer <= 10.0 and challenge_timer > 0.0:
		timer_label.modulate = Color.RED if int(challenge_timer * 2) % 2 == 0 else Color.WHITE
		
		if not timer_warning_played:
			sfx_timer_warning.play()
			timer_warning_played = true
	
	if challenge_timer <= 5.0 and challenge_timer > 0.0:
		var tick_interval = int(challenge_timer * 2)
		var prev_tick = int((challenge_timer + get_process_delta_time()) * 2)
		if tick_interval != prev_tick:
			sfx_timer_tick.play()

func _stop_timer_sounds() -> void:
	var tween = create_tween().set_parallel(true)
	
	if sfx_timer_warning.playing:
		tween.tween_property(sfx_timer_warning, "volume_db", -80, 0.3)
	
	if sfx_timer_tick.playing:
		tween.tween_property(sfx_timer_tick, "volume_db", -80, 0.3)
	
	await tween.finished
	
	sfx_timer_warning.stop()
	sfx_timer_tick.stop()
	sfx_timer_warning.volume_db = 0
	sfx_timer_tick.volume_db = 0

# ============================================
# UI CONTROL
# ============================================
func _hide_paint_ui() -> void:
	if paint_ui_vbox:
		paint_ui_vbox.hide()
	if paint_ui_grid:
		paint_ui_grid.hide()

func _show_paint_ui() -> void:
	if paint_ui_vbox:
		paint_ui_vbox.show()
	if paint_ui_grid:
		paint_ui_grid.show()

# ============================================
# BUTTON HANDLERS
# ============================================
func _on_finish_button_pressed() -> void:
	if challenge_active and not current_challenge.has("time_limit"):
		if not _is_dialogue_active():
			submit_challenge()

# ============================================
# HELPERS
# ============================================
func _play_sound(sound: AudioStreamPlayer) -> void:
	if sound and sound.stream:
		sound.play()

func _is_dialogue_active() -> bool:
	return dialogue_balloon and dialogue_balloon.visible

func _start_new_drawing_session() -> void:
	painter_image.start_new_drawing_session()

# ============================================
# DIALOGUE FLOWS
# ============================================
func start_intro_dialogue() -> void:
	_hide_paint_ui()
	
	if dialogue_balloon:
		dialogue_balloon.visible = true
	
	DialogueManager.show_dialogue_balloon(INTRO_DIALOGUE, "start", [])
	
	if not DialogueManager.dialogue_ended.is_connected(_on_intro_ended):
		DialogueManager.dialogue_ended.connect(_on_intro_ended)

func _on_intro_ended(dialogue_resource) -> void:
	DialogueManager.dialogue_ended.disconnect(_on_intro_ended)
	start_turn_dialogue()

func start_turn_dialogue() -> void:
	_hide_paint_ui()
	
	if dialogue_balloon:
		dialogue_balloon.visible = true
	
	DialogueManager.show_dialogue_balloon(TURN_DIALOGUE, "start", [])
	
	if not DialogueManager.dialogue_ended.is_connected(_on_turn_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_turn_dialogue_ended)

func _on_turn_dialogue_ended(dialogue_resource) -> void:
	DialogueManager.dialogue_ended.disconnect(_on_turn_dialogue_ended)
	SaveManager.mark_canvas_visited()

func start_greetings_dialogue() -> void:
	_hide_paint_ui()
	
	if dialogue_balloon:
		dialogue_balloon.visible = true
	
	DialogueManager.show_dialogue_balloon(GREETINGS_DIALOGUE, "start", [])
	
	if not DialogueManager.dialogue_ended.is_connected(_on_greetings_ended):
		DialogueManager.dialogue_ended.connect(_on_greetings_ended)

func _on_greetings_ended(dialogue_resource) -> void:
	if dialogue_balloon:
		dialogue_balloon.visible = false
	
	DialogueManager.dialogue_ended.disconnect(_on_greetings_ended)

# ============================================
# CHALLENGE START
# ============================================
func start_free_paint() -> void:
	challenge_active = false
	current_challenge = {}
	
	if dialogue_balloon:
		dialogue_balloon.visible = false
	
	await get_tree().process_frame
	
	_start_new_drawing_session()
	_show_paint_ui()

func start_random_challenge() -> void:
	var challenge = ChallengeData.get_random_challenge()
	start_challenge(challenge)

func start_challenge_by_type(type: int) -> void:
	var challenge = ChallengeData.get_random_challenge_by_type(type)
	start_challenge(challenge)

func start_challenge_by_id(challenge_id: String) -> void:
	var challenge = ChallengeData.get_challenge_by_id(challenge_id)
	start_challenge(challenge)

func start_challenge(challenge: Dictionary) -> void:
	if challenge.is_empty():
		return
	
	current_challenge = challenge
	challenge_active = true
	timer_warning_played = false
	
	_hide_paint_ui()
	_play_sound(sfx_challenge_start)
	
	var dialogue_path = challenge.get("dialogue", "")
	if dialogue_path != "" and FileAccess.file_exists(dialogue_path):
		var challenge_dialogue = load(dialogue_path)
		DialogueManager.show_dialogue_balloon(challenge_dialogue, "start", [])
		if not DialogueManager.dialogue_ended.is_connected(_on_challenge_dialogue_ended):
			DialogueManager.dialogue_ended.connect(_on_challenge_dialogue_ended)
	else:
		_on_challenge_dialogue_ended(null)

func _on_challenge_dialogue_ended(dialogue_resource) -> void:
	DialogueManager.dialogue_ended.disconnect(_on_challenge_dialogue_ended)
	
	if dialogue_balloon:
		dialogue_balloon.visible = false
	
	await get_tree().process_frame
	
	_start_new_drawing_session()
	
	if current_challenge.has("time_limit"):
		challenge_timer = current_challenge["time_limit"]
		if timer_label:
			timer_label.show()
			timer_label.modulate = Color.WHITE
	
	_apply_challenge_restrictions()
	_show_paint_ui()

func _apply_challenge_restrictions() -> void:
	match current_challenge.get("type", -1):
		ChallengeData.ChallengeType.BRUSH_CHALLENGE:
			var brush_min = current_challenge.get("brush_min", 1)
			var brush_max = current_challenge.get("brush_max", 20)
			painter_image.brush_size = (brush_min + brush_max) / 2

# ============================================
# CHALLENGE END
# ============================================
func end_challenge() -> void:
	challenge_active = false
	
	if current_challenge.has("time_limit"):
		await _stop_timer_sounds()
	
	if timer_label:
		timer_label.hide()
		timer_label.modulate = Color.WHITE
	
	_play_sound(sfx_challenge_complete)
	
	var image_copy = painter_image.get_image_copy()
	var result = evaluator.evaluate_painting(image_copy, current_challenge)
	
	SaveManager.complete_challenge(
		current_challenge["id"], 
		result.score, 
		result.rank, 
		result.feedback
	)
	SaveManager.increment_paintings()
	
	_show_results_dialogue(result)

func submit_challenge() -> void:
	if challenge_active and not current_challenge.has("time_limit"):
		end_challenge()

func cancel_challenge() -> void:
	challenge_active = false
	current_challenge = {}
	
	if timer_label:
		timer_label.hide()
	
	start_greetings_dialogue()

# ============================================
# RESULTS
# ============================================
func _show_results_dialogue(result) -> void:
	if not FileAccess.file_exists("res://assets/dialogues/paint_guide/challenge_results.dialogue"):
		return
	
	SaveManager.game_data["last_result_score"] = snapped(result.score, 0.1)
	SaveManager.game_data["last_result_rank"] = result.rank
	SaveManager.game_data["last_result_feedback"] = result.feedback
	
	_hide_paint_ui()
	
	if dialogue_balloon:
		dialogue_balloon.visible = true
	
	DialogueManager.show_dialogue_balloon(RESULTS_DIALOGUE, "start", [])
	
	if not DialogueManager.dialogue_ended.is_connected(_on_results_ended):
		DialogueManager.dialogue_ended.connect(_on_results_ended)

func _on_results_ended(dialogue_resource) -> void:
	DialogueManager.dialogue_ended.disconnect(_on_results_ended)
	
	var action = SaveManager.game_data.get("next_action", "")
	current_challenge = {}
	
	match action:
		"another":
			SaveManager.game_data["next_action"] = ""
			start_greetings_dialogue()
		"free":
			SaveManager.game_data["next_action"] = ""
			if dialogue_balloon:
				dialogue_balloon.visible = false
			await get_tree().process_frame
			start_free_paint()
		"done":
			SaveManager.game_data["next_action"] = ""
			if dialogue_balloon:
				dialogue_balloon.visible = false
		_:
			start_greetings_dialogue()
