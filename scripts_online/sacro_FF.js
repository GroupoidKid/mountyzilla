/*******************************************************************************
*    This file is part of Mountyzilla, distributed under License GNU-GPL2.     *
*    More information on : http://mountyzilla.tilk.info/                       *
*******************************************************************************/

/* 2014-03-04 - v4.1 by Dabihul
 * - mise à jour + correction de la version intégrée vers la version 4.0
 */

var input, listesac, optibutton, zonecalc, sacmax;
var Optimiser = MZ_getValue('SacroOptimal');

function refreshPertePV() {
	/* Màj des PV perdus en fonction des PV sacrifiés */
	var soin;
	if(Optimiser)
		soin = listesac.value;
	else
		soin = input.value;
	if(!soin)
		soin = 0;
	
	soin = Number(soin);
	var nbD = Math.floor(soin/5)+1;
	
	zonecalc.innerHTML =
		'Points de Vie perdus : entre '+(soin+nbD)+' et '+(soin+3*nbD)
		+' (moyenne : '+(soin+2*nbD)+')';
	}

function switchOptimiser() {
	/* Bascule entre les deux modes */
	Optimiser = (!Optimiser);
	MZ_setValue('SacroOptimal',Optimiser);
	if(Optimiser) {
		optibutton.value = 'Mode Normal';
		var i = Math.floor((Number(input.value)-4)/5);
		listesac.selectedIndex = i ? Math.max(i,0) : 0;
		input.setAttribute('name','zip');
		listesac.setAttribute('name','ai_NbPV');
		input.parentNode.replaceChild(listesac,input);
		refreshPertePV();
		}
	else {
		optibutton.value = 'Optimiser!';
		input.value = Number(listesac.value);
		listesac.setAttribute('name','none');
		input.setAttribute('name','ai_NbPV');
		listesac.parentNode.replaceChild(input,listesac);
		refreshPertePV();
		}
	}

function initCalculSacro() {
	/* Initialisation affichage PV perdus */
	var inode = document.evaluate("//div/i/text()[contains(.,'Chaque')]/..",
		document, null, 9, null).singleNodeValue;
	zonecalc = document.createElement('span');
	zonecalc.innerHTML = 'Points de Vie perdus : entre 1 et 3 (moyenne : 2)';
	var ligne = document.createElement('b');
	ligne.appendChild(zonecalc);
	inode.removeChild(inode.firstChild);
	insertBefore(inode,ligne);
	
	input = document.getElementsByTagName('input')[2];
	input.onkeyup = refreshPertePV;
	
	/* Préparation mode Optimiser */
	sacmax = document.evaluate("//div/i/text()[contains(.,'soin')]",
		document, null, 9, null).singleNodeValue.nodeValue.match(/\d+/);
	listesac = document.createElement('select');
	listesac.className = 'SelectboxV2';
	var sac = 4;
	while(sac<=sacmax) {
		appendOption(listesac,sac,sac);
		sac += 5;
		}
	if(!listesac.firstChild)
		appendOption(listesac,sacmax,sacmax);
	listesac.onmousemove = refreshPertePV;
	
	/* Bouton changement de mode */
	optibutton = appendButton(inode.parentNode,'Optimiser!',switchOptimiser);
	if(Optimiser) {
		Optimiser = false;
		switchOptimiser();
		}
	}

initCalculSacro();
