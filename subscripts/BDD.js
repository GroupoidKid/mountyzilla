
const
// Conversion qualité => indice [EM, Mélange]
numQualite = {
	'Très Mauvaise':1,
	'Mauvaise':2,
	'Moyenne':3,
	'Bonne':4,
	'Très Bonne':5
},

// Conversion indice => qualité [EM, Mélange]
qualiteNum = {
	1: 'Très Mauvaise',
	2: 'Mauvaise',
	3: 'Moyenne',
	4: 'Bonne',
	5: 'Très Bonne'
},

// Niveau des monstres (sans template) [Mélange]
nival = {
	'Abishaii Bleu':19,
	'Abishaii Noir':10,
	'Abishaii Rouge':23,
	'Abishaii Vert':15,
	'Ame-en-peine':8,
	'Amibe Geante':9,
	'Anaconda des Catacombes':8,
	'Ankheg':10,
	'Anoploure Purpurin':36,
	'Araignee Geante':2,
	'Ashashin':35,
	'Balrog':50,
	'Banshee':16,
	'Barghest':36,
	'Basilisk':11,
	'Behemoth':34,
	'Behir':14,
	'Beholder':50,
	'Boggart':3,
	'Bondin':9,
	"Bouj'Dla Placide":37,
	"Bouj'Dla":19,
	'Bulette':19,
	'Caillouteux':1,
	'Capitan':35,
	'Carnosaure':25,
	'Champi-Glouton':3,
	'Chauve-Souris Geante':4,
	'Cheval a Dents de Sabre':23,
	'Chevalier du Chaos':20,
	'Chimere':13,
	'Chonchon':24,
	'Coccicruelle':22,
	'Cockatrice':5,
	'Crasc Medius':17,
	'Crasc Maexus':25,
	'Crasc':10,
	'Croquemitaine':6,
	'Cube Gelatineux':32,
	'Daemonite':27,
	'Diablotin':5,
	'Dindon du Chaos':1,
	'Djinn':29,
	'Ectoplasme':18,
	'Effrit':27,
	"Elementaire d'Air":23,
	"Elementaire d'Eau":17,
	'Elementaire de Feu':21,
	'Elementaire de Terre':21,
	'Elementaire du Chaos':26,
	'Erinyes':7,
	'Esprit-Follet':16,
	'Essaim Craterien':30,
	'Essaim Sanguinaire':25,
	'Ettin':8,
	'Familier':1,
	'Fantome':24,
	'Feu Follet':20,
	'Flagelleur Mental':33,
	'Foudroyeur':38,
	'Fumeux':22,
	'Fungus Geant':9,
	'Fungus Violet':4,
	'Furgolin':10,
	'Gargouille':3,
	'Geant de Pierre':13,
	'Geant des Gouffres':22,
	"Geck'oo Majestueux":40,
	"Geck'oo":15,
	'Glouton':20,
	'Gnoll':5,
	'Gnu Domestique':1,
	'Gnu Sauvage':1,
	'Goblin':4,
	'Goblours':4,
	"Golem d'Argile":15,
	'Golem de cuir':1,
	'Golem de Chair':8,
	'Golem de Fer':31,
	'Golem de mithril':1,
	'Golem de metal':1,
	'Golem de papier':1,
	'Golem de Pierre':23,
	'Gorgone':11,
	'Goule':4,
	'Gowap Apprivoise':1,
	'Gowap Sauvage':1,
	'Gremlins':3,
	'Gritche':39,
	'Grouilleux':4,
	'Grylle':31,
	'Harpie':4,
	'Hellrot':18,
	'Homme-Lezard':4,
	'Hurleur':8,
	'Hydre':50,
	'Incube':13,
	'Kobold':2,
	'Labeilleux':26,
	'Lezard Geant':5,
	'Liche':50,
	'Limace Geante':10,
	'Loup-Garou':8,
	'Lutin':4,
	'Mante Fulcreuse':30,
	'Manticore':9,
	'Marilith':33,
	'Meduse':6,
	'Megacephale':38,
	'Mille-Pattes Geant':14,
	'Mimique':6,
	'Minotaure':7,
	'Molosse Satanique':8,
	'Momie':4,
	'Monstre Rouilleur':3,
	"Mouch'oo Domestique":14,
	"Mouch'oo Majestueux Sauvage":33,
	"Mouch'oo Sauvage":14,
	'Na-Haniym-Heee':0,
	'Necrochore':37,
	'Necromant':39,
	'Necrophage':8,
	'Naga':10,
	'Nuee de Vermine':13,
	"Nuage d'Insectes":7,
	'Ogre':7,
	'Ombre de Roches':13,
	'Ombre':2,
	'Orque':3,
	'Ours-Garou':18,
	'Palefroi Infernal':29,
	'Phoenix':32,
	'Pititabeille':0,
	'Plante Carnivore':4,
	'Pseudo-Dragon':5,
	'Rat Geant':2,
	'Rat-Garou':3,
	'Rocketeux':5,
	'Sagouin':3,
	'Scarabee Geant':4,
	'Scorpion Geant':10,
	'Shai':28,
	'Sirene':8,
	'Slaad':5,
	'Sorciere':17,
	'Spectre':14,
	'Sphinx':30,
	'Squelette':1,
	'Strige':2,
	'Succube':13,
	'Tertre Errant':20,
	'Thri-kreen':10,
	'Tigre-Garou':12,
	'Titan':26,
	'Trancheur':35,
	'Tubercule Tueur':14,
	'Tutoki':4,
	'Vampire':29,
	'Ver Carnivore Geant':12,
	'Ver Carnivore':11,
	'Veskan Du Chaos':14,
	'Vouivre':33,
	'Worg':5,
	'Xorn':14,
	'Yeti':8,
	'Yuan-ti':15,
	'Zombie':2
},

// Liste des Compos EM avec données
tabEM = {
	//Monstre: [Compo exact, Sort, Position, Localisation]
	// AA
	'Basilisk':["Œil d'un ","Analyse Anatomique",3,"Tête"],
	// AE
	'Ankheg':["Carapace d'un","Armure Ethérée",3,"Spécial"],
	'Rocketeux':["Tripes d'un","Armure Ethérée",4,"Corps"],
	// AdA
	'Loup-Garou':["Bras d'un","Augmentation de l'Attaque",3,"Membre"],
	'Titan':["Griffe d'un","Augmentation de l'Attaque",4,"Membre"],
	// AdE
	'Erinyes':["Plume d'une","Augmentation de l'Esquive",3,"Membre"],
	'Palefroi Infernal':["Sabot d'un","Augmentation de l'Esquive",4,"Membre"],
	// AdD
	'Manticore':["Patte d'une","Augmentation des Dégâts",3,"Membre"],
	'Trancheur':["Griffe d'un","Augmentation des Dégâts",4,"Membre"],
	// BAM
	'Banshee':["Peau d'une","Bulle Anti-Magie",3,"Corps"],
	// BuM
	'Essaim Sanguinaire':["Pattes d'un","Bulle Magique",3,"Membre"],
	'Sagouin':["Patte d'un","Bulle Magique",4,"Membre"],
	'Effrit':["Cervelle d'un","Bulle Magique",5,"Tête"],
	// Explo
	'Diablotin':["Cœur d'un","Explosion",3,"Corps"],
	'Chimère':["Sang d'une","Explosion",4,"Corps"],
	'Barghest':["Bave d'un","Explosion",5,"Spécial"],
	// FP
	'Nécrophage':["Tête d'un","Faiblesse Passagère",3,"Tête"],
	'Vampire':["Canine d'un","Faiblesse Passagère",4,"Spécial"],
	// FA
	'Gorgone':["Chevelure d'une","Flash Aveuglant",3,"Tête"],
	'Géant des Gouffres':["Cervelle d'un","Flash Aveuglant",4,"Tête"],
	// Glue
	'Limace Géante':["Mucus d'une","Glue",3,"Spécial"],
	'Grylle':["Gueule d'un","Glue",4,"Tête"],
	// GdS
	'Abishaii Noir':["Serre d'un","Griffe du Sorcier",3,"Membre"],
	'Vouivre':["Venin d'une","Griffe du Sorcier",4,"Spécial"],
	'Araignée Géante':["Mandibule d'une","Griffe du Sorcier",5,"Spécial"],
	// Invi
	"Nuage d'Insectes":["Chitine d'un","Invisibilité",3,"Spécial"],
	'Yuan-ti':["Cervelle d'un","Invisibilité",4,"Tête"],
	'Gritche':["Epine d'un","Invisibilité",5,"Spécial"],
	// Lévitation
	// ???
	// PréM :
	'Ashashin':["Œil d'un ","Précision Magique",3,"Tête"],
	'Crasc':["Œil Rougeoyant d'un ","Précision Magique",4,"Tête"],
	// Proj
	'Yéti':["Jambe d'un","Projection",3,"Membre"],
	'Djinn':["Tête d'un","Projection",4,"Tête"],
	// PuM :
	'Incube':["Épaule musclée d'un","Puissance Magique",3,"Membre"],
	'Capitan':["Tripes Puantes d'un","Puissance Magique",4,"Corps"],
	// Sacro
	'Sorcière':["Verrue d'une","Sacrifice",3,"Spécial"],
	// Télék
	'Plante Carnivore':["Racine d'une","Télékinésie",3,"Spécial"],
	'Tertre Errant':["Cervelle d'un","Télékinésie",4,"Tête"],
	// TP
	'Boggart':["Main d'un","Téléportation",3,"Membre"],
	'Succube':["Téton Aguicheur d'une","Téléportation",4,"Corps"],
	'Nécrochore':["Os d'un","Téléportation",5,"Corps"],
	// VA
	'Abishaii Vert':["Œil d'un","Vision Accrue",3,"Tête"],
	// VL
	'Fungus Géant':["Spore d'un","Vision Lointaine",3,"Spécial"],
	'Abishaii Rouge':["Aile d'un","Vision Lointaine",4,"Membre"],
	// VlC
	'Zombie':["Cervelle Putréfiée d'un","Voir le Caché",3,"Tête"],
	'Shai':["Tripes d'un","Voir le Caché",4,"Corps"],
	'Phoenix':["Œil d'un","Voir le Caché",5,"Tête"],
	// VT
	'Naga':["Ecaille d'un","Vue Troublée",3,"Corps"],
	'Marilith':["Ecaille d'une","Vue Troublée",4,"Membre"],
	// Variables
	'Rat':["d'un"],
	'Rat Géant':["d'un"],
	'Dindon':["d'un"],
	'Goblin':["d'un"],
	'Limace':["d'une"],
	'Limace Géante':["d'une"],
	'Ver':["d'un"],
	'Ver Carnivore':["d'un"],
	'Ver Carnivore Géant':["d'un"],
	'Fungus':["d'un"],
	'Vouivre':["d'une"],
	'Gnu':["d'un"],
	'Scarabée':["d'un"]
},

// Champis EM avec Mundidey
mundiChampi = {
	'Préscientus Reguis':'du Phoenix',
	'Amanite Trolloïde':'de la Mouche',
	'Girolle Sanglante':'du Dindon',
	'Horreur Des Prés':'du Gobelin',
	'Bolet Péteur':'du Démon',
	'Pied Jaune':'de la Limace',
	'Agaric Sous-Terrain':'du Rat',
	'Suinte Cadavre':"de l'Hydre",
	'Cèpe Lumineux':'du Ver',
	'Fungus Rampant':'du Fungus',
	'Nez Noir':'de la Vouivre',
	'Pleurote Pleureuse':'du Gnu',
	'Phytomassus Xilénique':'du Scarabée'
},

// Liste des talents avec abbréviation MZ [stockage mémoire]
arrayTalents = {
	/* Compétences */
	'Acceleration du Metabolisme':'AM',
	'Attaque Precise':'AP',
	'Balayage':'Balayage',
	//'Balluchonnage':'Ballu',
	'Baroufle':'Baroufle',
	'Bidouille':'Bidouille',
	'Botte Secrete':'BS',
	'Camouflage':'Camou',
	'Charger':'Charger',
	'Connaissance des Monstres':'CdM',
	'Construire un Piege':'Piege',
	'Piege a Feu':'PiegeFeu',
	'Piege a Glue':'PiegeGlue',
	'Contre-Attaquer':'CA',
	'Coup de Butoir':'CdB',
	'Course':'Course',
	'Deplacement Eclair':'DE',
	'Dressage':'Dressage',
	'Ecriture Magique':'EM',
	'Frenesie':'Frenesie',
	'Golemologie':'Golemo',
	'Golem de cuir':'GolemCuir',
	'Golem de metal':'GolemMetal',
	'Golem de mithril':'GolemMithril',
	'Golem de papier':'GolemPapier',
	'Grattage':'Grattage',
	'Hurlement Effrayant':'HE',
	'Identification des Champignons':'IdC',
	'Insultes':'Insultes',
	'Lancer de Potions':'LdP',
	'Marquage':'Marquage',
	'Melange Magique':'Melange',
	'Miner':'Miner',
	'Travail de la pierre':'Pierre',
	'Necromancie':'Necro',
	'Painthure de Guerre':'PG',
	'Parer':'Parer',
	'Pistage':'Pistage',
	'Planter un Champignon':'PuC',
	'Regeneration Accrue':'RA',
	'Reparation':'Reparation',
	'Retraite':'Retraite',
	'Rotobaffe':'RB',
	'Shamaner':'Shamaner',
	"S'interposer":'SInterposer',
	'Tailler':'Tailler',
	//'Vol':'Vol',
	/* Sortilèges */
	'Analyse Anatomique':'AA',
	'Armure Etheree':'AE',
	'Augmentation de l´Attaque':'AdA',
	'Augmentation de l´Esquive':'AdE',
	'Augmentation des Degats':'AdD',
	'Bulle Anti-Magie':'BAM',
	'Bulle Magique':'BuM',
	'Explosion':'Explo',
	'Faiblesse Passagere':'FP',
	'Flash Aveuglant':'FA',
	'Glue':'Glue',
	'Griffe du Sorcier':'GdS',
	'Hypnotisme':'Hypno',
	'Identification des tresors':'IdT',
	'Invisibilite':'Invi',
	'Levitation':'Levitation',
	'Precision Magique':'PreM',
	'Projectile Magique':'Projo',
	'Projection':'Proj',
	'Puissance Magique':'PuM',
	'Rafale Psychique':'Rafale',
	'Sacrifice':'Sacro',
	'Siphon des ames':'Siphon',
	'Telekinesie':'Telek',
	'Teleportation':'TP',
	'Vampirisme':'Vampi',
	'Vision Accrue':'VA',
	'Vision lointaine':'VL',
	'Voir le Cache':'VlC',
	'Vue Troublee':'VT'
	//'':''
},

// liste du matos
// mh_caracs ['Nom'] = [ 'Type', 'AttP', 'AttM', 'DegP','DegM', 'Esq',
// 'ArmP','ArmM', 'Vue', 'Reg', 'RM_Min', 'RM_Max', 'MM_Min', 'MM_Max',
// 'PV', 'DLA', 'Poids_Min', 'Poids_Max' ];
mh_caracs = {
	'anneau de protection':
		['anneau',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.00,3.00,13.00],
	"armure d'anneaux":
		['armure',0,0,0,0,-8,8,0,0,0,90,180,0,0,0,0.00,80.00,80.00],
	'armure de bois':
		['armure',0,0,0,0,-3,5,0,0,0,20,50,0,0,0,0.00,50.00,50.00],
	'armure de cuir':
		['armure',0,0,0,0,0,2,0,0,0,10,20,0,0,0,0.00,10.00,10.00],
	'armure de peaux':
		['armure',0,0,0,0,-2,4,0,0,0,20,60,0,0,0,0.00,45.00,45.00],
	'armure de pierre':
		['armure',0,0,0,0,-6,12,0,0,0,60,150,0,0,0,0.00,120.00,120.00],
	'armure de plates':
		['armure',0,0,0,0,-5,10,0,0,0,50,100,0,0,0,0.00,100.00,100.00],
	'baton lesté':
		['arme',2,0,-1,0,0,0,0,0,0,0,0,0,0,0,0.00,7.50,7.50],
	'bâtons de parade':
		['arme',-4,0,0,0,2,2,0,0,0,0,0,0,0,0,0.00,7.50,7.50],
	'bottes':
		['bottes',0,0,0,0,2,0,0,0,0,0,0,0,0,0,0.00,5.00,5.00],
	'bouclier à pointes':
		['bouclier',1,0,1,0,-1,4,0,0,0,0,0,0,0,0,0.00,35.00,35.00],
	'boulet et chaîne':
		['arme',-3,0,5,0,0,0,0,0,0,0,0,0,0,0,0.00,15.00,15.00],
	'cagoule':
		['casque',0,0,0,0,1,0,0,-1,0,0,0,5,10,0,0.00,2.50,2.50],
	'casque à cornes':
		['casque',0,0,1,0,-1,3,0,-1,0,5,10,0,0,0,0.00,10.00,10.00],
	'casque à pointes':
		['casque',1,0,1,0,0,3,0,-1,0,0,0,0,0,0,0.00,12.50,12.50],
	'casque en cuir':
		['casque',0,0,0,0,0,1,0,0,0,5,10,0,0,0,0.00,5.00,5.00],
	'casque en métal':
		['casque',0,0,0,0,0,2,0,-1,0,5,10,0,0,0,0.00,10.00,10.00],
	'chaîne cloutée':
		['arme',-2,0,4,0,1,0,0,0,0,0,0,0,0,0,0.00,35.00,35.00],
	'chapeau pointu':
		['casque',0,0,0,0,0,1,0,0,0,0,0,5,10,0,0.00,5.00,5.00],
	'collier de dents':
		['talisman',0,0,1,0,0,0,0,0,0,0,0,0,0,0,5.00,1.00,1.00],
	'collier de pierre':
		['talisman',0,0,0,0,0,0,0,0,0,5,10,5,10,0,0.00,2.50,2.50],
	'collier à pointes':
		['talisman',0,0,1,0,-1,1,0,0,0,0,0,0,0,0,0.00,2.50,2.50],
	'cotte de mailles':
		['armure',0,0,0,0,-3,7,0,0,0,30,60,0,0,0,0.00,70.00,70.00],
	'couronne de cristal':
		['casque',0,0,0,1,-1,0,-1,3,0,0,0,0,0,0,0.00,10.00,10.00],
	"couronne d'obsidienne":
		['casque',0,0,0,-1,0,1,2,0,-1,0,0,0,0,0,0.00,10.00,10.00],
	"coutelas d'obsidienne":
		['arme',2,0,2,0,0,0,0,0,-2,-10,-5,-30,-15,0,0.00,5.00,5.00],
	'coutelas en os':
		['arme',0,0,1,0,0,0,0,0,0,0,0,0,0,0,0.00,4.00,4.00],
	'crochet':
		['arme',-2,0,3,0,0,0,0,0,0,0,0,0,0,0,0.00,12.50,12.50],
	'cuir bouilli':
		['armure',0,0,0,0,-1,3,0,0,0,20,40,0,0,0,0.00,18.00,18.00],
	"cuirasse d'ossements":
		['armure',0,0,0,0,-3,5,0,0,0,15,30,15,30,0,0.00,67.50,67.50],
	"cuirasse d'écailles":
		['armure',0,0,0,0,-3,6,0,0,0,30,70,0,0,0,0.00,60.00,60.00],
	'culotte en cuir':
		['armure',0,0,0,0,1,0,0,0,0,0,0,0,0,0,0.00,2.50,2.50],
	'dague':
		['arme',0,0,1,0,0,0,0,0,0,0,0,0,0,0,0.00,5.00,5.00],
	'epée courte':
		['arme',0,0,2,0,0,0,0,0,0,0,0,0,0,0,0.00,10.00,10.00],
	'epée longue':
		['arme',-2,0,4,0,0,0,0,0,0,0,0,0,0,0,0.00,20.00,20.00],
	'espadon':
		['arme',-6,0,8,0,0,0,0,0,0,0,0,0,0,0,0.00,40.00,40.00],
	'fouet':
		['arme',4,0,-2,0,0,0,0,0,0,0,0,0,0,0,0.00,7.00,7.00],
	'fourrures':
		['armure',0,0,0,0,0,2,0,0,0,15,30,0,0,0,0.00,10.00,10.00],
	'gantelet':
		['arme',-2,0,1,0,1,2,0,0,0,0,0,0,0,0,0.00,7.50,7.50],
	'gorgeron en cuir':
		['talisman',0,0,0,0,0,1,0,0,0,0,0,0,0,0,0.00,2.50,2.50],
	'gorgeron en métal':
		['talisman',0,0,0,0,0,2,0,0,-1,0,0,0,0,0,0.00,5.00,5.00],
	'gourdin':
		['arme',-1,0,2,0,0,0,0,0,0,0,0,0,0,0,0.00,12.50,12.50],
	'gourdin clouté':
		['arme',-1,0,3,0,0,0,0,0,0,0,0,0,0,0,0.00,15.00,15.00],
	'grimoire':
		['bouclier',-2,2,-1,1,0,0,0,0,0,0,0,5,10,0,10.00,25.00,25.00],
	"gros'porte":
		['bouclier',0,0,0,0,-1,5,0,0,0,10,20,0,0,0,0.00,50.00,50.00],
	'grosse racine':
		['arme',-1,0,3,0,0,0,0,0,0,5,10,0,0,0,0.00,20.00,20.00],
	'grosse stalagmite':
		['arme',-20,0,28,0,-15,0,0,-4,0,0,0,0,0,0,0.00,125.00,125.00],
	'hache de bataille':
		['arme',-4,0,6,0,0,0,0,0,0,0,0,0,0,0,0.00,40.00,40.00],
	'hache de guerre en os':
		['arme',-4,0,6,0,0,0,0,0,0,0,0,0,0,0,0.00,25.00,25.00],
	'hache de guerre en pierre':
		['arme',-10,0,14,0,0,0,0,0,0,5,10,0,0,0,0.00,75.00,75.00],
	"hache à deux mains d'obsidienne":
		['arme',-8,0,16,0,0,0,0,0,-4,-90,-50,-30,-15,0,0.00,75.00,75.00],
	'hallebarde':
		['arme',-10,0,12,0,0,0,0,0,0,0,0,0,0,0,0.00,60.00,60.00],
	"haubert d'écailles":
		['armure',0,0,0,0,-4,8,0,0,0,40,80,0,0,0,0.00,80.00,80.00],
	'haubert de mailles':
		['armure',0,0,0,0,-4,9,0,0,0,40,90,0,0,0,0.00,90.00,90.00],
	'heaume':
		['casque',-1,0,0,0,0,4,0,-2,0,10,20,0,0,0,0.00,20.00,20.00],
	'jambières en cuir':
		['bottes',0,0,0,0,0,1,0,0,0,5,10,0,0,0,0.00,10.00,10.00],
	'jambières en fourrure':
		['bottes',0,0,0,0,0,1,0,0,0,5,10,0,0,0,0.00,2.50,2.50],
	'jambières en maille':
		['bottes',0,0,0,0,-1,3,0,0,0,5,10,0,0,0,0.00,20.00,20.00],
	'jambières en métal':
		['bottes',0,0,0,0,-2,4,0,0,0,5,10,0,0,0,0.00,25.00,25.00],
	'jambières en os':
		['bottes',0,0,0,0,-1,2,0,0,0,5,10,0,0,0,0.00,10.00,10.00],
	"lame d'obsidienne":
		['arme',2,0,6,0,0,0,0,0,-3,-60,-30,-20,-10,0,0.00,20.00,20.00],
	'lame en os':
		['arme',0,0,2,0,0,0,0,0,0,0,0,0,0,0,0.00,7.00,7.00],
	'lame en pierre':
		['arme',-2,0,4,0,0,0,0,0,0,0,0,0,0,0,0.00,20.00,20.00],
	'lorgnons':
		['casque',0,0,0,0,-1,0,0,1,0,0,0,5,10,0,0.00,2.50,2.50],
	'machette':
		['arme',1,0,2,0,-1,0,0,0,0,0,0,0,0,0,0.00,20.00,20.00],
	"masse d'arme":
		['arme',-1,0,3,0,0,0,0,0,0,0,0,0,0,0,0.00,15.00,15.00],
	'pagne de mailles':
		['armure',0,0,0,0,2,1,0,0,0,0,0,0,0,0,0.00,7.50,7.50],
	'pagne en cuir':
		['armure',0,0,0,0,2,-1,0,0,0,0,0,0,0,0,0.00,5.00,5.00],
	'robe de mage':
		['armure',0,0,0,0,-1,2,1,0,0,10,20,10,20,0,0.00,20.00,20.00],
	'rondache en bois':
		['bouclier',0,0,0,0,1,1,0,0,0,0,0,0,0,0,0.00,15.00,15.00],
	'rondache en métal':
		['bouclier',0,0,0,0,1,2,0,0,0,0,0,0,0,0,0.00,30.00,30.00],
	'sandales':
		['bottes',0,0,0,0,1,0,0,0,0,0,0,0,0,0,0.00,2.50,2.50],
	'souliers dorés':
		['bottes',0,0,0,0,-1,1,1,0,0,0,0,0,0,0,0.00,10.00,10.00],
	"talisman d'obsidienne":
		['talisman',1,0,2,0,0,0,0,0,-4,20,40,20,40,0,0.00,2.50,2.50],
	'talisman de pierre':
		['talisman',0,0,0,0,0,0,0,0,-1,10,20,10,20,0,0.00,2.50,2.50],
	'targe':
		['bouclier',0,0,0,0,1,0,0,0,0,0,0,0,0,0,0.00,5.00,5.00],
	'torche':
		['arme',1,0,1,0,0,0,0,1,0,0,0,0,0,0,0.00,5.00,5.00],
	'torque de pierre':
		['talisman',0,0,0,0,0,0,0,0,-2,20,40,20,40,0,0.00,2.50,2.50],
	'tunique':
		['armure',0,0,0,0,1,0,0,0,0,5,10,5,10,0,0.00,2.50,2.50],
	"tunique d'écailles":
		['armure',0,0,0,0,-1,3,0,0,0,15,30,0,0,0,0.00,30.00,30.00],
	'turban':
		['casque',0,0,0,0,0,0,0,0,0,10,20,0,0,0,0.00,2.50,2.50]
},

// liste des templates
// mh_templates['Nom'] = [ 'AttP', 'AttM', 'DegP', 'DegM', 'Esq',
// 'ArmP', 'ArmM', 'Vue', 'Reg', 'RM_Min', 'RM_Max', 'MM_Min', 'MM_Max',
// 'PV', 'DLA', 'Poids_Min', 'Poids_Max');
mh_templates = {
	'de Feu':
		[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'de Résistance':
		[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
	"de l'Aigle":
		[0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	'de la Salamandre':
		[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
	'des Cyclopes':
		[0,1,0,1,0,0,0,-1,0,0,0,0,0,0,0,0,0],
	'des Enragés':
		[0,1,0,1,-1,0,0,0,0,0,0,0,0,0,0,0,0],
	'des Tortues':
		[0,0,0,0,0,0,2,0,0,0,0,0,0,0,30,0,0],
	'des Vampires':
		[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
	'du Glacier':
		[0,1,0,0,0,0,1,0,0,5,5,0,0,0,0,0,0],
	'du Rat':
		[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
	'du Roc':
		[0,0,0,0,-1,0,1,0,0,0,0,0,0,0,0,0,0],
	'du Temps':
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,-30,0,0],
	'du Vent':
		[0,0,0,-1,1,0,0,0,0,0,0,0,0,0,0,0,0],
	'en Mithril':
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'des Anciens':
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'des Champions':
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'des Duellistes':
		[0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'de la Terre':
		[0,0,0,0,0,0,0,0,2,0,0,0,0,5,30,0,0],
	"de l'Orage":
		[0,0,0,-1,2,0,0,0,0,0,0,0,0,0,0,0,0],
	"de l'Ours":
		[0,0,0,2,0,0,0,0,0,0,0,0,0,5,30,0,0],
	'des Béhémoths':
		[0,0,0,0,0,0,3,0,0,0,0,0,0,0,30,0,0],
	'des Mages':
		[0,0,0,0,0,0,0,0,0,5,5,5,5,0,0,0,0],
	'du Pic':
		[0,0,0,0,-1,0,2,0,0,0,0,0,0,0,0,0,0],
	'du Sable':
		[0,0,0,0,3,0,-1,-1,0,0,0,0,0,0,0,0,0],
	'acéré':
		[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'acérée':
		[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'équilibré':
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'équilibrée':
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	'léger':
		[0,0,0,0,1,-1,0,0,0,0,0,0,0,0,0,0,0],
	'légère':
		[0,0,0,0,1,-1,0,0,0,0,0,0,0,0,0,0,0],
	'renforcé':
		[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
	'renforcée':
		[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
	'robuste':
		[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]
};

