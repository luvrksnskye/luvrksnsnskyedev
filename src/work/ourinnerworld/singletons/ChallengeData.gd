extends Node

# ============================================
# CHALLENGE DATA 
# ============================================

enum ChallengeType {
	FREE_STYLE,      # Free painting, no restrictions
	TIMED,           # Complete within time limit
	COLOR_LIMIT,     # Use only specific colors
	STYLE_BASED,     # Follow art style (abstract, minimalist, etc)
	THEME_BASED,     # Draw specific theme (nature, space, etc)
	BRUSH_CHALLENGE, # Use specific brush sizes
	SYMMETRY,        # Create symmetrical art
	MONOCHROME,      # Use only one color + black/white
}

# ============================================
# CHALLENGE DEFINITIONS
# ============================================
var challenges : Array[Dictionary] = [
	# ========== TIMED CHALLENGES ==========
	{
		"id": "speed_paint_30",
		"name": "Speed Paint: 30 Seconds",
		"type": ChallengeType.TIMED,
		"description": "Create anything you want in just 30 seconds!",
		"time_limit": 30.0,
		"dialogue": "res://assets/dialogues/challenges/timed_30s.dialogue",
		"evaluation_criteria": ["creativity", "coverage"],
		"difficulty": 1
	},
	{
		"id": "speed_paint_60",
		"name": "Speed Paint: 1 Minute",
		"type": ChallengeType.TIMED,
		"description": "Paint a landscape in 60 seconds!",
		"time_limit": 60.0,
		"dialogue": "res://assets/dialogues/challenges/timed_60s.dialogue",
		"evaluation_criteria": ["creativity", "coverage", "color_variety"],
		"difficulty": 2
	},
	{
		"id": "speed_paint_120",
		"name": "Speed Paint: 2 Minutes",
		"type": ChallengeType.TIMED,
		"description": "Create a portrait in 2 minutes!",
		"time_limit": 120.0,
		"dialogue": "res://assets/dialogues/challenges/timed_120s.dialogue",
		"evaluation_criteria": ["creativity", "coverage", "color_variety", "detail"],
		"difficulty": 3
	},
	
	# ========== STYLE-BASED CHALLENGES ==========
	{
		"id": "abstract_art",
		"name": "Abstract Expression",
		"type": ChallengeType.STYLE_BASED,
		"description": "Create an abstract artwork with bold shapes and colors!",
		"style": "abstract",
		"dialogue": "res://assets/dialogues/challenges/style_abstract.dialogue",
		"evaluation_criteria": ["creativity", "color_variety", "coverage"],
		"difficulty": 1
	},
	{
		"id": "minimalist_art",
		"name": "Minimalist Beauty",
		"type": ChallengeType.STYLE_BASED,
		"description": "Less is more! Create art using minimal elements.",
		"style": "minimalist",
		"dialogue": "res://assets/dialogues/challenges/style_minimalist.dialogue",
		"evaluation_criteria": ["simplicity", "balance", "color_harmony"],
		"difficulty": 2
	},
	{
		"id": "geometric_art",
		"name": "Geometric Shapes",
		"type": ChallengeType.STYLE_BASED,
		"description": "Use geometric shapes to create a composition!",
		"style": "geometric",
		"dialogue": "res://assets/dialogues/challenges/style_geometric.dialogue",
		"evaluation_criteria": ["precision", "balance", "color_harmony"],
		"difficulty": 2
	},
	{
		"id": "impressionist",
		"name": "Impressionist Style",
		"type": ChallengeType.STYLE_BASED,
		"description": "Paint with soft, blended strokes like the impressionists!",
		"style": "impressionist",
		"dialogue": "res://assets/dialogues/challenges/style_impressionist.dialogue",
		"evaluation_criteria": ["color_blending", "softness", "coverage"],
		"difficulty": 3
	},
	{
		"id": "pop_art",
		"name": "Pop Art Vibes",
		"type": ChallengeType.STYLE_BASED,
		"description": "Bold colors and strong contrasts - make it pop!",
		"style": "pop_art",
		"dialogue": "res://assets/dialogues/challenges/style_pop_art.dialogue",
		"evaluation_criteria": ["contrast", "color_variety", "boldness"],
		"difficulty": 2
	},
	
	# ========== COLOR LIMIT CHALLENGES ==========
	{
		"id": "rainbow_only",
		"name": "Rainbow Spectrum",
		"type": ChallengeType.COLOR_LIMIT,
		"description": "Use all the colors of the rainbow!",
		"allowed_colors": [Color.RED, Color.ORANGE, Color.YELLOW, Color.GREEN, Color.BLUE, Color.PURPLE],
		"dialogue": "res://assets/dialogues/challenges/color_rainbow.dialogue",
		"evaluation_criteria": ["color_variety", "creativity", "coverage"],
		"difficulty": 1
	},
	{
		"id": "warm_colors",
		"name": "Warm Palette",
		"type": ChallengeType.COLOR_LIMIT,
		"description": "Use only warm colors: reds, oranges, and yellows!",
		"allowed_colors": [Color("#FF6B6B"), Color("#FF8C42"), Color("#FFC65D"), Color("#FFE66D")],
		"dialogue": "res://assets/dialogues/challenges/color_warm.dialogue",
		"evaluation_criteria": ["color_harmony", "creativity", "coverage"],
		"difficulty": 2
	},
	{
		"id": "cool_colors",
		"name": "Cool Palette",
		"type": ChallengeType.COLOR_LIMIT,
		"description": "Use only cool colors: blues, greens, and purples!",
		"allowed_colors": [Color("#4ECDC4"), Color("#44A08D"), Color("#6C5CE7"), Color("#A29BFE")],
		"dialogue": "res://assets/dialogues/challenges/color_cool.dialogue",
		"evaluation_criteria": ["color_harmony", "creativity", "coverage"],
		"difficulty": 2
	},
	{
		"id": "three_colors",
		"name": "Triadic Challenge",
		"type": ChallengeType.COLOR_LIMIT,
		"description": "Use only three colors of your choice!",
		"max_colors": 3,
		"dialogue": "res://assets/dialogues/challenges/color_three.dialogue",
		"evaluation_criteria": ["color_harmony", "creativity", "balance"],
		"difficulty": 3
	},
	
	# ========== MONOCHROME CHALLENGES ==========
	{
		"id": "monochrome_red",
		"name": "Shades of Red",
		"type": ChallengeType.MONOCHROME,
		"description": "Use only red and its shades!",
		"base_color": Color.RED,
		"dialogue": "res://assets/dialogues/challenges/mono_red.dialogue",
		"evaluation_criteria": ["shade_variety", "creativity", "coverage"],
		"difficulty": 2
	},
	{
		"id": "monochrome_blue",
		"name": "Shades of Blue",
		"type": ChallengeType.MONOCHROME,
		"description": "Use only blue and its shades!",
		"base_color": Color.BLUE,
		"dialogue": "res://assets/dialogues/challenges/mono_blue.dialogue",
		"evaluation_criteria": ["shade_variety", "creativity", "coverage"],
		"difficulty": 2
	},
	{
		"id": "black_and_white",
		"name": "Black & White",
		"type": ChallengeType.MONOCHROME,
		"description": "Create art using only black, white, and gray!",
		"base_color": Color.WHITE,
		"dialogue": "res://assets/dialogues/challenges/mono_bw.dialogue",
		"evaluation_criteria": ["contrast", "creativity", "detail"],
		"difficulty": 3
	},
	
	# ========== THEME-BASED CHALLENGES ==========
	{
		"id": "nature_theme",
		"name": "Nature's Beauty",
		"type": ChallengeType.THEME_BASED,
		"description": "Paint something inspired by nature!",
		"theme": "nature",
		"dialogue": "res://assets/dialogues/challenges/theme_nature.dialogue",
		"evaluation_criteria": ["creativity", "color_harmony", "coverage"],
		"difficulty": 2
	},
	{
		"id": "space_theme",
		"name": "Space Odyssey",
		"type": ChallengeType.THEME_BASED,
		"description": "Create a cosmic scene from outer space!",
		"theme": "space",
		"dialogue": "res://assets/dialogues/challenges/theme_space.dialogue",
		"evaluation_criteria": ["creativity", "color_variety", "atmosphere"],
		"difficulty": 2
	},
	{
		"id": "ocean_theme",
		"name": "Under the Sea",
		"type": ChallengeType.THEME_BASED,
		"description": "Paint an underwater scene!",
		"theme": "ocean",
		"dialogue": "res://assets/dialogues/challenges/theme_ocean.dialogue",
		"evaluation_criteria": ["creativity", "color_harmony", "detail"],
		"difficulty": 2
	},
	{
		"id": "sunset_theme",
		"name": "Golden Hour",
		"type": ChallengeType.THEME_BASED,
		"description": "Capture the beauty of a sunset!",
		"theme": "sunset",
		"dialogue": "res://assets/dialogues/challenges/theme_sunset.dialogue",
		"evaluation_criteria": ["color_blending", "atmosphere", "creativity"],
		"difficulty": 3
	},
	{
		"id": "city_theme",
		"name": "Urban Landscape",
		"type": ChallengeType.THEME_BASED,
		"description": "Paint a cityscape or urban scene!",
		"theme": "city",
		"dialogue": "res://assets/dialogues/challenges/theme_city.dialogue",
		"evaluation_criteria": ["detail", "perspective", "creativity"],
		"difficulty": 3
	},
	{
		"id": "emotion_happy",
		"name": "Express Joy",
		"type": ChallengeType.THEME_BASED,
		"description": "Create art that expresses happiness!",
		"theme": "joy",
		"dialogue": "res://assets/dialogues/challenges/theme_joy.dialogue",
		"evaluation_criteria": ["creativity", "color_vibrancy", "energy"],
		"difficulty": 2
	},
	{
		"id": "emotion_calm",
		"name": "Express Calm",
		"type": ChallengeType.THEME_BASED,
		"description": "Create art that feels peaceful and serene!",
		"theme": "calm",
		"dialogue": "res://assets/dialogues/challenges/theme_calm.dialogue",
		"evaluation_criteria": ["balance", "color_harmony", "simplicity"],
		"difficulty": 2
	},
]

# ============================================
# HELPER FUNCTIONS
# ============================================
func get_challenge_by_id(challenge_id: String) -> Dictionary:
	for challenge in challenges:
		if challenge["id"] == challenge_id:
			return challenge
	return {}

func get_challenges_by_type(type: ChallengeType) -> Array[Dictionary]:
	var filtered : Array[Dictionary] = []
	for challenge in challenges:
		if challenge["type"] == type:
			filtered.append(challenge)
	return filtered

func get_challenges_by_difficulty(difficulty: int) -> Array[Dictionary]:
	var filtered : Array[Dictionary] = []
	for challenge in challenges:
		if challenge["difficulty"] == difficulty:
			filtered.append(challenge)
	return filtered

func get_random_challenge() -> Dictionary:
	if challenges.is_empty():
		return {}
	return challenges[randi() % challenges.size()]

func get_random_challenge_by_type(type: ChallengeType) -> Dictionary:
	var filtered = get_challenges_by_type(type)
	if filtered.is_empty():
		return {}
	return filtered[randi() % filtered.size()]
