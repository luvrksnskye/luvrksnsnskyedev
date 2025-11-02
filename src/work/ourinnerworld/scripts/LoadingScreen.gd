extends Control

@onready var black_overlay: ColorRect = $BlackOverlay
@onready var loading_container: Control = $LoadingContainer
@onready var loading_icon: AnimatedSprite2D = $LoadingContainer/MarginContainer/HBoxContainer/LoadingIcon
@onready var loading_label: Label = $LoadingContainer/MarginContainer/HBoxContainer/LoadingLabel
@onready var loading_image: AnimatedSprite2D = $BlackOverlay/LOADING_IMAGE

var loading_tween: Tween
var image_tween: Tween
var is_loading: bool = false

@export var pulse_speed: float = 1.5
@export var min_alpha: float = 0.3
@export var max_alpha: float = 1.0

func _ready():
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	
	if black_overlay:
		black_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		black_overlay.color = Color.BLACK
	
	setup_loading_position()
	setup_image_position()
	
	visible = false
	
	if loading_label:
		loading_label.text = "LOADING..."

func setup_loading_position():
	if loading_container:
		loading_container.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
		loading_container.position += Vector2(-120, -60)

func setup_image_position():
	if loading_image:
		var viewport_size = get_viewport().get_visible_rect().size
		loading_image.position = viewport_size / 2

func show_loading():
	visible = true
	is_loading = true
	
	modulate = Color.WHITE
	if black_overlay:
		black_overlay.modulate = Color.TRANSPARENT
	if loading_container:
		loading_container.modulate = Color.TRANSPARENT
	if loading_image:
		loading_image.modulate = Color.TRANSPARENT
	
	var fade_tween = create_tween()
	fade_tween.set_parallel(true)
	
	if black_overlay:
		fade_tween.tween_property(black_overlay, "modulate", Color.WHITE, 0.3)
	
	if loading_container:
		fade_tween.tween_property(loading_container, "modulate", Color.WHITE, 0.3).set_delay(0.2)
	
	if loading_image:
		fade_tween.tween_property(loading_image, "modulate", Color.WHITE, 0.3).set_delay(0.2)
	
	await fade_tween.finished
	
	start_loading_animation()

func hide_loading():
	is_loading = false
	
	stop_loading_animation()
	
	var fade_tween = create_tween()
	fade_tween.tween_property(self, "modulate", Color.TRANSPARENT, 0.3)
	await fade_tween.finished
	
	visible = false

func start_loading_animation():
	if not is_loading:
		return
	
	stop_loading_animation()
	
	if loading_icon:
		loading_tween = create_tween()
		loading_tween.set_loops()
		loading_tween.tween_property(loading_icon, "modulate:a", min_alpha, pulse_speed / 2)
		loading_tween.tween_property(loading_icon, "modulate:a", max_alpha, pulse_speed / 2)
	
	if loading_image:
		image_tween = create_tween()
		image_tween.set_loops()
		image_tween.tween_property(loading_image, "modulate:a", min_alpha, pulse_speed / 2)
		image_tween.tween_property(loading_image, "modulate:a", max_alpha, pulse_speed / 2)

func stop_loading_animation():
	if loading_tween:
		loading_tween.kill()
		loading_tween = null
	
	if image_tween:
		image_tween.kill()
		image_tween = null
	
	if loading_icon:
		loading_icon.modulate = Color.WHITE
	
	if loading_image:
		loading_image.modulate = Color.WHITE
