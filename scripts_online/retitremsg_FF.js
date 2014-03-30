/*******************************************************************************
*    This file is part of Mountyzilla, distributed under License GNU-GPL2.     *
*    More information on : http://mountyzilla.tilk.info/                       *
*******************************************************************************/

/* Script de remplacement des "Re" multiples avec gestion des [balises]
 * Merci � Dingar et Cenairdsvoum pour les scripts originaux.
 *
 * v3.1 - 2014-03-04 by Dabihul
 * - m�j pour migration vers Git
 */

function chopelabaliseettuelesre() {
	titreMess = document.evaluate("//input[@name='Titre']",
		document, null, 9, null).singleNodeValue;
	if(!titreMess || !titreMess.value) return;
	
	/* traitement des "Re : " de base */
	var str = titreMess.value;
	var numdere = str.match(/R[eE] : ?/g).length;
	str = str.replace(/R[eE] : ?/g,'');
	/* traitement des "Re(n) : " */
	var tabrenum = str.match(/Re\(\d+\) : ?/g);
	if (tabrenum!=null) {
		for (var i=0 ; i<tabrenum.length ; i++)
			numdere += Number(tabrenum[i].match(/\d+/));
		str = str.replace(/R[eE]\(\d+\) : ?/g,'');
		}
	
	/* Correction des espaces multiples dus � l'autre script */
	str = str.replace(/^\s+/g,'');
	
	/* R�cup�ration de l'eventuelle balise en d�but de titre */
	var balise = str.match(/^\[.*\] ?/);
	
	/* Cr�ation du nouveau titre */
	if (numdere==1)
		str = 'Re : '+str;
	else
		str = 'Re('+numdere+') : '+str;
	if (balise!=null)
		str = balise+str.replace(balise,'');
	titreMess.value = str;
	}

chopelabaliseettuelesre();
