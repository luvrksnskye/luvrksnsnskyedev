extends Node
## PocketInventory - Sistema de inventario con categorías POCKET
## Singleton que maneja todos los items del jugador

# =============================================================================
# SIGNALS
# =============================================================================

signal inventory_changed
signal item_added(item_id: String, amount: int)
signal item_removed(item_id: String, amount: int)
signal item_used(item_id: String, item_data: Dictionary)

# =============================================================================
# CONSTANTS
# =============================================================================

const DATABASE_PATH := "res://singletons/database/items_database.json"

enum Category { SNACKS, TOYS, IMPORTANT }

const CATEGORY_NAMES: Array[String] = ["SNACKS", "TOYS", "IMPORTANT"]

## Mapeo de pocket_category del JSON a enum Category
const POCKET_CATEGORY_MAP: Dictionary = {
	"SNACKS": Category.SNACKS,
	"TOYS": Category.TOYS,
	"IMPORTANT": Category.IMPORTANT,
	# Aliases adicionales para flexibilidad
	"CHARMS": Category.TOYS,
	"WEAPONS": Category.TOYS,
	"WORLD_EXCLUSIVE": Category.IMPORTANT,
	"WORLD_EXCLUSIVE_HALLOWEEN": Category.IMPORTANT,
	"WORLD_EXCLUSIVE_BLACKSPACE": Category.IMPORTANT,
	"WORLD_EXCLUSIVE_MAIN": Category.IMPORTANT,
	"SHOP_EXCLUSIVE": Category.SNACKS,
}

# =============================================================================
# CACHED DATA
# =============================================================================

var _database: Dictionary = {"categories": {}, "items": {}}
var _icon_cache: Dictionary = {}
var _inventory: Dictionary = {}
var max_slots: int = 99

# =============================================================================
# INITIALIZATION
# =============================================================================

func _ready() -> void:
	_load_database()
	call_deferred("_add_default_items")


func _load_database() -> void:
	if not FileAccess.file_exists(DATABASE_PATH):
		push_error("[PocketInventory] Database no encontrada: %s" % DATABASE_PATH)
		_create_default_database()
		return
	
	var file := FileAccess.open(DATABASE_PATH, FileAccess.READ)
	if not file:
		push_error("[PocketInventory] Error al abrir database")
		_create_default_database()
		return
	
	var json := JSON.new()
	if json.parse(file.get_as_text()) != OK:
		push_error("[PocketInventory] Error JSON: %s" % json.get_error_message())
		_create_default_database()
		return
	
	_database = json.data
	print("[PocketInventory] Database cargada: %d items" % _database.items.size())


func _create_default_database() -> void:
	_database = {
		"categories": {
			"consumables_food": {"name": "Consumables", "pocket_category": "SNACKS"},
			"charms": {"name": "Charms", "pocket_category": "TOYS"},
			"weapon_toys": {"name": "Weapons", "pocket_category": "TOYS"},
			"story_important": {"name": "Important", "pocket_category": "IMPORTANT"}
		},
		"items": {
			"strawberry_wild": {
				"name": "Wild Strawberry",
				"description": "A small wild strawberry.",
				"icon_path": "res://assets/ui/items/Food/ItemIcons11.png",
				"max_stack": 100,
				"category": ["consumables_food"],
				"effects": {"heal_hp": 10}
			}
		}
	}


func _add_default_items() -> void:
	if not _inventory.is_empty():
		return
	
	# Items por defecto
	add_item("throw_hikiko", 1)
	add_item("smash_hikiko", 1)
	add_item("memory_book", 1)
	add_item("train_pass", 1)
	add_item("strawberry_wild", 5)

# =============================================================================
# ITEM DEFINITION ACCESS
# =============================================================================

func get_item_definition(item_id: String) -> Dictionary:
	return _database.items.get(item_id, {})


func get_item_icon(item_id: String) -> Texture2D:
	# Revisar cache primero
	if _icon_cache.has(item_id):
		return _icon_cache[item_id]
	
	var item_data := get_item_definition(item_id)
	if item_data.is_empty():
		return null
	
	var icon_path: String = item_data.get("icon_path", "")
	if icon_path.is_empty() or not ResourceLoader.exists(icon_path):
		return null
	
	var texture: Texture2D = load(icon_path)
	_icon_cache[item_id] = texture
	return texture


func get_item_category(item_id: String) -> Category:
	var item_data := get_item_definition(item_id)
	if item_data.is_empty():
		return Category.SNACKS
	
	var categories = item_data.get("category", "")
	
	# Normalizar a array
	var cat_array: Array = []
	if categories is Array:
		cat_array = categories
	elif categories is String and not categories.is_empty():
		cat_array = [categories]
	
	if cat_array.is_empty():
		return Category.SNACKS
	
	# Buscar la primera categoría que mapee a POCKET
	for cat_id in cat_array:
		if not _database.categories.has(cat_id):
			continue
		
		var cat_data: Dictionary = _database.categories[cat_id]
		var pocket_cat: String = cat_data.get("pocket_category", "")
		
		if POCKET_CATEGORY_MAP.has(pocket_cat):
			return POCKET_CATEGORY_MAP[pocket_cat]
	
	return Category.SNACKS


func item_has_category(item_id: String, category_name: String) -> bool:
	var item_data := get_item_definition(item_id)
	if item_data.is_empty():
		return false
	
	var cat = item_data.get("category", "")
	if cat is Array:
		return category_name in cat
	return cat == category_name

# =============================================================================
# INVENTORY MANAGEMENT
# =============================================================================

func add_item(item_id: String, amount: int = 1) -> int:
	if amount <= 0:
		return 0
	
	var item_data := get_item_definition(item_id)
	if item_data.is_empty():
		push_warning("[PocketInventory] Item no existe: %s" % item_id)
		return 0
	
	var max_stack: int = item_data.get("max_stack", 99)
	var current: int = _inventory.get(item_id, 0)
	var can_add: int = mini(amount, max_stack - current)
	
	if can_add <= 0:
		return 0
	
	_inventory[item_id] = current + can_add
	inventory_changed.emit()
	item_added.emit(item_id, can_add)
	return can_add


func remove_item(item_id: String, amount: int = 1) -> int:
	if amount <= 0:
		return 0
	
	var current: int = _inventory.get(item_id, 0)
	if current <= 0:
		return 0
	
	var to_remove: int = mini(amount, current)
	_inventory[item_id] = current - to_remove
	
	if _inventory[item_id] <= 0:
		_inventory.erase(item_id)
	
	inventory_changed.emit()
	item_removed.emit(item_id, to_remove)
	return to_remove


func has_item(item_id: String, amount: int = 1) -> bool:
	return get_item_amount(item_id) >= amount


func get_item_amount(item_id: String) -> int:
	return _inventory.get(item_id, 0)


func use_item(item_id: String) -> bool:
	if not has_item(item_id):
		return false
	
	var item_data := get_item_definition(item_id)
	remove_item(item_id, 1)
	item_used.emit(item_id, item_data)
	return true

# =============================================================================
# CATEGORY QUERIES
# =============================================================================

func get_items_by_category(category: Category) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	
	for item_id in _inventory:
		var amount: int = _inventory[item_id]
		if amount <= 0:
			continue
		
		if get_item_category(item_id) != category:
			continue
		
		result.append({
			"item_id": item_id,
			"amount": amount,
			"definition": get_item_definition(item_id),
			"icon": get_item_icon(item_id)
		})
	
	return result


func is_category_empty(category: Category) -> bool:
	return get_items_by_category(category).is_empty()

# =============================================================================
# UTILITY
# =============================================================================

func get_total_items() -> int:
	var total: int = 0
	for amount in _inventory.values():
		total += amount
	return total


func get_used_slots() -> int:
	return _inventory.size()


func clear_inventory() -> void:
	_inventory.clear()
	inventory_changed.emit()

# =============================================================================
# SAVE / LOAD
# =============================================================================

func get_save_data() -> Dictionary:
	return _inventory.duplicate()


func load_save_data(data: Dictionary) -> void:
	_inventory = data.duplicate()
	inventory_changed.emit()

# =============================================================================
# DEBUG
# =============================================================================

func debug_print_inventory() -> void:
	print("╔═══════════════════════════════════╗")
	print("║       POCKET INVENTORY            ║")
	print("╠═══════════════════════════════════╣")
	
	if _inventory.is_empty():
		print("║  (vacío)                          ║")
	else:
		for item_id in _inventory:
			var item_data := get_item_definition(item_id)
			var name: String = item_data.get("name", item_id)
			var cat := get_item_category(item_id)
			print("║  %s x%d [%s]" % [name, _inventory[item_id], CATEGORY_NAMES[cat]])
	
	print("╠═══════════════════════════════════╣")
	print("║  Total: %d items" % get_total_items())
	print("╚═══════════════════════════════════╝")
