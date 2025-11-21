extends Button

@onready var sfx: AudioStreamPlayer = $"../../../Sounds/sfx"
@onready var dialogue_balloon = $"../../../Makomi_Dialogue/ExampleBalloon"

const PAINT_GUIDE_DIALOGUE = preload("res://assets/dialogues/paint_guide/makomiintro.dialogue")

func _ready() -> void:
	pressed.connect(_on_pressed)
	
	if dialogue_balloon:
		dialogue_balloon.visible = false

func _on_pressed() -> void:
	# Reproducir sonido
	if sfx:
		sfx.play()
	
	# Mostrar diálogo
	start_dialogue()

func start_dialogue() -> void:
	if dialogue_balloon:
		dialogue_balloon.visible = true
	
	# Inicia el diálogo con el título "start" (o el que uses en tu archivo .dialogue)
	DialogueManager.show_dialogue_balloon(PAINT_GUIDE_DIALOGUE, "start", [])
	
	# Conectar el evento de finalización si necesitas hacer algo después
	if not DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.connect(_on_dialogue_ended)

func _on_dialogue_ended(dialogue_resource) -> void:
	if dialogue_balloon:
		dialogue_balloon.visible = false
	
	# Desconectar para evitar múltiples conexiones
	if DialogueManager.dialogue_ended.is_connected(_on_dialogue_ended):
		DialogueManager.dialogue_ended.disconnect(_on_dialogue_ended)
