extends AudioStreamPlayer

# Timer for controlling train sound intervals
@onready var train_timer: Timer

func _ready():
	# Create and configure the timer
	train_timer = Timer.new()
	train_timer.wait_time = 40.0  # 40 seconds interval
	train_timer.autostart = true
	train_timer.timeout.connect(_on_train_timer_timeout)
	
	# Add timer as child of this node
	add_child(train_timer)
	
	play()

func _on_train_timer_timeout():
	# Play the train sound
	if not playing:
		play()
	else:
		# If already playing, restart the sound
		stop()
		play()
