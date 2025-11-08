extends Control

# =========================================================
# LOADING SCREEN - Pantalla de carga asíncrona mejorada
# =========================================================

# =========================================================
# --- Referencias de Nodos ---
# =========================================================
@onready var black_overlay: ColorRect = $CanvasLayer/BlackOverlay
@onready var loading_container: Control = $CanvasLayer/LoadingContainer
@onready var loading_icon: AnimatedSprite2D = $CanvasLayer/LoadingContainer/MarginContainer/HBoxContainer/LoadingIcon
@onready var loading_label: Label = $CanvasLayer/LoadingContainer/MarginContainer/HBoxContainer/LoadingLabel
@onready var loading_image: AnimatedSprite2D = $CanvasLayer/BlackOverlay/LOADING_IMAGE

# =========================================================
# --- Configuración ---
# =========================================================
@export var next_scene_path: String = ""
@export var min_duration: float = 2.0       # Duración mínima realista
@export var pulse_speed: float = 1.5
@export var min_alpha: float = 0.3
@export var max_alpha: float = 1.0

# =========================================================
# --- Estado ---
# =========================================================
var loading_tween: Tween
var image_tween: Tween
var elapsed_time: float = 0.0
var loaded_scene: PackedScene = null
var is_scene_ready: bool = false
var is_min_time_reached: bool = false
var scene_manager: Node = null

# =========================================================
# --- Inicialización ---
# =========================================================
func _ready():
	print("📄 LoadingScreen: Inicializando...")
	print("🎯 Escena objetivo: ", next_scene_path)
	
	# Configuración de UI
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	top_level = true
	z_index = 5000
	visible = true
	
	# Obtener referencia al SceneManager
	scene_manager = get_tree().get_root().get_node_or_null("SceneManager")
	
	# Configurar overlay negro
	if black_overlay:
		black_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		black_overlay.color = Color.BLACK
		black_overlay.modulate.a = 1.0
	
	# Configurar texto
	if loading_label:
		loading_label.text = "LOADING..."
	
	# Posicionar elementos
	_setup_loading_position()
	_setup_image_position()
	
	# Mostrar elementos inmediatamente
	if loading_container:
		loading_container.modulate = Color.WHITE
	if loading_image:
		loading_image.modulate = Color.WHITE
	
	# Validar ruta de escena
	if next_scene_path.is_empty():
		push_error("❌ LoadingScreen: next_scene_path está vacío")
		return
	
	# Iniciar animaciones y carga asíncrona
	_start_loading_animation()
	_load_scene_async()

# =========================================================
# --- Configuración del método público ---
# =========================================================
func set_target_scene(scene_path: String) -> void:
	next_scene_path = scene_path
	print("🎯 LoadingScreen: Escena objetivo configurada: ", scene_path)

# =========================================================
# --- Layout ---
# =========================================================
func _setup_loading_position():
	if loading_container:
		loading_container.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
		loading_container.position += Vector2(-120, -60)

func _setup_image_position():
	if loading_image:
		var viewport_size = get_viewport().get_visible_rect().size
		loading_image.position = viewport_size / 2

# =========================================================
# --- Carga Asíncrona ---
# =========================================================
func _load_scene_async():
	print("📦 Iniciando carga asíncrona: ", next_scene_path)
	
	var error = ResourceLoader.load_threaded_request(next_scene_path)
	if error != OK:
		push_error("❌ Error al solicitar carga: ", error)
		return
	
	set_process(true)
	elapsed_time = 0.0
	is_scene_ready = false
	is_min_time_reached = false
	
	print("✅ Carga asíncrona iniciada")

func _process(delta):
	elapsed_time += delta
	
	# Verificar si alcanzamos el tiempo mínimo
	if not is_min_time_reached and elapsed_time >= min_duration:
		is_min_time_reached = true
		print("⏱️ Tiempo mínimo alcanzado: %.2fs" % elapsed_time)
		_check_if_ready_to_transition()
	
	# Verificar estado de carga
	if not is_scene_ready:
		var status = ResourceLoader.load_threaded_get_status(next_scene_path)
		
		# Log cada segundo
		if int(elapsed_time) != int(elapsed_time - delta):
			print("⏳ Cargando... %.1fs / %.1fs | Estado: %d" % [elapsed_time, min_duration, status])
		
		match status:
			ResourceLoader.THREAD_LOAD_FAILED:
				push_error("❌ Error al cargar escena: ", next_scene_path)
				set_process(false)
			
			ResourceLoader.THREAD_LOAD_LOADED:
				loaded_scene = ResourceLoader.load_threaded_get(next_scene_path)
				is_scene_ready = true
				print("✅ Escena cargada: %.2fs" % elapsed_time)
				_check_if_ready_to_transition()
			
			ResourceLoader.THREAD_LOAD_IN_PROGRESS:
				# Todavía cargando
				pass

# =========================================================
# --- Control de Transición ---
# =========================================================
func _check_if_ready_to_transition():
	# Solo transicionar si AMBAS condiciones se cumplen
	if is_scene_ready and is_min_time_reached:
		print("🎬 Condiciones cumplidas, iniciando transición...")
		set_process(false)
		await _transition_to_loaded_scene()

# =========================================================
# --- Transición a Escena Cargada ---
# =========================================================
func _transition_to_loaded_scene():
	print("🌀 LoadingScreen: Transicionando a escena cargada...")
	
	# 1. Fade out de elementos de loading
	await _hide_loading_elements()
	
	# 2. Fade a negro usando SceneManager
	if scene_manager:
		print("🌑 Fade a negro...")
		await scene_manager.fade_to_black()
	
	await get_tree().process_frame
	
	# 3. Guardar referencias ANTES de hacer cualquier cambio
	var scene_to_instantiate = loaded_scene
	var scene_path_debug = next_scene_path
	var tree = get_tree()
	var root = tree.get_root()
	
	print("🗑️ Liberando LoadingScreen...")
	
	# 4. Remover del árbol pero NO queue_free todavía
	if tree.current_scene == self:
		tree.current_scene = null
	
	if get_parent():
		get_parent().remove_child(self)
	
	await tree.process_frame
	
	# 5. Instanciar nueva escena
	print("🎮 Instanciando escena: ", scene_path_debug)
	
	if scene_to_instantiate:
		var new_scene_instance = scene_to_instantiate.instantiate()
		
		if new_scene_instance:
			root.add_child(new_scene_instance)
			tree.current_scene = new_scene_instance
			print("✅ Escena instanciada: ", new_scene_instance.name)
			
			await tree.process_frame
			
			# 6. Fade desde negro
			var sm = root.get_node_or_null("SceneManager")
			if sm:
				print("🌕 Fade desde negro...")
				await sm.fade_from_black()
			
			print("✅ Transición completada")
			
			# 7. AHORA sí liberar este LoadingScreen
			queue_free()
		else:
			push_error("❌ No se pudo instanciar la escena")
			queue_free()
	else:
		push_error("❌ No hay escena cargada")
		queue_free()

# =========================================================
# --- Efectos Visuales ---
# =========================================================
func _hide_loading_elements():
	_stop_loading_animation()
	
	var fade_tween = create_tween()
	fade_tween.set_parallel(true)
	fade_tween.set_ease(Tween.EASE_IN_OUT)
	fade_tween.set_trans(Tween.TRANS_SINE)
	
	if loading_container:
		fade_tween.tween_property(loading_container, "modulate:a", 0.0, 0.3)
	if loading_image:
		fade_tween.tween_property(loading_image, "modulate:a", 0.0, 0.3)
	
	await fade_tween.finished

# =========================================================
# --- Animaciones ---
# =========================================================
func _start_loading_animation():
	_stop_loading_animation()
	print("🎨 Iniciando animaciones de loading")
	
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

func _stop_loading_animation():
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
