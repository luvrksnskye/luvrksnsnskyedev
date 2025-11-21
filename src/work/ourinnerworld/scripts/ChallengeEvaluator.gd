extends Node

# ============================================
# CHALLENGE EVALUATOR
# Evaluates player paintings against challenge criteria
# ============================================

# ============================================
# EVALUATION RESULT CLASS
# Stores evaluation scores and feedback
# ============================================
class EvaluationResult:
	var score: float = 0.0  # Overall score (0-100)
	var feedback: String = ""
	var criteria_scores: Dictionary = {}
	var rank: String = ""  # Rank: S, A, B, C, D, F
	
	func get_rank_from_score() -> String:
		if score >= 95: return "S"
		elif score >= 85: return "A"
		elif score >= 70: return "B"
		elif score >= 50: return "C"
		elif score >= 30: return "D"
		else: return "F"

# Image analysis cache - stores pre-computed values for optimization
var _image_cache: Dictionary = {}

# ============================================
# MAIN EVALUATION FUNCTION
# Entry point for evaluating a painting
# ============================================
func evaluate_painting(image: Image, challenge: Dictionary) -> EvaluationResult:
	var result = EvaluationResult.new()
	
	# Validate challenge data
	if challenge.is_empty():
		result.score = 0.0
		result.feedback = "No challenge data found"
		return result
	
	# Clear previous cache and analyze image once
	_image_cache.clear()
	_analyze_image(image)
	
	# Get evaluation criteria from challenge
	var criteria = challenge.get("evaluation_criteria", [])
	var total_score = 0.0
	var criteria_count = criteria.size()
	
	# Evaluate each criterion
	for criterion in criteria:
		var criterion_score = _evaluate_criterion(image, criterion, challenge)
		result.criteria_scores[criterion] = criterion_score
		total_score += criterion_score
	
	# Calculate final score
	if criteria_count > 0:
		result.score = (total_score / criteria_count) * 100.0
	else:
		result.score = 50.0
	
	result.rank = result.get_rank_from_score()
	result.feedback = _generate_feedback(result, challenge)
	
	return result

# ============================================
# IMAGE PRE-ANALYSIS (OPTIMIZATION)
# Single-pass image analysis to cache common calculations
# ============================================
func _analyze_image(image: Image) -> void:
	var width = image.get_width()
	var height = image.get_height()
	var total_pixels = width * height
	
	var painted_count = 0
	var color_map = {}
	var colors_array = []
	
	# Single pass through all pixels to gather all necessary data
	for x in range(width):
		for y in range(height):
			var pixel = image.get_pixel(x, y)
			
			# Check if pixel is painted (not transparent, not white)
			if pixel.a > 0.1 and not _is_white(pixel):
				painted_count += 1
				
				# Track unique colors and their frequency
				var key = _color_to_key(pixel)
				if key in color_map:
					color_map[key] += 1
				else:
					color_map[key] = 1
					colors_array.append(pixel)
	
	# Store computed values in cache
	_image_cache["painted_pixels"] = painted_count
	_image_cache["total_pixels"] = total_pixels
	_image_cache["coverage"] = float(painted_count) / float(total_pixels)
	_image_cache["color_count"] = colors_array.size()
	_image_cache["colors"] = colors_array
	_image_cache["color_map"] = color_map

# ============================================
# COLOR HELPER FUNCTIONS
# ============================================

# Calculate Euclidean distance between two colors
func _color_distance(c1: Color, c2: Color) -> float:
	var dr = c1.r - c2.r
	var dg = c1.g - c2.g
	var db = c1.b - c2.b
	return sqrt(dr * dr + dg * dg + db * db)

# Check if color is white (or very close to white)
func _is_white(color: Color) -> bool:
	return color.r > 0.95 and color.g > 0.95 and color.b > 0.95

# Convert color to string key for dictionary storage
func _color_to_key(color: Color) -> String:
	return "%d_%d_%d" % [int(color.r * 255), int(color.g * 255), int(color.b * 255)]

# Get most frequently used colors from cache
func _get_dominant_colors_cached(count: int) -> Array:
	var color_map = _image_cache.get("color_map", {})
	var colors_array = _image_cache.get("colors", [])
	
	if color_map.is_empty():
		return []
	
	# Create array of colors with their frequency counts
	var sorted_colors = []
	for i in range(colors_array.size()):
		var color = colors_array[i]
		var key = _color_to_key(color)
		sorted_colors.append({"color": color, "count": color_map.get(key, 0)})
	
	# Sort by frequency (descending)
	sorted_colors.sort_custom(func(a, b): return a["count"] > b["count"])
	
	# Return top N colors
	var result = []
	for i in range(min(count, sorted_colors.size())):
		result.append(sorted_colors[i]["color"])
	
	return result

# ============================================
# CRITERION DISPATCHER
# Routes to specific evaluation function based on criterion
# ============================================
func _evaluate_criterion(image: Image, criterion: String, challenge: Dictionary) -> float:
	match criterion:
		"creativity":
			return _evaluate_creativity(image)
		"coverage":
			return _evaluate_coverage(image)
		"color_variety":
			return _evaluate_color_variety(image)
		"color_harmony":
			return _evaluate_color_harmony(image)
		"color_blending":
			return _evaluate_color_blending(image)
		"contrast":
			return _evaluate_contrast(image)
		"balance":
			return _evaluate_balance(image)
		"symmetry":
			return _evaluate_symmetry(image, challenge)
		"detail":
			return _evaluate_detail(image)
		"simplicity":
			return _evaluate_simplicity(image)
		"boldness":
			return _evaluate_boldness(image)
		"softness":
			return _evaluate_softness(image)
		"precision":
			return _evaluate_precision(image)
		"shade_variety":
			return _evaluate_shade_variety(image, challenge)
		"atmosphere":
			return _evaluate_atmosphere(image)
		"energy":
			return _evaluate_energy(image)
		"patience":
			return _evaluate_patience(image)
		"smoothness":
			return _evaluate_smoothness(image)
		"consistency":
			return _evaluate_consistency(image)
		"pattern":
			return _evaluate_pattern(image)
		"cleverness":
			return _evaluate_cleverness(image)
		"color_vibrancy":
			return _evaluate_color_vibrancy(image)
		"perspective":
			return _evaluate_perspective(image)
		_:
			return 0.5  # Default score for unknown criteria

# ============================================
# INDIVIDUAL CRITERION EVALUATIONS
# Each function returns a score between 0.0 and 1.0
# ============================================

# Measures originality based on coverage and color diversity
func _evaluate_creativity(image: Image) -> float:
	var coverage = _image_cache.get("coverage", 0.0)
	var color_count = _image_cache.get("color_count", 0)
	return min(1.0, (coverage * 0.6) + (min(color_count / 10.0, 1.0) * 0.4))

# Measures how much of the canvas is painted
func _evaluate_coverage(image: Image) -> float:
	return _image_cache.get("coverage", 0.0)

# Measures number of unique colors used
func _evaluate_color_variety(image: Image) -> float:
	var unique_colors = _image_cache.get("color_count", 0)
	return min(1.0, unique_colors / 15.0)

# Measures how well colors work together (complementary, analogous, etc.)
func _evaluate_color_harmony(image: Image) -> float:
	var colors = _get_dominant_colors_cached(5)
	if colors.size() < 2:
		return 0.3
	
	var harmony_score = 0.0
	for i in range(colors.size() - 1):
		var hue_diff = abs(colors[i].h - colors[i + 1].h)
		
		# Similar or complementary hues (high harmony)
		if hue_diff < 0.1 or hue_diff > 0.9:
			harmony_score += 1.0
		# Analogous or split-complementary (medium harmony)
		elif hue_diff < 0.3 or hue_diff > 0.7:
			harmony_score += 0.7
		# Other combinations (low harmony)
		else:
			harmony_score += 0.3
	
	return harmony_score / (colors.size() - 1)

# Measures smooth color transitions between adjacent pixels
func _evaluate_color_blending(image: Image) -> float:
	var blend_score = 0.0
	var sample_count = 0
	var width = image.get_width()
	var height = image.get_height()
	
	# Reduced sampling for performance (every 3rd pixel)
	for x in range(1, width - 1, 3):
		for y in range(1, height - 1, 3):
			var center = image.get_pixel(x, y)
			
			if center.a > 0.1 and not _is_white(center):
				# Check 4-directional neighbors
				var neighbors = [
					image.get_pixel(x - 1, y),
					image.get_pixel(x + 1, y),
					image.get_pixel(x, y - 1),
					image.get_pixel(x, y + 1)
				]
				
				# Calculate average similarity to neighbors
				var similarity = 0.0
				for neighbor in neighbors:
					similarity += 1.0 - _color_distance(center, neighbor)
				blend_score += similarity / 4.0
				sample_count += 1
	
	return blend_score / max(sample_count, 1)

# Measures difference between lightest and darkest colors
func _evaluate_contrast(image: Image) -> float:
	var colors = _get_dominant_colors_cached(3)
	if colors.size() < 2:
		return 0.2
	
	# Find maximum contrast between any two dominant colors
	var max_contrast = 0.0
	for i in range(colors.size()):
		for j in range(i + 1, colors.size()):
			var contrast = _color_distance(colors[i], colors[j])
			max_contrast = max(max_contrast, contrast)
	
	return min(1.0, max_contrast)

# Measures visual weight distribution (left vs right)
func _evaluate_balance(image: Image) -> float:
	var left_weight = 0.0
	var right_weight = 0.0
	var mid_x = image.get_width() / 2
	var width = image.get_width()
	var height = image.get_height()
	
	# Reduced sampling (every 2nd pixel)
	for x in range(0, width, 2):
		for y in range(0, height, 2):
			var pixel = image.get_pixel(x, y)
			
			if not _is_white(pixel) and pixel.a > 0.1:
				var weight = 1.0
				if x < mid_x:
					left_weight += weight
				else:
					right_weight += weight
	
	var total = left_weight + right_weight
	if total == 0:
		return 0.0
	
	# Calculate balance ratio (closer to 1.0 = more balanced)
	var balance_ratio = min(left_weight, right_weight) / max(left_weight, right_weight)
	return balance_ratio

# Measures mirror similarity across specified axis
func _evaluate_symmetry(image: Image, challenge: Dictionary) -> float:
	var axis = challenge.get("symmetry_axis", "vertical")
	var width = image.get_width()
	var height = image.get_height()
	var similarity_sum = 0.0
	var sample_count = 0
	
	# Reduced sampling (every 3rd pixel)
	if axis == "vertical":
		for x in range(0, width / 2, 3):
			for y in range(0, height, 3):
				var left = image.get_pixel(x, y)
				var right = image.get_pixel(width - 1 - x, y)
				similarity_sum += 1.0 - _color_distance(left, right)
				sample_count += 1
	elif axis == "horizontal":
		for x in range(0, width, 3):
			for y in range(0, height / 2, 3):
				var top = image.get_pixel(x, y)
				var bottom = image.get_pixel(x, height - 1 - y)
				similarity_sum += 1.0 - _color_distance(top, bottom)
				sample_count += 1
	
	return similarity_sum / max(sample_count, 1)

# Measures complexity and variation in brushwork
func _evaluate_detail(image: Image) -> float:
	var stroke_density = 0.0
	var sample_count = 0
	var width = image.get_width()
	var height = image.get_height()
	
	# Reduced sampling (every 4th pixel)
	for x in range(1, width - 1, 4):
		for y in range(1, height - 1, 4):
			var center = image.get_pixel(x, y)
			
			if not _is_white(center) and center.a > 0.1:
				# Check 8 surrounding neighbors for variation
				var variation = 0.0
				for dx in [-1, 0, 1]:
					for dy in [-1, 0, 1]:
						if dx != 0 or dy != 0:
							var neighbor = image.get_pixel(x + dx, y + dy)
							variation += _color_distance(center, neighbor)
				stroke_density += variation / 8.0
				sample_count += 1
	
	return min(1.0, stroke_density / max(sample_count, 1) * 5.0)

# Measures minimalism (inverse of complexity)
func _evaluate_simplicity(image: Image) -> float:
	var color_count = _image_cache.get("color_count", 0)
	var complexity = min(1.0, color_count / 20.0)
	return 1.0 - complexity

# Measures color saturation and vibrancy
func _evaluate_boldness(image: Image) -> float:
	var colors = _get_dominant_colors_cached(5)
	var boldness = 0.0
	
	# High saturation and value = bold colors
	for color in colors:
		boldness += color.s * color.v
	
	return boldness / max(colors.size(), 1)

# Measures gentleness (inverse of contrast)
func _evaluate_softness(image: Image) -> float:
	return 1.0 - _evaluate_contrast(image) * 0.5

# Measures accuracy and control (combination of detail and balance)
func _evaluate_precision(image: Image) -> float:
	return _evaluate_detail(image) * 0.7 + _evaluate_balance(image) * 0.3

# Measures variety of shades within a specific hue range
func _evaluate_shade_variety(image: Image, challenge: Dictionary) -> float:
	var base_color = challenge.get("base_color", Color.WHITE)
	var colors = _image_cache.get("colors", [])
	var shade_count = 0
	
	# Count colors with similar hue to base color
	for pixel in colors:
		var hue_diff = abs(pixel.h - base_color.h)
		if hue_diff < 0.1 or hue_diff > 0.9:
			shade_count += 1
	
	return min(1.0, shade_count / 10.0)

# Measures overall mood and cohesiveness
func _evaluate_atmosphere(image: Image) -> float:
	return _evaluate_color_harmony(image) * 0.6 + _evaluate_color_blending(image) * 0.4

# Measures visual dynamism (variety + contrast)
func _evaluate_energy(image: Image) -> float:
	return _evaluate_color_variety(image) * 0.5 + _evaluate_contrast(image) * 0.5

# Measures thoroughness and effort (detail + coverage)
func _evaluate_patience(image: Image) -> float:
	return _evaluate_detail(image) * 0.7 + _evaluate_coverage(image) * 0.3

# Measures seamless transitions (alias for color blending)
func _evaluate_smoothness(image: Image) -> float:
	return _evaluate_color_blending(image)

# Measures regularity and repetition (alias for pattern)
func _evaluate_consistency(image: Image) -> float:
	return _evaluate_pattern(image)

# Measures repetitive elements (average of horizontal and vertical symmetry)
func _evaluate_pattern(image: Image) -> float:
	var pattern_score = _evaluate_symmetry(image, {"symmetry_axis": "vertical"})
	pattern_score += _evaluate_symmetry(image, {"symmetry_axis": "horizontal"})
	return pattern_score / 2.0

# Measures ingenuity (creativity + balance)
func _evaluate_cleverness(image: Image) -> float:
	return _evaluate_creativity(image) * 0.7 + _evaluate_balance(image) * 0.3

# Measures color intensity and saturation
func _evaluate_color_vibrancy(image: Image) -> float:
	var colors = _get_dominant_colors_cached(10)
	var vibrancy = 0.0
	
	# Average saturation of dominant colors
	for color in colors:
		vibrancy += color.s
	
	return vibrancy / max(colors.size(), 1)

# Measures depth perception (detail + balance)
func _evaluate_perspective(image: Image) -> float:
	return _evaluate_detail(image) * 0.5 + _evaluate_balance(image) * 0.5

# ============================================
# FEEDBACK GENERATION
# Generates encouraging feedback based on rank
# ============================================
func _generate_feedback(result: EvaluationResult, challenge: Dictionary) -> String:
	var feedback = ""
	
	match result.rank:
		"S":
			feedback = "Outstanding work! You've mastered this challenge!"
		"A":
			feedback = "Excellent job! Your artwork shows great skill."
		"B":
			feedback = "Good work! You're getting the hang of it."
		"C":
			feedback = "Nice effort! Keep practicing to improve."
		"D":
			feedback = "Keep trying! You're on the right track."
		"F":
			feedback = "Don't give up! Every artist starts somewhere."
	
	return feedback
