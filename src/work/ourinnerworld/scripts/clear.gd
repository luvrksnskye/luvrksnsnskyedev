extends Button


@onready var sfx_eraser: AudioStreamPlayer = $"../../../Sounds/sfx-eraser"


@onready var canvas := $"../../../Canvas/PainterImage"

func _ready() -> void:
	pressed.connect(_on_pressed)

func _on_pressed() -> void:
	# 1. Reproducir sonido de borrador
	if sfx_eraser:
		sfx_eraser.play()

	# 2. Limpiar el canvas
	if canvas and canvas.has_method("clear_canvas"):
		canvas.clear_canvas()
	else:
		push_warning("No se encontró clear_canvas() en el nodo asignado al canvas.")
