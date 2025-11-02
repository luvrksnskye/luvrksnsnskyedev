extends AudioStreamPlayer

@onready var minute_timer: Timer = $"../MinuteTimer"

func _ready():
	# Play the sound immediately
	if stream:
		play()

	# Start the timer
	if not minute_timer.is_stopped():
		minute_timer.stop()
	minute_timer.start()

func _on_MinuteTimer_timeout():
	if stream:
		play()
