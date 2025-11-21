extends Node

# ============================================
# SAVE MANAGER 
# ============================================

const SAVE_PATH := "user://save_game.dat"
const SAVE_PASSWORD := "paint_save_encrypted" # clave genérica

var game_data : Dictionary = {
	"first_time_canvas": true,
	"completed_challenges": [],
	"total_challenges_completed": 0,
	"best_scores": {},
	"last_challenge_id": "",
	"player_stats": {
		"total_paintings": 0,
		"favorite_color": Color.WHITE,
		"total_paint_time": 0.0
	},
	"last_result_score": 0.0,
	"last_result_rank": "",
	"last_result_feedback": "",
	"next_action": ""
}

# ============================================
# INITIALIZATION
# ============================================
func _ready() -> void:
	load_game()

# ============================================
# SAVE & LOAD (ENCRYPTED)
# ============================================
func save_game() -> void:
	var save_file := FileAccess.open_encrypted_with_pass(SAVE_PATH, FileAccess.WRITE, SAVE_PASSWORD)
	if save_file:
		save_file.store_var(game_data)
		save_file.close()
		print("💾 Game saved (encrypted)")
	else:
		push_error("❌ Failed to save game (encrypted)")

func load_game() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		var save_file := FileAccess.open_encrypted_with_pass(SAVE_PATH, FileAccess.READ, SAVE_PASSWORD)
		if save_file:
			game_data = save_file.get_var()
			save_file.close()
			print("📂 Encrypted save loaded successfully")
		else:
			push_error("❌ Failed to load encrypted save")
	else:
		print("📄 No save file found, using defaults")

# ============================================
# CANVAS FIRST TIME
# ============================================
func is_first_time_canvas() -> bool:
	return game_data.get("first_time_canvas", true)

func mark_canvas_visited() -> void:
	game_data["first_time_canvas"] = false
	save_game()

# ============================================
# CHALLENGE MANAGEMENT
# ============================================
func complete_challenge(challenge_id: String, score: float, rank: String, feedback: String) -> void:
	if challenge_id not in game_data["completed_challenges"]:
		game_data["completed_challenges"].append(challenge_id)

	game_data["total_challenges_completed"] += 1
	game_data["last_challenge_id"] = challenge_id
	
	game_data["last_result_score"] = snapped(score, 0.1)
	game_data["last_result_rank"] = rank
	game_data["last_result_feedback"] = feedback

	var current_best: float = game_data["best_scores"].get(challenge_id, 0.0)
	if score > current_best:
		game_data["best_scores"][challenge_id] = score

	save_game()

func has_completed_challenge(challenge_id: String) -> bool:
	return challenge_id in game_data["completed_challenges"]

func get_challenge_best_score(challenge_id: String) -> float:
	return game_data["best_scores"].get(challenge_id, 0.0)

# ============================================
# STATS HELPERS
# ============================================
func get_average_score() -> float:
	if game_data["best_scores"].is_empty():
		return 0.0
	var total := 0.0
	for score in game_data["best_scores"].values():
		total += score
	return total / game_data["best_scores"].size()

func get_highest_score() -> float:
	if game_data["best_scores"].is_empty():
		return 0.0
	var highest := 0.0
	for score in game_data["best_scores"].values():
		if score > highest:
			highest = score
	return highest

func get_average_score_int() -> int:
	return int(get_average_score())

func get_highest_score_int() -> int:
	return int(get_highest_score())

# ============================================
# HUMAN-READABLE PAINT TIME
# ============================================
func get_human_paint_time() -> String:
	var total: float = game_data["player_stats"]["total_paint_time"]

	if total < 60.0:
		return "Less than a minute"

	if total < 3600.0:
		var mins: int = int(total / 60.0)
		return str(mins) + " minutes"

	var hours: int = int(total / 3600.0)
	var minutes: int = int(fmod(total, 3600.0) / 60.0)

	var result := str(hours) + "h"
	if minutes > 0:
		result += " " + str(minutes) + "m"

	return result


# ============================================
# DIFFICULTY COUNTS
# ============================================
func get_easy_challenges_count() -> int:
	var count := 0
	for challenge_id in game_data["completed_challenges"]:
		var challenge = ChallengeData.get_challenge_by_id(challenge_id)
		if challenge.get("difficulty", 0) == 1:
			count += 1
	return count

func get_medium_challenges_count() -> int:
	var count := 0
	for challenge_id in game_data["completed_challenges"]:
		var challenge = ChallengeData.get_challenge_by_id(challenge_id)
		if challenge.get("difficulty", 0) == 2:
			count += 1
	return count

func get_hard_challenges_count() -> int:
	var count := 0
	for challenge_id in game_data["completed_challenges"]:
		var challenge = ChallengeData.get_challenge_by_id(challenge_id)
		if challenge.get("difficulty", 0) == 3:
			count += 1
	return count

# ============================================
# PLAYER STATS
# ============================================
func increment_paintings() -> void:
	game_data["player_stats"]["total_paintings"] += 1
	save_game()

func update_favorite_color(color: Color) -> void:
	game_data["player_stats"]["favorite_color"] = color
	save_game()

func add_paint_time(delta: float) -> void:
	game_data["player_stats"]["total_paint_time"] += delta
	save_game()

# ============================================
# RESET
# ============================================
func reset_save() -> void:
	game_data = {
		"first_time_canvas": true,
		"completed_challenges": [],
		"total_challenges_completed": 0,
		"best_scores": {},
		"last_challenge_id": "",
		"player_stats": {
			"total_paintings": 0,
			"favorite_color": Color.WHITE,
			"total_paint_time": 0.0
		},
		"last_result_score": 0.0,
		"last_result_rank": "",
		"last_result_feedback": "",
		"next_action": ""
	}
	save_game()
	print("🔄 Encrypted save reset")
