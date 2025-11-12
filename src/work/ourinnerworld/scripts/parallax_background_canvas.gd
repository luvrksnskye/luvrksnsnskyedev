extends ParallaxBackground

@export var scroll_speed: float = 5.0

@onready var parallax_layer = $ParallaxLayer

func _process(delta):
	if parallax_layer:
		parallax_layer.motion_offset.x -= scroll_speed * delta
