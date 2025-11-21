extends Node2D

# ============================================================================
# EXPORTS
# ============================================================================
@export var firefly_scene: PackedScene
@export var spawn_count: int = 20
@export var spawn_area_size: Vector2 = Vector2(800, 800)
@export var spawn_area_center: Vector2 = Vector2.ZERO
@export var min_distance_from_player: float = 100.0
@export var spawn_on_ready: bool = true
@export var use_clusters: bool = true
@export var cluster_count: int = 4
@export var fireflies_per_cluster: int = 5

# ============================================================================
# VARIABLES
# ============================================================================
var player: CharacterBody2D = null
var spawned_fireflies: Array = []
var spawn_points: Array = []

# ============================================================================
# LIFECYCLE
# ============================================================================
func _ready():
	call_deferred("_setup_spawner")

func _setup_spawner():
	_find_player()
	_find_spawn_points()
	
	if spawn_on_ready and firefly_scene:
		if use_clusters:
			_spawn_in_clusters()
		else:
			_spawn_random()

# ============================================================================
# SPAWNING METHODS
# ============================================================================
func _spawn_random():
	if spawn_points.size() == 0:
		push_error("No spawn points found! Make sure you have FireflySpawner_NH markers.")
		return
	
	var actual_spawn_count = min(spawn_count, 30)
	var fireflies_per_point = actual_spawn_count / spawn_points.size()
	var spawned = 0
	
	for spawn_point in spawn_points:
		var point_position = spawn_point.global_position
		
		for i in range(fireflies_per_point):
			if spawned >= actual_spawn_count:
				break
			
			var offset = Vector2(
				randf_range(-80, 80),
				randf_range(-80, 80)
			)
			var spawn_pos = point_position + offset
			
			if _is_valid_spawn_position(spawn_pos):
				_create_firefly(spawn_pos)
				spawned += 1
	
	print("Spawned ", spawned, " fireflies across ", spawn_points.size(), " spawn points")

func _spawn_in_clusters():
	if spawn_points.size() == 0:
		push_error("No spawn points found! Make sure you have FireflySpawner_NH markers.")
		return
	
	var actual_spawn_count = min(spawn_count, 30)
	var fireflies_per_point = actual_spawn_count / spawn_points.size()
	var spawned = 0
	
	for spawn_point in spawn_points:
		var point_position = spawn_point.global_position
		var clusters_for_this_point = max(1, cluster_count / spawn_points.size())
		
		var cluster_centers = []
		for i in range(clusters_for_this_point):
			var offset = Vector2(
				randf_range(-150, 150),
				randf_range(-150, 150)
			)
			cluster_centers.append(point_position + offset)
		
		var fireflies_for_this_point = 0
		var current_cluster = 0
		var fireflies_in_current_cluster = 0
		
		while fireflies_for_this_point < fireflies_per_point and spawned < actual_spawn_count:
			if current_cluster >= cluster_centers.size():
				current_cluster = 0
				fireflies_in_current_cluster = 0
			
			if fireflies_in_current_cluster >= fireflies_per_cluster:
				current_cluster += 1
				fireflies_in_current_cluster = 0
				continue
			
			var cluster_center = cluster_centers[current_cluster]
			var offset = Vector2(
				randf_range(-50, 50),
				randf_range(-50, 50)
			)
			var spawn_pos = cluster_center + offset
			
			if _is_valid_spawn_position(spawn_pos):
				_create_firefly(spawn_pos)
				spawned += 1
				fireflies_for_this_point += 1
				fireflies_in_current_cluster += 1
			
			if fireflies_in_current_cluster >= fireflies_per_cluster:
				current_cluster += 1
				fireflies_in_current_cluster = 0
	
	print("Spawned ", spawned, " fireflies across ", spawn_points.size(), " spawn points (clustered)")

func _create_firefly(pos: Vector2):
	if not firefly_scene:
		push_error("Firefly scene not assigned to spawner!")
		return
	
	var firefly = firefly_scene.instantiate()
	firefly.global_position = pos
	get_tree().current_scene.add_child(firefly)
	spawned_fireflies.append(firefly)

# ============================================================================
# POSITION VALIDATION
# ============================================================================
func _get_random_spawn_position() -> Vector2:
	var half_size = spawn_area_size / 2
	var random_offset = Vector2(
		randf_range(-half_size.x, half_size.x),
		randf_range(-half_size.y, half_size.y)
	)
	return spawn_area_center + random_offset

func _is_valid_spawn_position(pos: Vector2) -> bool:
	if player:
		var distance_to_player = pos.distance_to(player.global_position)
		if distance_to_player < min_distance_from_player:
			return false
	
	return true

# ============================================================================
# UTILITIES
# ============================================================================
func _find_player():
	var players = get_tree().get_nodes_in_group("Player")
	if players.size() > 0:
		player = players[0]

func _find_spawn_points():
	spawn_points.clear()
	
	# Buscar markers con nombres específicos
	for i in range(1, 5):  # FireflySpawner_NH, NH2, NH3, NH4
		var marker_name = "FireflySpawner_NH" + ("" if i == 1 else str(i))
		if has_node(marker_name):
			var marker = get_node(marker_name)
			spawn_points.append(marker)
			print("Found spawn point: ", marker_name)
	
	if spawn_points.size() == 0:
		push_error("No spawn points found! Make sure you have FireflySpawner_NH, FireflySpawner_NH2, FireflySpawner_NH3, and FireflySpawner_NH4 as children.")
	else:
		print("Total spawn points found: ", spawn_points.size())

func spawn_firefly_at(pos: Vector2):
	if spawned_fireflies.size() >= 50:
		print("Cannot spawn more fireflies: limit reached (30)")
		return
	
	_create_firefly(pos)

func clear_all_fireflies():
	for firefly in spawned_fireflies:
		if is_instance_valid(firefly):
			firefly.queue_free()
	spawned_fireflies.clear()
	print("All fireflies cleared")

func respawn_fireflies():
	clear_all_fireflies()
	await get_tree().create_timer(0.1).timeout
	
	if use_clusters:
		_spawn_in_clusters()
	else:
		_spawn_random()
