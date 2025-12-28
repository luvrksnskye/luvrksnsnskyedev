extends Node	#REFERENCE: https://omori.fandom.com/wiki/

func weapon(id):
	var Weapon = {id=0,Name="none",Hp=0,Mp=0,Atk=0,Def=0,Spd=0,Luck=0,Hit_rate=0,User="none",Info="none"}
	Weapon.id = id
	match id:
		1:
			Weapon.Name = "SHINY KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 5
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "OMORI"
			Weapon.Info = '''A shiny new knife. You can see your reflection in the blade.'''
		2:
			Weapon.Name = "KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 7
			Weapon.Def = 0
			Weapon.Spd = 2
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "OMORI"
			Weapon.Info = '''A pretty sharp knife. It's been used a few times.'''
		3:
			Weapon.Name = "DULL KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 9
			Weapon.Def = 0
			Weapon.Spd = 4
			Weapon.Luck = 2
			Weapon.Hit_rate = 100
			Weapon.User = "OMORI"
			Weapon.Info = '''Worn and harder to use. You can no longer see your reflection.'''
		4:
			Weapon.Name = "RUSTY KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 11
			Weapon.Def = 2
			Weapon.Spd = 6
			Weapon.Luck = 4
			Weapon.Hit_rate = 100
			Weapon.User = "OMORI"
			Weapon.Info = '''Turning a bit brown. It's not what it used to be.'''
		5:
			Weapon.Name = "RED KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 13
			Weapon.Def = 6
			Weapon.Spd = 6
			Weapon.Luck = 6
			Weapon.Hit_rate = 100
			Weapon.User = "OMORI"
			Weapon.Info = '''A shiny new knife. You can see something in the blade.'''
		6:
			Weapon.Name = "STUFFED TOY"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 4
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''"MR.PLANTEGG"'''+"\n"+'''Makes a weird noise when you punch it.'''
		7:
			Weapon.Name = "COMET HAMMER"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 6
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 2
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''A hammer made from meteors! What a LUCKY find!'''
		8:
			Weapon.Name = "BODY PILLOW"
			Weapon.Hp = +10
			Weapon.Mp = 0
			Weapon.Atk = 8
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''Life-sized and huggable, yet suspicious.'''
		9:
			Weapon.Name = "MAILBOX"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 12
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''You got mail... box.'''
		10:
			Weapon.Name = "SWEETHEART BUST"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 20
			Weapon.Def = 0
			Weapon.Spd = -30
			Weapon.Luck = 0
			Weapon.Hit_rate = 75
			Weapon.User = "AUBREY"
			Weapon.Info = '''A bust of SWEETHEART. It's really heavy. Like really, really heavy.'''
		11:
			Weapon.Name = "POOL NOODLE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = -5
			Weapon.Def = -5
			Weapon.Spd = -5
			Weapon.Luck = -5
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''It's completely useless. Who invented this, '''
		12:
			Weapon.Name = "COOL NOODLE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 15
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''It's a POOL NOODLE. But cooler.'''
		13:
			Weapon.Name = "BASEBALL BAT"
			Weapon.Hp = 10
			Weapon.Mp = 0
			Weapon.Atk = 20
			Weapon.Def = 0
			Weapon.Spd = 10
			Weapon.Luck = 10
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''AUBREY's ultimate weapon.'''
		14:
			Weapon.Name = "RUBBER BALL"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 3
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''Playground-tested, child-approved.'''
		15:
			Weapon.Name = "METEOR BALL"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 4
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 2
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''A literal meteor! What are the chances?'''
		16:
			Weapon.Name = "BLOOD ORANGE"
			Weapon.Hp = 0
			Weapon.Mp = 30
			Weapon.Atk = 6
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''A red orange.'''
		17:
			Weapon.Name = "JACK"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 12
			Weapon.Def = -6
			Weapon.Spd = 0
			Weapon.Luck = -6
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''"Please, call me Jack. O' Lantern is my father's name." - Jack'''
		18:
			Weapon.Name = "BEACH BALL"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 10
			Weapon.Def = 0
			Weapon.Spd = 25
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''Fun in the sun for everyone!'''
		19:
			Weapon.Name = "COCONUT"
			Weapon.Hp = 0
			Weapon.Mp = 50
			Weapon.Atk = 8
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''Brown, furry, and full of'''
		20:
			Weapon.Name = "GLOBE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 10
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 1000
			Weapon.User = "KEL"
			Weapon.Info = '''THE EARTH, but smaller. It's a little hard to dribble.'''
		21:
			Weapon.Name = "SNOWBALL"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 13
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''It is cold because it is made of snow.'''
		22:
			Weapon.Name = "CHICKEN BALL"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 0
			Weapon.Def = 0
			Weapon.Spd = 200
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''A CHICKEN BALL. What else would it be?'''
		23:
			Weapon.Name = "BASKETBALL"
			Weapon.Hp = 0
			Weapon.Mp = 50
			Weapon.Atk = 10
			Weapon.Def = 0
			Weapon.Spd = 100
			Weapon.Luck = 15
			Weapon.Hit_rate = 100
			Weapon.User = "KEL"
			Weapon.Info = '''KEL's ultimate weapon.'''
		24:
			Weapon.Name = "SPATULA"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 4
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''Good for flipping burgers.'''
		25:
			Weapon.Name = "BAKING PAN"
			Weapon.Hp = 10
			Weapon.Mp = 0
			Weapon.Atk = 6
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''Hot when it comes out of the oven.'''
		26:
			Weapon.Name = "TEAPOT"
			Weapon.Hp = 0
			Weapon.Mp = 30
			Weapon.Atk = 6
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''Equipped with a handle and spout.'''
		27:
			Weapon.Name = "FRYING PAN"
			Weapon.Hp = 30
			Weapon.Mp = 0
			Weapon.Atk = 7
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''Less effective than a microwave. SNACKS will restore more HEART in battle.'''
		28:
			Weapon.Name = "BLENDER"
			Weapon.Hp = 0
			Weapon.Mp = 30
			Weapon.Atk = 7
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''Turns any solid into liquid. SNACKS will restore more JUICE in battle.'''
		29:
			Weapon.Name = "SHUCKER"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 10
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''Good for opening MUSSELS.'''
			
		30:
			Weapon.Name = "LOL SWORD"
			Weapon.Hp = 0
			Weapon.Mp = 10
			Weapon.Atk = 14
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''xD'''
		31:
			Weapon.Name = "TENDERIZER"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 30
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''The most dangerous tool in the kitchen.'''
		32:
			Weapon.Name = '''OL' RELIABLE'''
			Weapon.Hp = 20
			Weapon.Mp = 20
			Weapon.Atk = 20
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''HERO's ultimate weapon. SNACKS will restore more HEART and JUICE in battle.'''
		33:
			Weapon.Name = "GARDEN SHEARS"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 13
			Weapon.Def = 6
			Weapon.Spd = 6
			Weapon.Luck = 6
			Weapon.Hit_rate = 100
			Weapon.User = "BASIL"
			Weapon.Info = '''Good for trimming down plants and foes.'''
		34:
			Weapon.Name = "HANDS"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 2
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 95
			Weapon.User = "SUNNY"
			Weapon.Info = '''These are all you have.'''
		35:
			Weapon.Name = "STEAK KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 30
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 25
			Weapon.User = "SUNNY"
			Weapon.Info = '''A shiny knife./Good for cutting meat.'''
		36:
			Weapon.Name = "VIOLIN"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 1
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 1000
			Weapon.User = "SUNNY"
			Weapon.Info = '''Cannot be played.'''
		37:
			Weapon.Name = "VIOLIN"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 8
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 1000
			Weapon.User = "SUNNY"
			Weapon.Info = '''Cannot be played.'''
		38:
			Weapon.Name = "VIOLIN"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 14
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 1000
			Weapon.User = "SUNNY"
			Weapon.Info = '''Cannot be destroyed.'''
		39:
			Weapon.Name = "FLY SWATTER"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 1
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 1000
			Weapon.User = "SUNNY"
			Weapon.Info = '''Welcome to the swat team.'''
		40:
			Weapon.Name = "BASKETBALL (RW)"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 2
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 95
			Weapon.User = "KEL"
			Weapon.Info = '''KEL's weapon of choice. Surprisingly effective.'''
		41:
			Weapon.Name = "NAIL BAT"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 3
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 95
			Weapon.User = "AUBREY"
			Weapon.Info = '''AUBREY's weapon of choice. More dangerous than a STEAK KNIFE.'''
		42:
			Weapon.Name = "FIST"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 1
			Weapon.Def = 0
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 95
			Weapon.User = "HERO"
			Weapon.Info = '''Gets the job done.'''
		43:
			Weapon.Name = "BROKEN KNIFE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 13
			Weapon.Def = 6
			Weapon.Spd = 6
			Weapon.Luck = 6
			Weapon.Hit_rate = 100
			Weapon.User = "OMORI"
			Weapon.Info = '''Rusted and worn. It's seen better days.'''
		44:
			Weapon.Name = '''HERO'S TROPHY'''
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 10
			Weapon.Def = 5
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''HERO's most prized possession.'''+"/n"+'''Inflicts SAD on HERO.'''
		45:
			Weapon.Name = "BAGUETTE"
			Weapon.Hp = 0
			Weapon.Mp = 0
			Weapon.Atk = 10
			Weapon.Def = 10
			Weapon.Spd = 0
			Weapon.Luck = 0
			Weapon.Hit_rate = 100
			Weapon.User = "AUBREY"
			Weapon.Info = '''Made of bread.'''+"/n"+'''It's harder than it looks...'''
		46:
			Weapon.Name = "ROLLING PIN"
			Weapon.Hp = 10
			Weapon.Mp = 0
			Weapon.Atk = 0
			Weapon.Def = 0
			Weapon.Spd = 12
			Weapon.Luck = 12
			Weapon.Hit_rate = 100
			Weapon.User = "HERO"
			Weapon.Info = '''The more efficient way to roll dough.'''
	return Weapon

func charm(id):
	var Charm = {id=0,Name="none",Hp=0,Mp=0,Atk=0,Def=0,Spd=0,Luck=0,Hit_rate=0,Info="none"}
	Charm.id = id
	match id:
		1:
			Charm.Name = '''"GOLD" WATCH'''
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Most definitely-probably-not-really made of gold.'''+"/n"+'''Useless in battle.'''
		2:
			Charm.Name = "3-LEAF CLOVER"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 3
			Charm.Hit_rate = 0
			Charm.Info = '''Just a regular clover.'''+"/n"+'''LUCK +3'''
		3:
			Charm.Name = "4-LEAF CLOVER"
			Charm.Hp = 4
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 4
			Charm.Hit_rate = 0
			Charm.Info = '''If you find one, it’s supposed to make you lucky!'''+"/n"+'''LUCK +4, HEART +4'''
		4:
			Charm.Name = "5-LEAF CLOVER"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 2 #+ (1 for each point of ENERGY)
			Charm.Hit_rate = 0
			Charm.Info = '''Is it even a clover at this point?'''+"/n"+'''LUCK increases with more ENERGY.'''
		5:
			Charm.Name = "APPENDIX"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Does nothing.'''
		6:
			Charm.Name = "BACKPACK"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 2
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A convenient storage device.'''+"/n"+'''DEF +2'''
		7:
			Charm.Name = "BASEBALL CAP"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 10
			Charm.Spd = 15
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A mystical hat dating back to 199X.'''+"/n"+'''DEF +10, SPD +15'''
		8:
			Charm.Name = "BINOCULARS"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 2
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 200
			Charm.Info = '''Two noculars. Noculars x2.'''+"/n"+'''DEF +2, Increases HIT RATE.'''
		9:
			Charm.Name = "BLANKET"
			Charm.Hp = 10
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 1
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Soft, fluffy, and protects you from monsters.'''+"/n"+'''DEF +1, HEART +10'''
		10:
			Charm.Name = "BOOK"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Contains a wealth of knowledge within it.'''+"/n"+'''Wearer gains 50% more EXP in battle.'''
		11:
			Charm.Name = "BOW-TIE"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 4
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A simple and elegant bow.'''+"/n"+'''DEF +4'''
		12:
			Charm.Name = "BRACELET"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 1
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A simple bracelet.'''+"/n"+'''DEF +1'''
		13:
			Charm.Name = "BREADPHONES"
			Charm.Hp = 10
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 5
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Two rolls of bread. HEART +10, DEF + 5'''+"/n"+'''LIFE JAM will heal more HEART when used in battle.'''
		14:
			Charm.Name = "BUBBLE WRAP"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 3
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Therapeutic packaging.'''+"/n"+'''DEF +3'''
		15:
			Charm.Name = "BUNNY EARS"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 3
			Charm.Spd = 12
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Helps you hear better.'''+"/n"+'''DEF +3, SPD +12'''
		16:
			Charm.Name = "CAT EARS"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 1
			Charm.Spd = 10
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Gives you catlike reflexes!'''+"/n"+'''DEF +1, SPD +10'''
		17:
			Charm.Name = "CELLPHONE"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 10
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Absolutely indestructible.'''+"/n"+'''DEF +10'''
		18:
			Charm.Name = "CLAM COIN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Said to bring great wealth and fortune!'''+"/n"+'''Doubles the amount of CLAMS earned in battle.'''
		19:
			Charm.Name = "COOL GLASSES"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 5
			Charm.Def = 5
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Even cooler when worn indoors.'''+"/n"+'''ATK +5, DEF +5'''
		20:
			Charm.Name = "COUGH MASK"
			Charm.Hp = 25
			Charm.Mp = 25
			Charm.Atk = 10
			Charm.Def = 10
			Charm.Spd = 10
			Charm.Luck = 10
			Charm.Hit_rate = 0
			Charm.Info = '''Keeps germs close to your face.'''+"/n"+'''Increases ALL STATS.'''
		21:
			Charm.Name = "DAISY"
			Charm.Hp = 10
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A daisy from DAISY.'''+"/n"+'''HEART +10, Wearer starts HAPPY in battle.'''
		22:
			Charm.Name = "EYE PATCH"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 7
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = -25
			Charm.Info = '''The first step to becoming a pirate.'''+"/n"+'''ATK +7, but reduces HIT RATE.'''
		23:
			Charm.Name = "FAUX TAIL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 15
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Not a real tail.'''+"/n"+'''SPD +15'''
		24:
			Charm.Name = "FEDORA"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 5
			Charm.Spd = 0
			Charm.Luck = 5
			Charm.Hit_rate = 0
			Charm.Info = '''MR. JAWSUM pulls it off.'''+"/n"+'''DEF +5, LUCK +5'''
		25:
			Charm.Name = "FINGER"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 10
			Charm.Def = -5
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A dismembered finger. Still fresh.'''+"/n"+'''ATK +10, DEF -5, Wearer starts ANGRY in battle.'''
		26:
			Charm.Name = "FOX TAIL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 5 #+ (3 for each point of ENERGY)
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A real fox tail!'''+"/n"+'''SPEED increases with more ENERGY.'''
		27:
			Charm.Name = "FRIENDSHIP BRACELET"
			Charm.Hp = 10
			Charm.Mp = 10
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A bracelet that embodies friendship.'''+"/n"+'''HEART +10, JUICE +10'''
		28:
			Charm.Name = "NERDY GLASSES"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 5
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 200
			Charm.Info = '''Automatically makes you look smarter.'''+"/n"+'''DEF +5, Increases HIT RATE.'''
		29:
			Charm.Name = "GOLD WATCH"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = -10
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Definitely 100% gold. You can tell by the weight.'''+"/n"+'''SPD -10'''
		30:
			Charm.Name = "HARD HAT"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 6
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''More difficult than an easy hat.'''+"/n"+'''DEF +6'''
		31:
			Charm.Name = "HEADBAND"
			Charm.Hp = 0
			Charm.Mp = 20
			Charm.Atk = 10
			Charm.Def = 3
			Charm.Spd = 15
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Used to keep the hair out of your face.'''+"/n"+'''Raises most STATS.'''
		33:
			Charm.Name = "HEART STRING"
			Charm.Hp = 30
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Fragile. Treat well.'''+"/n"+'''HEART +30, Wearer starts HAPPY in battle.'''
		34:
			Charm.Name = "HIGH HEELS"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 10
			Charm.Def = 0
			Charm.Spd = -10
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Makes you taller! KEL would probably like these.'''+"/n"+'''ATK +10, SPD -10'''
		35:
			Charm.Name = "HOMEWORK"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''The bane of every child's existence.'''+"/n"+'''Wearer starts SAD in battle.'''
		36:
			Charm.Name = "INNER TUBE"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 2 #+ (1 for each point of ENERGY)
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Makes swimming easier, yet harder.'''+"/n"+'''DEFENSE increases with more ENERGY.'''
		37:
			Charm.Name = "MAGICAL BEAN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Wearer starts battle with a random EMOTION.'''
		38:
			Charm.Name = "ONION RING"
			Charm.Hp = 20
			Charm.Mp = 20
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Just one.'''+"/n"+'''HEART +20, JUICE +20'''	
		39:
			Charm.Name = "PAPER BAG"
			Charm.Hp = 40
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 13
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Wear it over your head.'''+"/n"+'''DEF +13, HEART +40, Prevents EMOTION.'''
		40:
			Charm.Name = "HECTOR"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Can talk, but is very shy.'''+"/n"+'''He is a good friend.'''
		41:
			Charm.Name = "PRETTY BOW"
			Charm.Hp = 50
			Charm.Mp = 0
			Charm.Atk = 10
			Charm.Def = 3
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A polkadot bow. Too flashy for your taste.'''+"/n"+'''HEART +50, ATK +10, DEF +3'''
		42:
			Charm.Name = "PUNCHING BAG"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Has a picture of KEL on it.'''+"/n"+'''Wearer starts ANGRY in battle.'''
		43:
			Charm.Name = "RABBIT FOOT"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 15
			Charm.Luck = 10
			Charm.Hit_rate = 0
			Charm.Info = '''A little yucky, but keeps you lucky.'''+"/n"+'''SPD +15, LUCK +10'''
		44:
			Charm.Name = "RED RIBBON"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 1 #+ (2 for each point of ENERGY)
			Charm.Def = 5
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A pretty red ribbon.'''+"/n"+'''DEF +5, ATTACK increases with more ENERGY.'''
		45:
			Charm.Name = "DEEP POETRY BOOK"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Touches the soul deeply.'''+"/n"+'''Wearer starts SAD in battle.'''
		46:
			Charm.Name = "RUBBER DUCK"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 7
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A cute rubber duck. Doesn’t like you very much.'''+"/n"+'''DEF +7'''
		47:
			Charm.Name = "SALES TAG"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Who can resist a sale?'''+"/n"+'''Reduces cost of the first SKILL used in battle by 50%.'''
		48:
			Charm.Name = "SEER GOGGLES"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 1
			Charm.Spd = 0
			Charm.Luck = 3
			Charm.Hit_rate = 200
			Charm.Info = '''Goggles that know everything.'''+"/n"+'''DEF +1, LUCK +3, Increases HIT RATE.'''
		49:
			Charm.Name = "TOP HAT"
			Charm.Hp = 13
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 13
			Charm.Spd = 0
			Charm.Luck = 13
			Charm.Hit_rate = 0
			Charm.Info = '''Hope it's not haunted...'''+"/n"+'''DEF +13, LUCK +13, HEART +13'''
		50:
			Charm.Name = "HECTOR JR"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 1 #+ (1 for each point of ENERGY)
			Charm.Def = 1 #+ (1 for each point of ENERGY)
			Charm.Spd = 1 #+ (1 for each point of ENERGY)
			Charm.Luck = 0#+1 for each point of ENERGY
			Charm.Hit_rate = 0
			Charm.Info = '''Can talk, but is very shy.'''+"/n"+'''Stats increase with more ENERGY.'''
		51:
			Charm.Name = "WEDDING RING"
			Charm.Hp = 10
			Charm.Mp = 10
			Charm.Atk = 3
			Charm.Def = 3
			Charm.Spd = 3
			Charm.Luck = 3
			Charm.Hit_rate = 0
			Charm.Info = '''Ruthlessly discarded by SWEETHEART.'''+"/n"+'''Increases ALL STATS. Wearer starts HAPPY.'''
		52:
			Charm.Name = "WISHBONE"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 7
			Charm.Hit_rate = 0
			Charm.Info = '''For all your wish-making needs.'''+"/n"+'''LUCK +7'''
		53:
			Charm.Name = "VEGGIE KID"
			Charm.Hp = 15
			Charm.Mp = 15
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A young vegetable.'''+"/n"+'''HEART +15, JUICE +15'''
		54:
			Charm.Name = "WATERING PAIL"
			Charm.Hp = 0
			Charm.Mp = 10
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Embodies the spirit of SPRING.'''+"/n"+'''JUICE +10'''
		55:
			Charm.Name = "RAKE"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 3
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Embodies the spirit of FALL.'''+"/n"+'''ATK +3'''
		56:
			Charm.Name = "SCARF"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 3
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Embodies the spirit of WINTER.'''+"/n"+'''DEF +3'''
		57:
			Charm.Name = "COTTON BALL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 1
			Charm.Spd = 3
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A fluffy ball of cotton.'''+"/n"+'''DEF +1, SPD +3'''
		58:
			Charm.Name = "FLASHLIGHT"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 4
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Brightens up a room.'''+"/n"+'''DEF +4'''
		59:
			Charm.Name = "UNIVERSAL REMOTE"
			Charm.Hp = 10
			Charm.Mp = 10
			Charm.Atk = 5
			Charm.Def = 5
			Charm.Spd = 5
			Charm.Luck = 5
			Charm.Hit_rate = 0
			Charm.Info = '''Can change the universe.'''+"/n"+'''Increases ALL STATS.'''
		60:
			Charm.Name = '''CHEF'S HAT'''
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 15
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''The pride of every chef.'''+"/n"+'''DEF +15, Restores 5% JUICE every turn.'''
		61:
			Charm.Name = "TV REMOTE"
			Charm.Hp = 5
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 2
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Changes channels on the TV.'''+"/n"+'''DEF +2, HEART +5'''
		62:
			Charm.Name = "SUNSCREEN"
			Charm.Hp = 15
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Embodies the spirit of SUMMER.'''+"/n"+'''HEART +15'''
		63:
			Charm.Name = "CONTRACT"
			Charm.Hp = -80	#Percent (%)
			Charm.Mp = -80	#Percent (%)
			Charm.Atk = 20
			Charm.Def = 20
			Charm.Spd = 20
			Charm.Luck = 20
			Charm.Hit_rate = 0
			Charm.Info = '''A powerful piece of paper.'''+"/n"+'''Trades HEART and JUICE for other STATS.'''
		64:
			Charm.Name = "FLOWER CROWN"
			Charm.Hp = 100
			Charm.Mp = 25
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A precious gift made by BASIL.'''+"/n"+'''HEART +100, JUICE +25'''
		65:
			Charm.Name = '''ABBI'S EYE'''
			Charm.Hp = -90	#Percent (%)
			Charm.Mp = -99	#Percent (%)
			Charm.Atk = 40
			Charm.Def = 0
			Charm.Spd = 40
			Charm.Luck = 40
			Charm.Hit_rate = 100
			Charm.Info = '''ABBI's remains. Predicts who a foe'''+"/n"+'''will target at the start of battle.'''
		66:
			Charm.Name = "TULIP HAIRSTICK"
			Charm.Hp = 50
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Plain, simple, and bulbous.'''+"/n"+'''HEART +50, Wearer gains 150% more EXP.'''
		67:
			Charm.Name = "GLADIOLUS HAIRBAND"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 10
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 10
			Charm.Hit_rate = 100
			Charm.Info = '''Represents strength of character.'''+"/n"+'''ATK +10, LUCK +10, Increases HIT RATE.'''
		68:
			Charm.Name = "CACTUS HAIRCLIP"
			Charm.Hp = 15
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 15
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A very sturdy and resilient plant.'''+"/n"+'''DEF +15, HEART +15'''
		69:
			Charm.Name = "ROSE HAIRCLIP"
			Charm.Hp = 15
			Charm.Mp = 15
			Charm.Atk = 5
			Charm.Def = 5
			Charm.Spd = 5
			Charm.Luck = 5
			Charm.Hit_rate = 100
			Charm.Info = '''Versatile and universally loved.'''+"/n"+'''Increases ALL STATS.'''
		70:
			Charm.Name = "RED HAND"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Red, sticky, and shaped like a hand.'''
		71:
			Charm.Name = "GREEN HAND"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Green, sticky, and shaped like a hand.'''
		72:
			Charm.Name = "PURPLE HAND"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Purple, sticky, and shaped like a hand.'''
		73:
			Charm.Name = "PURPLE BALL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A bouncy purple ball.'''
		74:
			Charm.Name = "PINK BALL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A bouncy pink ball.'''
		75:
			Charm.Name = "GREEN BALL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A bouncy green ball.'''
		76:
			Charm.Name = "GREEN SLINKY"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A green springy toy.'''
		77:
			Charm.Name = "BLUE SLINKY"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A blue springy toy.'''
		78:
			Charm.Name = "YELLOW SLINKY"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A yellow springy toy.'''
		79:
			Charm.Name = "YELLOW KEYCHAIN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A portable yellow cat.'''
		80:
			Charm.Name = "GREEN KEYCHAIN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A portable green cat.'''
		81:
			Charm.Name = "PINK KEYCHAIN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A portable pink cat.'''
		82:
			Charm.Name = "CHIMERA KEYCHAIN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 5
			Charm.Hit_rate = 0
			Charm.Info = '''A portable... cat?'''
		83:
			Charm.Name = "PET ROCK"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''The most loyal rock.'''
		84:
			Charm.Name = "FLOWER CLIP (REAL WORLD)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A flower on a clip.'''
		85:
			Charm.Name = "RED HEADBAND"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A headband that is red.'''
		86:
			Charm.Name = "ORANGE HEADBAND"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A headband that is orange.'''
		87:
			Charm.Name = "COOL GLASSES (REAL WORLD)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Even cooler when worn indoors.'''
		88:
			Charm.Name = "SEASHELL NECKLACE"
			Charm.Hp = 25
			Charm.Mp = 25
			Charm.Atk = 0
			Charm.Def = 5
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''To help you remember your friends...'''+"/n"+'''DEF +5, HEART +25, JUICE +25'''
		89:
			Charm.Name = "GOLD WATCH (REAL WORLD)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A shiny item for your wrist.'''
		90:
			Charm.Name = '''"GOLD" WATCH (REAL WORLD)'''
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Is this even real gold?'''
		91:
			Charm.Name = "FEDORA (REAL WORLD)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Goes on your head, but it shouldn't.'''
		92:
			Charm.Name = '''"YOU ROCK" CAP'''
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A prestigious cap bestowed upon the PET ROCK'''+"/n"+'''champion. 100% cotton.'''
		93:
			Charm.Name = "PINWHEEL"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Prettier in the wind.'''
		94:
			Charm.Name = "PAINT BRUSH"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Feels cool to carry around.'''
		95:
			Charm.Name = "COOL BOTTLECAP"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Rare and vintage. Mildly shiny.'''
		96:
			Charm.Name = '''KEL'S PET ROCK'''
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''KEL's best friend.'''
		97:
			Charm.Name = "3D GLASSES"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 3
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Now has one more D than 2D glasses.'''+"/n"+'''DEF +3'''
		98:
			Charm.Name = "BABY CHICKEN"
			Charm.Hp = 30
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''You can't be sad while holding a baby chicken.'''+"/n"+'''HEART +30, Wearer starts HAPPY in battle.'''
		99:
			Charm.Name = "BOTTLE CAP"
			Charm.Hp = 10
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Pretty neat.'''+"/n"+'''HEART +10'''
		100:
			Charm.Name = "CACTUS"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 3
			Charm.Def = 3
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Spiky on the outside, soft on the inside.'''+"/n"+'''DEF +3, ATK +3'''
		101:
			Charm.Name = "FLOWER CLIP"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 2
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''A nice gift.'''+"/n"+'''DEF +2, Wearer starts HAPPY in battle.'''
		102:
			Charm.Name = "LUCKY TOKEN"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 10
			Charm.Hit_rate = 0
			Charm.Info = '''Prevents TOAST if wearer has more than'''+"/n"+'''1 HEART. LUCK +10''' 
		103:
			Charm.Name = "MONOCLE"
			Charm.Hp = 1
			Charm.Mp = 1
			Charm.Atk = 1
			Charm.Def = 1
			Charm.Spd = 1
			Charm.Luck = 1
			Charm.Hit_rate = 1
			Charm.Info = '''Designed for the rich and people with one eye.'''+"/n"+'''ALL STATS +1'''
		104:
			Charm.Name = "MUSTACHE"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 5
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 10
			Charm.Hit_rate = 0
			Charm.Info = '''The pride of every gentleman.'''+"/n"+'''ATK +5, LUCK +10'''
		105:
			Charm.Name = "OVEN MITTS"
			Charm.Hp = 30
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 13
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Fashionable and practical.'''+"/n"+'''DEF +13, HEART +30'''
		106:
			Charm.Name = "RABBIT FOOT (REAL WORLD)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''No rabbits were harmed.'''
		107:
			Charm.Name = "SEASHELL NECKLACE (Unused)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''You can almost feel the sea breeze.'''
		108:
			Charm.Name = "TEDDY BEAR (REAL WORLD)"
			Charm.Hp = 0
			Charm.Mp = 0
			Charm.Atk = 0
			Charm.Def = 0
			Charm.Spd = 0
			Charm.Luck = 0
			Charm.Hit_rate = 0
			Charm.Info = '''Better when you hug it.'''
	return Charm

#Reference: https://omori.fandom.com/wiki/SKILLS
func skill(id,User):
	var Skill = {id=id,Name="none",Effect="none",Level=0,Cost=0,Target="none",Info="none",User=User,sfxId=0}
	match User:
		"Follow-Up":
			match id:
				0:
					Skill.Name = "RELEASE ENERGY"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "AllEnemies"
					Skill.Info = '''OMORI and friends come together and use their ultimate attack, dealing huge damage to all foes!'''
					Skill.sfxId = 23
				1:
					Skill.Name = "ATTACK AGAIN"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "randomE1"
					Skill.Info = '''OMORI attacks again, dealing extra damage to a random foe!'''
				2:
					Skill.Name == "TRIP"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "randomE1"
					Skill.Info = '''OMORI trips a random foe, dealing damage, lowering its SPEED, and making it SAD!'''
					Skill.sfxId = 28
		
		
		"OMORI":
			match id:
				0:
					Skill.Name = "ATTACK"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "Enemy"
					Skill.Info = '''OMORI's Basic Attack'''
					Skill.sfxId = 8
				1:
					Skill.Name = "SAD POEM"
					Skill.Level = 0
					Skill.Cost = 5
					Skill.Target = "Anyone"
					Skill.Info = '''Inflicts SAD on a friend or foe.'''+"\n"+'''cost: 5'''
				2:
					Skill.Name = "GUARD"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "self"
					Skill.Info = '''Acts first, reducing damage taken for 1 turn.'''+"\n"+'''cost: 0'''
				3:
					Skill.Name = "STAB"
					Skill.Level = 3
					Skill.Cost = 13
					Skill.Target = "Enemy"
					Skill.Info = '''Always deals a critical hit.'''+"\n"+'''Ignores DEFENSE when OMORI is SAD. cost: 13'''
					Skill.sfxId = 25
				4:
					Skill.Name = "BREAD SLICE"
					Skill.Level = 5
					Skill.Cost = 10
					Skill.Target = "Enemy"
					Skill.Info = '''If this skill defeats a foe, gain BREAD.'''+"\n"+'''cost: 10'''
				5:
					Skill.Name = "MOCK"
					Skill.Level = 7
					Skill.Cost = 20
					Skill.Target = "Enemy"
					Skill.Info = '''Deals damage. If the foe is ANGRY,'''+"\n"+'''greatly reduce its ATTACK. cost: 20'''
				6:
					Skill.Name = "HACK AWAY"	
					Skill.Level = 10
					Skill.Cost = 30
					Skill.Target = "randomE3" # 3 Random Enemy
					Skill.Info = '''Attacks 3 times, hitting random foes.'''+"\n"+'''cost: 30'''
					Skill.sfxId = 15
				7:
					Skill.Name = "OBSERVE"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "Enemy"
					Skill.Info = '''Predicts who a foe will target next turn.'''+"\n"+'''cost: 0'''
					Skill.sfxId = 19
				8:
					Skill.Name = "LUCKY SLICE"
					Skill.Level = 12
					Skill.Cost = 15
					Skill.Target = "Enemy"
					Skill.Info = '''Acts first. An attack that's stronger'''+"\n"+'''when OMORI is HAPPY. cost: 15'''
				9:
					Skill.Name = "TRICK"
					Skill.Level = 15
					Skill.Cost = 20
					Skill.Target = "Enemy"
					Skill.Info = '''Deals damage. If the foe is HAPPY, greatly'''+"\n"+'''reduce its SPEED. cost: 20'''
					Skill.sfxId = 27
				10:
					Skill.Name = "PAINFUL TRUTH"
					Skill.Level = 19
					Skill.Cost = 10
					Skill.Target = "Enemy"
					Skill.Info = '''Deals damage to a foe. OMORI and the foe'''+"\n"+'''become SAD. cost: 10'''
				11:
					Skill.Name = "SHUN"
					Skill.Level = 20
					Skill.Cost = 20
					Skill.Target = "Enemy"
					Skill.Info = '''Deals damage. If the foe is SAD, greatly'''+"\n"+'''reduce its DEFENSE. cost: 20'''
				12:
					Skill.Name = "STARE"
					Skill.Level = 25
					Skill.Cost = 45
					Skill.Target = "Enemy"
					Skill.Info = '''Reduces all of a foe's STATS.'''+"\n"+'''cost: 45'''
				13:
					Skill.Name = "EXPLOIT"
					Skill.Level = 30
					Skill.Cost = 30
					Skill.Target = "Enemy"
					Skill.Info = '''Deals extra damage to a HAPPY, SAD, or'''+"\n"+'''ANGRY foe. cost: 30'''
				14:
					Skill.Name = "FINAL STRIKE"
					Skill.Level = 35
					Skill.Cost = 50
					Skill.Target = "AllEnemies"
					Skill.Info = '''Strikes all foes, ignoring their DEFENSE.'''+"\n"+'''cost: 50'''
				15:
					Skill.Name = "RED HANDS"
					Skill.Level = 50
					Skill.Cost = 75
					Skill.Target = "Enemy"
					Skill.Info = '''Deals big damage 4 times.'''+"\n"+'''cost: 75'''
				16:
					Skill.Name = "VERTIGO"
					Skill.Level = 50
					Skill.Cost = 45
					Skill.Target = "AllEnemies"
					Skill.Info = '''Deals damage to all foes based on user's SPEED'''+"\n"+'''and greatly reduces their ATTACK.'''
				17:
					Skill.Name = "CRIPPLE"
					Skill.Level = 50
					Skill.Cost = 45
					Skill.Target = "AllEnemies"
					Skill.Info = '''Deals big damage to all foes and'''+"\n"+'''greatly reduces their SPEED.'''
				18:
					Skill.Name = "SUFFOCATE"
					Skill.Level = 50
					Skill.Cost = 45
					Skill.Target = "AllEnemies"
					Skill.Info = '''Deals 400 damage to all foes and'''+"\n"+'''greatly reduces their DEFENSE.'''
		"AUBREY":
			match id:
				0:
					Skill.Name = "ATTACK"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "Enemy"
					Skill.Info = '''AUBREY's Basic Attack'''
					Skill.sfxId = 9
				1:
					Skill.Name = "PEP TALK"
					Skill.Level = 0
					Skill.Cost = 5
					Skill.Target = "Anyone"
					Skill.Info = '''Makes a friend or foe HAPPY.'''+"\n"+'''cost: 5'''
					Skill.sfxId = 20
				2:
					Skill.Name = "GUARD"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "self"
					Skill.Info = '''Acts first, reducing damage taken by 50% for 1 turn.'''+"\n"+'''cost: 0'''
				3:
					Skill.Name = "HEADBUTT"
					Skill.Level = 0
					Skill.Cost = 5
					Skill.Target = "Enemy"
					Skill.Info = '''Deals big damage, but AUBREY also takes damage.'''+"\n"+'''Stronger when AUBREY is ANGRY. cost: 5'''
					Skill.sfxId = 16
				4:
					Skill.Name = "COUNTER"
					Skill.Level = 6
					Skill.Cost = 5
					Skill.Target = "Enemy"
					Skill.Info = '''foes target AUBREY for 1 turn.'''+"\n"+'''If AUBREY is attacked, she attacks. cost: 5'''
				5:
					Skill.Name = "TWIRL"
					Skill.Level = 10
					Skill.Cost = 10
					Skill.Target = "Enemy"
					Skill.Info = '''AUBREY attacks a foe and becomes HAPPY.'''+"\n"+'''cost: 10'''
				6:
					Skill.Name = "TEAM SPIRIT"
					Skill.Level = 12
					Skill.Cost = 10
					Skill.Target = "Player"
					Skill.Info = '''Makes AUBREY and a friend HAPPY.'''+"\n"+'''cost: 10'''
				7:
					Skill.Name = "POWER HIT"
					Skill.Level = 14
					Skill.Cost = 20
					Skill.Target = "Enemy"
					Skill.Info = '''An attack that ignores a foe's DEFENSE,'''+"\n"+'''then reduces the foe's DEFENSE. cost: 20'''
				8:
					Skill.Name = "MOOD WRECKER"
					Skill.Level = 17
					Skill.Cost = 10
					Skill.Target = "Enemy"
					Skill.Info = '''A swing that doesn't miss. Deals extra damage to'''+"\n"+'''HAPPY foes. cost: 10'''
				9:
					Skill.Name = "WIND-UP THROW"
					Skill.Level = 20
					Skill.Cost = 20
					Skill.Target = "AllEnemies"
					Skill.Info = '''Damages all foes. Deals more damage the less'''+"\n"+'''enemies there are. cost: 20'''
				10:
					Skill.Name = "MASH"
					Skill.Level = 23
					Skill.Cost = 15
					Skill.Target = "Enemy"
					Skill.Info = '''If this skill defeats a foe, recover 100% JUICE'''+"\n"+'''cost: 15'''
				11:
					Skill.Name = "BEATDOWN"
					Skill.Level = 27
					Skill.Cost = 30
					Skill.Target = "Enemy"
					Skill.Info = '''Attacks a foe 3 times.'''+"\n"+'''cost: 30'''
				12:
					Skill.Name = "LAST RESORT"
					Skill.Level = 30
					Skill.Cost = 50
					Skill.Target = "Enemy"
					Skill.Info = '''Deals damage based on AUBREY's HEART,'''+"\n"+'''but AUBREY becomes TOAST. cost: 50'''
		"KEL":
			match id:
				0:
					Skill.Name = "ATTACK"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "Enemy"
					Skill.Info = '''KEL's Basic Attack'''
					Skill.sfxId = 10
				1:
					Skill.Name = "ANNOY"
					Skill.Level = 0
					Skill.Cost = 5
					Skill.Target = "Enemy"
					Skill.Info = '''Makes a friend or foe ANGRY.'''+"\n"+'''cost: 5'''
					Skill.sfxId = 12
				2:
					Skill.Name = "GUARD"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "self"
					Skill.Info = '''Acts first, reducing damage taken by 50% for 1 turn.'''+"\n"+'''cost: 0'''
				3:
					Skill.Name = "REBOUND"
					Skill.Level = 4
					Skill.Cost = 15
					Skill.Target = "AllEnemies"
					Skill.Info = '''Deals damage to all foes.'''+"\n"+'''cost: 15'''
					Skill.sfxId = 22
				4:
					Skill.Name = '''RUN N' GUN'''
					Skill.Level = 9
					Skill.Cost = 15
					Skill.Target = "Enemy"
					Skill.Info = '''KEL does an attack based on his SPEED'''+"\n"+'''instead of his ATTACK. cost: 15'''
				5:
					Skill.Name = "CURVEBALL"
					Skill.Level = 10
					Skill.Cost = 20
					Skill.Target = "Enemy"
					Skill.Info = '''Makes a foe feel a random EMOTION. Deals'''+"\n"+'''extra damage to foes with EMOTION. cost: 20'''
				6:
					Skill.Name = "RICOCHET"
					Skill.Level = 16
					Skill.Cost = 30
					Skill.Target = "Enemy"
					Skill.Info = '''Deals damage to a foe 3 times'''+"\n"+'''cost: 30'''
					Skill.sfxId = 24
				7:
					Skill.Name = "MEGAPHONE"
					Skill.Level = 20
					Skill.Cost = 45
					Skill.Target = "AllPlayers"
					Skill.Info = '''Makes all friends ANGRY.'''+"\n"+'''cost: 45'''
				8:
					Skill.Name = '''CAN'T CATCH ME'''
					Skill.Level = 21
					Skill.Cost = 50
					Skill.Target = "AllEnemies"
					Skill.Info = '''Attracts attention and reduces all foes' '''+"\n"+'''HIT RATE for the next turn. cost: 50'''
				9:
					Skill.Name = "RALLY"
					Skill.Level = 26
					Skill.Cost = 50
					Skill.Target = "AllPlayers"
					Skill.Info = '''KEL becomes HAPPY. KEL'S friends recover some'''+"\n"+'''ENERGY and JUICE. cost: 50'''
					Skill.sfxId = 21
				10:
					Skill.Name = "COMEBACK"
					Skill.Level = 29
					Skill.Cost = 25
					Skill.Target = "self"
					Skill.Info = '''Makes KEL HAPPY. If SAD was removed,'''+"\n"+'''KEL gains FLEX. cost: 25'''	
			
				11:
					Skill.Name = "TICKLE"
					Skill.Level = 30
					Skill.Cost = 55
					Skill.Target = "Enemy"
					Skill.Info = '''All attacks on a foe will hit right'''+"\n"+'''in the HEART next turn. cost: 55'''
					Skill.sfxId = 26
				12:
					Skill.Name = "FLEX"
					Skill.Level = 50
					Skill.Cost = 10
					Skill.Target = "self"
					Skill.Info = '''KEL deals more damage next turn and increases'''+"\n"+'''HIT RATE for his next attack. cost: 10'''
					Skill.sfxId = 14
				13:
					Skill.Name = "JUICE ME"
					Skill.Level = 50
					Skill.Cost = 10
					Skill.Target = "Player"
					Skill.Info = '''Heals a lot of JUICE to a friend, but also'''+"\n"+'''hurts the friend. cost: 10'''
				14	:
					Skill.Name = "SNOWBALL"
					Skill.Level = 50
					Skill.Cost = 20
					Skill.Target = "Enemy" #and AllEnemies included in doTheSkill()
					Skill.Info = '''Makes a foe SAD.'''+"\n"+'''Also deals big damage to SAD foes. cost: 20'''
		"HERO":
			match id:
				0:
					Skill.Name = "ATTACK"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "Enemy"
					Skill.Info = '''HERO's Basic Attack	'''
					Skill.sfxId = 11
				1:
					Skill.Name = "COOK"
					Skill.Level = 0
					Skill.Cost = 10
					Skill.Target = "Player"
					Skill.Info = '''Heals a friend for 75% of their HEART.'''+"\n"+'''Can be used outside of battle. cost: 10'''
					Skill.sfxId = 13
				2:
					Skill.Name = "GUARD"
					Skill.Level = 0
					Skill.Cost = 0
					Skill.Target = "Enemy"
					Skill.Info = '''Acts first, reducing damage taken by 50% for 1 turn.'''+"\n"+'''cost: 0'''
				3:
					Skill.Name = "MASSAGE"
					Skill.Level = 2
					Skill.Cost = 5
					Skill.Target = "Anyone"
					Skill.Info = '''Removes a friend or foe's EMOTION.'''+"\n"+'''cost: 5'''
					Skill.sfxId = 17
				4:
					Skill.Name = "CHARM"
					Skill.Level = 8
					Skill.Cost = 10
					Skill.Target = "Enemy"
					Skill.Info = '''Act's first, a foe targets HERO for 1 turn.'''+"\n"+'''cost: 10'''
				5:
					Skill.Name = "SMILE"
					Skill.Level = 10
					Skill.Cost = 25
					Skill.Target = "Enemy"
					Skill.Info = '''Acts first, reducing a foe's ATTACK.'''+"\n"+'''cost: 25'''
				6:
					Skill.Name = "FAST FOOD"
					Skill.Level = 13
					Skill.Cost = 15
					Skill.Target = "Player"
					Skill.Info = '''Act's first, healing a friend for 40% of'''+"\n"+'''their HEART. cost: 15'''
				7:
					Skill.Name = "HOMEMADE JAM"
					Skill.Level = 16
					Skill.Cost = 40
					Skill.Target = "ToastedPlayer"
					Skill.Info = '''Brings back a friend that is TOAST'''+"\n"+'''cost: 40'''
				8:
					Skill.Name = "CAPTIVATE"
					Skill.Level = 20
					Skill.Cost = 20
					Skill.Target = "AllEnemies"
					Skill.Info = '''Acts first. All foes target HERO for 1 turn.'''+"\n"+'''cost: 20'''
				9:
					Skill.Name = "ENCHANT"
					Skill.Level = 22
					Skill.Cost = 15
					Skill.Target = "Enemy"
					Skill.Info = '''Acts first. A foe targets HERO for 1 turn and'''+"\n"+'''becomes HAPPY. cost: 15'''
				10:
					Skill.Name = "SHARE FOOD"
					Skill.Level = 24
					Skill.Cost = 15
					Skill.Target = "Player" #self included in useSkill()
					Skill.Info = '''HERO and a friend recover some HEART.'''+"\n"+'''cost: 15'''
				11:
					Skill.Name = "MESMERIZE"
					Skill.Level = 28
					Skill.Cost = 30
					Skill.Target = "AllEnemies"
					Skill.Info = '''Acts first. All foes target HERO for 1 turn.'''+"\n"+'''HERO takes less damage. cost: 30'''
					Skill.sfxId = 18
				12:
					Skill.Name = "DAZZLE"
					Skill.Level = 30
					Skill.Cost = 35
					Skill.Target = "AllEnemies"
					Skill.Info = '''Acts first. Reduces all foes' ATTACK and'''+"\n"+'''makes them HAPPY. cost: 35'''
				13:
					Skill.Name = "SNACK TIME"
					Skill.Level = 50
					Skill.Cost = 25
					Skill.Target = "AllPlayers"
					Skill.Info = '''Heals all friends for 40% of their HEART.'''+"\n"+'''Can be used outside of battle. cost: 25'''
				14:
					Skill.Name = "TEA TIME"
					Skill.Level = 50
					Skill.Cost = 25
					Skill.Target = "Player"
					Skill.Info = '''Heals some of a friend's HEART and JUICE.'''+"\n"+'''cost: 25'''
				15:
					Skill.Name = "SPICY FOOD"
					Skill.Level = 50
					Skill.Cost = 15
					Skill.Target = "Enemy"
					Skill.Info = '''Damages a foe and makes them ANGRY.'''+"\n"+'''cost: 15'''
				16:
					Skill.Name = "REFRESH"
					Skill.Level = 50
					Skill.Cost = 40
					Skill.Target = "Player"
					Skill.Info = '''Heals 50% of a friend's JUICE.'''+"\n"+'''cost: 40'''
				17:
					Skill.Name = "TENDERIZE"
					Skill.Level = 50
					Skill.Cost = 30
					Skill.Target = "Enemy"
					Skill.Info = '''Deals big damage to a foe and reduces'''+"\n"+'''their DEFENSE. cost: 30'''
				18:
					Skill.Name = "GATOR AID"
					Skill.Level = 50
					Skill.Cost = 15
					Skill.Target = "AllPlayers"
					Skill.Info = '''Boosts all friends' DEFENSE.'''+"\n"+'''cost: 15 JUICE'''
		"SWEETHEART":
			match id:
				0:
					Skill.Name = "ATTACK"
					Skill.Cost = 0
					Skill.Target = "Player"
					Skill.Possibility = {"Normal"=40,"Happy"=35,"Sad"=35,"Angry"=50}
				1:
					Skill.Name = "SHARP INSULT"
					Skill.Cost = 0
					Skill.Target = "AllPlayers"
					Skill.Possibility = {"Normal"=30,"Happy"=45,"Sad"=20,"Angry"=30}
				2:
					Skill.Name = "SWING MACE"
					Skill.Cost = 0
					Skill.Target = "AllPlayers"
					Skill.Possibility = {"Normal"=35,"Happy"=100,"Sad"=30,"Angry"=70}
				3:
					Skill.Name = "BRAG"
					Skill.Cost = 0
					Skill.Target = "self"
					Skill.Possibility = {"Normal"=100,"Happy"=0,"Sad"=100,"Angry"=100}
	return Skill


func snack(id):	#Reference: https://omori.fandom.com/wiki/Category:SNACKS
	var Snack = {id=0,Name="none",Hp=0,Mp=0,Type="num",Target='Player',Cost=0,Curr='clams',qt=1,Info="none"}
	Snack.id = id
	if id <= 62:
		Snack.Curr='clams'
	else:
		Snack.Curr='dollars'
	
	match id:
		1:
			Snack.Name = '''TOFU'''
			Snack.Hp = 5
			Snack.Mp = 0
			Snack.Cost = 2
			Snack.Info = '''Soft cardboard, basically. Heals 5 HEART.'''
		2:
			Snack.Name = '''CANDY'''
			Snack.Hp = 30
			Snack.Mp = 0
			Snack.Cost = 10
			Snack.Info = '''A child's favorite food. Sweet! Heals 30 HEART.'''
		3:
			Snack.Name = '''SMORES'''
			Snack.Hp = 50
			Snack.Mp = 0
			Snack.Cost = 60
			Snack.Info = '''S'more smores, please! Heals 50 HEART.'''
		4:
			Snack.Name = '''GRANOLA BAR'''
			Snack.Hp = 60
			Snack.Mp = 0
			Snack.Cost = 40
			Snack.Info = '''A healthy stick of grain. Heals 60 HEART.'''
		5:
			Snack.Name = '''BREAD'''
			Snack.Hp = 60
			Snack.Mp = 0
			Snack.Cost = 10
			Snack.Info = '''A slice of life. Heals 60 HEART.'''
		6:
			Snack.Name = '''NACHOS'''
			Snack.Hp = 75
			Snack.Mp = 0
			Snack.Cost = 100
			Snack.Info = '''Suggested serving size: 6-8 nachos. Heals 75 HEART.'''
		7:
			Snack.Name = '''CHICKEN WING'''
			Snack.Hp = 80
			Snack.Mp = 0
			Snack.Cost = 100
			Snack.Info = '''Wing of chicken. Heals 80 HEART.'''
		8:
			Snack.Name = '''HOT DOG'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 150
			Snack.Info = '''Better than a cold dog. Heals 100 HEART.'''
		9:
			Snack.Name = '''WAFFLE'''
			Snack.Hp = 150
			Snack.Mp = 0
			Snack.Cost = 200
			Snack.Info = '''Designed to hold syrup! Heals 150 HEART.'''
		10:
			Snack.Name = '''PANCAKE'''
			Snack.Hp = 150
			Snack.Mp = 0
			Snack.Cost = 200
			Snack.Info = '''Not designed to hold syrup... Heals 150 HEART.'''
		11:
			Snack.Name = '''PIZZA SLICE'''
			Snack.Hp = 175
			Snack.Mp = 0
			Snack.Cost = 250
			Snack.Info = '''1/8th of a WHOLE PIZZA. Heals 175 HEART.'''
		12:
			Snack.Name = '''FISH TACO'''
			Snack.Hp = 200
			Snack.Mp = 0
			Snack.Cost = 250
			Snack.Info = '''Aquatic taco. Heals 200 HEART.'''
		13:
			Snack.Name = '''CHEESEBURGER'''
			Snack.Hp = 250
			Snack.Mp = 0
			Snack.Cost = 300
			Snack.Info = '''Contains all food groups, so it's healthy! Heals 250 HEART.'''
		14:
			Snack.Name = '''CHOCOLATE'''
			Snack.Hp = 40
			Snack.Mp = 0
			Snack.Cost = 50
			Snack.Type = 'perc'
			Snack.Info = '''Chocolate!? Oh, it's baking chocolate... Heals 40% of HEART.'''
		15:
			Snack.Name = '''DONUT'''
			Snack.Hp = 60
			Snack.Mp = 0
			Snack.Cost = 150
			Snack.Type = 'perc'
			Snack.Info = '''Circular bread with a hole in it. Heals 60% of HEART.'''
		16:
			Snack.Name = '''RAMEN'''
			Snack.Hp = 80
			Snack.Mp = 0
			Snack.Cost = 300
			Snack.Type = 'perc'
			Snack.Info = '''Now that is a lot of sodium! Heals 80% of HEART.'''
		17:
			Snack.Name = '''SPAGHETTI'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 500
			Snack.Type = 'perc'
			Snack.Info = '''Wet noodles slathered with chunky sauce. Fully heals a friend's HEART.'''
		18:
			Snack.Name = '''POPCORN'''
			Snack.Hp = 35
			Snack.Mp = 0
			Snack.Cost = 150
			Snack.Target = 'AllPlayers'
			Snack.Info = '''9/10 dentists hate it. Heals 35 HEART to all friends.'''
		19:
			Snack.Name = '''FRIES'''
			Snack.Hp = 60
			Snack.Mp = 0
			Snack.Cost = 200
			Snack.Target = 'AllPlayers'
			Snack.Info = '''From France, wherever that is...Heals 60 HEART to all friends.'''
		20:
			Snack.Name = '''CHEESE WHEEL'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 250
			Snack.Target = 'AllPlayers'
			Snack.Info = '''Delicious, yet functional. Heals 100 HEART to all friends.'''
		21:
			Snack.Name = '''WHOLE CHICKEN'''
			Snack.Hp = 175
			Snack.Mp = 0
			Snack.Cost = 500
			Snack.Target = 'AllPlayers'
			Snack.Info = '''An entire chicken, wings and all. Heals 175 HEART to all friends.'''
		22:
			Snack.Name = '''WHOLE PIZZA'''
			Snack.Hp = 250
			Snack.Mp = 0
			Snack.Cost = 500
			Snack.Target = 'AllPlayers'
			Snack.Info = '''8/8ths of a WHOLE PIZZA. Heals 250 HEART to all friends.'''
		23:
			Snack.Name = '''SNO-CONE'''
			Snack.Hp = 100
			Snack.Mp = 100
			Snack.Cost = 5000
			Snack.Type = 'perc'
			Snack.Info = '''Heals a friend's HEART and JUICE, and raises ALL STATS for the battle.''' #Special TODO
		24:
			Snack.Name = '''TOMATO'''
			Snack.Hp = 100
			Snack.Mp = 50
			Snack.Cost = 250
			Snack.Info = '''You say tomato, I say tomato. Heals 100 HEART and 50 JUICE.'''
		25:
			Snack.Name = '''COMBO MEAL'''
			Snack.Hp = 250
			Snack.Mp = 100
			Snack.Cost = 600
			Snack.Info = '''What more could you ask for? Heals 250 HEART and 100 JUICE.'''
		26:
			Snack.Name = '''DINO CLUMPS'''
			Snack.Hp = 250
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Target = 'AllPlayers'
			Snack.Info = '''Chicken nuggets shaped like dinosaurs. Heals 250 HEART to all friends.'''
		27:
			Snack.Name = '''DINO PASTA'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Type = 'perc'
			Snack.Info = '''Pasta shaped like dinosaurs. Fully restores a friend's HEART.'''
		28:
			Snack.Name = '''MARI'S COOKIE'''
			Snack.Hp = 0
			Snack.Mp = 0
			Snack.Cost = 0	
			Snack.Info = '''Everyone's favorite cookie. Made with MARI's love.'''
		29:
			Snack.Name = '''PLUM JUICE'''
			Snack.Hp = 0
			Snack.Mp = 15
			Snack.Cost = 5
			Snack.Info = '''For seniors. Wait, that's PRUNE JUICE. Heals 15 JUICE.'''
		30:
			Snack.Name = '''APPLE JUICE'''
			Snack.Hp = 0
			Snack.Mp = 25
			Snack.Cost = 20
			Snack.Info = '''Apparently better than ORANGE JUICE. Heals 25 JUICE.'''
		31:
			Snack.Name = '''CHERRY SODA'''
			Snack.Hp = 0
			Snack.Mp = 25
			Snack.Cost = 70
			Snack.Type = 'perc'
			Snack.Info = '''Carbonated hell sludge. Heals 25% of JUICE.'''
		32:
			Snack.Name = '''STAR FRUIT SODA'''
			Snack.Hp = 0
			Snack.Mp = 35
			Snack.Cost = 70
			Snack.Type = 'perc'
			Snack.Info = '''To be shared with a friend. Heals 35% of JUICE.'''
		33:
			Snack.Name = '''BREADFRUIT JUICE'''
			Snack.Hp = 0
			Snack.Mp = 50
			Snack.Cost = 100
			Snack.Info = '''Does not taste like bread. Heals 50 JUICE.'''
		34:
			Snack.Name = '''TASTY SODA'''
			Snack.Hp = 0
			Snack.Mp = 50
			Snack.Cost = 150
			Snack.Type = 'perc'
			Snack.Info = '''Tasty soda for thirsty people. Heals 50% of JUICE.'''
		35:
			Snack.Name = '''LEMONADE'''
			Snack.Hp = 0
			Snack.Mp = 75
			Snack.Cost = 150
			Snack.Info = '''When life gives you lemons, make this! Heals 75 JUICE.'''
		36:
			Snack.Name = '''PEACH SODA'''
			Snack.Hp = 0
			Snack.Mp = 60
			Snack.Cost = 180
			Snack.Type = 'perc'
			Snack.Info = '''A regular PEACH SODA. Heals 60% of JUICE.'''
		37:
			Snack.Name = '''BUTT PEACH SODA'''
			Snack.Hp = 0
			Snack.Mp = 61
			Snack.Cost = 360
			Snack.Type = 'perc'
			Snack.Info = '''An irregular PEACH SODA. Heals 61% of JUICE.'''
		38:
			Snack.Name = '''ORANGE JUICE'''
			Snack.Hp = 0
			Snack.Mp = 100
			Snack.Cost = 200
			Snack.Info = '''Apparently better than APPLE JUICE. Heals 100 JUICE.'''
		39:
			Snack.Name = '''PINEAPPLE JUICE'''
			Snack.Hp = 0
			Snack.Mp = 150
			Snack.Cost = 450
			Snack.Info = '''Painful... Why do you drink it? Heals 150 JUICE.'''
		40:
			Snack.Name = '''GRAPE SODA'''
			Snack.Hp = 0
			Snack.Mp = 80
			Snack.Cost = 500
			Snack.Type = 'perc'
			Snack.Info = '''Objectively the best soda. Heals 80% of JUICE.'''
		41:
			Snack.Name = '''BANANA SMOOTHIE'''
			Snack.Hp = 0
			Snack.Mp = 20
			Snack.Cost = 70
			Snack.Target = 'AllPlayers'
			Snack.Info = '''A little bland, but it does the job. Heals 20 JUICE to all friends.'''
		42:
			Snack.Name = '''MANGO SMOOTHIE'''
			Snack.Hp = 0
			Snack.Mp = 40
			Snack.Cost = 200
			Snack.Target = 'AllPlayers'
			Snack.Info = '''Makes you tango! Heals 40 JUICE to all friends.'''
		43:
			Snack.Name = '''BERRY SMOOTHIE'''
			Snack.Hp = 0
			Snack.Mp = 60
			Snack.Cost = 250
			Snack.Target = 'AllPlayers'
			Snack.Info = '''A healthy smoothie that tastes like dirt. Heals 60 JUICE to all friends.'''
		44:
			Snack.Name = '''MELON SMOOTHIE'''
			Snack.Hp = 0
			Snack.Mp = 80
			Snack.Cost = 350
			Snack.Target = 'AllPlayers'
			Snack.Info = '''Chunky green melon goodness. Heals 80 JUICE to all friends.'''
		45:
			Snack.Name = '''S.BERRY SMOOTHIE'''
			Snack.Hp = 0
			Snack.Mp = 100
			Snack.Cost = 500
			Snack.Target = 'AllPlayers'
			Snack.Info = '''The default smoothie. Heals 100 JUICE to all friends.'''
		46:
			Snack.Name = '''WATERMELON JUICE'''
			Snack.Hp = 0
			Snack.Mp = 100
			Snack.Cost = 1000
			Snack.Type = 'perc'
			Snack.Info = '''Heavenly nectar. Fully heals a friend's JUICE.'''
		47:
			Snack.Name = '''DINO MELON SODA'''
			Snack.Hp = 0
			Snack.Mp = 100
			Snack.Cost = 0
			Snack.Type = 'perc'
			Snack.Info = '''Melon soda in a dino-shaped bottle. Fully heals a friend's JUICE.'''
		48:
			Snack.Name = '''DINO SMOOTHIE'''
			Snack.Hp = 0
			Snack.Mp = 150
			Snack.Cost = 0
			Snack.Target = 'AllPlayers'
			Snack.Info = '''Berry smoothie in a dino-shaped cup. Heals 150 JUICE to all friends.'''
		49:
			Snack.Name = '''BOTTLED WATER'''
			Snack.Hp = 0
			Snack.Mp = 100
			Snack.Cost = 0	
			Snack.Info = '''Water in a bottle. Heals 100 JUICE.'''
		50:
			Snack.Name = '''FRUIT JUICE?'''
			Snack.Hp = 0
			Snack.Mp = 75
			Snack.Cost = 0
			Snack.Info = '''You are not sure what fruit it is. Heals 75 JUICE.'''
		51:
			Snack.Name = '''PRUNE JUICE'''
			Snack.Hp = -30	#-30% of current HP
			Snack.Mp = 30
			Snack.Cost = 0
			Snack.Type = 'percOnHp'
			Snack.Info = '''This tastes horrible. Don't drink it. Heals 30 JUICE... probably.'''
		52:
			Snack.Name = '''ROTTEN MILK'''
			Snack.Hp = -50	#-50% of current HP
			Snack.Mp = 10
			Snack.Cost = 2
			Snack.Type = 'percOnHp'
			Snack.Info = '''This is bad. Don't drink it. Heals 10 JUICE + ???''' #Special TODO
		53:
			Snack.Name = '''MILK'''
			Snack.Hp = 0
			Snack.Mp = 10
			Snack.Cost = 200
			Snack.Info = '''Good for your bones. Heals 10 JUICE and increases DEFENSE for the battle.''' #Special TODO
		54:
			Snack.Name = '''MUSH'''
			Snack.Hp = 0
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Info = '''Can't wait to be eaten! Makes a friend slightly stronger.''' #Special TODO
		55:
			Snack.Name = '''LIFE JAM'''
			Snack.Hp = 50
			Snack.Mp = 0
			Snack.Cost = 300
			Snack.Type = 'perc'
			Snack.Target = "ToastedPlayer"
			Snack.Info = '''Infused with the spirit of life. Revives a friend that is TOAST.''' #Special TODO
		56:
			Snack.Name = '''COFFEE'''
			Snack.Hp = 10	#10% of Max JUICE
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Type = 'percOnMP'
			Snack.Info = '''Bitter bean juice. Increases a friend's SPEED.''' #Special TODO
		57:
			Snack.Name = '''DINO JAM'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Type = 'perc'
			Snack.Target = "ToastedPlayer"
			Snack.Info = '''Infused with the spirit of dino life. Fully revives a friend that is TOAST.''' #Special TODO
		58:
			Snack.Name = '''JAM PACKETS'''
			Snack.Hp = 25
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Type = 'perc'
			Snack.Target = "AllToastedPlayers"
			Snack.Info = '''Infused with the spirit of life. Revives all friends that are TOAST.''' #Special TODO
		59:
			Snack.Name = '''MARI'S COOKIE'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Type = 'perc'
			Snack.Info = '''Your favorite cookie. Made with MARI's love.'''
		60:
			Snack.Name = '''(TOFU) ☐☐☐'''
			Snack.Hp = 50
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Info = '''☐☐☐☐☐☐☐☐☐ ☐☐☐ ☐☐☐'''
		61:
			Snack.Name = '''TOFU ☐☐ ☐☐'''
			Snack.Hp = 100
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Info = '''☐☐ ☐☐☐☐ ☐☐ ☐☐☐☐ ☐☐'''
		62:
			Snack.Name = '''TOFU 'KEY' INGREDIENT'''
			Snack.Hp = 0
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Info = ''''''
		63:
			Snack.Name = '''DONUT (REAL WORLD)'''
			Snack.Hp = 2
			Snack.Mp = 0
			Snack.Cost = 1
			'''Circular bread with a hole in it. "The DONUT had a soft fluffy texture and was very sugary."'''
		64:
			Snack.Name = '''CANDY (REAL WORLD)'''
			Snack.Hp = 1
			Snack.Mp = 0
			Snack.Cost = 1
			'''A child's favorite food. Sweet! "The CANDY had a chewy texture and fruity flavor."'''
		65:
			Snack.Name = '''SALAD'''
			Snack.Hp = 3
			Snack.Mp = 0
			Snack.Cost = 5
			Snack.Info = '''Grass in a bowl. "The SALAD tasted like grass."'''
		66:
			Snack.Name = '''BREAD (REAL WORLD)'''
			Snack.Hp = 3
			Snack.Mp = 0
			Snack.Cost = 2
			Snack.Info = '''A slice of bread. "The BREAD was fragrant and crispy... and kind of addicting?"'''
		67:
			Snack.Name = '''CHOCOLATE (REAL WORLD)'''
			Snack.Hp = 2
			Snack.Mp = 0
			Snack.Cost = 1
			Snack.Info = '''Chocolate!? Yes. Chocolate. "The CHOCOLATE was a bit creamy and a bit nutty. It melted in your mouth."'''
		68:
			Snack.Name = '''PIZZA SLICE (REAL WORLD)'''
			Snack.Hp = 5
			Snack.Mp = 0
			Snack.Cost = 5
			Snack.Info = '''1/8th of a WHOLE PIZZA. "The PIZZA SLICE was hot and covered in cheese. You wish you had more..."'''
		69:
			Snack.Name = '''HERO SANDWICH'''
			Snack.Hp = 5
			Snack.Mp = 0
			Snack.Cost = 5
			Snack.Info = '''HERO's favorite food. "The HERO SANDWICH boasted the perfect mix of meats and veggies. Wow..."'''
		70:
			Snack.Name = '''CARAMEL APPLE'''
			Snack.Hp = 5
			Snack.Mp = 0
			Snack.Cost = 5
			Snack.Info = '''Apples dipped in caramel. Half healthy. "The CARAMEL APPLE was sticky and sweet, yet crunchy and sour."'''
		71:
			Snack.Name = '''WHOLE PIZZA (REAL WORLD)'''
			Snack.Hp = 10
			Snack.Mp = 0
			Snack.Cost = 20
			Snack.Info = '''8/8ths of a WHOLE PIZZA. "The WHOLE PIZZA was hot and covered in cheese. This was the perfect amount."'''
		72:
			Snack.Name = '''PIE'''
			Snack.Hp = 10
			Snack.Mp = 0
			Snack.Cost = 15
			Snack.Info = '''Crust with stuffing. "The PIE's buttery crust perfectly complemented the fruity filling."'''
		73:
			Snack.Name = '''SLICE OF CAKE'''
			Snack.Hp = 15
			Snack.Mp = 0
			Snack.Cost = 30
			Snack.Info = '''A slice of celebratory frosted bread. "The SLICE OF CAKE was small and humble, but rich."'''
		74:
			Snack.Name = '''HAMBURGER'''
			Snack.Hp = 4
			Snack.Mp = 0
			Snack.Cost = 0
			Snack.Info = '''A CHEESEBURGER without the cheese. "The HAMBURGER's ingredients blended together flawlessly. All it was missing was the cheese."'''
		75:
			Snack.Name = '''TASTY SODA (REAL WORLD)'''
			Snack.Hp = 0
			Snack.Mp = 3
			Snack.Cost = 2
			Snack.Info = '''Tasty soda for thirsty people. "The TASTY SODA had a fizzy and nostalgic taste that flooded your mouth."'''
		76:
			Snack.Name = '''ORANGE JOE (SNACK)'''
			Snack.Hp = 0
			Snack.Mp = 3
			Snack.Cost = 2
			Snack.Info = '''KEL's favorite soda. Orange-flavored coffee. "The ORANGE JUICE and COFFEE combination created a questionable flavor."'''
		77:
			Snack.Name = '''APPLE JUICE (REAL WORLD)'''
			Snack.Hp = 0
			Snack.Mp = 5
			Snack.Cost = 2
			Snack.Info = '''Apparently better than ORANGE JUICE. "The APPLE JUICE was truly made from the ripest of apples."'''
		78:
			Snack.Name = '''ORANGE JUICE (REAL WORLD)'''
			Snack.Hp = 0
			Snack.Mp = 5
			Snack.Cost = 2
			Snack.Info = '''Apparently better than APPLE JUICE. "The ORANGE JUICE was truly made from the freshest of oranges."'''
		79:
			Snack.Name = '''COFFEE (REAL WORLD)'''
			Snack.Hp = 0
			Snack.Mp = 1
			Snack.Cost = 0
			Snack.Info = '''Bitter bean juice. "The COFFEE was hot and bitter, as expected. You don't know why people drink this."'''
	return Snack
