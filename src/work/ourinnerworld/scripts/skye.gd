extends CharacterBody2D

# Animation nodes
@onready var main_sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var emotion_sprite: AnimatedSprite2D = $Skye_Emotions

func _ready():
	# Start reading animation on main character sprite (loops automatically)
	if main_sprite:
		main_sprite.play("reading")
	
	# Start sing animation on emotion sprite above head (loops automatically)
	if emotion_sprite:
		emotion_sprite.play("sing")
