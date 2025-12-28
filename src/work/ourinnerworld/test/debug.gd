extends Node2D

## Script para tu escena principal
## Inicializa el party con los personajes

@onready var rainy: PartyMember = $Rainy
@onready var hikiko: PartyMember = $Hikiko
@onready var stranger: PartyMember = $Stranger

func _ready() -> void:
	# Esperar un frame para que todo esté listo
	await get_tree().process_frame
	
	# Agregar Rainy primero (será el líder por default)
	PartyManager.add_member(rainy)
	
	# Agregar Hikiko (será seguidor)
	PartyManager.add_member(hikiko)
	
	PartyManager.add_member(stranger)
	
	print("Party inicializado!")
	print("- Líder: ", PartyManager.leader.display_name)
	print("- Miembros: ", PartyManager.get_party_size())
	print("")
	print("Controles:")
	print("  Flechas = Mover")
	print("  Z = Abrir menú Tag")
	print("  E = Usar habilidad especial")
