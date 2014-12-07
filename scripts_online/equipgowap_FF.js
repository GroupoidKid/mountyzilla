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

function traiteCompos() {
	try {
		// On recherche les divs contenant des composants
		var tbodyCompos = document.evaluate(
			".//div[contains(@id,'_hidden_Composant')]/table/tbody",
			document, null, 7, null
		);
	} catch(e) {
		console.warn('[MZ equipgowap] Aucun compo récupéré');
		return;
	}
	for(var i=0 ; i<tbodyCompos.snapshotLength ; i++) {
		var tbody = tbodyCompos.snapshotItem(i);
		if(MZ_getValue('NOINFOEM')!='true') {
			insererInfosEM(tbody);
		}
		/* DEBUG: Désactivé en attendant la révision des enchantements */
		/*if(MZ_getValue(numTroll+".enchantement.liste")
			&& MZ_getValue(numTroll+".enchantement.liste")!="")
			insertEnchantInfos(tbody);*/
	}
}

function traiteChampis() {
	if(MZ_getValue("NOINFOEM")=="true") {
		return;
	}
	try {
		var tbodyChampis = document.evaluate(
			".//div[contains(@id,'_hidden_Champi')]/table/tbody",
			document, null, 7, null
		);
	} catch(e) {
		console.warn('[MZ equipgowap] Aucun champignon récupéré');
		return;
	}
	for(var i=0 ; i<tbodyChampis.snapshotLength ; i++) {
		var tbody = tbodyChampis.snapshotItem(i);
		if(MZ_getValue('NOINFOEM')!='true') {
			insererInfosChampisEM(tbody);
		}
	}
}

start_script();

traiteCompos();
traiteChampis();
/* DEBUG: Désactivé en attendant la révision des enchantements */
/*if(MZ_getValue(numTroll+".enchantement.liste") && MZ_getValue(numTroll+".enchantement.liste")!="" )
{
	initPopup();
	computeEnchantementEquipement(createPopupImage,formateTexte);
}*/

displayScriptTime();
