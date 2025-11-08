extends Node

var _locks := {}   # { "rest": true, ... }

func lock(tag: String) -> void:
	_locks[tag] = true

func unlock(tag: String) -> void:
	_locks.erase(tag)

func clear() -> void:
	_locks.clear()

func is_locked() -> bool:
	return _locks.size() > 0
