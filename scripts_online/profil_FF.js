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


/*---------------------------- Variables globales ----------------------------*/

var	
	// Structure g�n�rale des donn�es
	lignesProfil, lignesPV,
	tr_comps, tr_sorts,
	
	// Anatrolliseur
	urlAnatrolliseur,
	
	// Infobulles talents
	hauteur = 50, bulleStyle = null,
	
	// Caract�ristiques (ordre de la page)
		// pour setAccel()
	race,
		// utilis�e pour les moyennes MM/jour, kill/jour, etc
	NBjours,
		// calcul des DLA suivantes
	DLA, DLAsuiv, HeureServeur,
		// d�tails dur�e du tour (calcul pvdispo) :
	dtb, pdm, bmt,
		//posale
	posX, posY, posN,
		// caracs physiques
	vue, vuebm, vuetotale,
	pvbase, pvmax, pv, pvdispo,
	fatigue, bmfatigue,
	reg, regbm, regmoy,
	att, attbm, attbmm, attmoy,
	esq, esqbm, esqmoy,
	deg, degbm, degbmm, degmoy,
	arm, armbmp, armbmm, armmoy,
	rm, rmbm, mm, mmbm,
	
	// Modificateurs
	// DEBUG: revoir le fonctionnement de "nbattaques" (obsol�te) :
	//  |-> gestion (x3) : malusDAtt, malusDEsq, malusDArm
	//  |-> r�init. sur menu
	nbattaques, bmDDegM, bmDAttM,
	
	// Variables sp�ciales Kastars
	pva, minParPV, overDLA,
		// id pour �dition manuelle de lastDLA :
	inJour, inMois, inAn, inHr, inMin, inSec,
		// id pour auto-refresh lastDLA :
	lastDLAZone, maxAMZone, cumulZone,
	lastDLA, DLAaccel;


/*-[functions]----------------- Fonctions utiles -----------------------------*/

function resiste(Ddeg,bm) {
	// version naive mais compr�hensible ^^
	// DEBUG: � revoir
	if(!bm) {
		return 2*Math.floor(Ddeg/2);
	}
	return 2*Math.floor(Ddeg/2)+Math.round(bm/2);
}

function getPortee(param) {
	param = Math.max(0,Number(param));
	return Math.ceil( Math.sqrt( 2*param+10.75 )-3.5 );
	// �a devrait �tre floor, +10.25, -2.5
}

function retourAZero(fatig) {
	var fat = fatig, raz = 0;
	while(fat>0) {
		raz++;
		fat = Math.floor(fat/1.25);
	}
	return raz;
}

function decumulPumPrem(bonus) {
	switch(bonus) {
		case 20: return 33;
		case 33: return 41;
		case 41: return 46;
		case 46: return 49;
		case 49: return 51;
		default: return 20;
	}
}

function coefDecumul(i) {
	switch(i) {
		case 2: return 0.67;
		case 3: return 0.4;
		case 4: return 0.25;
		case 5: return 0.15;
		default: return 0.1;
	}
}

function dureeHM(dmin) {
	var ret = "";
	dmin = Math.floor(dmin);
	if(dmin>59) { ret = Math.floor(dmin/60)+"h"; }
	var mins = dmin%60;
	if(mins!=0) { ret += (ret) ? addZero(mins)+"min" : mins+"min"; }
	return (ret) ? ret : "-";
}


/*-[functions]------- Extraction / Sauvegarde des donn�es --------------------*/

function initAll() {
	var tablePrincipale, lignesCaracs, Nbrs={},
		lignes, paragraphes, str;
	
	// On recherche la table principale du profil et on en extrait les "lignes"
	tablePrincipale = document.evaluate(
		"//h2[@id='titre2']/following-sibling::table",
		document, null, 9, null
	).singleNodeValue;
	
	// ***INIT GLOBALE*** lignesProfil
	// On utilise un snapshot pour continuer � acc�der aux lignes dans l'ordre
	// original m�me si on en ajoute (e.g. fatigue des Kastars)
	lignesProfil = document.evaluate(
		"./tbody/tr",
		tablePrincipale, null, 7, null
	);
	
	// EXTRACTION DES DONNEES BRUTES
	lignes = lignesProfil.snapshotItem(1).cells[1].getElementsByTagName("p")[2].
		childNodes;
	// dtb = Dur�e Tour de Base, bmt = BM Temps, pdm = Poids Du Matos
	for(var i=lignes.length-1 ; i>=0 ; --i) {
		if(lignes[i].nodeType!=3) { continue; }
		str = trim(lignes[i].nodeValue);
		switch(str.slice(0,5)) {
			case "Dur�e": Nbrs["dtb"] = str; continue;
			case "Bonus": Nbrs["bmt"] = str; continue;
			case "Poids": Nbrs["pdm"] = str; continue;
		}
	}
	
	lignes = lignesProfil.snapshotItem(2).cells[1].childNodes;
	for(var i=lignes.length-1 ; i>=0 ; --i) {
		if(lignes[i].nodeType!=3) { continue; }
		str = trim(lignes[i].nodeValue);
		switch(str.slice(0,3)) {
			case "X =": Nbrs["pos"] = str; continue;
			case "Vue": Nbrs["vue"] = str; continue;
		}
	}

	Nbrs["niv"] = document.evaluate(
		"./text()[contains(.,'Niveau')]",
		lignesProfil.snapshotItem(3).cells[1],
		null, 9, null
	).singleNodeValue.nodeValue;
	
	// ***INIT GLOBALE*** lignesPV
	// Il y a 4 lignes :
	// 0) PV actuels+barre de PVs, 1) PV max, 2) vide, 3) fatigue
	lignesPV = lignesProfil.snapshotItem(4).cells[1].
		getElementsByTagName("table")[0].rows;
	Nbrs["pva"] = lignesPV[0].cells[0].textContent;
	Nbrs["pvm"] = lignesPV[1].cells[0].textContent;
	Nbrs["fat"] = document.evaluate(
		"./text()[contains(.,'atigue')]",
		lignesPV[3].cells[0],
		null, 9, null
	).singleNodeValue.nodeValue;
	
	lignesCaracs = lignesProfil.snapshotItem(5).cells[1].
		getElementsByTagName("table")[0].rows;
	for(var i=lignesCaracs.length-1 ; i>=0 ; --i) {
		str = trim(lignesCaracs[i].cells[0].textContent).slice(0,3).toLowerCase().
			replace(/�/,'e');
		Nbrs[str] = lignesCaracs[i].textContent;
	}
	
	lignes = lignesProfil.snapshotItem(9).cells[1].childNodes;
	for(var i=lignes.length-1 ; i>=0 ; --i) {
		if(lignes[i].nodeType!=3) { continue; }
		str = trim(lignes[i].nodeValue);
		switch(str.slice(0,3)) {
			case "R�s": Nbrs["rm"] = str; continue;
			case "Ma�": Nbrs["mm"] = str; continue;
		}
	}
	
	// TRAITEMENT DES DONNEES
	for(var key in Nbrs) {
		//window.console.debug(key,Nbrs[key]);
		Nbrs[key] = getNumbers(Nbrs[key]);
		//window.console.debug("traitement:",Nbrs[key]);
	}
	
	dtb = Nbrs["dtb"][0]*60+Nbrs["dtb"][1];
	// la ligne des bm de temps n'existe pas si bmt=0 :
	bmt = Nbrs["bmt"] ? Nbrs["bmt"][0]*60+Nbrs["bmt"][1] : 0;
	pdm = Nbrs["pdm"][0]*60+Nbrs["pdm"][1];
	
	posX = Nbrs["pos"][0];
	posY = Nbrs["pos"][1];
	posN = Nbrs["pos"][2];
	
	vue = Nbrs["vue"][0];
	vuebm = Nbrs["vue"][1];
	vuetotale = Math.max(0,vue+vuebm);
	
	nivTroll = Nbrs["niv"][0];
	
	pv = Nbrs["pva"][0];
	pvbase = Nbrs["pvm"][0];
	pvmax = pvbase;
	if(Nbrs["pvm"].length>1) {
		// s'il y a des BM de PV
		pvmax += Nbrs["pvm"][1];
	}
	
	fatigue = Nbrs["fat"][0];
	// bmfat = 0 si pas de BM fat
	bmfatigue = (Nbrs["fat"].length>1) ? Nbrs["fat"][1] : 0;
	
	// les Nbrs[...][1] contiennent les 3 ou les 6 de "D3" ou "D6"
	reg = Nbrs["reg"][0];
	regbm = Nbrs["reg"][2]+Nbrs["reg"][3];
	regmoy = 2*reg+regbm;
	appendTdText(lignesCaracs[0],"(moyenne : "+regmoy+")");
	regmoy = Math.max(0,regmoy);
	// Temps r�cup�r� par reg (propale R')
	str = "Temps moyen r�cup�r� par r�g�n�ration : "+
		Math.floor(250*regmoy/pvmax)+
		" min";
	var sec = Math.floor(15000*regmoy/pvmax)%60;
	if(sec!=0) { str += " "+sec+" sec"; }
	lignesCaracs[0].title = str;
	
	att = Nbrs["att"][0];
	attbmm = Nbrs["att"][3];
	attbm = Nbrs["att"][2]+attbmm;
	attmoy = 3.5*att+attbm;
	appendTdText(lignesCaracs[1],"(moyenne : "+attmoy+")");
	
	esq = Nbrs["esq"][0];
	esqbm = Nbrs["esq"][2]+Nbrs["esq"][3];
	esqmoy = 3.5*esq+esqbm;
	appendTdText(lignesCaracs[2],"(moyenne : "+esqmoy+")");
	
	deg = Nbrs["deg"][0];
	degbmm = Nbrs["deg"][3];
	degbm = Nbrs["deg"][2]+degbmm;
	degmoy = 2*deg+degbm;
	appendTdText(lignesCaracs[3],
		"(moyenne : "+degmoy+"/"+(2*Math.floor(1.5*deg)+degbm)+")"
	);
	
	rm = Nbrs["rm"][0];
	rmbm = Nbrs["rm"][1];
	rmTroll = rm+rmbm;
	mm = Nbrs["mm"][0];
	mmbm = Nbrs["mm"][1];
	mmTroll = mm+mmbm;
	
	arm = Nbrs["arm"][0];
	if(Nbrs["arm"].length>4) {
		// s'il y a des D d'armure non activ�s
		armbmp = Nbrs["arm"][4];
		armbmm = Nbrs["arm"][5];
	} else {
		armbmp = Nbrs["arm"][2];
		armbmm = Nbrs["arm"][3];
	}
	armmoy = 2*arm+armbmp+armbmm;
	appendTdText(lignesCaracs[4],"(moyenne : "+armmoy+")");
	
	// Race
	str = lignesProfil.snapshotItem(0).cells[1].innerHTML.split("<br>")[1];
	race = trim(str.slice(str.indexOf(":")+2));
	
	// PuM/Pr�M
	paragraphes = lignesProfil.snapshotItem(6).cells[1].getElementsByTagName("p");
	if(paragraphes.length>2) {
		lignes = paragraphes[1].childNodes;
		for(var i=lignes.length-1 ; i>=0 ; --i) {
			if(lignes[i].nodeType!=3) { continue; }
			str = lignes[i].nodeValue;
			if(str.indexOf("D�s d'attaque")!=-1) {
				bmDAttM = getNumbers(str)[0];
			} else if(str.indexOf("D�s de d�g�ts")!=-1) {
				bmDDegM = getNumbers(str)[0];
			}
		}
	}
	//window.console.debug("PuM/Pr�M",bmDAttM,bmDDegM);
	
	// setDLA()
	str = lignesProfil.snapshotItem(1).cells[1].getElementsByTagName("p")[0].
		getElementsByTagName("b")[0].textContent;
	DLA = new Date( StringToDate(str) );
	
	// setHeureServeur()
	try {
		str = document.evaluate(
			".//text()[contains(.,'Serveur')]",
			document.getElementById("footer2"),
			null, 9, null
		).singleNodeValue.nodeValue;
		str = str.slice(str.indexOf("/")-2,str.lastIndexOf(":")+3);
		HeureServeur = new Date( StringToDate(str) );
	} catch(e) {
		window.console.warn(
			"[MZ] Heure Serveur introuvable, utilisation de l'heure actuelle", e
		);
		HeureServeur = new Date();
	}
	
	// initAnatrolliseur()
	var amelio_dtb = function(dtb) {
		if(dtb>555) {
			return Math.floor((21-Math.sqrt(8*dtb/3-1479))/2);
		}
		return 10+Math.ceil((555-dtb)/2.5);
	},
		amelio_pv = Math.floor(pvbase/10)-3,
		amelio_vue = vue-3,
		amelio_att = att-3,
		amelio_esq = esq-3,
		amelio_deg = deg-3,
		amelio_reg = reg-1,
		amelio_arm = arm-1;
	if(race==="Darkling") { amelio_reg--; }
	if(race==="Durakuir") { amelio_pv-- ; }
	if(race==="Kastar")   { amelio_deg--; }
	if(race==="Skrim")    { amelio_att--; }
	if(race==="Tomawak")  { amelio_vue--; }
	
	urlAnatrolliseur = "http://mountyhall.dispas.net/dynamic/"
		+"outils_anatrolliseur.php?anatrolliseur=v8"
		+"|r="+race.toLowerCase()
		+"|dla="+amelio_dtb(dtb)
		+"|pv="+amelio_pv+",0,"+(pvmax-pvbase)
		+"|vue="+amelio_vue+",0,"+vuebm
		+"|att="+amelio_att+","+Nbrs["att"][2]+","+attbmm
		+"|esq="+amelio_esq+","+Nbrs["esq"][2]+","+Nbrs["esq"][3]
		+"|deg="+amelio_deg+","+Nbrs["deg"][2]+","+degbmm
		+"|reg="+amelio_reg+","+Nbrs["reg"][2]+","+Nbrs["reg"][3]
		+"|arm="+amelio_arm+","+armbmp+","+armbmm
		+"|mm="+mmTroll
		+"|rm="+rmTroll+"|";
}

function saveProfil() {
	//MZ_setValue(numTroll+'.profilON',true); // pour remplacer isProfilActif ?
	//MZ_setValue('NIV_TROLL',nivTroll);
	MZ_setValue(numTroll+'.caracs.attaque',att);
	MZ_setValue(numTroll+'.caracs.attaque.bm',attbm);
	MZ_setValue(numTroll+'.caracs.attaque.bmp',attbm-attbmm);
	MZ_setValue(numTroll+'.caracs.attaque.bmm',attbmm);
	MZ_setValue(numTroll+'.caracs.esquive',esq);
	MZ_setValue(numTroll+'.caracs.esquive.bm',esqbm);
	MZ_setValue(numTroll+'.caracs.esquive.nbattaques',nbattaques);
	MZ_setValue(numTroll+'.caracs.degats',deg);
	MZ_setValue(numTroll+'.caracs.degats.bm',degbm);
	MZ_setValue(numTroll+'.caracs.degats.bmp',degbm-degbmm);
	MZ_setValue(numTroll+'.caracs.degats.bmm',degbmm);
	MZ_setValue(numTroll+'.caracs.regeneration',reg);
	MZ_setValue(numTroll+'.caracs.regeneration.bm',regbm);
	MZ_setValue(numTroll+'.caracs.vue',vue);
	MZ_setValue(numTroll+'.caracs.vue.bm',vuebm);
	MZ_setValue(numTroll+'.caracs.pv',pv);
	MZ_setValue(numTroll+'.caracs.pv.base',pvbase);
	MZ_setValue(numTroll+'.caracs.pv.max',pvmax);
	MZ_setValue(numTroll+'.caracs.rm',rmTroll);
	MZ_setValue(numTroll+'.caracs.rm.bm',rmbm);
	MZ_setValue(numTroll+'.caracs.mm',mmTroll);
	MZ_setValue(numTroll+'.caracs.mm.bm',mmbm);
	MZ_setValue(numTroll+'.caracs.armure',arm);
	MZ_setValue(numTroll+'.caracs.armure.bm',armbmp+armbmm);
	MZ_setValue(numTroll+'.caracs.armure.bmp',armbmp);
	MZ_setValue(numTroll+'.caracs.armure.bmm',armbmm);
	if(bmDAttM) MZ_setValue(numTroll+'.bonus.DAttM',+bmDAttM);
	if(bmDDegM) MZ_setValue(numTroll+'.bonus.DDegM',bmDDegM);
	MZ_setValue(numTroll+'.position.X',posX);
	MZ_setValue(numTroll+'.position.Y',posY);
	MZ_setValue(numTroll+'.position.N',posN);
	MZ_setValue(numTroll+'.race',race);
	}


/*-[functions]----------- Fonctions modifiant la page ------------------------*/

function newStyleLink() {
	appendButton(
		document.getElementById("titre2"),
		"Nouveau Profil",
		function(){
			window.open("Play_profil2.php","Contenu");
		}
	);
}

function setAnatrolliseur() {
	appendButton(
		lignesProfil.snapshotItem(0).cells[0],
		"Anatrolliser!",
		function(){
			window.open(urlAnatrolliseur,"_blank")
		}
	);
}

function setInfoDateCreation() {
	var strCreation, dateCreation, txt;
	
	strCreation = lignesProfil.snapshotItem(0).cells[1].textContent;
	strCreation = strCreation.slice(
		strCreation.indexOf("(")+1, strCreation.indexOf(")")
	);
	dateCreation = new Date( StringToDate(strCreation) );
	
	// ***INIT GLOBALE*** NBjours
	NBjours = Math.floor((HeureServeur-dateCreation)/864e5)+1;
	
	txt = (NBjours!=1) ?
		"("+NBjours+" jours dans le hall)" :
		"(Bienvenue � toi pour ton premier jour dans le hall)" ;
	appendText(lignesProfil.snapshotItem(0).cells[1], txt, false);
}

function setNextDLA() {
	var
		parDLAsuiv, dureeTourMS, DLAsuivMS, nbLoupes,
		title, nextPv, nextTour,
		str, nbrs;
	
	// ***INIT GLOBALE*** DLAsuiv
	parDLAsuiv = lignesProfil.snapshotItem(1).cells[1].
		getElementsByTagName("p")[3];
	str = parDLAsuiv.getElementsByTagName("i")[0].textContent;
	DLAsuiv = new Date( StringToDate(str) );
	
	// Affichage des tours manqu�s
	nbrs = getNumbers(
		lignesProfil.snapshotItem(1).cells[1].getElementsByTagName("p")[2].
		getElementsByTagName("b")[0].textContent
	);
	dureeTourMS = nbrs[0]*36e5+nbrs[1]*6e4;
	DLAsuivMS = DLA.getTime()+dureeTourMS;
	nbLoupes = 0;
	while(DLAsuivMS<HeureServeur) {
		DLAsuivMS += dureeTourMS;
		nbLoupes++;
	}
	if(nbLoupes>0) {
		// ***RE-INIT GLOBALE*** DLAsuiv
		DLAsuiv = new Date( DLAsuivMS );
		txt = "(+"+nbLoupes+" tour"+
			(nbLoupes>1?"s":"")+" : "+
			DateToString( DLAsuiv )+
			")";
		appendBr(parDLAsuiv);
		appendText(parDLAsuiv, txt, false);
	}

	// Estimation des DLA suivantes
	title = ""; nextPv = pv;
	for(var i=1 ; i<4 ; ++i) {
		nextPv = Math.min(nextPv+regmoy,pvmax);
		nextTour = dtb +
			Math.max( 0, pdm+bmt + Math.floor(500*(pvmax-nextPv)/pvmax)/2 );
		title += (title?"\n":"")+
			"DLA +"+i+": "+
			DateToString( new Date(DLAsuivMS) )+
			" ("+nextPv+"PV, dur�e: "+dureeHM(nextTour)+")";
		DLAsuivMS += nextTour*6e4;
	}
	parDLAsuiv.title = title;
}

function vueCarac() {
	var tableCaracs, nodeVue, parentNodeVue,
		tr, td;
	
	// On ins�re la Vue dans les caracs
	tableCaracs = lignesProfil.snapshotItem(5).cells[1].
		getElementsByTagName("table")[0];
	tr = tableCaracs.insertRow(0);
	appendTdText(tr,"Vue..................:");
	td = appendTdText(tr,vue+" Cases");
	td.colSpan = 2;
	td.align = "right";
	td = appendTdText(tr,aff(vuebm));
	td.align = "right";
	
	// On retire la Vue de la ligne "Position"
	parentNodeVue = lignesProfil.snapshotItem(2).cells[1];
	nodeVue = document.evaluate(
		"./text()[contains(.,'Vue')]",
		parentNodeVue,
		null, 9, null
	).singleNodeValue;
	parentNodeVue.removeChild(nodeVue.previousSibling);
	parentNodeVue.removeChild(nodeVue);
}

function setLieu() {
	var urlBricol = 'http://trolls.ratibus.net/mountyhall/lieux.php'+
		'?search=position&orderBy=distance&posx='+
		posX+'&posy='+posY+'&posn='+posN+'&typeLieu=3';
	if(MZ_getValue('VUECARAC')=='true') {
		insertButton(
			lignesProfil.snapshotItem(2).cells[1].getElementsByTagName("b")[0],
			'Lieux � proximit�',
			function(){ window.open(urlBricol,'_blank') }
		);
	} else {
		appendBr(lignesProfil.snapshotItem(2).cells[0]);
		appendButton(
			lignesProfil.snapshotItem(2).cells[0],
			'Lieux � proximit�',
			function(){ window.open(urlBricol,'_blank') }
		);
	}
}

function setInfosPxPi() {
	if(nivTroll==60) return;
	
	/* Extraction des donn�es */
	var TDexp = lignesProfil.snapshotItem(3).cells[1];
	var node = TDexp.firstChild;
	var str = node.nodeValue;
	var pi_tot = parseInt(str.match(/\d+/g)[1]);
	var nbrs = getNumbers(TDexp.childNodes[2].nodeValue);
	var px = nbrs[0]+nbrs[1];
	var pi_nextLvl = nivTroll*(nivTroll+3)*5;
	var px_ent = 2*nivTroll;
	if(nivTroll<3) px_ent=Math.max(px_ent,Math.min(px,5));
	var nb_ent = Math.ceil((pi_nextLvl-pi_tot)/px_ent);
	
	/* Modification ligne "Niveau" */
	str = str.substring(0,str.length-1)+' | Niveau '+(nivTroll+1)+' : '
		+pi_nextLvl+' PI => '+nb_ent+' entra�nement';
	if(nb_ent>1) str += 's';
	str += ')';
	var span = document.createElement('span');
	span.title = (Math.round(10*(pi_tot+px)/NBjours)/10)+' PI par jour';
	appendText(span,str);
	TDexp.replaceChild(span,node);
	
	/* Ajout ligne PX entrainement */
	insertBr(TDexp.childNodes[3]);
	node = document.createElement('i');
	if(px<px_ent)
		appendText(node,
			'Il vous manque '+(px_ent-px)+' PX pour vous entra�ner.'
			);
	else
		appendText(node,
			'Entra�nement possible. Il vous restera '+(px-px_ent)+' PX.'
			);
	insertBefore(TDexp.childNodes[4],node);
	}

function setInfosPV() { // pour AM et Sacro
	var
		txt = "1 PV de perdu = +"+Math.floor(250/pvmax)+" min",
		sec = Math.floor(15000/pvmax)%60,
		lifebar = lignesPV[0].cells[1].getElementsByTagName("table")[0];
	if(sec!=0) { txt += " "+sec+" sec"; }
	if(lifebar) { lifebar.title = txt; }
	if(pv<=0) { return; }
	
	// Diff�rence PV p/r � �quilibre de temps (propale R')
	// Note : pvmin pour 0 malus = pvmax + ceiling(pvmax/250*(bmt+pdm))
	// ***INIT GLOBALE*** pvdispo
	pvdispo = pv-pvmax-Math.ceil((bmt+pdm)*pvmax/250);
	var	
		td = appendTd(lignesPV[2]),
		span = document.createElement("span");
	span.title = txt;
	span.style.fontStyle = "italic";
	if(bmt+pdm>=0) {
		txt = "Vous ne pouvez compenser aucune blessure actuellement.";
	} else if(pvdispo>0) {
		txt = "Vous pouvez encore perdre "+
			Math.min(pvdispo,pv)+
			" PV sans malus de temps.";
	} else if(pvdispo<0) {
		txt = "Il vous manque "
			+(-pvdispo)
			+" PV pour ne plus avoir de malus de temps.";
	} else {
		txt = "Vous �tes � l'�quilibre en temps (+/- 30sec).";
	}
	appendText(span,txt);
	td.appendChild(span);
}

function setCurrentEsquive() {
	var pnode = lignesProfil.snapshotItem(6).cells[1].
		getElementsByTagName("p")[0];
	var attmod = pnode.childNodes[3].nodeValue.match(/\d+/)[0];
	pnode.childNodes[3].nodeValue +=
		' (moyenne attaque : '+Math.max(attmoy-3.5*attmod,attbm,0)+')';
	var esqmod = pnode.childNodes[5].nodeValue.match(/\d+/)[0];
	pnode.childNodes[5].nodeValue +=
		' (moyenne esquive : '+Math.max(esqmoy-3.5*esqmod,esqbm,0)+')';
	nbattaques = parseInt(esqmod);
	var armmod = pnode.childNodes[7].nodeValue.match(/\d+/)[0];
	pnode.childNodes[7].nodeValue +=	
		' (moyenne armure : '+Math.max(armmoy-2*armmod,armbmp+armbmm,0)+')';
	}

function setStabilite() {
	var node = lignesProfil.snapshotItem(5).getElementsByTagName("p")[0];
	appendBr(node);
	appendText(node,
		'- Stabilit�..........: '+Math.floor(2*(esq+reg)/3)+' D6 '+aff(esqbm)
		+' (moyenne : '+Math.round(3.5*Math.floor(2*(esq+reg)/3)+esqbm)+')'
	);
}

function setRatioKillDeath() {
	try{
		var node = document.evaluate(
			"./td[2]/p[contains(./text(),'Adversaires tu�s')]",
			lignesProfil.snapshotItem(6),null,9,null).singleNodeValue;
		var killnode = node.firstChild;
		var deathnode = node.childNodes[2];
		}
	catch(e){return;}
	var kill = getNumbers(killnode.nodeValue)[0];
	var span = document.createElement('span');
	span.title  = 'Un kill tous les '
		+(Math.round(10*NBjours/kill)/10)+' jours';
	appendText(span,killnode.nodeValue);
	node.replaceChild(span,killnode);
	var death = getNumbers(deathnode.nodeValue)[0];
	if(death) {
		span = document.createElement('span');
		span.title = 'Une mort tous les '
			+(Math.round(10*NBjours/death)/10)+' jours';
		appendText(span,deathnode.nodeValue);
		node.replaceChild(span,deathnode);
		appendBr(node);
		appendText(node,
			'Rapport meurtres/d�c�s : '+Math.floor((kill/death)*1000)/1000
			);
		}
	}

function setTotauxMagie() {
	var td = lignesProfil.snapshotItem(9).cells[1];
	/* RM */
	var span = document.createElement('span');
	span.title = (Math.round(10*rm/NBjours)/10)
				+' ('+(Math.round(10*rmTroll/NBjours)/10)+') points de RM par jour | '
				+(Math.round(10*rm/nivTroll)/10)+
				' ('+(Math.round(10*rmTroll/nivTroll)/10)+') points de RM par niveau';
	appendText(span,td.firstChild.nodeValue+' (Total : '+rmTroll+')');
	td.replaceChild(span,td.firstChild);
	/* MM */
	span = document.createElement('span');
	span.title = (Math.round(10*mm/NBjours)/10)
				+' ('+(Math.round(10*mmTroll/NBjours)/10)+') points de MM  par jour | '
				+(Math.round(10*mm/nivTroll)/10)
				+' ('+(Math.round(10*mmTroll/nivTroll)/10)+') points de MM par niveau';
	appendText(span,td.childNodes[2].nodeValue+' (Total : '+mmTroll+')');
	td.replaceChild(span,td.childNodes[2]);
	}


/*-[functions]----------- Fonctions sp�ciales Kastars ------------------------*/

function minParPVsac(fat,bm) {
// Calcule le nombre de min gagn�es / PV sacrifi�s pour une AM r�alis�e sous
// fatigue = 'fat', sans et avec un bm de fatigue = 'bm'
	var out = [];
	out[0] = (fat>4) ?
		Math.floor(120/( fat*(1+Math.floor(fat/10)) )) :
		30;
	if(bm && bm>0) {
		var totalfat=fat+bm;
		out[1] = (totalfat>4) ?
			Math.floor(120/( totalfat*(1+Math.floor(totalfat/10)) )) :
			30; // en principe inutile pour des bm fat >= 15 mais bon...
	}
	return out;
}

function toInt(str) {
	str = parseInt(str);
	return (str) ? str : 0;
	}

function saveLastDLA() {
	// pour les calculs d'AM max
	var str = addZero(toInt(inJour.value))+'/'+addZero(toInt(inMois.value))
		+'/'+toInt(inAn.value)+' '+addZero(toInt(inHr.value))
		+':'+addZero(toInt(inMin.value))+':'+addZero(toInt(inSec.value));
	lastDLA = new Date( StringToDate(str) );
	MZ_setValue(numTroll+'.DLA.ancienne',str);
	lastDLAZone.innerHTML = '';
	var b = document.createElement('b');
	b.addEventListener('click',inputMode,false);
	appendText(b,str);
	lastDLAZone.appendChild(b);
	refreshAccel();
	}

function inputMode() {
	// �dition manuelle lastDLA
	var date;
	if(lastDLA)
		date = new Date( lastDLA );
	else
		date = new Date( DLAaccel );
	lastDLAZone.innerHTML = '';
	inJour = appendTextbox(lastDLAZone,'text','inJour',1,2,date.getDate());
	appendText(lastDLAZone,'/');
	inMois = appendTextbox(lastDLAZone,'text','inMois',1,2,1+date.getMonth());
	appendText(lastDLAZone,'/');
	inAn = appendTextbox(lastDLAZone,'text','inAn',3,4,date.getFullYear());
	appendText(lastDLAZone,' - ');
	inHr = appendTextbox(lastDLAZone,'text','inHr',1,2,date.getHours()+'');
	appendText(lastDLAZone,':');
	inMin = appendTextbox(lastDLAZone,'text','inMin',1,2,date.getMinutes()+'');
	appendText(lastDLAZone,':');
	inSec = appendTextbox(lastDLAZone,'text','inSec',1,2,date.getSeconds()+'');
	appendText(lastDLAZone,' - ');
	appendButton(lastDLAZone,'Enregistrer',saveLastDLA);
	}

function setAccel() {
	var
		BMfrais=false,
		fat=fatigue, listeBmFat=[], minppv,
		tr, td, insertPt;

	// Cr�ation d'une nouvelle ligne du profil sp�ciale AM
	tr = document.createElement('tr');
	tr.className = 'mh_tdpage';
	td = document.createElement('td');
	td.className = 'mh_tdtitre';
	td.vAlign = 'top';
	appendText(td,'Fatigue et AM',true);
	tr.appendChild(td);
	insertPt = document.createElement('td');
	tr.appendChild(insertPt);
	// si pas PDA, augmenter la hauteur de la banni�re de pub
	if(lignesProfil.snapshotItem(0).cells.length>2) {
		lignesProfil.snapshotItem(0).cells[2].rowSpan = 12;
	}
	insertBefore(lignesProfil.snapshotItem(5),tr);
	
	// Est-on en over-DLA ?
	// ***INIT GLOBALE*** overDLA
	overDLA = (HeureServeur>DLA.getTime()+3e5);
	if(overDLA) {
		fatigue = Math.floor(fatigue/1.25);
		fat=fatigue;
	}

	// Gestion des BM de fatigue
	if(bmfatigue>0) {
		// On tente de r�cup�rer les BM de fatigue de la page des BM
		if(MZ_getValue(numTroll+'.bm.fatigue')) {
			var BMmemoire = MZ_getValue(numTroll+'.bm.fatigue').split(';');
			BMmemoire.pop();
			var tour = 0;
			for(var i=0 ; i<BMmemoire.length ; i++) {
				var nbrs = BMmemoire[i].match(/\d+/g); // [tour,fatigue]
				while(tour<=parseInt(nbrs[0])) {
					listeBmFat[tour]=parseInt(nbrs[1]);
					tour++;
				}
			}
		}
		if(listeBmFat[0]==bmfatigue) {
			// Si (bm profil=1er bm stock�), on suppose que les bm stock�s sont � jour
			BMfrais = true;
			MZ_removeValue(numTroll+".bm.fatigue");
		}
	} else {
		// S'il n'y a pas de bm de fatigue sur le profil, on est � jour
		BMfrais = true;
	}
	if(!BMfrais && bmfatigue>0) {
		// si les BM n'ont pas �t� rafra�chis, on conjecture le pire:
		if(bmfatigue==15) {
			listeBmFat = [15,15,15];
		} else {
			listeBmFat = [30,30,15];
		}
	}
	if(overDLA) {
		// Si on est en over-DLA, on d�cale les bm d'un tour
		listeBmFat.shift();
	}
	
	// Tableau des fatigues et accel futures
	var
		minppv = minParPVsac(fat,listeBmFat[0]),
		table, tbody,
		ligneTour, ligneFat, ligneMin,
		col;
	// ***INIT GLOBALE*** minParPV
	minParPV = (listeBmFat[0]==void(0)) ? minppv[0] : minppv[1];
	if(fatigue>0 || listeBmFat[0]>0) {
		table = document.createElement('table');
		table.className = 'mh_tdborder';
		table.border = 0;
		table.cellSpacing = 1;
		table.cellPadding = 1;
		table.style.textAlign = "center";
		tbody = document.createElement('tbody');
		table.appendChild(tbody);
		insertPt.appendChild(table);
		
		ligneTour = appendTr(tbody,'mh_tdtitre');
		ligneTour.style.fontWeight = "bold";
		td = appendTdText(ligneTour,'Tour :',true);
		td.align = 'left';
		ligneFat = appendTr(tbody,'mh_tdpage');
		td = appendTdText(ligneFat,'Fatigue :',true);
		td.className = 'mh_tdtitre';
		td.align = 'left';
		ligneMin = appendTr(tbody,'mh_tdpage');
		td = appendTdText(ligneMin,'1 PV =',true);
		td.className = 'mh_tdtitre';
		td.align = 'left';
		col=0;
		while(col<9 && (fat>0 || listeBmFat[col])) {
			if(col==0) {
				if(overDLA) {
					var i = document.createElement('i');
					appendText(i,'� activer');
					ligneTour.appendChild(i);
				} else {
					appendTdText(ligneTour,'En cours');
				}
			} else {
				appendTdText(ligneTour,'\u00A0\u00A0+'+col+'\u00A0\u00A0');
			}
			if(listeBmFat[col]) {
				if(BMfrais || (!overDLA && col==0)) {
					appendTdText(ligneFat,fat+'+'+listeBmFat[col]);
					appendTdText(ligneMin,minppv[1]+'\'');
				} else {
					appendTdText(ligneFat,fat+'+'+listeBmFat[col]+' (?)');
					appendTdText(ligneMin,minppv[1]+'\' ('+minppv[0]+'\')');
				}
			} else {
				appendTdText(ligneFat,fat);
				appendTdText(ligneMin,minppv[0]+'\'');
			}
			col++;
			fat = Math.floor(fat / 1.25);
			minppv = minParPVsac(fat,listeBmFat[col]);
		}
		if(fat>1 || (fat==1 && !overDLA)) {
			appendTdText(ligneTour,'\u00A0 ... \u00A0',true);
			appendTdText(ligneFat,'-');
			appendTdText(ligneMin,'-');
		}
		col = (overDLA) ?	
			Math.max(retourAZero(fatigue)-1,col) :
			Math.max(retourAZero(fatigue),col);
		appendTdText(ligneTour,'\u00A0\u00A0+'+col+'\u00A0\u00A0');
		appendTdText(ligneFat,'0');
		appendTdText(ligneMin,'30\'');
		
		if(!BMfrais && bmfatigue) {
			// si les BM n'ont pas �t� rafra�chis, on signale:
			appendText(
				insertPt,
				'/!\\ Visitez la page des Bonus/Malus '+
				'pour mettre � jour votre fatigue. /!\\',
				true
			);
			appendBr(insertPt);
		}
		appendBr(insertPt);
	}
	
	if(pv<=0) {
		appendText(insertPt,'Aucun calcul possible : vous �tes mort voyons !');
		return;
	}
	
	if(fatigue>30) {
		appendText(insertPt,'Vous �tes trop fatigu� pour acc�l�rer.');
		return;
	}
	
	// Setup lastDLAZone
	if(overDLA) {
		// bypass des infos de "menu_FF.js" en cas d'overDLA
		DLAaccel = new Date( DLAsuiv );
		lastDLA = new Date( DLA );
		MZ_setValue(numTroll+'.DLA.ancienne',DateToString(DLA));
		// ***INIT GLOBALE*** pva
		pva = Math.min(pv+regmoy,pvmax);
		appendText(
			insertPt,
			'/!\\ Votre DLA est d�pass�e, calculs bas�s sur des estimations. /!\\',
			true
		);
		appendBr(insertPt);
	} else {
		DLAaccel = new Date( DLA );
		pva = pv;
		if(MZ_getValue(numTroll+'.DLA.ancienne')) {
			lastDLA = new Date(StringToDate(MZ_getValue(numTroll+'.DLA.ancienne')));
		} else {
			lastDLA = false;
		}
	}
	appendText(insertPt,'Derni�re DLA enregistr�e : ');	
	lastDLAZone = document.createElement('span');
	lastDLAZone.style.cursor = 'pointer';
	var b = document.createElement('b');
	b.onclick = inputMode;
	lastDLAZone.appendChild(b);
	insertPt.appendChild(lastDLAZone);
	if(lastDLA) {
		appendText(b,DateToString(lastDLA));
	} else {
		appendText(b,'aucune');
	}
	appendBr(insertPt);
	
	// Setup maxAMZone et cumulZone
	appendText(insertPt,'Acc�l�ration maximale possible : ');
	maxAMZone = document.createElement('b');
	insertPt.appendChild(maxAMZone);
	appendBr(insertPt);
	cumulZone = document.createElement('span');
	insertPt.appendChild(cumulZone);
	
	refreshAccel();
}

function refreshAccel() {
	var pvs, pvsmax;
	
	// Acc�l�ration pour cumul instantan�
	//window.console.debug('refreshAccel',pva,DLAaccel,lastDLA,minParPV);
	if(lastDLA) {
		pvsmax = Math.min(
			pva-1,
			Math.ceil( Math.floor((DLAaccel-lastDLA)/6e4)/minParPV )
		);
		maxAMZone.innerHTML = pvsmax+" PV";
	} else {
		pvsmax = pva-1;
		maxAMZone.innerHTML = "inconnue";
	}
	
	// pvAccel = (nb min avant DLA (arr. sup) / nb min p/ PVsac) (arrondi sup)
	pvs = Math.ceil( Math.ceil((DLAaccel-HeureServeur)/6e4) / minParPV );
	cumulZone.innerHTML = '';
	if(pvs<=pvsmax) {
		appendText(cumulZone,'Vous devez acc�l�rer d\'au moins ');
		appendText(cumulZone,pvs+' PV', true);
		appendText(cumulZone,' pour activer imm�diatement un nouveau tour.');
		if(pvs!=1) {
			var gainSec = Math.floor((DLAaccel-HeureServeur)/1e3)
				-(pvs-1)*60*minParPV;
			appendText(
				cumulZone,
				' ('+(pvs-1)+' PV dans '+
				Math.floor(gainSec/60)+'min'+
				addZero(gainSec%60)+'s)'
			);
		}
	} else {
		var avantDLA = new Date( DLAaccel-HeureServeur-pvsmax*minParPV*6e4 );
		appendText(
			cumulZone,
			'Apr�s votre acc�l�ration maximale, il vous faudra encore attendre '+
			dureeHM(avantDLA/6e4)+
			' avant de r�activer.'
		);
	}
}


/*-[functions]-------- Fonctions g�rant les infos-bulles ---------------------*/

function traitementTalents() {
	try {
		tr_comps = document.getElementById('competences').rows;
		tr_sorts = document.getElementById('sortileges').rows;
		var titres = document.evaluate(
			"./tbody/tr/td/b/text()",
			document.getElementById('competences').parentNode.
				parentNode.parentNode.parentNode,
			null, 7, null
		);
	} catch(e) {
		avertissement('[traitementTalents] Donn�es non trouv�es')
		window.console.error(e);
		return false;
	}
	removeAllTalents();
	var totalComp = injecteInfosBulles(tr_comps,'competences');
	var totalSort = injecteInfosBulles(tr_sorts,'sortileges');
	titres.snapshotItem(0).nodeValue += ' (Total : '+totalComp+'%)';
	titres.snapshotItem(1).nodeValue += ' (Total : '+totalSort+'%)';
	return true;
}

function injecteInfosBulles(liste,fonction) {
	var totalpc = 0;
	// on parse la liste des talents du type 'fonction'
	for(var i=1 ; i<liste.length ; i++) {
		var node = liste[i].cells[1].getElementsByTagName('a')[0];
		var nom = epure(trim(node.textContent));
		var nbrs = getNumbers(
			liste[i].cells[7].textContent
		);
		/*if(nom.indexOf('Piege')!=-1 || nom.indexOf('Golemo')!=-1) {
			// pour pi�ge et golemo, on extrait les sous-comps pour stockage
			// est-ce bien utile ?...
			var lstNoms = trim(
				epure(liste[i].cells[1].lastChild.nodeValue)
			).slice(1,-1).split(', ');
			for(var j=0 ; j<lstNoms.length ; j++) {
				setTalent(lstNoms[j],nbrs[1],nbrs[0]);
			}
			setInfos(node,lstNoms.join(', '),fonction,nbrs[0]);
			totalpc += nbrs[1];
		} else {
			// pour les autres talents, stockage direct
			window.console.debug(nom,fonction,nbrs);
			setInfos(node,nom,fonction,nbrs[0]);
			setTalent(nom,nbrs[1],nbrs[0]);
			totalpc += nbrs[1];
		}*/
		//window.console.debug(nom,fonction,nbrs);
		setInfos(node,nom,fonction,nbrs[0]);
		setTalent(nom,nbrs[1],nbrs[0]);
		totalpc += nbrs[1];

		// stockage des niveaux inf�rieurs du talent si pr�sents
		for(var j=2 ; j<nbrs.length ; j+=2) {
			//window.console.debug("setTalent(",nom,nbrs[j+1],nbrs[j],")");
			setTalent(nom,nbrs[j+1],nbrs[j]);
			totalpc += nbrs[j+1];
		}
	}
	return totalpc;
}

function setInfos(node,nom,fonction,niveau) {
	node.nom = nom;
	node.fonction = fonction;
	node.niveau = niveau;
	node.onmouseover = setBulle;
	node.onmouseout = cacherBulle;
}

var arrayModifAnatroll = {
	'Glue':'Glu',
	'PuM':'PuiM',
	'HE':'Hurlement',
	//'Insultes':'Insu',
	'Pistage':'Pist',
	'PuC':'Planter'
}

function setTalent(nom,pc,niveau) {
	// Nota : voir plus tard si stocker les effets des comps/sorts directement 
	// (et pas les % dont osf) ne serait pas plus rentable
	var nomEnBase = arrayTalents[epure(nom)];
	if(!nomEnBase) { return; }
	if(!niveau) { niveau = 1; }
	
	switch(nomEnBase) {
		case 'Insultes':
			urlAnatrolliseur += 'Insu'+niveau+'|';
		case 'IdT':
			nomEnBase += niveau;
			break;
		case 'AP':
		case 'Baroufle':
		case 'CdB':
		case 'CdM':
		case 'Parer':
		case 'Retraite':
		case 'RB':
		case 'SInterposer':
			nomEnBase += niveau;
		default:
			urlAnatrolliseur += (arrayModifAnatroll[nomEnBase] ? 
				arrayModifAnatroll[nomEnBase] : nomEnBase) + '|';
	}
	
	MZ_setValue(numTroll+'.talent.'+nomEnBase,pc);
}

function creerBulleVide() {
	var table = document.createElement('table');
	table.id = 'bulle';
	table.className = 'mh_tdborder';
	table.width = 300;
	table.border = 0;
	table.cellPadding = 5;
	table.cellSpacing = 1;
	table.style =	
		 'position:absolute;'
		+'visibility:hidden;'
		+'z-index:800;'
		+'height:auto;';
	var tr = appendTr(table,'mh_tdtitre');
	appendTdText(tr,'Titre');
	tr = appendTr(table,'mh_tdpage');
	appendTdText(tr,'Contenu');
	var aList = document.getElementsByTagName('a');
	aList[aList.length-1].parentNode.appendChild(table);
	}

function cacherBulle() {
	if(bulleStyle) bulleStyle.visibility = 'hidden';
	}

function setBulle(evt) {
	var nom = this.nom;
	var fonction = this.fonction;
	var niveau = parseInt(this.niveau);
	var str='';
	if(fonction=='competences') str=competences(nom,niveau);
	else if(fonction=='sortileges') str=sortileges(nom,true);
	if(str=='') return;
	if(nom.indexOf('Golem')!=-1) nom='Golemologie';
	
	var xfenetre, yfenetre, xpage, ypage, element = null;
	var offset = 15;
	var bulleWidth = 300;
	if(!hauteur) hauteur = 50;
	element = document.getElementById('bulle');
	xfenetre = evt.clientX;
	yfenetre = evt.clientY;
	xpage = xfenetre;
	ypage = yfenetre;
	if(evt.pageX) xpage = evt.pageX;
	if(evt.pageY) ypage = evt.pageY;
	if(element) {
		bulleStyle = element.style;
		element.firstChild.firstChild.innerHTML = '<b>'+nom+'</b>';
		element.childNodes[1].firstChild.innerHTML = str;
		}
	if(bulleStyle) {
		if(xfenetre>bulleWidth+offset)
			xpage -= bulleWidth+offset;
		else
			xpage += offset;
		if(yfenetre>hauteur+offset)
			ypage -= hauteur + offset;
		bulleStyle.width = bulleWidth;
		bulleStyle.left = xpage + 'px';
		bulleStyle.top = ypage + 'px';
		bulleStyle.visibility = 'visible';
		}
	}


/*-[functions] Textes des infos-bulles pour les comp�tences et sortil�ges ----*/

function competences(comp,niveau) {
	var texte = '';
	if(comp.indexOf('Acceleration du Metabolisme')!=-1 && minParPV!=null) {
		texte = '<b>1</b> PV = <b>'+minParPV+'</b> minute';
		if(minParPV>1) texte += 's';
		if(overDLA) texte += '<br/><i>(Votre DLA est d�pass�e.)</i>';
		}
	else if(comp.indexOf('Attaque Precise')!=-1) {
		var pc, lastmax=0, espatt=0;
		var notMaxedOut = false;
		for(var i=niveau ; i>0 ; i--) {
			pc = getTalent(comp,i);
			if(lastmax!=0 && pc<=lastmax) continue;
			var jetatt = Math.round(3.5*Math.min(Math.floor(1.5*att),att+3*i))+attbm;
			texte += 'Attaque niv. '+i+' ('+(pc-lastmax)+'%) : <b>'+
				Math.min(Math.floor(att*1.5),att+3*i)+'</b> D6 '+aff(attbm)+
				' => <b>'+jetatt+'</b><br/>';
			espatt += (pc-lastmax)*jetatt;
			lastmax = pc;
			if(i<niveau) notMaxedOut = true;
		}
		if(notMaxedOut) {
			texte += '<i>Attaque moyenne (si r�ussite) : <b>'+
				Math.floor(10*espatt/lastmax)/10+'</b></i><br/>';
		}
		texte += 'D�g�ts : <b>'+deg+'</b> D3 '+aff(degbm)
			+' => <b>'+degmoy+'/'+(degmoy+2*Math.floor(deg/2))+'</b>';
	}
	else if(comp.indexOf('Balayage')!=-1)
		texte = 'D�stabilisation : <b>'+att+'</b> D6 '+aff(attbm)
			+' => <b>'+(Math.round(3.5*att)+attbm)+'</b><br/>'
			+'Effet : <b>Met � terre l\'adversaire</b>';
	else if(comp.indexOf('Bidouille')!=-1)
		texte = 'Bidouiller un tr�sor permet de compl�ter le nom d\'un objet '
			+'de votre inventaire avec le texte de votre choix.';
	else if(comp.indexOf('Baroufle')!=-1)
		texte = 'Vous voulez encourager vos compagnons de chasse ? '
			+'Ramassez quelques Coquillages, et en avant la musique !';
	else if(comp.indexOf('Botte Secrete')!=-1)
		texte = 'Attaque : <b>'
			+Math.floor(2*att/3)+'</b> D6 '+aff(Math.floor(attbm/2))
			+' => <b>'
			+Math.round(3.5*Math.floor(2*att/3)+Math.floor(attbm/2))
			+'</b><br/>D�g�ts : <b>'
			+Math.floor(att/2)+'</b> D3 '+aff(Math.floor(degbm/2))
			+' => <b>'
			+(2*Math.floor(att/2)+Math.floor(degbm/2))
			+'/'+(2*Math.floor(1.5*Math.floor(att/2))+Math.floor(degbm/2))
			+'</b>';
	else if(comp.indexOf('Camouflage')!=-1) {
		var camou = getTalent('Camouflage');
		texte = 'Pour conserver son camouflage, il faut r�ussir un jet sous:<br/>'
			+'<i>D�placement :</i> <b>'+Math.floor(0.75*camou)+'%</b><br/>'
			+'<i>Attaque :</i> <b>perte automatique</b>.<br/>'
			+'<i>Projectile Magique :</i> <b>'+Math.floor(0.25*camou)+'%</b>';
		}
	else if(comp.indexOf('Charger')!=-1) {
		if(pv<=0)
			return '<i>On ne peut charger personne quand on est mort !</i>';
		var portee = Math.min(
			getPortee(reg+Math.floor(pv/10))-Math.floor((fatigue+bmfatigue)/5),
			vuetotale);
		if(portee<1)
			return '<b>Impossible de charger</b>';
		else {
			texte = 'Attaque : <b>'+att+'</b> D6 '+aff(attbm)
				+' => <b>'+attmoy+'</b><br/>'
				+'D�g�ts : <b>'+deg+'</b> D3 '+aff(degbm)
				+' => <b>'+degmoy+'/'+(degmoy+2*Math.floor(deg/2))+'</b>'
				+'<br/>Port�e : <b>'+portee+'</b> case';
			if(portee>1) texte += 's';
			}
		}
	else if(comp.indexOf('Connaissance des Monstres')!=-1) {
		texte = 'Port�e horizontale : <b>'+vuetotale+'</b> case';
		if(vuetotale>1) texte += 's';
		texte += '<br/>Port�e verticale : <b>'+Math.ceil(vuetotale/2)+'</b> case';
		if(vuetotale>2) texte += 's';
		}
	else if(comp.indexOf('Piege')!=-1) {
		if(comp.indexOf('Glue')!=-1)
			texte = 'Et si vous colliez vos adversaires au sol ?';
		if(comp.indexOf('Feu')!=-1) {
			if(texte)
				texte += ' � moins que vous ne pr�f�riez les envoyer en l\'air !<br/>';
			texte += 'D�gats du pi�ge � feu : <b>'+Math.floor((esq+vue)/2)+'</b> D3'
				+' => <b>'+2*Math.floor((esq+vue)/2)+' ('+resiste((esq+vue)/2)+')</b>';
			}
		}
	else if(comp.indexOf('Contre-Attaquer')!=-1)
		texte = 'Attaque : <b>'
			+Math.floor(att/2)+'</b> D6 '+aff(Math.floor(attbm/2))
			+' => <b>'+Math.round(3.5*Math.floor(att/2)+Math.floor(attbm/2))
			+'</b><br/>D�g�ts : <b>'+deg+'</b> D3 '+aff(degbm)
			+' => <b>'+degmoy+'/'+(degmoy+2*Math.floor(deg/2))+'</b>';
	else if(comp.indexOf('Coup de Butoir')!=-1) {
		var pc, lastmax=0, espdeg=0;
		var notMaxedOut = false;
		texte = 'Attaque : <b>'+att+'</b> D6 '+aff(attbm)
			+' => <b>'+attmoy+'</b>';
		for(var i=niveau ; i>0 ; i--) {
			pc = getTalent(comp,i);
			if(lastmax!=0 && pc<=lastmax) continue;
			var jetdeg = 2*Math.min(Math.floor(1.5*deg),deg+3*i)+degbm;
			texte += '<br/>D�g�ts niv. '+i+' ('+(pc-lastmax)+'%) : <b>'+
				Math.min(Math.floor(deg*1.5),deg+3*i)+'</b> D6 '+aff(degbm)+
				' => <b>'+jetdeg+'/'+(jetdeg+2*Math.floor(deg/2))+'</b>';
			espdeg += (pc-lastmax)*jetdeg;
			lastmax = pc;
			if(i<niveau) notMaxedOut = true;
		}
		if(notMaxedOut) {
			texte += '<br/><i>D�g�ts moyens (si r�ussite) : <b>'+
				Math.floor(10*espdeg/lastmax)/10+'/'+
				(Math.floor(10*espdeg/lastmax)/10+2*Math.floor(deg/2))+'</b></i>';
		}
	}
	else if(comp.indexOf('Course')!=-1)
		texte = 'D�placement gratuit : <b>'
			+Math.floor(getTalent('Course')/2)
			+' %</b> de chance';
	else if(comp.indexOf('Deplacement Eclair')!=-1)
		texte = 'Permet d\'�conomiser <b>1</b> PA '
			+'par rapport au d�placement classique';
	else if(comp.indexOf('Dressage')!=-1)
		texte = 'Le dressage permet d\'apprivoiser un gowap redevenu sauvage '
			+'ou un gnu sauvage.';
	else if(comp.indexOf('Ecriture Magique')!=-1)
		texte = 'R�aliser la copie d\'un sortil�ge apr�s en avoir d�couvert '
			+'la formule n�cessite de r�unir les composants de cette formule, '
			+'d\'obtenir un parchemin vierge sur lequel �crire, et de r�cup�rer '
			+'un champignon ad�quat pour confectionner l\'encre.';
	else if(comp.indexOf('Frenesie')!=-1) {
		texte = 'Attaque : <b>'+att+'</b> D6 '+aff(attbm)
			+' => <b>'+attmoy+'</b><br/>'
			+'D�g�ts : <b>'+deg+'</b> D3 '+aff(degbm)
			+' => <b>'+degmoy+'/'+(degmoy+2*Math.floor(deg/2))+'</b>';
		}
	else if(comp.indexOf('Golem')!=-1)
		texte = 'Animez votre golem en assemblant divers mat�riaux '
			+'autour d\'un cerveau min�ral.'
	else if(comp.indexOf('Grattage')!=-1) {
		texte = 'Permet de confectionner un Parchemin Vierge '
			+'� partir de composants et de Gigots de Gob\'.';
		}
	else if(comp.indexOf('Hurlement Effrayant')!=-1)
		texte = 'Fait fuir un monstre si tout se passe bien.'
			+'<br/>Lui donne de gros bonus sinon...';
	else if(comp.indexOf('Identification des Champignons')!=-1) {
		texte = 'Port�e horizontale : <b>'+Math.ceil(vuetotale/2)+'</b> case';
		if(vuetotale>2) texte += 's';
		texte += '<br/>Port�e verticale : <b>'+Math.ceil(vuetotale/4)+'</b> case';
		if(vuetotale>4) texte += 's';
		}
	else if(comp.indexOf('Insultes')!=-1)
		texte = 'Port�e horizontale : <b>'+Math.min(vuetotale,1)+'</b> case';
	else if(comp.indexOf('interposer')!=-1)
		texte = 'Jet de r�flexe : <b>'
			+Math.floor(2*(esq+reg)/3)+'</b> D6 '+aff(esqbm)
			+' => <b>'+Math.round(3.5*Math.floor(2*(esq+reg)/3)+esqbm)+'</b>';
	else if(comp.indexOf('Lancer de Potions') != -1)
		texte = 'Port�e : <b>'+(2+Math.floor(vuetotale/5))+'</b> cases';
	else if(comp.indexOf('Marquage')!=-1)
		texte = 'Marquage permet de rajouter un sobriquet � un monstre. Il faut '
			+'bien choisir le nom � ajouter car celui-ci sera d�finitif. Il faut '
			+'se trouver dans la m�me caverne que le monstre pour le marquer.';
	else if(comp.indexOf('Melange Magique')!=-1)
		texte = 'Cette Comp�tence permet de combiner deux Potions pour '
			+'en r�aliser une nouvelle dont l\'effet est la somme '
			+'des effets des potions initiales.';
	else if(comp.indexOf('Miner')!=-1)
		texte = 'Port�e horizontale (officieuse) : <b>'
			+2*vuetotale+'</b> cases<br/>'
			+'Port�e verticale (officieuse) : <b>'
			+2*Math.ceil(vuetotale/2)+'</b> cases';
	else if(comp.indexOf('Necromancie')!=-1)
		texte = 'La N�cromancie permet � partir des composants d\'un monstre '
			+'de faire "revivre" ce monstre.';
	else if(comp.indexOf('Painthure de Guerre')!=-1)
		texte = 'Grimez vos potr�lls et r�veillez l\'esprit guerrier '
			+'qui sommeille en eux ! Un peu d\'encre, une T�te R�duite '
			+'pour s\'inspirer, et laissez parler votre cr�ativit�.'
	else if(comp.indexOf('Parer')!=-1)
		texte = 'Jet de parade : <b>'
			+Math.floor(att/2)+'</b> D6 '+aff(Math.floor(attbm)/2)
			+' => <b>'
			+Math.round(3.5*Math.floor(att/2)+Math.floor(attbm/2))
			+'</b><hr><i>Equivalent esquive : <b>'
			+(Math.floor(att/2)+esq)+'</b> D6 '+aff(Math.floor(attbm/2)+esqbm)
			+' => <b>'
			+(Math.round(3.5*(Math.floor(att/2)+esq)+Math.floor(attbm/2))+esqbm)
			+'</b></i>';
	else if(comp.indexOf('Pistage')!=-1)
		texte = 'Port�e horizontale : <b>'
			+2*vuetotale+'</b> cases<br/>'
			+'Port�e verticale : <b>'
			+2*Math.ceil(vuetotale/2)+'</b> cases';
	else if(comp.indexOf('Planter un Champignon')!=-1)
		texte = 'Planter un Champignon est une comp�tence qui vous permet de '
			+'cr�er des colonies d\'une vari�t� donn�e de champignon � partir de '
			+'quelques exemplaires pr�alablement enterr�s.';
	else if(comp.indexOf('Regeneration Accrue')!=-1)
		texte = 'R�g�n�ration : <b>'+Math.floor(pvmax/15)+'</b> D3'
			+' => <b>+'+2*Math.floor(pvmax/15)+'</b> PV';
	else if(comp.indexOf('Reparation')!=-1)
		texte = 'Marre de ces arnaqueurs de forgerons ? Prenez quelques outils, '
			+'et r�parez vous-m�me votre mat�riel !';
	else if(comp.indexOf('Retraite')!=-1)
		texte = 'Vous jugez la situation avec sagesse et estimez qu\'il serait '
			+'pr�f�rable de pr�parer un repli strat�gique pour d�concerter '
			+'l\'ennemi et lui foutre une bonne branl�e ... plus tard. MOUAHAHA ! '
			+'Quelle intelligence d�moniaque.';
	else if(comp.indexOf('Rotobaffe')!=-1) {
		var Datt = att, vattbm = attbm;
		var Ddeg = deg, vdegbm = degbm;
		for(var i=1 ; i<niveau+2 ; i++) {
			texte += '<b>Attaque n�'+i+' :</b><br/>'
				+'Attaque : <b>'+Datt+'</b> D6 '+aff(attbm)
				+' => <b>'+(Math.round(3.5*Datt)+attbm)+'</b><br/>'
				+'D�g�ts : <b>'+Ddeg+'</b> D3 '+aff(degbm)
				+' => <b>'+(2*Ddeg+degbm)+'</b>';
			Datt = Math.floor(0.75*Datt); vattbm = Math.floor(0.75*vattbm);
			Ddeg = Math.floor(0.75*Ddeg); vdegbm = Math.floor(0.75*vdegbm);
			if(i<niveau+1) texte += '<hr>';
			}
		}
	else if(comp.indexOf('Shamaner')!=-1)
		texte = 'Permet de contrecarrer certains effets des pouvoirs sp�ciaux '
			+'des monstres en utilisant des champignons (de 1 � 3).';
	else if(comp.indexOf('Tailler')!=-1)
		texte = 'Permet d\'augmenter sensiblement la valeur marchande de certains '
			+'minerais. Mais cette op�ration d�licate n\'est pas sans risques...';
	return texte;
	}

function decumul_buff(nom,str,buff) {
	// D�cumul des sorts de buff
	var ret = '1<sup>ere</sup>'+nom+' : <b>'+str+' +'+buff+'</b>';
	var dec = buff, total = buff, i=1;
	while(i<6) {
		i++;
		dec = Math.floor(coefDecumul(i)*buff);
		if(dec<=1 || i==6) break;
		total += dec;
		ret += '<br/><i>'+i+'<sup>e</sup> '+nom+' : '
			+str+' +'+dec+' (+'+total+')</i>';
		}
	ret += '<br/><i>'+i+'<sup>e</sup> et + : '+str+' +'+dec+'</i>';
	return ret;
	}


function sortileges(sort,mainCall,pcA,pcD) {
	// Si mainCall==false, affichage r�duit des infos (pour PuM/Pr�M)
	var texte = '';
	if(mainCall) {
		var pcA = (bmDAttM) ? bmDAttM : false;
		var pcD = (bmDDegM) ? bmDDegM : false;
	}
	if(sort.indexOf('Analyse Anatomique')!=-1) {
		texte = 'Port�e horizontale : <b>'
			+Math.floor(vuetotale/2)+'</b> case';
		if(vuetotale>3) { texte += 's'; }
		texte += '<br/>Port�e verticale : <b>'
			+Math.floor((vuetotale+1)/4)+'</b> case';
		if(vuetotale>7) { texte += 's'; } 
	}
	else if(sort.indexOf('Armure Etheree')!=-1)
		texte = decumul_buff('AE','Armure magique',reg);
	else if(sort.indexOf('Augmentation')!=-1 && sort.indexOf('Attaque')!=-1)
		texte = decumul_buff('AdA','Attaque physique',1+Math.floor((att-3)/2));
	else if(sort.indexOf('Augmentation')!=-1 && sort.indexOf('Esquive')!=-1)
		texte = decumul_buff('AdE','Esquive',1+Math.floor((esq-3)/2));
	else if(sort.indexOf('Augmentation des Degats')!=-1)
		texte = decumul_buff('AdD','D�g�ts physiques',1+Math.floor((deg-3)/2));
	else if(sort.indexOf('Bulle Anti-Magie')!=-1) {
		texte = 'RM : <b>+'+rm+'</b><br/>MM : <b>-'+mm+'</b>';
	}
	else if(sort.indexOf('Bulle Magique')!=-1) {
		texte = 'RM : <b>-'+rm+'</b><br/>MM : <b>+'+mm+'</b>';
	}
	else if(sort.indexOf('Explosion')!=-1)
		texte = 'D�g�ts : <b>'
			+Math.floor( 1+(deg+Math.floor(pvmax/10))/2 )+'</b> D3 '
			+' => <b>'+2*Math.floor( 1+(deg+Math.floor(pvmax/10))/2 )
			+' ('+resiste( 1+(deg+Math.floor(pvmax/10))/2 )+')</b>';
	else if(sort.indexOf('Faiblesse Passagere')!=-1) {
		if(pv<=0)
			return '<i>Dans votre �tat, vous n\'affaiblirez personne...</i>';
		texte = 'Port�e horizontale : <b>'
			+Math.min(1,vuetotale)+'</b> case<br/>'
			+'D�g�ts physiques : <b>-'
			+Math.ceil( (Math.floor(pv/10)+deg-5)/4 )
			+' (-'+Math.ceil( (Math.floor(pv/10)+deg-5)/8 )+')</b><br/>'
			+'D�g�ts magiques : <b>-'
			+Math.floor( (Math.floor(pv/10)+deg-4)/4 )
			+' (-'+Math.floor( (Math.floor(pv/10)+deg-2)/8 )+')</b>';
		}
	else if(sort.indexOf('Flash Aveuglant')!=-1)	
		texte = 'Vue, Attaque, Esquive : <b>-'+(1+Math.floor(vue/5))+'</b>';
	else if(sort.indexOf('Glue')!=-1) {
		texte = 'Port�e : <b>'+(1+Math.floor(vuetotale/3))+'</b> case';
		if(vuetotale>2) texte += 's';
		}
	else if(sort.indexOf('Griffe du Sorcier')!=-1) {
		/* Frappe */
		var modD = 0;
		texte = 'Attaque : <b>'+att+'</b> D6 ';
		if(pcA) {
			modD = parseInt(att*pcA/100);
			texte += '<i>'+aff(modD)+'D6</i> ';
			}
		texte += aff(attbmm)
			+' => <b>'+(Math.round(3.5*(att+modD))+attbmm)+'</b><br/>'
			+'D�g�ts : <b>'+Math.floor(deg/2)+'</b> D3 ';
		if(pcD) {
			modD = parseInt(Math.floor(deg/2)*pcD/100);
			texte += '<i>'+aff(modD)+'D3</i> ';
			}
		else
			modD = 0;
		texte += aff(degbmm)+' => <b>'
			+(2*(Math.floor(deg/2)+modD)+degbmm)
			+'/'+(2*(Math.floor(deg/2)+Math.floor(deg/4)+modD)+degbmm)
			+' ('+resiste(Math.floor(deg/2)+modD,degbmm)
			+'/'+resiste(Math.floor(deg/2)+Math.floor(deg/4)+modD,degbmm)
			+')</b>';
		if(!mainCall) return texte;
		/* Venins */
		function addVenin(type,effet,duree) {
			var ret = '<b>Venin '+type+' : </b><br/><b>'+effet+'</b> D3'
				+' pendant <b>'+duree+'</b> tour';
			if(duree>1) ret += 's';
			var dred = Math.max(Math.floor(duree/2),1);
			return ret+' => <b>'+2*effet+' x '+duree+' = '+2*effet*duree
				+'</b> ('+2*effet+' x '+dred+' = '+2*effet*dred+')';
			}
		var effet = 1+Math.floor((Math.floor(pvbase/10)+reg)/3);
		texte += '<hr>'+addVenin('insidieux',effet,2+Math.floor(vue/5));
		effet = Math.floor(1.5*effet);
		texte += '<hr>'+addVenin('virulent',effet,1+Math.floor(vue/10));
		}
	else if(sort.indexOf('Hypnotisme')!=-1)
		texte = 'Esquive : <b>-'+Math.floor(1.5*esq)+'</b> D�s'
			+' (<b>-'+Math.floor(esq/3)+'</b> D�s)';
	else if(sort.indexOf('Identification des tresors')!=-1)
		texte = 'Permet de connaitre les caract�ristiques et effets pr�cis '
			+'d\'un tr�sor.';
	else if(sort.indexOf('Invisibilite')!=-1)
		texte = 'Un troll invisible est ind�tectable m�me quand on se trouve '
			+'sur sa zone. Toute action physique ou sortil�ge d\'attaque '
			+'fait dispara�tre l\'invisibilit�.';
	else if(sort.indexOf('Levitation')!=-1)
		texte = 'Prendre un peu de hauteur permet parfois d\'�viter les ennuis. '
			+'Comme les pi�ges ou les trous par exemple...';
	else if(sort.indexOf('Precision')!=-1 || sort.indexOf('Puissance')!=-1) {
		var eps = 1, pc = 20;
		var str = 'Pr�M';
		var newSort;
		var sortAtt = [
			'Projectile Magique',
			'Rafale Psychique',
			'Siphon des Ames',
			'Vampirisme',
			'Griffe du Sorcier'
		];
		if(sort.indexOf('Puissance')!=-1) {
			eps = -1; str='PuM';
		}
		for(var i=1 ; i<4 ; i++) {
			if(texte) { texte += '<hr>'; }
			texte += '<b>'+i+'<sup>e</sup> '+str+' ('+aff(pc)+' %) :</b><br/>';
			newSort = false;
			for(var j=0 ; j<5 ; j++) {
				if(getTalent(sortAtt[j])) {
					if(newSort) { texte += '<br/><br/>'; }
					texte += '<i>'+sortAtt[j]+' :</i><br/>'
						+sortileges(sortAtt[j],false,eps*pc,-eps*pc);
					newSort = true;
				}
			}
			pc = decumulPumPrem(pc);
		}
	}
	else if(sort.indexOf('Projectile Magique')!=-1) {
		var modD = 0;
		var portee = getPortee(vuetotale);
		texte = 'Attaque : <b>'+vue+'</b> D6 ';
		if(pcA) {
			modD = parseInt(vue*pcA/100);
			texte += '<i>'+aff(modD)+'D6</i> ';
			}
		texte += aff(attbmm)
			+' => <b>'+(Math.round(3.5*(vue+modD))+attbmm)+'</b><br/>'
			+'D�g�ts : <b>'+Math.floor(vue/2)+'</b> D3 ';
		if(pcD) {
			modD = parseInt(Math.floor(vue/2)*pcD/100);
			texte += '<i>'+aff(modD)+'D3</i> ';
			}
		else
			{ modD = 0; }
		texte += aff(degbmm)
			+' => <b>'+(2*(Math.floor(vue/2)+modD)+degbmm)
			+'/'+(2*(Math.floor(1.5*Math.floor(vue/2))+modD)+degbmm)
			+' ('+resiste(Math.floor(vue/2)+modD,degbmm)
			+'/'+resiste(1.5*Math.floor(vue/2)+modD,degbmm)+')</b>';
		if(!mainCall) return texte;
		texte += '<br/>Port�e : <b>'+portee+'</b> case';
		if(portee>1) texte += 's';
		}
	else if(sort.indexOf('Projection')!=-1) {
		texte = 'Si le jet de r�sistance de la victime est rat�:<br/>'
			+'la victime est <b>d�plac�e</b> et perd <b>1D6</b> d\'Esquive<hr>'
			+'Si le jet de r�sistance de la victime est r�ussi:<br/>'
			+'la victime ne <b>bouge pas</b> mais perd <b>1D6</b> d\'Esquive.';
		}
	else if(sort.indexOf('Rafale Psychique')!=-1) {
		var modD = 0;
		texte = 'D�g�ts : <b>'+deg+'</b> D3 ';
		if(pcD) {
			modD = parseInt(deg*pcD/100);
			texte += '<i>'+aff(modD)+'D3</i> ';
			}
		texte += aff(degbmm)
			+' => <b>'+(2*(deg+modD)+degbmm)+' ('+resiste(deg+modD,degbmm)+')</b>';
		if(!mainCall) return texte;
		texte += '<br/>Malus : r�g�n�ration <b>-'+deg+'</b>';
		}
	else if(sort.indexOf('Sacrifice')!=-1) {
		if(pv<=0)
			return '<i>Qui voulez-vous donc soigner ? Vous �tes mort !</i>';
		
		function perteSacro(sac) {
			return ' (-'+(sac+2*Math.floor(sac/5)+2)+' PV)';
			}
		
		var sac = Math.floor((pv-1)/2);
		texte = 'Port�e horizontale : <b>'+Math.min(1,vuetotale)+'</b> case<br/>'
			+'Soin maximal : <b>'+sac+'</b> PV'+perteSacro(sac);
		/* Sacros max et optimal sans malus (propale R') */
		sac = Math.floor(pvdispo/1.4)-1;
		if(sac>0)
			texte += '<hr>Soin maximal sans malus de temps : <b>'
				+sac+'</b> PV'+perteSacro(sac);
		if(sac>3) {
			sac = 5*Math.floor((sac+1)/5)-1;
			texte += '<br/>Soin optimal sans malus de temps : <b>'
				+sac+'</b> PV'+perteSacro(sac);
			}
		}
	else if(sort.indexOf('Siphon')!=-1) {
		var modD = 0;
		texte = 'Attaque : <b>'+att+'</b> D6 ';
		if(pcA) {
			modD = parseInt(att*pcA/100);
			texte += '<i>'+aff(modD)+'D6</i> ';
			}
		texte += aff(attbmm)
			+' => <b>'+Math.round(3.5*(att+modD)+attbmm)+'</b><br/>'
			+'D�g�ts : <b>'+reg+'</b> D3 ';
		if(pcD) {
			modD = parseInt(reg*pcD/100);
			texte += '<i>'+aff(modD)+'D3</i> ';
			}
		else
			modD = 0;
		texte += aff(degbmm)
			+' => <b>'+(2*(reg+modD)+degbmm)+'/'+(2*(Math.floor(1.5*reg)+modD)+degbmm)
			+' ('+resiste(reg+modD,degbmm)+'/'+resiste(1.5*reg+modD,degbmm)+')</b>';
		if(!mainCall) return texte;
		texte += '<br/>N�crose : attaque magique <b>-'+reg+'</b>';
		}
	else if(sort.indexOf('Telekinesie')!=-1) {
		texte = 'Port�e horizontale  :';
		var vt = Math.floor(vuetotale/2)+2;
		var strList = ['d\'une Plum\' ou Tr�s L�ger','L�ger',
					'Moyen','Lourd','Tr�s Lourd ou d\'une Ton\''];
		for(var i=0 ; i<5 ; i++) {
			texte += '<br/><i>Tr�sor '+strList[i]+' : </i><b>'+vt+'</b> case';
			if(vt>1) texte += 's';
			vt=Math.max(0,vt-1);
			}
		}
	else if(sort.indexOf('Teleportation')!=-1) {
		var portee = getPortee(mmTroll/5);
		var pmh = (20+vue+portee);
		var pmv = 3+Math.floor(portee/3);
		texte = 'Port�e horizontale : <b>'+pmh+'</b> cases<br/>'
			+'Port�e verticale : <b>'+pmv+'</b> cases<hr>'
			+'X compris entre '+(posX-pmh)+' et '+(posX+pmh)+'<br/>'
			+'Y compris entre '+(posY-pmh)+' et '+(posY+pmh)+'<br/>'
			+'N compris entre '+(posN-pmv)+' et '+Math.min(-1,posN+pmv)+'<br/>';
		}
	else if(sort.indexOf('Vampirisme')!=-1) {
		var modD = 0;
		texte = 'Attaque : <b>'+Math.floor(2*deg/3)+'</b> D6 ';
		if(pcA) {
			modD = parseInt(Math.floor(2*deg/3)*pcA/100);
			texte += '<i>'+aff(modD)+'D6</i> ';
			}
		texte += aff(attbmm)
			+' => <b>'+Math.round(3.5*(Math.floor(2*deg/3)+modD)+attbmm)+'</b><br/>'
			+'D�g�ts : <b>'+deg+'</b> D3 ';
		if(pcD) {
			modD = parseInt(deg*pcD/100);
			texte += '<i>'+aff(modD)+'D3</i> ';
			}
		else
			modD = 0;
		texte += aff(degbmm)
			+' => <b>'+(2*(deg+modD)+degbmm)+'/'+(2*(Math.floor(1.5*deg)+modD)+degbmm)
			+' ('+resiste(deg+modD,degbmm)+'/'+resiste(1.5*deg+modD,degbmm)+')</b>';
		}
	else if(sort.indexOf('Vision Accrue')!=-1)
		texte = decumul_buff('VA','Vue',Math.floor(vue/2));
	else if(sort.indexOf('Vision lointaine')!=-1)
		texte = 'En ciblant une zone situ�e n\'importe o� dans le '
			+'Monde Souterrain, votre Tr�ll peut voir comme s\'il s\'y trouvait.';
	else if(sort.indexOf('Voir le Cache')!=-1)
		texte = '<b>Sur soi :</b><br/>Port�e horizontale : <b>'
			+Math.min(5,getPortee(vue))+'</b> cases<hr>'
			+'<b>� distance :</b><br/>Port�e horizontale : <b>'
			+getPortee(vuetotale)+'</b> cases';
	else if(sort.indexOf('Vue Troublee')!=-1)
		texte = 'Port�e horizontale : <b>'+Math.min(1,vuetotale)+'</b> case<br/>'
			+'Vue : <b>-'+Math.floor(vue/3)+'</b>';
	return texte;
	}


/*---------------------------------- Main ------------------------------------*/

try {
	start_script(31);

	initAll();

	creerBulleVide();
	newStyleLink();
	setInfoDateCreation();
	setNextDLA();
	if(MZ_getValue('VUECARAC')=='true') { vueCarac(); }
	setLieu();
	setInfosPV();
	setInfosPxPi();
	setStabilite();
	setCurrentEsquive();
	setRatioKillDeath();
	setTotauxMagie();
	if(traitementTalents()) {
		setAnatrolliseur();
	}
	// Cette fonction modifie lourdement le DOM, � placer en dernier :
	if(race=='Kastar') { setAccel(); }
	saveProfil();
	displayScriptTime();
} catch(e) {
	avertissement("[MZ] Une erreur s'est produite.");
	window.console.error("[MZ] Erreur g�n�rale Profil",e);
}
