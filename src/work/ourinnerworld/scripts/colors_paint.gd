extends GridContainer

# ============================================
# NODE REFERENCES
# ============================================
@onready var painter_image: Sprite2D = $"../../../../Canvas/PainterImage"
@onready var current_color_rect: ColorRect = $"../CurrentColorRect"
@onready var color_picker: ColorPicker = $"../ColorPicker"
@onready var sfx_click: AudioStreamPlayer = $"../../../../Sounds/sfx-click"

# ============================================
# LIFECYCLE
# ============================================
func _ready() -> void:
	_setup_color_palette()
	_connect_color_rects()
	_setup_current_color_rect()
	_setup_color_picker()
	_connect_painter_signals()

# ============================================
# SETUP
# ============================================
func _setup_color_palette() -> void:
	var colors = [
		# Row 1 - Reds and oranges
		Color("#FF9999"), Color("#FFAA88"), Color("#FFCC77"), Color("#FFDD66"), Color("#FFEE88"),
		# Row 2 - Greens and blues
		Color("#88DD88"), Color("#77CCAA"), Color("#66BBDD"), Color("#77AAFF"), Color("#8899FF"),
		# Row 3 - Purples and pinks
		Color("#DD99FF"), Color("#BB99DD"), Color("#AA77CC"), Color("#DD77DD"), Color("#FF99DD"),
		# Row 4 - Warm mid-tones
		Color("#FF8888"), Color("#FF9966"), Color("#FFBB66"), Color("#FFCC77"), Color("#FFDD88"),
		# Row 5 - Neutrals
		Color("#FFFFFF"), Color("#EEEEEE"), Color("#CCCCCC"), Color("#AAAAAA"), Color("#888888")
	]
	
	var color_rects = get_children()
	for i in min(colors.size(), color_rects.size()):
		if color_rects[i] is ColorRect:
			color_rects[i].color = colors[i]
	
	if color_rects.size() > 0 and color_rects[0] is ColorRect:
		_set_active_color(color_rects[0].color)

func _connect_color_rects() -> void:
	for c in get_children():
		if c is ColorRect:
			c.gui_input.connect(_on_color_clicked.bind(c))

func _setup_current_color_rect() -> void:
	if current_color_rect:
		current_color_rect.gui_input.connect(_on_current_color_clicked)

func _setup_color_picker() -> void:
	if not color_picker:
		return
	
	color_picker.color_changed.connect(_on_color_changed)
	color_picker.gui_input.connect(_on_color_picker_input)
	color_picker.hide()

func _connect_painter_signals() -> void:
	if painter_image:
		painter_image.color_picked.connect(_on_painter_color_picked)

# ============================================
# COLOR MANAGEMENT
# ============================================
func _set_active_color(color: Color) -> void:
	painter_image.paint_color = color
	current_color_rect.color = color

# ============================================
# EVENT HANDLERS
# ============================================
func _on_color_clicked(event: InputEvent, color_rect: ColorRect) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_set_active_color(color_rect.color)
		_close_color_picker()

func _on_current_color_clicked(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if sfx_click:
			sfx_click.play()
		
		_toggle_color_picker()

func _on_color_picker_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		get_viewport().set_input_as_handled()

func _on_color_changed(color: Color) -> void:
	_set_active_color(color)

func _on_painter_color_picked(color: Color) -> void:
	current_color_rect.color = color
	if color_picker and color_picker.visible:
		color_picker.color = color

# ============================================
# COLOR PICKER CONTROL
# ============================================
func _toggle_color_picker() -> void:
	if not color_picker:
		return
	
	color_picker.visible = not color_picker.visible
	if color_picker.visible:
		color_picker.color = current_color_rect.color

func _close_color_picker() -> void:
	if color_picker and color_picker.visible:
		color_picker.hide()

func _close_color_picker_if_open() -> void:
	_close_color_picker()
