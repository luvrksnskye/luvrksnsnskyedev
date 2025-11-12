extends GridContainer

@onready var painter_image: Sprite2D = $"../../../../Canvas/PainterImage"
@onready var current_color_rect: ColorRect = $"../CurrentColorRect"

func _ready() -> void:
	# Configurar la paleta de colores
	_setup_color_palette()
	
	# Conectar eventos de cada ColorRect
	for c in get_children():
		if c is ColorRect:
			c.gui_input.connect(_on_color_clicked.bind(c))

func _setup_color_palette() -> void:
	# Colores equilibrados - medio suaves, medio intensos
	var colors = [
		# Fila 1 - Rojos y naranjas
		Color("#FF9999"), Color("#FFAA88"), Color("#FFCC77"), Color("#FFDD66"), Color("#FFEE88"),
		# Fila 2 - Verdes y azules
		Color("#88DD88"), Color("#77CCAA"), Color("#66BBDD"), Color("#77AAFF"), Color("#8899FF"),
		# Fila 3 - Morados y rosas
		Color("#DD99FF"), Color("#BB99DD"), Color("#AA77CC"), Color("#DD77DD"), Color("#FF99DD"),
		# Fila 4 - Cálidos medios
		Color("#FF8888"), Color("#FF9966"), Color("#FFBB66"), Color("#FFCC77"), Color("#FFDD88"),
		# Fila 5 - Neutros
		Color("#FFFFFF"), Color("#EEEEEE"), Color("#CCCCCC"), Color("#AAAAAA"), Color("#888888")
	]
	
	# Asignar colores a los ColorRect
	var color_rects = get_children()
	for i in min(colors.size(), color_rects.size()):
		if color_rects[i] is ColorRect:
			color_rects[i].color = colors[i]
	
	# Establecer el color inicial
	if color_rects.size() > 0 and color_rects[0] is ColorRect:
		painter_image.paint_color = color_rects[0].color
		current_color_rect.color = color_rects[0].color

func _on_color_clicked(event: InputEvent, color_rect: ColorRect) -> void:
	if event is InputEventMouseButton:
		if event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
			# Cambiar el color del pincel
			painter_image.paint_color = color_rect.color
			current_color_rect.color = color_rect.color
