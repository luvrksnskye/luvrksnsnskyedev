extends Node

# =========================================================
# SCENE MANAGER - Sistema centralizado de cambio de escenas
# =========================================================

# =========================================================
# --- Referencias ---
# =========================================================
var fade_rect: ColorRect = null
var transition_layer: CanvasLayer = null

# =========================================================
# --- Configuración ---
# =========================================================
const LOADING_SCENE_PATH = "res://scenes/LoadingScreen.tscn"
const FADE_SPEED: float = 0.4  # Velocidad normal de fade


# =========================================================
# --- Estado ---
# =========================================================
var is_transitioning: bool = false
var current_scene_path: String = ""

# =========================================================
# --- Inicialización ---
# =========================================================
func _ready():
	# Crear estructura de nodos
	_create_transition_layer()
	_create_fade_rect()
	
	# Configurar el fade_rect
	fade_rect.color = Color.BLACK
	fade_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fade_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	fade_rect.modulate.a = 0.0

	
	print("✅ SceneManager inicializado")

func _create_transition_layer():
	if not transition_layer:
		transition_layer = CanvasLayer.new()
		transition_layer.name = "TransitionLayer"
		transition_layer.layer = 100
		add_child(transition_layer)

func _create_fade_rect():
	if not fade_rect:
		fade_rect = ColorRect.new()
		fade_rect.name = "FadeRect"
		transition_layer.add_child(fade_rect)

# =========================================================
# --- Cambio de Escena Principal ---
# =========================================================
func change_scene_with_loading(target_scene_path: String) -> void:
	if is_transitioning:
		print("⚠️ Ya hay una transición en progreso")
		return
	
	if target_scene_path.is_empty():
		push_error("❌ SceneManager: target_scene_path está vacío")
		return
	
	is_transitioning = true
	current_scene_path = target_scene_path
	
	print("🎬 SceneManager: Iniciando cambio de escena a: ", target_scene_path)
	
	# 1. Fade a negro
	await fade_to_black()
	
	# 2. Liberar la escena actual
	_free_current_scene()
	await get_tree().process_frame
	await get_tree().process_frame
	
	# 3. Instanciar el LoadingScreen
	print("📦 Instanciando LoadingScreen...")
	var loading_screen = _instantiate_loading_screen(target_scene_path)
	if not loading_screen:
		push_error("❌ No se pudo instanciar el LoadingScreen")
		is_transitioning = false
		await fade_from_black()
		return
	
	await get_tree().process_frame
	
	# 4. Fade desde negro para mostrar el loading screen
	await fade_from_black()
	
	print("✅ SceneManager: LoadingScreen activo, esperando carga...")
	
	# El LoadingScreen manejará el resto (carga asíncrona + transición)
	is_transitioning = false

# =========================================================
# --- Cambio de Escena Directo (sin loading screen) ---
# =========================================================
func change_scene_direct(target_scene_path: String) -> void:
	if is_transitioning:
		print("⚠️ Ya hay una transición en progreso")
		return
	
	if target_scene_path.is_empty():
		push_error("❌ SceneManager: target_scene_path está vacío")
		return
	
	is_transitioning = true
	
	print("🎬 SceneManager: Cambio directo a: ", target_scene_path)
	
	# 1. Fade a negro
	await fade_to_black()
	
	# 2. Cambiar escena directamente
	var error = get_tree().change_scene_to_file(target_scene_path)
	if error != OK:
		push_error("❌ Error al cambiar escena: ", error)
	
	await get_tree().process_frame
	
	# 3. Fade desde negro
	await fade_from_black()
	
	is_transitioning = false
	print("✅ SceneManager: Cambio directo completado")

# =========================================================
# --- Utilidades de Fade ---
# =========================================================
func fade_to_black() -> void:
	if not fade_rect:
		return
	
	print("🌑 Fade to black...")
	var tween = create_tween()
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(fade_rect, "modulate:a", 1.0, FADE_SPEED)
	await tween.finished

func fade_from_black() -> void:
	if not fade_rect:
		return
	
	print("🌕 Fade from black...")
	var tween = create_tween()
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(fade_rect, "modulate:a", 0.0, FADE_SPEED)
	await tween.finished

func set_fade_alpha(alpha: float) -> void:
	if fade_rect:
		fade_rect.modulate.a = clamp(alpha, 0.0, 1.0)

# =========================================================
# --- Helpers Internos ---
# =========================================================
func _free_current_scene() -> void:
	var current = get_tree().current_scene
	if current:
		print("🗑️ Liberando escena actual: ", current.name)
		current.queue_free()

func _instantiate_loading_screen(target_path: String) -> Node:
	print("🔍 Intentando cargar: ", LOADING_SCENE_PATH)
	
	# Verificar si el archivo existe
	if not FileAccess.file_exists(LOADING_SCENE_PATH):
		push_error("❌ El archivo no existe: ", LOADING_SCENE_PATH)
		return null
	
	var loading_scene = load(LOADING_SCENE_PATH)
	if not loading_scene:
		push_error("❌ No se pudo cargar la escena: ", LOADING_SCENE_PATH)
		return null
	
	print("✅ Escena LoadingScreen cargada, instanciando...")
	var instance = loading_scene.instantiate()
	
	if not instance:
		push_error("❌ No se pudo instanciar la escena")
		return null
	
	print("✅ LoadingScreen instanciado, configurando target_path...")
	
	# Configurar el LoadingScreen con la escena objetivo
	if instance.has_method("set_target_scene"):
		instance.set_target_scene(target_path)
		print("✅ Usó método set_target_scene()")
	elif "next_scene_path" in instance:
		instance.next_scene_path = target_path
		print("✅ Configuró next_scene_path directamente: ", target_path)
	else:
		push_error("❌ LoadingScreen no tiene next_scene_path ni set_target_scene()")
	
	# Añadir al árbol
	print("🌳 Añadiendo LoadingScreen al árbol de escenas...")
	get_tree().get_root().add_child(instance)
	get_tree().current_scene = instance
	
	print("✅ LoadingScreen completamente configurado para: ", target_path)
	return instance

# =========================================================
# --- Getters ---
# =========================================================
func get_is_transitioning() -> bool:
	return is_transitioning

func get_current_scene_path() -> String:
	return current_scene_path
