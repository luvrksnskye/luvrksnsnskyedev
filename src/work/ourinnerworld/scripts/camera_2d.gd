extends Camera2D

@export_range(0, 1, 0.05, "or_greater") var shake_power: float = 0.2  # Lower power for gentle train shake
@export var shake_max_offset: float = 2.0  # Smaller max offset for subtle movement
@export var shake_decay: float = 0.3  # Slower decay to maintain continuous shake
@export var base_shake_intensity: float = 0.4  # Constant base shake for train movement
@export var shake_frequency: float = 1.5  # How fast the shake oscillates

var shake_trauma: float = 0.0
var time_passed: float = 0.0
var noise: FastNoiseLite

func _ready():
	# Initialize noise for more natural shake pattern
	noise = FastNoiseLite.new()
	noise.seed = randi()
	noise.frequency = shake_frequency
	noise.noise_type = FastNoiseLite.TYPE_PERLIN
	
	# Start with base train shake
	shake_trauma = base_shake_intensity

func _process(delta):
	time_passed += delta
	
	# Maintain minimum shake for train movement
	if shake_trauma < base_shake_intensity:
		shake_trauma = base_shake_intensity
	
	# Apply shake effect
	if shake_trauma > 0:
		var shake_amount = pow(shake_trauma, shake_power)
		
		# Use noise for more realistic train shake pattern
		var shake_x = noise.get_noise_2d(time_passed * 100, 0) * shake_amount * shake_max_offset
		var shake_y = noise.get_noise_2d(0, time_passed * 100) * shake_amount * shake_max_offset * 0.7  # Less vertical shake
		
		# Apply gentle oscillation for train rhythm
		shake_x += sin(time_passed * shake_frequency) * shake_amount * shake_max_offset * 0.3
		shake_y += cos(time_passed * shake_frequency * 0.8) * shake_amount * shake_max_offset * 0.2
		
		offset = Vector2(shake_x, shake_y)
		
		# Decay trauma (but not below base level)
		shake_trauma = max(base_shake_intensity, shake_trauma - shake_decay * delta)
	else:
		offset = Vector2.ZERO

# Call this function to add extra shake (e.g., train hitting a bump)
func add_trauma(amount: float):
	shake_trauma = min(shake_trauma + amount, 1.0)

# Call this to simulate train stopping (reduces base shake)
func set_train_moving(is_moving: bool):
	if is_moving:
		base_shake_intensity = 0.4
	else:
		base_shake_intensity = 0.0
