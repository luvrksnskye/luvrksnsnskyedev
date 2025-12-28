extends Node

# ============================================
# MUSIC MANAGER
# ============================================

# ============================================
# MUSIC TRACKS
# ============================================
@onready var music_track_1: AudioStreamPlayer = $ow_outskirts
@onready var music_track_2: AudioStreamPlayer = $ow_junkyard
@onready var music_track_3: AudioStreamPlayer = $town

# ============================================
# STATE
# ============================================
var music_tracks: Array[AudioStreamPlayer] = []
var current_track_index: int = 0
var is_playing: bool = false

# ============================================
# SETTINGS
# ============================================
@export var shuffle_mode: bool = false
@export var fade_duration: float = 1.0
@export var volume_db = -30.0

# ============================================
# INITIALIZATION
# ============================================
func _ready() -> void:
	# Configurar para que ignore la pausa del juego
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Gather all music tracks
	_collect_music_tracks()
	
	# Set initial volume
	_set_all_volumes(volume_db)
	
	# Start playing if we have tracks
	if music_tracks.size() > 0:
		play_music()

func _collect_music_tracks() -> void:
	music_tracks.clear()
	
	# Add tracks if they exist and have streams
	if music_track_1 and music_track_1.stream:
		music_tracks.append(music_track_1)
	if music_track_2 and music_track_2.stream:
		music_tracks.append(music_track_2)
	if music_track_3 and music_track_3.stream:
		music_tracks.append(music_track_3)

	
	# Connect finished signals
	for track in music_tracks:
		if not track.finished.is_connected(_on_track_finished):
			track.finished.connect(_on_track_finished)
	
	print("🎵 Music Manager: Found %d tracks" % music_tracks.size())

# ============================================
# PLAYBACK CONTROL
# ============================================
func play_music() -> void:
	if music_tracks.is_empty():
		print("⚠️ No music tracks available")
		return
	
	is_playing = true
	_play_current_track()

func stop_music() -> void:
	is_playing = false
	if _get_current_track():
		_get_current_track().stop()

func pause_music() -> void:
	is_playing = false
	if _get_current_track() and _get_current_track().playing:
		_get_current_track().stream_paused = true

func resume_music() -> void:
	is_playing = true
	if _get_current_track():
		_get_current_track().stream_paused = false

# ============================================
# TRACK MANAGEMENT
# ============================================
func _play_current_track() -> void:
	var track = _get_current_track()
	if not track:
		return
	
	# Stop all other tracks
	for t in music_tracks:
		if t != track and t.playing:
			t.stop()
	
	# Play current track
	track.play()
	print("🎵 Now playing: Track %d" % (current_track_index + 1))

func _on_track_finished() -> void:
	if not is_playing:
		return
	
	# Move to next track
	_next_track()
	
	# Play the next track
	_play_current_track()

func _next_track() -> void:
	if shuffle_mode:
		# Random track (but not the same one)
		var old_index = current_track_index
		current_track_index = randi() % music_tracks.size()
		# Ensure we don't repeat the same track
		if music_tracks.size() > 1 and current_track_index == old_index:
			current_track_index = (current_track_index + 1) % music_tracks.size()
	else:
		# Sequential loop
		current_track_index = (current_track_index + 1) % music_tracks.size()

func _previous_track() -> void:
	if shuffle_mode:
		current_track_index = randi() % music_tracks.size()
	else:
		current_track_index = (current_track_index - 1 + music_tracks.size()) % music_tracks.size()

func skip_to_next() -> void:
	if _get_current_track():
		_get_current_track().stop()
	_next_track()
	if is_playing:
		_play_current_track()

func skip_to_previous() -> void:
	if _get_current_track():
		_get_current_track().stop()
	_previous_track()
	if is_playing:
		_play_current_track()

# ============================================
# VOLUME CONTROL
# ============================================
func set_volume(db: float) -> void:
	volume_db = db
	_set_all_volumes(db)

func _set_all_volumes(db: float) -> void:
	for track in music_tracks:
		track.volume_db = db

func fade_out(duration: float = fade_duration) -> void:
	var track = _get_current_track()
	if not track:
		return
	
	var tween = create_tween()
	tween.tween_property(track, "volume_db", -80.0, duration)
	tween.tween_callback(track.stop)

func fade_in(duration: float = fade_duration) -> void:
	var track = _get_current_track()
	if not track:
		return
	
	track.volume_db = -80.0
	track.play()
	
	var tween = create_tween()
	tween.tween_property(track, "volume_db", volume_db, duration)

# ============================================
# HELPERS
# ============================================
func _get_current_track() -> AudioStreamPlayer:
	if current_track_index < 0 or current_track_index >= music_tracks.size():
		return null
	return music_tracks[current_track_index]

func get_current_track_name() -> String:
	var track = _get_current_track()
	if not track:
		return "None"
	return track.name

func is_music_playing() -> bool:
	var track = _get_current_track()
	return track != null and track.playing

# ============================================
# TOGGLE MODES
# ============================================
func toggle_shuffle() -> void:
	shuffle_mode = !shuffle_mode
	print("🔀 Shuffle mode: %s" % ("ON" if shuffle_mode else "OFF"))

func set_shuffle(enabled: bool) -> void:
	shuffle_mode = enabled
