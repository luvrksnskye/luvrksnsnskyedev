extends Node2D

var sfx
var ambience
var bgm

func _ready():
	sfx = $Sfx
	ambience = $Ambience
	bgm = $bgm
	
	configure_audio_loop(sfx)
	configure_audio_loop(ambience)
	configure_audio_loop(bgm)

func configure_audio_loop(audio_player: AudioStreamPlayer):
	if audio_player and audio_player.stream:
		if audio_player.stream is AudioStreamWAV:
			audio_player.stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
		elif audio_player.stream is AudioStreamOggVorbis:
			audio_player.stream.loop = true
		elif audio_player.stream is AudioStreamMP3:
			audio_player.stream.loop = true
