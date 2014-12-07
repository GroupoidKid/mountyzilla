/*******************************************************************************
*  This file is part of Mountyzilla.                                           *
*                                                                              *
*  Mountyzilla is free software; you can redistribute it and/or modify         *
*  it under the terms of the GNU General Public License as published by        *
*  the Free Software Foundation; either version 2 of the License, or           *
*  (at your option) any later version.                                         *
*                                                                              *
*  Mountyzilla is distributed in the hope that it will be useful,              *
*  but WITHOUT ANY WARRANTY; without even the implied warranty of              *
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               *
*  GNU General Public License for more details.                                *
*                                                                              *
*  You should have received a copy of the GNU General Public License           *
*  along with Mountyzilla; if not, write to the Free Software                  *
*  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA  *
*******************************************************************************/

/* TODO
 * /!\ bug latent sur diminution bonusPV (perte Telaite / template Ours),
 * pr�voir fix ("delete infos")
 */

/*--------------------------- Variables Globales -----------------------------*/

// Infos remplies par des scripts ext�rieurs
var listeCDM = [], listeLevels = [];

var listeTags = [], listeTagsInfos = [],
	listeTagsGuilde = [], listeTagsInfosGuilde = [];

// Fen�tres d�pla�ables
var winCurr = null;
var offsetX, offsetY;
document.onmousemove = drag;

// Diplomatie
var Diplo = {
	Guilde: {},
	Troll: {},
	Monstre: {}
	// .mythiques: uniquement si option activ�e
};
var isDiploRaw = true; // = si la Diplo n'a pas encore �t� analys�e

// Infos de combat (& tags)
var popup;

// G�re l'affichage en cascade des popups de CdM
var nbCDM = 0;

var isCDMsRetrieved = false; // = si les CdM ont d�j� �t� DL

// Utilis� pour supprimer les monstres "engag�s"
var listeEngages = {};
var isEngagesComputed = false;
var cursorOnLink = false; // DEBUG: wtf ?

var needComputeEnchantement = MZ_getValue(numTroll+'.enchantement.liste')
	&& MZ_getValue(numTroll+'.enchantement.liste')!='';

// Checkboxes de filtrage
var checkBoxGG, checkBoxCompos, checkBoxBidouilles, checkBoxIntangibles,
	checkBoxDiplo, checkBoxTrou, checkBoxEM, checkBoxTresorsNonLibres,
	checkBoxTactique, checkBoxLevels, checkBoxGowaps, checkBoxEngages,
	comboBoxNiveauMin, comboBoxNiveauMax;


/*-[functions]-------------- Fonctions utilitaires ---------------------------*/
function getPortee(param) {
	return Math.ceil((Math.sqrt(19 + 8 * (param + 3)) - 7) / 2);
}

function savePosition() {
	var pos = getPosition();
	MZ_setValue(numTroll+'.position.X',pos[0]);
	MZ_setValue(numTroll+'.position.Y',pos[1]);
	MZ_setValue(numTroll+'.position.N',pos[2]);
}


/*-[functions]--- Fonctions de r�cup�ration de donn�es (DOM) -----------------*/
/* INFOS :
 * les champs-titres (table>tbody>tr>td>table>tbody>tr>td>a)
 * sont identifiables via leur Name
 * les tables-listings sont identifiables via l'ID du tr conteneur
 * (mh_vue_hidden_XXX, XXX=trolls, champis, etc)
 */

/* Acquisition & Stockage des donn�es  */
var node = document.getElementById('mh_vue_hidden_monstres');
var tr_monstres = node.getElementsByTagName('tr');
var nbMonstres = tr_monstres.length-1;
node = document.getElementById('mh_vue_hidden_trolls');
var tr_trolls = node.getElementsByTagName('tr');
var nbTrolls = tr_trolls.length-1;
node = document.getElementById('mh_vue_hidden_tresors');
var tr_tresors = node.getElementsByTagName('tr');
var nbTresors = tr_tresors.length-1;
node = document.getElementById('mh_vue_hidden_champignons');
var tr_champis = node.getElementsByTagName('tr');
var nbChampis = tr_champis.length-1;
node = document.getElementById('mh_vue_hidden_lieux');
var tr_lieux = node.getElementsByTagName('tr');
var nbLieux = tr_lieux.length-1;
/*---------------------------------- DEBUG -----------------------------------*/
var mainTabs = document.getElementsByClassName('mh_tdborder');
var x_monstres = tr_monstres;
var x_trolls = tr_trolls;
var x_tresors = tr_tresors;
var x_champis = tr_champis;
var x_lieux = tr_lieux;
/*-------------------------------- FIN DEBUG ---------------------------------*/

function getPositionStr(pos) {
	// � renommer. Grave.
	return pos[0]+';'+pos[1]+';'+pos[2];
}

/* [functions] R�cup donn�es Utilisateur */
function getPosition() {
	// DEBUG : et pourquoi c'est pas juste stock� en var globale... ?
	var pos = document.evaluate("//li/b/text()[contains(.,'X = ')]",
				document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nodeValue;
	var posx = pos.substring(pos.indexOf('=') + 2, pos.indexOf(','));
	pos = pos.substr(pos.indexOf(',') + 1);
	return new Array(posx, pos.substring(pos.indexOf('=') + 2, pos.indexOf(',')), pos.substr(pos.lastIndexOf('=') + 2));
}

function getPorteVue() {
	// Retourne [vueHpure, vueVpure, vueHlimit�e, vueVlimit�e]
	// DEBUG : et pourquoi c'est pas juste stock� en var globale... ?
	var array = [];
	var infoTab = document.getElementById('infoTab');
	var nodes = document.evaluate(
		".//li/b/text()[contains(.,'horizontalement') "
		+"or contains(.,'verticalement')]",
		infoTab, null, 7, null);
	if(nodes.snapshotLength!=4) {
		return null;
		}
	for(var i=0 ; i<4 ; i++) {
		array.push(parseInt(nodes.snapshotItem(i).nodeValue));
		}
	return array;
	}

function getVue() {
	// Retourne [vueHpure, vueVpure]
	var vues = getPorteVue();
	return [ vues[0], vues[1] ];
	}

/* [functions] R�cup donn�es monstres */
function getMonstreDistance(i) {
	return tr_monstres[i].firstChild.firstChild.nodeValue;
	}

function getMonstreID(i) {
	return tr_monstres[i].childNodes[1].firstChild.nodeValue;
	}

function getMonstreIDByTR(tr) {
	return tr.childNodes[1].firstChild.nodeValue;
	}

function getMonstreLevelNode(i) {
	return tr_monstres[i].childNodes[2];
	}

function getMonstreLevel(i) {
	if(!isCDMsRetrieved) return -1;
	var donneesMonstre = listeCDM[getMonstreID(i)];
	return donneesMonstre ? parseInt(donneesMonstre[0]) : -1;
	}

function getMonstreTdNom(i) {
	try {
		return tr_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
		}
	catch(e) {
		window.alert('[getMonstreTdNom] Impossible de trouver le monstre '+i);
		}
	}

function getMonstreNom(i) {
	try {
		return tr_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3]
			.firstChild.firstChild.nodeValue;
		}
	catch(e) {
		window.alert('[getMonstreNom] Impossible de trouver le monstre '+i);
		}
	}

function getMonstreNomByTR(tr) {
	return tr.childNodes[checkBoxLevels.checked ? 2 : 3]
		.firstChild.firstChild.nodeValue;
	}

function getMonstrePosition(i) {
	var tds = tr_monstres[i].childNodes;
	var c = checkBoxLevels.checked ? 0 : 1;
	return [ tds[3+c].firstChild.nodeValue,
			tds[4+c].firstChild.nodeValue,
			tds[5+c].firstChild.nodeValue ];
	}

function appendMonstres(txt) {
	for(var i=1; i<=nbMonstres ; i++)
		txt += getMonstreID(i)+';'+getMonstreNom(i)+';'+getPositionStr(getMonstrePosition(i))+'\n';
	return txt;
}

function getMonstres() {
	var vue = getVue();
	return appendMonstres(getPositionStr(getPosition()) + ";" + vue[0] + ";" + vue[1] + "\n");
}

/* [functions] R�cup donn�es Trolls */
function getTrollDistance(i) {
	return tr_trolls[i].firstChild.firstChild.nodeValue;
	}

function getTrollID(i) {
	return tr_trolls[i].childNodes[1].firstChild.nodeValue;
	}

function getTrollNomNode(i) {
	var isEnvoiOn =
		document.getElementById('btnEnvoi').parentNode.childNodes.length>1;
	return tr_trolls[i].childNodes[ isEnvoiOn ? 3 : 2 ];
	}

function getTrollGuildeID(i) {
	if(tr_trolls[i].childNodes[5].firstChild.childNodes.length>0) {
		var href = tr_trolls[i].childNodes[5].firstChild.getAttribute('href');
		return href.substring(href.indexOf('(')+1,href.indexOf(','));
		}
	return -1;
	}

function getTrollPosition(i) {
	var tds = tr_trolls[i].childNodes;
	var l = tds.length;
	return [
		tds[l-3].firstChild.nodeValue,
		tds[l-2].firstChild.nodeValue,
		tds[l-1].firstChild.nodeValue ];
	}

/* [functions] R�cup donn�es Tr�sors */
function getTresorDistance(i) {
	return tr_tresors[i].firstChild.firstChild.nodeValue;
}

function getTresorTdNom(i) {
	return tr_tresors[i].childNodes[2];
}

function getTresorNom(i) {
	// Utilisation de textContent pour r�gler le "bug de Pollux"
	return trim(tr_tresors[i].cells[2].textContent);
}

function getTresorPosition(i) {
	var tds = tr_tresors[i].childNodes;
	return [
		tds[3].firstChild.nodeValue,
		tds[4].firstChild.nodeValue,
		tds[5].firstChild.nodeValue
	];
}

/* [functions] R�cup donn�es Lieux */
function getLieuDistance(i) {
	return parseInt(tr_lieux[i].firstChild.firstChild.nodeValue);
}

function getLieuNom(i) { /* DEBUG - en test */
	return tr_lieux[i].childNodes[2].childNodes[1].textContent;
}

function appendLieux(txt) {
	for(var i = 1; i < nbLieux+1; i++) {
		var tds = x_lieux[i].childNodes;
		txt += tds[1].firstChild.nodeValue + ";" + getLieuNom(i) + ";" + tds[3].firstChild.nodeValue + ";"
				+ tds[4].firstChild.nodeValue + ";" + tds[5].firstChild.nodeValue + "\n";
	}
	return txt;
}

function getLieux() {
	var vue = getVue();
	return appendLieux(getPositionStr(getPosition()) + ";" + vue[0] + ";" + vue[1] + "\n");
}


/*-[functions]--------- Gestion Pr�f�rences Utilisateur ----------------------*/

function saveCheckBox(chkb, pref) {
	// Enregistre et retourne l'�tat d'une CheckBox
	var etat = chkb.checked;
	MZ_setValue(pref, etat ? 'true' : 'false' );
	return etat;
	}

function recallCheckBox(chkb, pref) {
	// Restitue l'�tat d'une CheckBox
	chkb.checked = (MZ_getValue(pref)=='true');
	}

function saveComboBox(cbb, pref) {
	// Enregistre et retourne l'�tat d'une ComboBox
	var etat = cbb.selectedIndex;
	MZ_setValue(pref, etat);
	return etat;
	}

function recallComboBox(cbb, pref) {
	// Restitue l'�tat d'une ComboBox
	var nb = MZ_getValue(pref);
	if(nb) cbb.value = nb;
	return nb;
	}

function synchroniseFiltres() {
	// R�cup�ration de toutes les options de la vue
	var numBool = recallComboBox(comboBoxNiveauMin,'NIVEAUMINMONSTRE');
	numBool = recallComboBox(comboBoxNiveauMax,'NIVEAUMAXMONSTRE') || numBool;
	if(numBool) {
		debutFiltrage('Monstres');
	}
	recallCheckBox(checkBoxGowaps,'NOGOWAP');
	recallCheckBox(checkBoxMythiques,'NOMYTH');
	recallCheckBox(checkBoxEngages,'NOENGAGE');
	recallCheckBox(checkBoxLevels,'NOLEVEL');
	recallCheckBox(checkBoxIntangibles,'NOINT');
	recallCheckBox(checkBoxGG,'NOGG');
	recallCheckBox(checkBoxCompos,'NOCOMP');
	recallCheckBox(checkBoxBidouilles,'NOBID');
	recallCheckBox(checkBoxDiplo,numTroll+'.diplo.off');
	recallCheckBox(checkBoxTrou,'NOTROU');
	recallCheckBox(checkBoxTresorsNonLibres,'NOTRESORSNONLIBRES');
	recallCheckBox(checkBoxTactique,'NOTACTIQUE');
	if(MZ_getValue('NOINFOEM')!='true')
		recallCheckBox(checkBoxEM,'NOEM');
}


/*-[functions]-------- Initialisation: Ajout des Boutons ---------------------*/

/* [functions] Menu Vue 2D */
// DEBUG: � refaire plus clairement en JSON
var vue2Ddata = {
	'Bricol\' Vue':
		['http://trolls.ratibus.net/mountyhall/vue_form.php', 'vue',
		getVueScript, ['mode','vue_SP_Vue2','screen_width',window.screen.width] ],
	'Vue du CCM':
		['http://clancentremonde.free.fr/Vue2/RecupVue.php', 'vue',
		getVueScript, ['id',numTroll+';'+getPositionStr(getPosition())] ],
	'Vue Gloumfs 2D' :
		['http://gloumf.free.fr/vue2d.php', 'vue_mountyzilla', getVueScript, [] ],
	'Vue Gloumfs 3D':
		['http://gloumf.free.fr/vue3d.php', 'vue_mountyzilla', getVueScript, [] ],
	'Grouky Vue!':
		['http://ythogtha.org/MH/grouky.py/grouky', 'vue',
		getVueScript, ['type_vue', 'V5b1'] ]
};

function getVueScript() {
	try
	{
		txt = '#DEBUT TROLLS\n'+numTroll+';'+getPositionStr(getPosition())+'\n';
		for(var i=1; i <=nbTrolls ; i++) {
			txt += getTrollID(i)+';'+getPositionStr(getTrollPosition(i))+'\n';
			}
		txt = appendMonstres(txt+'#FIN TROLLS\n#DEBUT MONSTRES\n')+'#FIN MONSTRES\n#DEBUT TRESORS\n';
		for(var i=1 ; i<=nbTresors ; i++) {
			var tds = x_tresors[i].childNodes;
			txt += tds[1].firstChild.nodeValue+';'+getTresorNom(i)+';'+tds[3].firstChild.nodeValue+';'
				+tds[4].firstChild.nodeValue+';'+tds[5].firstChild.nodeValue+'\n';
			}
	    txt = appendLieux(txt+'#FIN TRESORS\n#DEBUT LIEUX\n')+'#FIN LIEUX\n#DEBUT CHAMPIGNONS\n';
	    for(var i=1 ; i <=nbChampis ; i++) {
			var tds = x_champis[i].childNodes;
			txt += ';'+tds[1].firstChild.nodeValue+';'+tds[2].firstChild.nodeValue+';'
				+tds[3].firstChild.nodeValue+';'+tds[4].firstChild.nodeValue+'\n';
			}
		return txt+'#FIN CHAMPIGNONS\n#DEBUT ORIGINE\n'+getVue()[0]+';'+getPositionStr(getPosition())+'\n#FIN ORIGINE\n';
	}
	catch(e) {window.alert(e)}
	}

function refresh2DViewButton() {
	// = EventListener menu+bouton vue 2D
	var vueext = document.getElementById('selectVue2D').value;
	MZ_setValue('VUEEXT',vueext);
	var form = document.getElementById('viewForm');
	form.innerHTML = '';
	form.method = 'post';
	form.action = vue2Ddata[vueext][0];
	form.target = '_blank';
	appendHidden(form, vue2Ddata[vueext][1], '');
	var listeParams = vue2Ddata[vueext][3];
	for(var i=0 ; i<listeParams.length ; i+=2) {
		appendHidden(form, listeParams[i], listeParams[i+1]);
	}
	appendSubmit(form, 'Voir',
		function() {
			document.getElementsByName(vue2Ddata[vueext][1])[0].value =
				vue2Ddata[vueext][2]();
		}
	);
}

function set2DViewSystem() {
	// = Initialiseur du syst�me de vue 2D
	var vueext = MZ_getValue('VUEEXT');
	if(!vueext || !vue2Ddata[vueext]) {
		// La vue Bricol'Trolls est employ�e par d�faut
		vueext = 'Bricol\' Vue';
	}
	
	/* Cr�ation du s�lecteur de vue */
	selectVue2D = document.createElement('select');
	selectVue2D.id = 'selectVue2D';
	selectVue2D.className = 'SelectboxV2';
	for(var view in vue2Ddata) {
		appendOption(selectVue2D, view, view);
	}
	selectVue2D.value = vueext;
	selectVue2D.onchange = refresh2DViewButton;
	
	/* Cr�ation du formulaire d'envoi (vide, le submit est g�r� via handler) */
	var form = document.createElement('form');
	form.id = 'viewForm';
	
	/* Insertion du syst�me de vue */
	var center = document.getElementById('titre2').nextSibling;
	var table = document.createElement('table');
	var tr = appendTr(table);
	var td = appendTd(tr);
	td.appendChild(selectVue2D);
	td = appendTd(tr);
	td.style.fontSize = '0px'; // g�re l'erreur de l'extra character
	td.appendChild(form);
	center.insertBefore(table,center.firstChild);
	insertBr(center.childNodes[1]);
	
	/* Appelle le handler pour initialiser le bouton de submit */
	refresh2DViewButton();
}

/* [functions] Tableau d'Infos */
function creerTableauInfos() {
	var infoTab = document.getElementsByName('LimitViewForm')[0].childNodes[1];
	infoTab.id = 'infoTab';
	var thead = document.createElement('thead');
	var tr = appendTr(thead,'mh_tdtitre');
	var td = appendTdText(tr,'INFORMATIONS',true);
	td.colSpan = 3;
	td.onmouseover = function() {
		this.style.cursor = 'pointer';
		this.className = 'mh_tdpage';
	};
	td.onmouseout = function() {
		this.className = 'mh_tdtitre';
	};
	td.onclick = function() {
		toggleTableauInfos(false);
	};
	infoTab.childNodes[1].firstChild.childNodes[1].colSpan = 2;
	infoTab.replaceChild(thead,infoTab.firstChild);
	tr = appendTr(infoTab.childNodes[1],'mh_tdpage');
	td = appendTdText(tr,'EFFACER : ',true);
	td.align = 'center';
	td.className = 'mh_tdtitre';
	td.width = 100;
	td = appendTdCenter(tr,2);
	// DEBUG : � quoi servent les ids si on utilise des var globales ?
	checkBoxGG = appendCheckBoxSpan(
		td,'delgg',filtreTresors," Les GG'"
	).firstChild;
	checkBoxCompos = appendCheckBoxSpan(
		td,'delcomp',filtreTresors,' Les Compos'
	).firstChild;
	checkBoxBidouilles = appendCheckBoxSpan(
		td,'delbid',filtreTresors,' Les Bidouilles'
	).firstChild;
	checkBoxIntangibles = appendCheckBoxSpan(
		td,'delint',filtreTrolls,' Les Intangibles'
	).firstChild;
	checkBoxGowaps = appendCheckBoxSpan(
		td,'delgowap',filtreMonstres,' Les Gowaps'
	).firstChild;
	checkBoxEngages = appendCheckBoxSpan(
		td,'delengage',filtreMonstres,' Les Engag�s'
	).firstChild;
	checkBoxLevels = appendCheckBoxSpan(
		td,'delniveau',toggleLevelColumn,' Les Niveaux'
	).firstChild;
	checkBoxDiplo = appendCheckBoxSpan(
		td,'delDiplo',refreshDiplo,' La Diplomatie'
	).firstChild;
	checkBoxTrou = appendCheckBoxSpan(
		td,'deltrou',filtreLieux,' Les Trous'
	).firstChild;
	checkBoxMythiques = appendCheckBoxSpan(
		td,'delmyth',filtreMonstres,' Les Mythiques'
	).firstChild;
	if(MZ_getValue('NOINFOEM')!='true') {
		checkBoxEM = appendCheckBoxSpan(
			td,'delem',filtreMonstres,' Les Composants EM'
		).firstChild;
	}
	checkBoxTresorsNonLibres = appendCheckBoxSpan(
		td,'deltres',filtreTresors,' Les Tr�sors non libres'
	).firstChild;
	checkBoxTactique = appendCheckBoxSpan(
		td,'deltactique',updateTactique,' Les Infos tactiques'
	).firstChild;
	
	if(MZ_getValue('INFOPLIE')) {
		toggleTableauInfos(true);
	}
}

function toggleTableauInfos(firstRun) {
	if(cursorOnLink) { return; } // DEBUG: h�ritage Tilk, utilit� inconnue
	
	var infoTab = document.getElementById('infoTab');
	if(!firstRun) {
		MZ_setValue('INFOPLIE', !MZ_getValue('INFOPLIE') );
	}
	if(MZ_getValue('INFOPLIE')) {
		var vues = getPorteVue();
		var pos = getPosition();
		appendText(
			infoTab.firstChild.firstChild.firstChild,
			' => Position : X = '+pos[0]+', Y = '+pos[1]+', N = '+pos[2]
			+' --- Vue : '+vues[0]+'/'+vues[1]+' ('+vues[2]+'/'+vues[3]+')',
			true
		);
		infoTab.childNodes[1].style.display = 'none';
	}
	else {
		var titre = infoTab.firstChild.firstChild.firstChild.childNodes[1];
		titre.parentNode.removeChild(titre);
		infoTab.childNodes[1].style.display = '';
	}
}

/* [functions] Filtres */
function prepareFiltrage(ref,width) {
// = Initialise le filtre 'ref'
	var tdTitre = document.getElementsByName(ref.toLowerCase())[0].parentNode;
	if(width) { tdTitre.width = width; }
	// Ajout du tr de Filtrage (masqu�)
	var tbody = tdTitre.parentNode.parentNode;
	var tr = appendTr(tbody,'mh_tdpage');
	tr.style.display = 'none';
	tr.id = 'trFiltre'+ref;
	var td = appendTd(tr);
	td.colSpan = 5;
	// Ajout du bouton de gestion de Filtrage
	var tdBtn = insertTd(tdTitre.nextSibling);
	tdBtn.id = 'tdInsert'+ref;
	var btn = appendButton(tdBtn,'Filtrer');
	btn.id = 'btnFiltre'+ref;
	btn.onclick =	function() {
		debutFiltrage(ref)
	};
	return td;
}

function debutFiltrage(ref) {
	// = Handler de d�but de filtrage (filtre 'ref')
	document.getElementById('trFiltre'+ref).style.display = '';
	var btn = document.getElementById('btnFiltre'+ref);
	btn.value = 'Annuler Filtre';
	btn.onclick = function() {
		finFiltrage(ref);
	};
}

function finFiltrage(ref) {
// = Handler de fin de filtrage (filtre 'ref')
	/* On r�assigne le bouton 'Filtrer' */
	document.getElementById('trFiltre'+ref).style.display = 'none';
	var btn = document.getElementById('btnFiltre'+ref);
	btn.value = 'Filtrer';
	btn.onclick = function() {
		debutFiltrage(ref);
	};
	/* R�initialisation filtres */
	document.getElementById('str'+ref).value = '';
	switch(ref) {
		case 'Monstres':
			document.getElementById('nivMinMonstres').value = 0;
			document.getElementById('nivMaxMonstres').value = 0;
			break;
		case 'Trolls':
			document.getElementById('strGuildes').value = '';
	}
	/* Nettoyage (=lance le filtre) */
	// Ici this = MZ.global (!= window), permet d'acc�der aux fonctions MZ
	this['filtre'+ref]();
}

function ajoutFiltreStr(td,nomBouton,id,onClick) {
	var bouton = appendButton(td,nomBouton,onClick);
	appendText(td,'\u00a0');
	var textbox = appendTextbox(td,'text',id,15,30);
	textbox.onkeypress = function(event) {
		try {
			if(event.keyCode==13) {
				event.preventDefault();
				bouton.click();
			}
		}
		catch(e){
			window.alert(e)
		}
	};
}

function ajoutFiltreMenu(tr,id,onChange) {
	var select = document.createElement('select');
	select.id = id;
	select.onchange = onChange;
	appendOption(select,0,'Aucun');
	for(var i=1 ; i<=60 ; i++) {
		appendOption(select,i,i);
	}
	tr.appendChild(select);
	return select;
}

function ajoutDesFiltres() {
	/* Monstres */
	var td = prepareFiltrage('Monstres',120);
	ajoutFiltreStr(td,'Nom du monstre:','strMonstres',filtreMonstres);
	appendText(td,'\u00a0\u00a0\u00a0');
	appendText(td,'Niveau Min: ');
	comboBoxNiveauMin = ajoutFiltreMenu(td,'nivMinMonstres',filtreMonstres);
	appendText(td,'\u00a0');
	appendText(td,'Niveau Max: ');
	comboBoxNiveauMax = ajoutFiltreMenu(td,'nivMaxMonstres',filtreMonstres);
	/* Tr�lls */
	td = prepareFiltrage('Trolls',50);
	ajoutFiltreStr(td,'Nom du tr�ll:','strTrolls',filtreTrolls);
	appendText(td,'\u00a0\u00a0\u00a0');
	ajoutFiltreStr(td,'Nom de guilde:','strGuildes',filtreTrolls);
	/* Tr�sors */
	td = prepareFiltrage('Tresors',55);
	ajoutFiltreStr(td,'Nom du tr�sor:','strTresors',filtreTresors);
	/* Lieux */
	td = prepareFiltrage('Lieux',40);
	ajoutFiltreStr(td,'Nom du lieu:','strLieux',filtreLieux);
}

/* [functions] Boutons d'envoi d'infos aux bases */
function appendSendBouton(paren, url, id, func, text) {
	var myForm = document.createElement('form');
	myForm.method = 'post';
	myForm.align = 'right';
	myForm.action = url;
	myForm.name = 'frmvue';
	myForm.target = '_blank';
	appendHidden(myForm,id,'');
	appendSubmit(myForm,text,
		function() {
			document.getElementsByName(id)[0].value = func();
		}
	);
	paren.appendChild(myForm);
}

function putBoutonMonstres() {
	var td = document.getElementById('tdInsertMonstres');
	td = insertTd(td.nextSibling);
	td.style.fontSize = '0px';
	appendSendBouton(td,
		'http://mountyhall.clubs.resel.fr/script/v2/get_monstres.php',
		'listeMonstres', getMonstres,
		'Envoyer les monstres aux Teubreux');
	}

function putBoutonLieux() {
	var td = document.getElementById('tdInsertLieux');
	td = insertTd(td.nextSibling);
	td.style.fontSize = '0px';
	appendSendBouton(td,
		'http://mountyzilla.tilk.info/scripts/lieux.php',
		'listeLieux', getLieux,
		'Ajouter les lieux � la base MZ');
	}


/*-[functions]--------------- Fonctions Monstres -----------------------------*/

/* [functions] Affichage de la colonne des niveaux */
function insertLevelColumn() {
// D�clench� si bascule vers affichage des niveaux des mobs
	var td = insertTdText(getMonstreLevelNode(0),'Niveau',true);
	td.width = 25;
	for(var i=1 ; i<=nbMonstres ; i++) {
		td = insertTdText(getMonstreLevelNode(i), '-');
		td.onclick = function() {
			basculeCDM(
				getMonstreNomByTR(this.parentNode),
				getMonstreIDByTR(this.parentNode)
			);
		};
		td.onmouseover = function() {
			this.style.cursor = 'pointer';
			this.className = 'mh_tdtitre';
		};
		td.onmouseout = function() {
			if(this.parentNode.diploActive=='oui') {
				this.className = '';
			} else {
				this.className = 'mh_tdpage';
			}
		};
		td.style = 'font-weight:bold;text-align:center;';
		if(isCDMsRetrieved) {
			// Rappel des niveaux si m�moris�s
			td.innerHTML = listeLevels[i];
		}
	}
}

function toggleLevelColumn() {
// = Handler checkBox noLevel
	if(!saveCheckBox(checkBoxLevels,'NOLEVEL')) {
		insertLevelColumn();
		if(!isCDMsRetrieved) { retrieveCDMs(); }
	}
	else if(getMonstreLevelNode(0).textContent=='Niveau') {
		for(var i=0 ; i<=nbMonstres ; i++) {
			if(isCDMsRetrieved) {
				// M�morisation des niveaux pour rappel �ventuel
				listeLevels[i] = getMonstreLevelNode(i).innerHTML;
			}
			// Suppression du td Niveau
			tr_monstres[i].removeChild(getMonstreLevelNode(i));
		}
	}
}

/* [functions] Gestion de l'AFFICHAGE des CdMs */
function basculeCDM(nom,id) {
// = Bascule l'affichage des popups CdM
	if(listeCDM[id]) {
		if(!document.getElementById('popupCDM'+id)) {
			afficherCDM(nom, id);
		} else {
			cacherPopupCDM('popupCDM'+id);
		}
	}
	// DEBUG: pr�voir un "else" ou d�sactiver l'effet onmouseover si pas de CdM
}

function cacherPopupCDM(titre) {
	var popup = document.getElementById(titre);
	popup.parentNode.removeChild(popup);
}

/* DEBUG: Section � mettre � jour */
var selectionFunction;

function startDrag(evt) {
	winCurr = this.parentNode;
	evt = evt || window.event; // est-ce utile sous FF ? sous FF24+ ?
	offsetX = evt.pageX - parseInt( winCurr.style.left );
	offsetY = evt.pageY - parseInt( winCurr.style.top );
	selectionFunction = document.body.style.MozUserSelect;
	document.body.style.MozUserSelect = 'none';
	winCurr.style.MozUserSelect = 'none';
	return false;
}

function stopDrag(evt) {
	winCurr.style.MozUserSelect = selectionFunction;
	document.body.style.MozUserSelect = selectionFunction;
	winCurr = null;
}

function drag(evt) {
	if(winCurr==null) { return; }
	evt = evt || window.event;
	winCurr.style.left = (evt.pageX - offsetX)+'px';
	winCurr.style.top = (evt.pageY - offsetY)+'px';
	return false;
}
/* FIN DEBUG */

function afficherCDM(nom,id) {
// Cr�e la table de CdM du mob n� id
	var donneesMonstre = listeCDM[id];
	/* D�but cr�ation table */
	var table = createCDMTable(id,nom,donneesMonstre); // voir Libs
	table.id = 'popupCDM'+id;
	table.style =
		'position:fixed;'+
		'z-index:1;'+
		'top:'+(300+(30*nbCDM))%(30*Math.floor((window.innerHeight-400)/30))+'px;'+
		'left:'+(window.innerWidth-365)+'px;'+
		'width:300px;'+
		'height:200px;';
	/* Ajout du titre avec gestion Drag & Drop */
	var tr = table.firstChild;
	tr.style.cursor = 'move';
	tr.onmousedown = startDrag;
	tr.onmouseup = stopDrag;
	/* Ajout du bouton "Fermer" */
	tr = appendTr(table.childNodes[1], 'mh_tdtitre');
	tr.onmouseover = function() {
		this.style.cursor = 'pointer';
		this.className = 'mh_tdpage';
	};
	tr.onmouseout = function() {
		this.className = 'mh_tdtitre';
	};
	tr.idcdm = id;
	tr.onclick = function() {
		cacherPopupCDM('popupCDM'+this.idcdm);
		this.className = 'mh_tdtitre';
	};
	td = appendTdText(tr,'Fermer',true);
	td.colSpan = 2;
	td.style = 'text-align:center;';
	nbCDM++;
	/* Fin cr�ation table & Affichage */
	document.body.appendChild(table);
}

/* [functions] Gestion de l'AFFICHAGE des Infos de combat */
function initPopup() {
	popup = document.createElement('div');
	popup.id = 'popup';
	popup.className = 'mh_textbox';
	popup.style =
		'position: absolute;'+
		'border: 1px solid #000000;'+
		'visibility: hidden;'+
		'display: inline;'+
		'z-index: 3;'+
		'max-width: 400px;';
	document.body.appendChild(popup);
}

function showPopupTactique(evt) {
	var id = this.id;
	var nom = this.nom;
	var texte = getAnalyseTactique(id,nom);
	if(texte=='') { return; }
	popup.innerHTML = texte;
	popup.style.left = Math.min(evt.pageX+15,window.innerWidth-400)+'px';
	popup.style.top = (evt.pageY+15)+'px';
	popup.style.visibility = 'visible';
}

function hidePopup() {
	popup.style.visibility = 'hidden';
}

/* [functions] R�cup�ration / Computation des Infos Tactiques */
// TODO � revoir
function retireMarquage(nom) {
	var i = nom.indexOf(']');
	switch(i) {
		case -1:
		case nom.length-1:
			return nom;
		default:
			return nom.slice(0,i+1);
	}
}

function retrieveCDMs() {
// R�cup�re les CdM disponibles dans la BDD
// Lanc� uniquement sur toggleLevelColumn
	if(checkBoxLevels.checked) { return; }
	
	var str = '';
	var begin = 1; // num de d�but de lot si plusieurs lots de CdM (501+ CdM)
	var cdmMax = MZ_getValue(numTroll+'.MAXCDM');
	cdmMax = Math.min(nbMonstres, cdmMax ? cdmMax : 500);
	if(MZ_getValue('CDMID')==null) MZ_setValue('CDMID',1); // � quoi sert CDMID ??
	
	for(var i=1 ; i<=cdmMax ; i++) {
		var nomMonstre = retireMarquage(getMonstreNom(i,true));
		if(nomMonstre.indexOf(']') != -1)
			nomMonstre = nomMonstre.substring(0,nomMonstre.indexOf(']')+1);
		str += 'nom[]=' + escape(nomMonstre) + '$'
			+ (getMonstreDistance(i) <= 5 ? getMonstreID(i) : -getMonstreID(i)) + '&';
		
		if(i%500==0 || i==cdmMax) { // demandes de CdM par lots de 500 max
			var url = 'http://mountypedia.ratibus.net/mz/monstres_0.9_post_FF.php';
			
			FF_XMLHttpRequest({
				method: 'POST',
				url: url,
				headers : {
					'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml',
					'Content-type':'application/x-www-form-urlencoded'
				},
				data: 'begin='+begin+'&idcdm='+MZ_getValue('CDMID')+'&'+str,
				onload: function(responseDetails) {
					try
					{
						var texte = responseDetails.responseText;
						var lines = texte.split('\n');
						if(lines.length==0)
							return;
						var begin2,end2,index;
						for(var j=0;j<lines.length;j++) {
							var infos = lines[j].split(';');
							if(infos.length<4)
								continue;
							var idMonstre=infos[0];
							var isCDM = infos[1];
							index = parseInt(infos[2]);
							var level = infos[3];
							infos=infos.slice(3);
							if(begin2==null)
								begin2=index;
							end2=index;
							listeCDM[idMonstre] = infos;
							if(isCDM==1)
								x_monstres[index].childNodes[2].innerHTML='<i>'+level+'</i>';
							else
								x_monstres[index].childNodes[2].innerHTML=level;
							}
						computeMission(begin2,end2);
					}
					catch(e)
					{
						console.error(e+'\n'+url+'\n'+texte);
					}
					}
				});
			str = '';
			begin = i + 1;
			}
		}
	isCDMsRetrieved=true;
	}

function computeMission(begin,end) {
// pk begin/end ? --> parce qu'au chargement c'est RetrieveCdMs qui le lance
	computeVLC(begin,end);
	if(!begin) begin=1;
	if(!end) end=nbMonstres;
	var str = MZ_getValue(numTroll+'.MISSIONS');
	if(!str) { return; }
	
	var urlImg = MZimg+'mission.png';
	var infosMissions = JSON.parse(str);
	
	for(var i=end ; i>=begin ; i--) {
		var mess = '';
		for(var num in infosMissions) {
			var mobMission = false;
			switch(infosMissions[num].type) {
				case 'Race':
					var race = epure(infosMissions[num].race.toLowerCase());
					var nom = epure(getMonstreNom(i).toLowerCase());
					if(nom.indexOf(race)!=-1) {
						mobMission = true;
					}
					break;
				case 'Niveau':
					var donneesMonstre = listeCDM[getMonstreID(i)];
					if(donneesMonstre) {
						var nivMob = Number(donneesMonstre[0]);
						var	nivMimi = Number(infosMissions[num].niveau),
							mod = infosMissions[num].mod;
						if((!isNaN(mod) && Math.abs(nivMimi-nivMob)<=Number(mod))
							|| (isNaN(mod) && nivMob>=nivMimi)) {
							mobMission = true;
						}
					}
					break;
				case 'Famille':
					var donneesMonstre = listeCDM[getMonstreID(i)];
					if(donneesMonstre) {
						var familleMimi = epure(infosMissions[num].famille.toLowerCase());
						var familleMob = epure(donneesMonstre[1].toLowerCase());
						if(familleMob.indexOf(familleMimi)!=-1) {
							mobMission = true;
						}
					}
					break;
				case 'Pouvoir':
					var donneesMonstre = listeCDM[getMonstreID(i)];
					if(donneesMonstre) {
						var pvrMimi = epure(infosMission[2].toLowerCase());
						var pvrMob = epure(donneesMonstre[10].toLowerCase());
						if(pvrMob.indexOf(pvrMimi)!=-1) {
							mobMission = true;
						}
					}
			}
			if(mobMission) {
				mess += mess ? '\n\n' : '';
				mess += 'Mission '+num+' :\n'+infosMissions[num].libelle;
			}
		}
		if(mess) {
			var td = getMonstreTdNom(i);
			appendText(td,' ');
			td.appendChild(createImage(urlImg,mess));
		}
	}
}

function computeVLC(begin,end) {
// pk begin/end ? --> parce qu'au chargement c'est RetrieveCdMs qui le lance via computeMission
	computeTactique(begin,end);
	if(!begin) begin=1;
	if(!end) end=nbMonstres;
	var cache = getSortComp("Invisibilit�")>0 || getSortComp("Camouflage")>0;
	if(!cache)
		return false;
	var urlImg = "http://mountyzilla.tilk.info/scripts_0.9/images/oeil.png";
	for(var i = end; i >= begin;i--)
	{
		var id = getMonstreID(i);
		var donneesMonstre = listeCDM[id];
		if(donneesMonstre && donneesMonstre.length>12)
		{
			if(donneesMonstre[12]==1)
			{
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createImage(urlImg, "Voit le cach�"));
			}
		}
	}
}

function computeTactique(begin, end) {
// pk begin/end ? --> parce qu'au chargement c'est RetrieveCdMs qui le lance via computeVLC
	try {
		if(!begin) begin = 1;
		if(!end) end = nbMonstres;
		var noTactique = saveCheckBox(checkBoxTactique,'NOTACTIQUE');
		if(noTactique || !isProfilActif()) return;
		
		for(var j=end ; j>=begin ; j--) {
			var id = getMonstreID(j);
			var nom = getMonstreNom(j);
			var donneesMonstre = listeCDM[id];
			if(donneesMonstre && nom.indexOf('Gowap')==-1) {
				var td = getMonstreTdNom(j);
				appendText(td,' ');
				td.appendChild(
					createImageTactique(MZimg+'calc2.png', id, nom)
				);
			}
		}
	}
	catch(e) {
		window.alert('Erreur computeTactique mob num : '+j+' :\n'+e)
	}
	filtreMonstres();
}

function updateTactique() {
// = Handler checkBox noTactique
	var noTactique = saveCheckBox(checkBoxTactique,'NOTACTIQUE');
	if(!isCDMsRetrieved) return;
	
	if(noTactique) {
		for(var i=nbMonstres ; i>0 ; i--) {
			var tr = getMonstreTdNom(i);
			var img = document.evaluate("img[@src='"+MZimg+"calc2.png']",
				tr, null, 9, null).singleNodeValue;
			if(img) {
				img.parentNode.removeChild(img.previousSibling);
				img.parentNode.removeChild(img);
				}
			}
		}
	else
		computeTactique();
}

function computeChargeProjoMonstre()
{
	var urlImgCharge = "http://mountyzilla.tilk.info/scripts_0.9/images/Competences/charger.png";
	var urlImgProjo = "http://mountyzilla.tilk.info/scripts_0.9/images/Sorts/projectileMagique.png";
	var charger = getSortComp("Charger")!=0;
	var projo = getSortComp("Projectile Magique")!=0;
	var trolln = getPosition()[2];
	if(!charger && !projo)
	{
		return false;
	}
	var porteeCharge = -1;
	var porteeProjo = -1;
	if(charger)
	{
		var aux = Math.ceil(MZ_getValue(numTroll+".caracs.pv") / 10) + MZ_getValue(numTroll+".caracs.regeneration");
		porteeCharge = getPortee(aux);
	}
	if(projo)
	{
		porteeProjo = getPortee(MZ_getValue(numTroll+".caracs.vue.bm")+MZ_getValue(numTroll+".caracs.vue"));
	}
	
	var urlImg = "http://mountyzilla.tilk.info/scripts_0.9/images/oeil.png";
	for(var i = nbMonstres+1; --i >= 1;) 
	{
		var id = getMonstreID(i);
		var pos = getMonstrePosition(i);
		var dist = getMonstreDistance(i);
		if(dist>0 && pos[2] == trolln && dist<=porteeCharge)
		{
			var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgCharge, "Accessible en charge"));
		}
		if(pos[2] == trolln && dist<=porteeProjo)
		{
			var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgProjo, "Touchable avec un projectile magique"));
		}
	}
	return true;
}

function filtreMonstres() {
// = Handler universel pour les fonctions li�es aux monstres
	var urlImg = MZimg+'Competences/ecritureMagique.png',
		urlEnchantImg = MZimg+'images/enchant.png';
	
	/* V�rification/Sauvegarde de tout ce qu'il faudra traiter */
	var useCss = MZ_getValue(numTroll+'.USECSS')=='true';
	var noGowaps = saveCheckBox(checkBoxGowaps,'NOGOWAP'),
		noEngages = saveCheckBox(checkBoxEngages,'NOENGAGE'),
		nivMin = saveComboBox(comboBoxNiveauMin,'NIVEAUMINMONSTRE'),
		nivMax = saveComboBox(comboBoxNiveauMax,'NIVEAUMAXMONSTRE');
	// old/new : d�termine s'il faut ou non nettoyer les tr
	var oldNOEM = true, noEM = true;
	if(MZ_getValue('NOINFOEM')!='true') {
		noEM = saveCheckBox(checkBoxEM, 'NOEM');
	}
	// Filtrage par nom
	var strMonstre = document.getElementById('strMonstres').value.toLowerCase();
	// G�n�re la liste des mobs engag�s (si filtr�s)
	if(noEngages && !isEngagesComputed) {
		for(var i=nbTrolls ; i>0 ; i--) {
			var pos = getTrollPosition(i);
			if(!listeEngages[pos[0]]) { listeEngages[pos[0]]={}; }
			if(!listeEngages[pos[0]][pos[1]]) { listeEngages[pos[0]][pos[1]]={}; }
			listeEngages[pos[0]][pos[1]][pos[2]] = 1;
		}
		isEngagesComputed = true;
	}
	
	/*** FILTRAGE ***/
	/* � computer :
	 * - Projotable (posale suffit)
 	 * - Chargeable (posale suffit)
	 * - EM (nom suffit)
	 * - Enchant (nom suffit)
	 * - Mission (n�cessite CdM)
 	 * - mob VlC (n�cessite CdM)
	 * Sans computation :
	 * - Gowap ? engag� ?
	 */
	for(var i=nbMonstres ; i>0 ; i--) {
		var pos = getMonstrePosition(i);
		var nom = getMonstreNom(i).toLowerCase();
		if(noEM!=oldNOEM) {
			if(noEM) {
				// Si noEM passe de false � true, on nettoie les td "Nom"
				// DEBUG: Sauf que ce serait carr�ment mieux avec des id...
				var tr = getMonstreTdNom(i);
				while(tr.childNodes.length>1) {
					tr.removeChild(tr.childNodes[1]);
				}
			}
			else {
				var tr = getMonstreTdNom(i);
				var TypeMonstre=getEM(nom);
				if(TypeMonstre!='') {
					var infosCompo=compoMobEM(TypeMonstre);
					if(infosCompo.length>0) {
						tr.appendChild(document.createTextNode(' '));
						tr.appendChild(createImage(urlImg, infosCompo));
					}
				}
			}
		}
		if(needComputeEnchantement || (noEM!=oldNOEM && noEM)) {
			var texte = getInfoEnchantementFromMonstre(nom);
			if(texte!='') {
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				tr.appendChild(document.createTextNode(' '));
				tr.appendChild(createImage(urlEnchantImg, texte));
			}
		}
		
		tr_monstres[i].style.display =
			(noGowaps
				&& nom.indexOf('gowap apprivois�')!=-1
				&& getMonstreDistance(i)>1) ||
			(noEngages
				&& getMonstreDistance(i)!=0
				&& listeEngages[pos[0]]
				&& listeEngages[pos[0]][pos[1]]
				&& listeEngages[pos[0]][pos[1]][pos[2]]) ||
			(strMonstre!=''
				&& nom.indexOf(strMonstre)==-1) ||
			(nivMin>0
				&& getMonstreLevel(i)<nivMin
				&& getMonstreDistance(i)>1
				&& getMonstreDistance(i)!=-1 // wtf ?
				&& nom.toLowerCase().indexOf("kilamo")==-1) ||
			(nivMax>0
				&& getMonstreLevel(i)>nivMax
				&& getMonstreDistance(i)>1
				&& getMonstreDistance(i)!=-1
				&& nom.toLowerCase().indexOf("kilamo") == -1
			) ? 'none' : '';
	}
	
	if(MZ_getValue('NOINFOEM')!='true') {
		if(noEM != oldNOEM) {
			if(noEM) computeChargeProjoMonstre();
			if(noEM && isCDMsRetrieved) computeMission();
		}
		oldNOEM = noEM;
	}
	
	needComputeEnchantement = false;
}


/*-[functions]---------------- Fonctions Tr�lls ------------------------------*/

function filtreTrolls() {
	var noIntangibles = saveCheckBox(checkBoxIntangibles,'NOINT');
	var strTroll = document.getElementById('strTrolls').value.toLowerCase();
	var strGuilde = document.getElementById('strGuildes').value.toLowerCase();
	for(var i=1 ; i<=nbTrolls ; i++) {
		var tds = tr_trolls[i].childNodes;
		tr_trolls[i].style.display =
			(noIntangibles && tds[2].firstChild.className=='mh_trolls_0')
			|| (strTroll!=''
				&& getTrollNomNode(i).textContent.toLowerCase().indexOf(strTroll)==-1)
			|| (strGuilde!=''
				&& (!tds[5].firstChild.firstChild
					|| tds[5].textContent.toLowerCase().indexOf(strGuilde)==-1) )
			? 'none' : '';
	}
}

function computeChargeProjo()
{
	var urlImgCharge = "http://mountyzilla.tilk.info/scripts_0.9/images/Competences/charger.png";
	var urlImgProjo = "http://mountyzilla.tilk.info/scripts_0.9/images/Sorts/projectileMagique.png";

	var trolln = getPosition()[2];
	if(!computeChargeProjoMonstre()) return false;
	
	var charger = getSortComp("Charger")!=0;
	var projo = getSortComp("Projectile Magique")!=0;
	if(!charger && !projo)
	{
		return false;
	}
	var porteeCharge = -1;
	var porteeProjo = -1;
	if(charger)
	{
		var aux = Math.ceil(MZ_getValue(numTroll+".caracs.pv") / 10) + MZ_getValue(numTroll+".caracs.regeneration");
		porteeCharge = getPortee(aux);
	}
	if(projo)
	{
		porteeProjo = getPortee(MZ_getValue(numTroll+".caracs.vue.bm")+MZ_getValue(numTroll+".caracs.vue"));
	}
	for(var i = 1; i < nbTrolls+1; i++) 
	{
		var id = getTrollID(i);
		var pos = getTrollPosition(i);
		var dist = getTrollDistance(i);
		if(dist>0 && pos[2] == trolln && dist<=porteeCharge)
		{
			var tr = x_trolls[i].childNodes[2];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgCharge, "Accessible en charge"));
		}
		if(pos[2] == trolln && dist<=porteeProjo)
		{
			var tr = x_trolls[i].childNodes[2];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgProjo, "Touchable avec un projectile magique"));
		}

	}
}

/* [functions] Diplomatie */
function refreshDiplo() {
	MZ_setValue(numTroll+'.diplo.off',
		checkBoxDiplo.checked?'true':'false'
	);
	if(isDiploRaw) { computeDiplo(); }
	appliqueDiplo();
}

function computeDiplo() {
// On extrait les donn�es de couleur et on les stocke par id
// Ordre de pr�s�ance :
//  source Guilde < source Perso
//  guilde cible < troll cible
	
	/* Diplo de Guilde */
	var diploGuilde = MZ_getValue(numTroll+'.diplo.guilde') ?
		JSON.parse(MZ_getValue(numTroll+'.diplo.guilde')) : {};
	if(diploGuilde && diploGuilde.isOn=='true') {
		// Guilde perso
		if(diploGuilde.guilde) {
			Diplo.Guilde[diploGuilde.guilde.id] = {
				couleur: diploGuilde.guilde.couleur,
				titre: 'Ma Guilde'
			};
		}
		// Guildes/Trolls A/E
		for(var AE in {Amis:0,Ennemis:0}) {
			for(var i=0 ; i<5 ; i++) {
				if(diploGuilde[AE+i]) {
					for(var type in {Guilde:0,Troll:0}) {
						var liste = diploGuilde[AE+i][type].split(';');
						for(var j=liste.length-2 ; j>=0 ; j--) {
							Diplo[type][liste[j]] = {
								couleur: diploGuilde[AE+i].couleur,
								titre: diploGuilde[AE+i].titre
							};
						}
					}
				}
			}
		}
	}
	
	/* Diplo Perso */
	var diploPerso = MZ_getValue(numTroll+'.diplo.perso') ?
		JSON.parse(MZ_getValue(numTroll+'.diplo.perso')) : {};
	if(diploPerso && diploPerso.isOn=='true') {
		for(var type in {Guilde:0,Troll:0,Monstre:0}) {
			for(var id in diploPerso[type]) {
				Diplo[type][id] = diploPerso[type][id];
			}
		}
	}
	if(diploPerso.mythiques) {
		Diplo.mythiques = diploPerso.mythiques;
	}
	
	isDiploRaw = false;
}

function appliqueDiplo() {
	var aAppliquer = Diplo;
	if(checkBoxDiplo.checked) {
		// Pour retour � l'affichage basique sur d�sactivation de la diplo
		aAppliquer = {
			Guilde: {},
			Troll: {},
			Monstre: {}
		};
	}
	
	/* On applique "aAppliquer" */
	// Diplo Tr�lls
	for(var i=nbTrolls ; i>0 ; i--) {
		var idG = getTrollGuildeID(i);
		var idT = getTrollID(i);
		var tr = tr_trolls[i];
		if(aAppliquer.Troll[idT]) {
			tr.className = '';
			var descr = aAppliquer.Troll[idT].titre;
			if(descr) {
				getTrollNomNode(i).title = descr
			}
			tr.style.backgroundColor = aAppliquer.Troll[idT].couleur;
		} else if(aAppliquer.Guilde[idG]) {
			tr.className = '';
			var descr = aAppliquer.Guilde[idG].titre;
			if(descr) {
				getTrollNomNode(i).title = descr
			}
			tr.style.backgroundColor = aAppliquer.Guilde[idG].couleur;
		} else {
			tr.className = 'mh_tdpage';
			getTrollNomNode(i).title = '';
		}
	}
	
	// Diplo Monstres
	for(var i=nbMonstres ; i>0 ; i--) {
		var id = getMonstreID(i);
		var nom = getMonstreNom(i).toLowerCase();
		if(aAppliquer.Monstre[id]) {
			tr_monstres[i].className = '';
			tr_monstres[i].style.backgroundColor = aAppliquer.Monstre[id].couleur;
			tr_monstres[i].diploActive = 'oui';
			var descr = aAppliquer.Monstre[id].titre;
			if(descr) {
				getMonstreTdNom(i).title = descr;
			}
		} else if(aAppliquer.mythiques &&
			(nom.indexOf('liche')==0 ||
			nom.indexOf('hydre')==0 ||
			nom.indexOf('balrog')==0 ||
			nom.indexOf('beholder')==0)) {
			tr_monstres[i].className = '';
			tr_monstres[i].style.backgroundColor = aAppliquer.mythiques;
			tr_monstres[i].diploActive = 'oui';
			getMonstreTdNom(i).title = 'Monstre Mythique';
		} else {
			tr_monstres[i].className = 'mh_tdpage';
			tr_monstres[i].diploActive = '';
		}
	}
}

/* [functions] Bulle PX Trolls */
var bulle;

function initPXTroll() {
	bulle = document.createElement('div');
	bulle.id = 'bulle';
	bulle.className = 'mh_textbox';
	bulle.style =
		'position: absolute;'+
		'border: 1px solid #000000;'+
		'visibility: hidden;'+
		'display: inline;'+
		'z-index: 2;';
	document.body.appendChild(bulle);

	for(var i=nbTrolls ; i>0 ; i--) {
		var td_niv = tr_trolls[i].childNodes[3];
		td_niv.onmouseover = showPXTroll;
		td_niv.onmouseout = hidePXTroll;
	}
}

function showPXTroll(evt) {
	var lvl = this.firstChild.nodeValue;
	bulle.innerHTML = 'Niveau '+lvl+analysePXTroll(lvl);
	bulle.style.left = evt.pageX+15+'px';
	bulle.style.top = evt.pageY+'px';
	bulle.style.visibility = 'visible';
}

function hidePXTroll() {
	bulle.style.visibility = 'hidden';
}

/* [functions] Envoi PX / MP */
function putBoutonPXMP() {
// Bouton d'initialisation du mode Envoi
	var td = document.getElementById('tdInsertTrolls');
	td.width = 100;
	td = insertTd(td.nextSibling);
	td.style.verticalAlign = 'top';
	var bouton = appendButton(td,'Envoyer...',prepareEnvoi);
	bouton.id = 'btnEnvoi';
}

function prepareEnvoi() {
// = 1er Handler du bouton d'envoi
	
	/* Ajout de la colonne des CheckBoxes */
	var td = insertTdText(getTrollNomNode(0),'');
	td.width = 5;
	for(var i=nbTrolls ; i>0 ; i--) {
		td = insertTd(getTrollNomNode(i));
		appendCheckBox(td,'envoi'+i);
	}
	
	/* Ajout du radio de choix PX ou MP */
	var btnEnvoi = document.getElementById('btnEnvoi');
	if(!btnEnvoi) { return; }
	var tdEnvoi = btnEnvoi.parentNode;
	appendText(tdEnvoi,' ');
	var span = document.createElement('span');
	span.style.whiteSpace = 'nowrap';
	var radioElt = document.createElement('input');
	radioElt.type = 'radio';
	radioElt.name = 'envoiPXMP';
	radioElt.id = 'radioPX';
	span.appendChild(radioElt);
	appendText(span,' des PX ');
	radioElt = document.createElement('input');
	radioElt.type = 'radio';
	radioElt.name = 'envoiPXMP';
	radioElt.checked = true;
	span.appendChild(radioElt);
	appendText(span,' un MP');
	tdEnvoi.appendChild(span);
	
	/* Insertion du bouton Annuler */
	insertButton(btnEnvoi,'Annuler',annuleEnvoi);
	
	/* Modification de l'effet du bouton Envoi */
	document.getElementById('btnEnvoi').onclick = effectueEnvoi;
}

function annuleEnvoi() {
// = Handler bouton Annuler
	/* Nettoyage du td du bouton Envoi */
	var btnEnvoi = document.getElementById('btnEnvoi');
	var tdEnvoi = btnEnvoi.parentNode;
	while(tdEnvoi.firstChild) {
		tdEnvoi.removeChild(tdEnvoi.firstChild);
	}
	/* Retour � l'effet de base du bouton Envoi */
	btnEnvoi.onclick = prepareEnvoi;
	tdEnvoi.appendChild(btnEnvoi);
	/* Suppression CheckBoxes */
	for(var i=nbTrolls ; i>=0 ; i--) {
		var td = getTrollNomNode(i);
		td.parentNode.removeChild(td);
	}
}

function effectueEnvoi() {
// = 2e Handler du bouton d'envoi (charge un nouveau frame)
	var str='';
	for(var i=nbTrolls ; i>0 ; i--) {
		var chb = document.getElementById('envoi'+i);
		if(chb.checked)	{
			str += (str?',':'')+getTrollID(i);
		}
	}
	var PXchecked = document.getElementById('radioPX').checked;
	if(PXchecked) {
		window.open('Actions/Play_a_DonPX.php?cat=8&dest='+str,'Contenu');
	} else {
		window.open('../Messagerie/MH_Messagerie.php?cat=3&dest='+str,'Contenu');
	}
}

/*-[functions]---------------- Fonctions Tr�sors -----------------------------*/

function filtreTresors() {
// = EventListener ChB : gg, compos, bidouilles, non libres
	var noGG = saveCheckBox(checkBoxGG,'NOGG');
	var noCompos = saveCheckBox(checkBoxCompos,'NOCOMP');
	var noBidouilles = saveCheckBox(checkBoxBidouilles,'NOBID');
	var noEngages = saveCheckBox(checkBoxTresorsNonLibres,'NOTRESORSNONLIBRES');
	if(noEngages && !isEngagesComputed) {
		for(var i=nbTrolls ; i>0 ; i--) {
			var pos = getTrollPosition(i);
			if(!listeEngages[pos[2]]) listeEngages[pos[2]] = [];
			if(!listeEngages[pos[2]][pos[1]]) listeEngages[pos[2]][pos[1]] = [];
			listeEngages[pos[2]][pos[1]][pos[0]] = 1;
			}
		isEngagesComputed = true;
		}
	var strTresor = document.getElementById('strTresors').value.toLowerCase();
	for(var i=nbTresors ; i>0 ; i--) {
		var nom = getTresorNom(i);
		var pos = getTresorPosition(i);
		tr_tresors[i].style.display =
			(noGG	
				&& nom.indexOf('Gigots de Gob')!=-1) ||
			(noCompos	
				&& nom.indexOf('Composant')!=-1) ||
			(noEngages
				&& listeEngages[pos[2]]
				&& listeEngages[pos[2]][pos[1]]
				&& listeEngages[pos[2]][pos[1]][pos[0]]
				&& getTresorDistance(i)>0) ||
			(strTresor!=''
				&& nom.toLowerCase().indexOf(strTresor)==-1) ||
			(noBidouilles
				&& nom.indexOf('[Bidouille]')!=-1)
			? 'none' : '';
	}
}

function computeTelek() {
	if(getSortComp('T�l�kin�sie')==0) { return; }
	var urlImg = MZimg+'Sorts/telekinesie.png';
	var posN = getPosition()[2];
	for(var i=nbTresors ; i>0 ; i--) {
		var pos = getTresorPosition(i);
		if(pos[2]==posN) {
			var td = getTresorTdNom(i);
			appendText(td,' ');
			td.appendChild(
				createImage(urlImg,'Tr�sor transportable par T�l�kin�sie')
			);
		}
	}
}


/*-[functions]----------------- Fonctions Lieux ------------------------------*/

function filtreLieux() {
// = EventListener ChB trous
	var noTrou = saveCheckBox(checkBoxTrou,'NOTROU');
	var strLieu = document.getElementById('strLieux').value.toLowerCase();
	for(var i=nbLieux ; i>0 ; i--) {
		tr_lieux[i].style.display =
			(strLieu
				&& getLieuNom(i).toLowerCase().indexOf(strLieu)==-1)
			|| (noTrou
				&& getLieuNom(i).toLowerCase().indexOf("trou de m�t�orite")!=-1
				&& getLieuDistance(i)>1)
			? 'none' : '';
	}
}


/*-[functions]--------------- Syst�mes Tactiques -----------------------------*/

function putScriptExterne() {
	var infoit = MZ_getValue(numTroll+'.INFOSIT');
	if(!infoit || infoit=='') return;
	
	var nomit = infoit.slice(0,infoit.indexOf('$'));
	if(nomit=='bricol') {
		var data = infoit.split('$');
		try {
			appendNewScript('http://trolls.ratibus.net/'+data[1]
				+'/mz.php?login='+data[2]
				+'&password='+data[3]
				);
			}
		catch(e) { window.alert(erreurIT(e,it)); }
		}
	}

function erreurIT( chaine , it ) {
	if(it=='bricol')
		window.alert(
			"Erreur lors de la connection avec l'interface des Bricol'Trolls :\n"
			+chaine
			);
	MZ_removeValue(numTroll+'.INFOSIT');
	}

/* Le script de Ratibus renvoie :
 + infosTrolls = new Array();
 + infosTrolls[numdutroll] =
 new Array(PV,PVbase,date m�j: "le JJ/MM/AAAA � hh:mm:ss",date pDLA,PA dispos);
 + etc ...
 + putInfosTrolls();
 * 
 * Il est donc impossible d'afficher les invis d'une IT Bricol'Trolls.
 */

function corrigeBricolTrolls() {
	for(var i in infosTrolls) {
		var pv = infosTrolls[i][0];
		var pvmax = infosTrolls[i][1];
		var pvmem = MZ_getValue(i+'.caracs.pv.max');
		if(pvmem && pvmem>pvmax) {
			infosTrolls[i][1] = pvmem;
			pvmax = pvmem;
			}
		if(pv>pvmax) {
			var newpvmax = 5*Math.ceil(pv/5);
			MZ_setValue(i+'.caracs.pv.max',newpvmax);
			infosTrolls[i][1] = newpvmax;
			}
		}
	}

function putInfosTrolls() {
	// teste la pr�sence de tr�lls de l'IT
	var i=nbTrolls;
	while( i>0 && !infosTrolls[getTrollID(i)] ) i--;
	if(i==0) return;
	
	try
	{
	var td = insertTdText(tr_trolls[0].childNodes[6],'PA',true);
	td.width = 40;
	td = insertTdText(tr_trolls[0].childNodes[6],'PV',true);
	td.width = 105;
	
	corrigeBricolTrolls();
	
	for(i=nbTrolls ; i>0 ; i--) {
		var infos = infosTrolls[getTrollID(i)];
		if(infos) {
			/* PAs dispos */
			var span = document.createElement('span');
			span.title = infos[3];
			appendText(span, infos[4]+' PA' );
			insertTdElement(tr_trolls[i].childNodes[6], span);
			/* cadre barre PV */
			var tab = document.createElement('div');
			tab.width = 100;
			tab.style.background = '#FFFFFF';
			tab.style.width = 100;
			tab.style.border = 1;
			tab.height = 10;
			tab.title = infos[0]+'/'+infos[1]+' '+ infos[2];
			/* barre PV */
			var img = document.createElement('img');
			img.src = '../Images/Interface/milieu.gif';
			img.height = 10;
			img.width = Math.floor( (100*infos[0])/infos[1] );
			tab.appendChild(img);
			/* lien vers l'IT */
			var lien = document.createElement('a');
			var nomit = MZ_getValue(numTroll+'.INFOSIT').split('$')[1];
			lien.href = 'http://trolls.ratibus.net/'+nomit+'/index.php';
			lien.target = '_blank';
			lien.appendChild(tab);
			insertTdElement(tr_trolls[i].childNodes[6],lien);
			}
		else {
			insertTd(tr_trolls[i].childNodes[6]);
			insertTd(tr_trolls[i].childNodes[6]);
			}
		}
	}
	catch(e) {
		window.alert('Erreur troll='+i+'\n'+e+'\n'+tr_trolls[i].innerHTML);
		}
	}


/* [functions] Gros tas de fonctions � ranger */

// POPUP TAGS

function showPopup(evt) {
	var texte = this.getAttribute('texteinfo');
	popup.innerHTML = texte;
	popup.style.left = evt.pageX + 15 + 'px';
	popup.style.top = evt.pageY + 'px';
	popup.style.visibility = "visible";
}

function createPopupImage(url, text)
{
	var img = document.createElement('img');
	img.setAttribute('src',url);
	img.setAttribute('align','ABSMIDDLE');
	img.setAttribute("texteinfo",text);
	img.addEventListener("mouseover", showPopup,true);
	img.addEventListener("mouseout", hidePopup,true);
	return img;
}

function recomputeTypeTrolls()
{
	for(var i = 0; i < listeTags; i++) 
	{
		computeTypeTrolls(listeTags[i],listeTagsInfos[i]);
	}
	for(var i = 0; i < listeTagsGuilde; i++) 
	{
		computeTypeGuildes(listeTagsGuilde[i],listeTagsInfosGuilde[i]);
	}
}

function setAllTags(infoTrolls,infoGuildes)
{
	for(var i = 1; i < nbTrolls+1; i++) 
	{
		var infos = infoGuildes[getTrollGuildeID(i)];
		if(infos) 
		{
			var tr = document.evaluate("td/a[contains(@href,'EAV')]/..",
			x_trolls[i], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			for(var j=0;j<infos.length;j++)
			{
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createPopupImage(infos[j][0], infos[j][1]));
			}
		}
		infos = infoTrolls[getTrollID(i)];
		if(infos) 
		{
			var tr = document.evaluate("td/a[contains(@href,'EPV')]/..",
			x_trolls[i], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			for(var j=0;j<infos.length;j++)
			{
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createPopupImage(infos[j][0], infos[j][1]));
			}
		}
	}
}

function analyseTagFile(data)
{
	var icones = new Array();
	var descriptions = new Array();
	var infoTrolls = new Array();
	var infoGuildes = new Array();
	
	var lignes = data.split("\n");
	for(var i=0;i<lignes.length;i++)
	{
		try
		{
			var data = lignes[i].split(";");
			if(data.length<=1)
				continue;
			if(data[0]=="I")
			{
				icones.push(lignes[i].substring(lignes[i].indexOf(";")+1));
			}
			else if(data[0]=="D")
			{
				descriptions.push(bbcode(lignes[i].substring(lignes[i].indexOf(";")+1)));
			}
			else if(data[0]=="T")
			{
				if(data.length<=2)
				continue;
				var id = data[1]*1;
				var icone = icones[data[2]*1];
				var texte = "";
				for(var j=3;j<data.length;j++)
					texte+=descriptions[data[j]*1];
				var info = new Array(icone,texte);
				if(infoTrolls[id] == null)
					infoTrolls[id] = new Array();
				infoTrolls[id].push(info);
			}
			else if(data[0]=="G")
			{
				if(data.length<=2)
					continue;
				var id = data[1]*1;
				var icone = icones[data[2]*1];
				var texte = "";
				for(var j=3;j<data.length;j++)
					texte+=descriptions[data[j]*1];
				var info = new Array(icone,texte);
				if(infoGuildes[id] == null)
					infoGuildes[id] = new Array();
				infoGuildes[id].push(info);
			}
		}
		catch(e)
		{
			window.alert(e);
			break;
		}
	}
	if(infoGuildes.length!=0 || infoTrolls.length!=0)
		setAllTags(infoTrolls,infoGuildes);
}

function computeTag()
{
	try
	{
	if(MZ_getValue(numTroll+'.TAGSURL')==null || MZ_getValue(numTroll+'.TAGSURL')=='')
		return false;
	var tagsurl = MZ_getValue(numTroll+'.TAGSURL');
	var listeTagsURL = tagsurl.split("$");
	for(var i=0;i<listeTagsURL.length;i++)
	{
		if(listeTagsURL[i].toLowerCase().indexOf("http")==0)
		{
			//appendNewScript(listeTagsURL[i]);
			FF_XMLHttpRequest({
			    method: 'GET',
			    url: listeTagsURL[i],
			    headers: {
			        'User-agent': 'Mozilla/4.0 (compatible) Mountyzilla',
			        'Accept': 'application/xml,text/xml',
			    },
			    onload: function(responseDetails) {
					try
					{
						analyseTagFile(responseDetails.responseText);
					}
					catch(e)
					{
						window.alert(e);
					}
				}
			});
		}
	}
	}
	catch(e) {window.alert(e);}
}


/*                             Partie principale                              */

try {
	start_script(31);

	creerTableauInfos();
	ajoutDesFiltres();
	set2DViewSystem();
	putBoutonMonstres();
	putBoutonLieux();
	putBoutonPXMP();

	synchroniseFiltres();
	toggleLevelColumn();
	savePosition();
	
	refreshDiplo();
	
	//400 ms
	{
		var noGG = saveCheckBox(checkBoxGG, "NOGG");
		var noCompos = saveCheckBox(checkBoxCompos, "NOCOMP");
		var noBidouilles = saveCheckBox(checkBoxBidouilles, "NOBID");
		var noGowaps = saveCheckBox(checkBoxGowaps, "NOGOWAP");
		var noEngages = saveCheckBox(checkBoxEngages, "NOENGAGE");
		var noTresorsEngages =
			saveCheckBox(checkBoxTresorsNonLibres, "NOTRESORSNONLIBRES");
		var noTrou = saveCheckBox(checkBoxTrou, "NOTROU");
		var noIntangibles = saveCheckBox(checkBoxIntangibles, "NOINT");
		filtreMonstres();
		if(noIntangibles) filtreTrolls();
		if(noGG || noCompos || noBidouilles || noTresorsEngages) filtreTresors();
		if(noTrou) filtreLieux();
	}
	initPopup(); // XXX Sert � la fois aux infos tactiques et aux tags XXX
	initPXTroll();
	computeTag();
	computeTelek();
	computeChargeProjo(); // TODO � d�composer
	putScriptExterne();

	displayScriptTime();
} catch(e) {
	console.error(e);
}
