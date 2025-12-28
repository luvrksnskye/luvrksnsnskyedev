extends Node

# ============================================
# ============================================
const SKILLS_DB_PATH: String = "res://singletons/database/skills_database.json"
const CHARACTER_PROFILE_PATH: String = "res://singletons/database/characters_profile.json"

# ============================================
# DATA CARGADA
# ============================================
var skills_data: Dictionary = {}              # JSON completo de skills_database
var skills: Dictionary = {}                   # skills[id] -> dict
var characters: Dictionary = {}               # characters[name] -> dict
var default_loadouts: Dictionary = {}         # default_loadouts[name] -> dict
var emotion_system: Dictionary = {}           # emotion_system -> dict
var skill_categories: Dictionary = {}         # skill_categories -> dict
var emotion_chart: Dictionary = {}            # emotion_chart -> dict

var character_profile: Dictionary = {}       # character_profile[name] -> dict

# ============================================
# ESTADO
# ============================================
var skills_loaded: bool = false
var profile_loaded: bool = false


func _ready() -> void:
	_load_skills_database()
	_load_character_profile()


# ============================================
# LOADERS
# ============================================
func _load_skills_database() -> void:
	var file := FileAccess.open(SKILLS_DB_PATH, FileAccess.READ)
	if file == null:
		push_error("SkillsManager: Could not open skills database at: %s" % SKILLS_DB_PATH)
		skills_loaded = false
		return
	
	var text: String = file.get_as_text()
	var result = JSON.parse_string(text)
	
	if typeof(result) != TYPE_DICTIONARY:
		push_error("SkillsManager: Invalid JSON format in skills_database.json")
		skills_loaded = false
		return
	
	skills_data = result
	
	# extraer secciones importantes si existen
	skills = skills_data.get("skills", {})
	characters = skills_data.get("characters", {})
	default_loadouts = skills_data.get("default_loadouts", {})
	emotion_system = skills_data.get("emotion_system", {})
	skill_categories = skills_data.get("skill_categories", {})
	emotion_chart = skills_data.get("emotion_chart", {})
	
	skills_loaded = true


func _load_character_profile() -> void:
	var file := FileAccess.open(CHARACTER_PROFILE_PATH, FileAccess.READ)
	if file == null:
		push_error("SkillsManager: Could not open character profile JSON at: %s" % CHARACTER_PROFILE_PATH)
		profile_loaded = false
		return
	
	var text: String = file.get_as_text()
	var result = JSON.parse_string(text)
	
	if typeof(result) != TYPE_DICTIONARY:
		push_error("SkillsManager: Invalid JSON format in character_profile.json")
		profile_loaded = false
		return
	
	character_profile = result.get("character_profile", {})
	profile_loaded = true


# ============================================
# STATUS HELPERS
# ============================================
func is_loaded() -> bool:
	return skills_loaded


func are_profile_loaded() -> bool:
	return profile_loaded


# ============================================
# CHARACTER HELPERS
# ============================================
@warning_ignore("shadowed_variable_base_class")
func _normalize_character_key(name: String) -> String:
	# por si en otro lado usas "Rainy" o "RAINY"
	return name.strip_edges().to_lower()


@warning_ignore("shadowed_variable_base_class")
func has_character(name: String) -> bool:
	var key := _normalize_character_key(name)
	return characters.has(key)


@warning_ignore("shadowed_variable_base_class")
func get_character_data(name: String) -> Dictionary:
	var key := _normalize_character_key(name)
	if characters.has(key):
		return characters[key]
	return {}


@warning_ignore("shadowed_variable_base_class")
func get_character_profile(name: String) -> Dictionary:
	if not profile_loaded:
		return {}
	
	var key := _normalize_character_key(name)
	if character_profile.has(key):
		return character_profile[key]
	
	return {}


# ============================================
# SKILL LOOKUP
# ============================================
func has_skill(skill_id: String) -> bool:
	return skills.has(skill_id)


func get_skill(skill_id: String) -> Dictionary:
	if skills.has(skill_id):
		return skills[skill_id]
	return {}


# Devuelve todas las skills de un personaje (combat + action si quieres)
@warning_ignore("shadowed_variable_base_class")
func get_all_skills_for_character(name: String, include_combat: bool = true, include_action: bool = true) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	if not skills_loaded:
		return result
	
	var key := _normalize_character_key(name)
	if not characters.has(key):
		return result
	
	for skill_id in skills.keys():
		var skill_data: Dictionary = skills[skill_id]
		if not skill_data.has("characters"):
			continue
		
		var char_list: Array = skill_data["characters"]
		if not char_list.has(key):
			continue
		
		var t := String(skill_data.get("type", "combat"))
		if (t == "combat" and include_combat) or (t == "action" and include_action):
			result.append(skill_data)
	
	return result


# ============================================
# LOADOUTS (SLOTS POR DEFECTO)
# ============================================
@warning_ignore("shadowed_variable_base_class")
func get_default_loadout(name: String) -> Dictionary:
	var key := _normalize_character_key(name)
	if default_loadouts.has(key):
		return default_loadouts[key]
	return {}


@warning_ignore("shadowed_variable_base_class")
func get_character_combat_slots(name: String) -> Array[String]:
	var key := _normalize_character_key(name)
	var loadout := get_default_loadout(key)
	if loadout.is_empty():
		return []
	
	# ["calm_down", "cherish", "sad_poem", "encore"]
	var slots: Array = loadout.get("combat_slots", [])
	var result: Array[String] = []
	for s in slots:
		if typeof(s) == TYPE_STRING:
			result.append(s)
		else:
			result.append("")  # o null si prefieres
	return result


@warning_ignore("shadowed_variable_base_class")
func get_character_action_slots(name: String) -> Array[String]:
	var key := _normalize_character_key(name)
	var loadout := get_default_loadout(key)
	if loadout.is_empty():
		return []
	
	var slots: Array = loadout.get("action_slots", [])
	var result: Array[String] = []
	for s in slots:
		if typeof(s) == TYPE_STRING:
			result.append(s)
		else:
			result.append("")
	return result


# Devuelve las skills de combate en el orden de los slots (para el menú)
@warning_ignore("shadowed_variable_base_class")
func get_character_combat_skills_data(name: String) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	if not skills_loaded:
		return result
	
	var slots := get_character_combat_slots(name)
	for skill_id in slots:
		if skill_id == "" or not skills.has(skill_id):
			continue
		result.append(skills[skill_id])
	
	return result


# Devuelve las action skills en el orden de los slots
@warning_ignore("shadowed_variable_base_class")
func get_character_action_skills_data(name: String) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	if not skills_loaded:
		return result
	
	var slots := get_character_action_slots(name)
	for skill_id in slots:
		if skill_id == "" or not skills.has(skill_id):
			continue
		result.append(skills[skill_id])
	
	return result


# ============================================
# EMOTION / CATEGORIES HELPERS
# ============================================
func get_emotion_system() -> Dictionary:
	return emotion_system


func get_skill_categories() -> Dictionary:
	return skill_categories


func get_emotion_chart() -> Dictionary:
	return emotion_chart
