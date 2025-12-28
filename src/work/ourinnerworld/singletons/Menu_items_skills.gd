extends Inventory

@onready var inventory = $Inventory

func _process(delta):
		if Input.is_action_just_pressed("interact"):
				print("Inventory Stacks:")
				for stack in inventory.stacks:
						print("A Stack")
