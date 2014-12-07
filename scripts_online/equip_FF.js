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

/**
 * 2014-02-08 - v2.0a (from scratch)
 * 2014-02-18 - v2.0a0
 * - ajout calcul Carats / UM des minerais + totaux
 * 2014-03-06 - v2.0a1
 * - retour Infos EM des Champis
 * TODO
 * Ces fonctions sont dev ici en test, à terme elles seront à intégrer dans libs
 */

function traiteChampis() {
	try {
		var tr = document.getElementById('mh_objet_hidden_Champignon');
		var tbody = document.evaluate(
			"./td/table/tbody", tr, null, 9, null
		).singleNodeValue;
	} catch(e) {
		console.warn('[MZ Equip traiteChampis] Erreur initialisation\n'+e);
		return;
	}
	insererInfosChampisEM(tbody,3);
}

function traiteCompos() {
	try {
		var tr = document.getElementById('mh_objet_hidden_Composant');
		var tbody = document.evaluate(
			"./td/table/tbody", tr, null, 9, null
		).singleNodeValue;
	} catch(e) {
		console.warn('[MZ Equip traiteCompos] Erreur initialisation\n'+e);
		return;
	}
	insererInfosEM(tbody,3);
}

function traiteMinerai() {
	try{
		var tr = document.getElementById('mh_objet_hidden_Minerai');
		var trList = document.evaluate('./td/table/tbody/tr', tr, null, 7, null);
	}
	catch(e){ return; }
	if(trList.length<=0) { return; }
	var totaux = {};
	var str;
	for(var i=0 ; i<trList.snapshotLength ; i++) {
		var node = trList.snapshotItem(i);
		var nature = node.childNodes[7].textContent,
			caracs = node.childNodes[9].textContent;
		var taille = Number(caracs.match(/\d+/));
		var coef = 1;
		if(caracs.indexOf('Moyen')!=-1) { coef = 2; }
		else if(caracs.indexOf('Normale')!=-1) { coef = 3; }
		else if(caracs.indexOf('Bonne')!=-1) { coef = 4; }
		else if(caracs.indexOf('Exceptionnelle')!=-1) { coef = 5; }
		if(nature.indexOf('Mithril')!=-1) {
			coef = 2*coef;
			str = ' | UM: ';
		}
		else {
			coef = 7.5*coef+12.5;
			if(nature.indexOf('Taill')!=-1) { coef = 1.15*coef; }
			str = ' | Carats: ';
		}
		var carats = Math.round(taille*coef)/10;
		appendText(node.childNodes[9], str+carats );
		if(!totaux[nature]) {
			totaux[nature] = [taille,carats];
		}
		else {
			totaux[nature][0] += taille;
			totaux[nature][1] += carats;
		}
	}
	str = 'Total : ';
	for(var nature in totaux) {
		if(str.length>8) str += ', ';
		if(nature.indexOf('Mithril')!=-1) {
			str += nature+totaux[nature][1]+' UM';
		}
		else {
			str += nature+totaux[nature][0]+'U/'
				+totaux[nature][1]+'c';
		}
	}
	/*var node = document.getElementById('mh_plus_Minerai');
	var titre = document.evaluate("./td[contains(./b/text(),'Minerai')]",
		node.parentNode.parentNode.parentNode, null, 9, null).singleNodeValue;
	if(!titre) return;*/
	// Il faut préalablement injecter du CSS pour ne pas hériter de 'mh_titre3'
	var td = appendTdText(trList.snapshotItem(0).parentNode, '('+str+')');
	td.colSpan = 7;
}


start_script();

traiteChampis();
traiteCompos();
traiteMinerai();

displayScriptTime();
