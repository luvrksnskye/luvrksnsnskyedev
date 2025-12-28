extends Node

## PartyManager - Sistema de party con hasta 5 miembros
## Si no hay personajes, Rainy se establece como líder individual

# =============================================================================
# SIGNALS
# =============================================================================

signal party_changed
signal leader_changed(new_leader: PartyMember)
signal member_joined(member: PartyMember)
signal member_left(member: PartyMember)
signal tag_performed(old_leader: PartyMember, new_leader: PartyMember)
signal ability_activated(the_leader: PartyMember, ability_name: String)

# =============================================================================
# CONSTANTS
# =============================================================================

const MAX_PARTY_SIZE := 5
const FOLLOW_DISTANCE := 30.0
const FOLLOW_SPEED := 90.0
const SNAP_THRESHOLD := 2.0
const MAX_HISTORY_SIZE := 200

# =============================================================================
# PARTY DATA
# =============================================================================

var members: Array[PartyMember] = []
var leader: PartyMember = null
var position_history: Array[Dictionary] = []

# =============================================================================
# READY
# =============================================================================

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	
	# Esperar un frame para que la escena esté lista
	await get_tree().process_frame
	
	# Si no hay miembros, buscar a Rainy automáticamente
	if members.is_empty():
		_auto_setup_rainy()


func _auto_setup_rainy() -> void:
	"""
	Si no hay ningún personaje en el party, busca a Rainy en la escena
	y lo establece como líder individual.
	"""
	# Buscar en el grupo "Player"
	var players := get_tree().get_nodes_in_group("Player")
	for node in players:
		if node is PartyMember and node.member_name.to_lower() == "rainy":
			add_member(node)
			print("[PartyManager] Rainy establecido como líder individual")
			return
	
	# Buscar por nombre de nodo
	var rainy := get_tree().get_first_node_in_group("Rainy")
	if rainy and rainy is PartyMember:
		add_member(rainy)
		print("[PartyManager] Rainy establecido como líder individual")
		return
	
	# Buscar cualquier nodo llamado "Rainy" en la escena actual
	var current_scene := get_tree().current_scene
	if current_scene:
		var found_rainy := _find_rainy_in_tree(current_scene)
		if found_rainy:
			add_member(found_rainy)
			print("[PartyManager] Rainy encontrado y establecido como líder individual")
			return
	
	print("[PartyManager] No se encontró a Rainy en la escena")


func _find_rainy_in_tree(node: Node) -> PartyMember:
	"""Busca recursivamente a Rainy en el árbol de nodos."""
	if node is PartyMember:
		if node.member_name.to_lower() == "rainy" or node.name.to_lower() == "rainy":
			return node
	
	for child in node.get_children():
		var result := _find_rainy_in_tree(child)
		if result:
			return result
	
	return null


# =============================================================================
# PHYSICS - RECORD POSITIONS & UPDATE FOLLOWERS
# =============================================================================

func _physics_process(delta: float) -> void:
	if not leader:
		return
	
	_record_leader_position()
	_update_followers(delta)
	_update_party_z_index()


func _record_leader_position() -> void:
	if position_history.is_empty():
		position_history.append({
			"pos": leader.global_position,
			"dir": leader.direction
		})
		return
	
	var last_entry: Dictionary = position_history[0]
	var last_pos: Vector2 = last_entry.get("pos", leader.global_position)
	var distance: float = leader.global_position.distance_to(last_pos)
	
	if distance >= SNAP_THRESHOLD:
		position_history.push_front({
			"pos": leader.global_position,
			"dir": leader.direction
		})
		
		while position_history.size() > MAX_HISTORY_SIZE:
			position_history.pop_back()


func _update_followers(delta: float) -> void:
	if members.size() <= 1:
		return
	
	var leader_is_moving: bool = leader.velocity.length() > 1.0
	
	for i in range(1, members.size()):
		var follower: PartyMember = members[i]
		var target_data: Dictionary = _get_target_for_follower(i)
		var target_pos: Vector2 = target_data.get("pos", follower.global_position)
		var target_dir: String = target_data.get("dir", "down")
		
		# AJUSTE VISUAL: Bajar ligeramente a los seguidores durante movimiento horizontal
		if target_dir in ["left", "right"]:
			target_pos.y += 0.0  # Ajustar este valor según necesites (3-5 píxeles)
		
		var distance_to_target: float = follower.global_position.distance_to(target_pos)
		
		if distance_to_target > SNAP_THRESHOLD:
			var move_speed: float = FOLLOW_SPEED if leader_is_moving else FOLLOW_SPEED * 1.5
			var move_dir: Vector2 = (target_pos - follower.global_position).normalized()
			var move_amount: float = minf(move_speed * delta, distance_to_target)
			
			follower.global_position += move_dir * move_amount
			follower._set_direction_from_movement(move_dir)
			follower._set_moving(true)
		else:
			follower._set_moving(false)
			follower._match_direction(target_dir)


func _get_target_for_follower(follower_index: int) -> Dictionary:
	var target_distance: float = FOLLOW_DISTANCE * follower_index
	
	if position_history.is_empty():
		return {"pos": leader.global_position, "dir": leader.direction}
	
	var accumulated_distance: float = 0.0
	var prev_pos: Vector2 = leader.global_position
	var prev_dir: String = leader.direction
	
	for entry in position_history:
		var current_pos: Vector2 = entry.get("pos", prev_pos)
		var entry_dir: String = entry.get("dir", prev_dir)
		var segment_distance: float = prev_pos.distance_to(current_pos)
		
		if accumulated_distance + segment_distance >= target_distance:
			var remaining: float = target_distance - accumulated_distance
			var t: float = remaining / segment_distance if segment_distance > 0.0 else 0.0
			var interpolated_pos: Vector2 = prev_pos.lerp(current_pos, t)
			return {"pos": interpolated_pos, "dir": entry_dir}
		
		accumulated_distance += segment_distance
		prev_pos = current_pos
		prev_dir = entry_dir
	
	var last_entry: Dictionary = position_history.back()
	var last_pos: Vector2 = last_entry.get("pos", leader.global_position)
	var last_dir: String = last_entry.get("dir", leader.direction)
	return {"pos": last_pos, "dir": last_dir}


func _update_party_z_index() -> void:
	"""
	Actualiza el z-index relativo entre los miembros del party.
	Usa el z_as_relative del líder como base y ajusta a los demás relativamente.
	"""
	if members.is_empty():
		return
	
	var base_z: int = 0
	
	for i in range(members.size()):
		var member: PartyMember = members[i]
		
		if leader.direction == "down":
			member.z_as_relative = base_z + (members.size() - i)
		else:
			member.z_as_relative = base_z + i

# =============================================================================
# PARTY MANAGEMENT
# =============================================================================

func add_member(member: PartyMember) -> bool:
	if members.size() >= MAX_PARTY_SIZE:
		push_warning("[PartyManager] Party lleno (máximo %d)" % MAX_PARTY_SIZE)
		return false
	
	if member in members:
		push_warning("[PartyManager] %s ya está en el party" % member.member_name)
		return false
	
	members.append(member)
	member._join_party()
	
	if members.size() == 1:
		_set_as_leader(member)
	else:
		_set_as_follower(member)
	
	member_joined.emit(member)
	party_changed.emit()
	return true


func remove_member(member: PartyMember) -> bool:
	var index: int = members.find(member)
	if index == -1:
		return false
	
	var was_leader: bool = member == leader
	members.remove_at(index)
	member._leave_party()
	
	if was_leader and not members.is_empty():
		_set_as_leader(members[0])
	elif members.is_empty():
		leader = null
		position_history.clear()
	
	member_left.emit(member)
	party_changed.emit()
	return true


func remove_by_name(member_name: String) -> bool:
	var member: PartyMember = get_member(member_name)
	if member:
		return remove_member(member)
	return false


func clear_party() -> void:
	var members_copy: Array[PartyMember] = members.duplicate()
	for m in members_copy:
		remove_member(m)

# =============================================================================
# LEADER / TAG MANAGEMENT
# =============================================================================

func set_leader(member: PartyMember) -> bool:
	if member not in members:
		return false
	
	if member == leader:
		return false
	
	var old_leader: PartyMember = leader
	var old_leader_pos: Vector2 = leader.global_position if leader else Vector2.ZERO
	
	if leader:
		leader._set_follower_mode()
	
	var index: int = members.find(member)
	if index > 0:
		members.remove_at(index)
		members.push_front(member)
	
	var new_leader_pos: Vector2 = member.global_position
	
	_set_as_leader(member)
	
	leader.global_position = new_leader_pos
	_smooth_formation_on_tag(old_leader_pos)
	
	if old_leader:
		tag_performed.emit(old_leader, leader)
	
	leader_changed.emit(leader)
	party_changed.emit()
	return true


func set_leader_by_name(member_name: String) -> bool:
	var member: PartyMember = get_member(member_name)
	if member:
		return set_leader(member)
	return false


func set_leader_by_index(index: int) -> bool:
	if index < 0 or index >= members.size():
		return false
	return set_leader(members[index])


func cycle_leader() -> void:
	if members.size() <= 1:
		return
	set_leader(members[1])


func _set_as_leader(member: PartyMember) -> void:
	leader = member
	leader._set_leader_mode()


func _set_as_follower(member: PartyMember) -> void:
	var index: int = members.find(member)
	var target: Dictionary = _get_target_for_follower(index)
	var target_pos: Vector2 = target.get("pos", member.global_position)
	var target_dir: String = target.get("dir", "down")
	member.global_position = target_pos
	member._set_follower_mode()
	member._match_direction(target_dir)

# =============================================================================
# QUERIES
# =============================================================================

func get_member(member_name: String) -> PartyMember:
	var search: String = member_name.to_lower()
	for m in members:
		if m.member_name.to_lower() == search or m.name.to_lower() == search:
			return m
	return null


func get_member_by_index(index: int) -> PartyMember:
	if index >= 0 and index < members.size():
		return members[index]
	return null


func has_member(member_name: String) -> bool:
	return get_member(member_name) != null


func get_party_size() -> int:
	return members.size()


func is_empty() -> bool:
	return members.is_empty()


func get_leader() -> PartyMember:
	return leader


func get_followers() -> Array[PartyMember]:
	var followers: Array[PartyMember] = []
	for i in range(1, members.size()):
		followers.append(members[i])
	return followers


func is_solo() -> bool:
	"""Retorna true si solo hay un miembro en el party (modo individual)."""
	return members.size() == 1

# =============================================================================
# FORMATION
# =============================================================================

func _smooth_formation_on_tag(old_leader_pos: Vector2) -> void:
	if not leader or members.size() <= 1:
		return
	
	position_history.clear()
	
	var direction_to_old: Vector2 = (old_leader_pos - leader.global_position).normalized()
	
	for i in range(MAX_HISTORY_SIZE):
		var pos: Vector2 = leader.global_position + direction_to_old * (i * 2.0)
		position_history.append({"pos": pos, "dir": leader.direction})


func _snap_formation() -> void:
	if not leader or members.size() <= 1:
		return
	
	position_history.clear()
	
	var back_dir: Vector2 = _get_back_direction()
	for i in range(MAX_HISTORY_SIZE):
		var pos: Vector2 = leader.global_position + back_dir * (i * 2.0)
		position_history.append({"pos": pos, "dir": leader.direction})
	
	for i in range(1, members.size()):
		var target: Dictionary = _get_target_for_follower(i)
		var target_pos: Vector2 = target.get("pos", members[i].global_position)
		members[i].global_position = target_pos
		members[i]._match_direction(leader.direction)


func _get_back_direction() -> Vector2:
	if not leader:
		return Vector2.DOWN
	
	match leader.direction:
		"up": return Vector2.DOWN
		"down": return Vector2.UP
		"left": return Vector2.RIGHT
		"right": return Vector2.LEFT
	return Vector2.DOWN


func teleport_party(pos: Vector2) -> void:
	if leader:
		leader.global_position = pos
		_snap_formation()

# =============================================================================
# MOVEMENT CONTROL
# =============================================================================

func freeze_party() -> void:
	for m in members:
		m.movement_enabled = false
		m.velocity = Vector2.ZERO


func unfreeze_party() -> void:
	for m in members:
		m.movement_enabled = true

# =============================================================================
# SPECIAL ABILITIES
# =============================================================================

func can_use_leader_ability() -> bool:
	return leader != null and leader.has_special_ability()


func get_leader_ability_name() -> String:
	if leader and leader.has_special_ability():
		return leader.special_ability_name
	return ""


func use_leader_ability() -> bool:
	if not can_use_leader_ability():
		return false
	
	var success: bool = leader.use_special_ability()
	if success:
		ability_activated.emit(leader, leader.special_ability_name)
		print("[PartyManager] %s usó %s!" % [leader.display_name, leader.special_ability_name])
	
	return success
