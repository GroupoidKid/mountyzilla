/*********************************************************************************
*    This file is part of Mountyzilla.                                           *
*                                                                                *
*    Mountyzilla is free software; you can redistribute it and/or modify         *
*    it under the terms of the GNU General Public License as published by        *
*    the Free Software Foundation; either version 2 of the License, or           *
*    (at your option) any later version.                                         *
*                                                                                *
*    Mountyzilla is distributed in the hope that it will be useful,              *
*    but WITHOUT ANY WARRANTY; without even the implied warranty of              *
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               *
*    GNU General Public License for more details.                                *
*                                                                                *
*    You should have received a copy of the GNU General Public License           *
*    along with Mountyzilla; if not, write to the Free Software                  *
*    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA  *
*********************************************************************************/

/* v0.2 by Dab - 2013-08-20
 * - patch d�gueu pour g�rer la d�composition P/M de l'armure
 */

var pageDispatcher = "http://mountypedia.ratibus.net/mz/cdmdispatcher.php";
//var pageDispatcher = "http://nocmh.free.fr/scripts/cdmCollecteur.php";
//var pageCdmRecord = "http://nocmh.free.fr/scripts/cdmCollecteur.php";
//var pageEffetDispatcher = "http://mountypedia.ratibus.net/mz/effetdispatcher.php";
var buttonCDM;

/*******************************************************************************************
CDM :
Vous avez R�USSI � utiliser cette comp�tence au niveau 5 : jet de 34 sur 95 %.

Il ne vous est pas possible d'am�liorer cette comp�tence.

Le Monstre Cibl� fait partie des : Mort-Vivant (Archi-N�cromant [Antique] - N�4571589)
Niveau :	Inimaginable (entre 49 et 51)
Points de Vie :	Surtrollesque (entre 450 et 470)
Blessure (Approximatif) :	0 %	
D�s d'Attaque :	Impressionnant (entre 30 et 32)
D�s d'Esquive :	Impressionnant (entre 28 et 30)
D�s de D�gat :	Tr�s Fort (entre 18 et 20)
D�s de R�g�n�ration :	Excellent (�gal � 13)
Armure Physique :	Moyen (entre 10 et 12)
Armure Magique :	Faible (inf�rieur � 6)
Vue :	Moyen (entre 9 et 11)
Maitrise Magique :	Inimaginable (sup�rieur � 6000)
R�sistance Magique :	Inimaginable (sup�rieur � 6000)
Nombre d'attaques :	1
Vitesse de D�placement :	Normale
Voir le Cach� :	Oui
Attaque � distance :	Non
Attaque magique :	Oui
Vole :	Non
Sang froid :	Inexistant
DLA :	Milieu
Dur�e Tour :	Remarquable (entre 9 et 11)
Chargement :	Vide
Bonus Malus :	Aucun

Vous avez �galement gagn� 1 PX pour la r�ussite.
*******************************************************************************************
BOT :
Vous avez utilis� CONNAISSANCE DES MONSTRES sur un Capitan Ronfleur [Naissant] (4768960)

Le Monstre cibl� fait partie des : Mort-Vivant

Niveau : Incroyable (entre 36 et 38)
*******************************************************************************************/

function getNNInt(str) {
	var nbrs = str.match(/\d+/g);
	for (var i=0 ; i<nbrs.length ; i++)
		nbrs[i] = parseInt(nbrs[i]);
	return nbrs;
	}

function sendCDM() {
	var td = document.evaluate("//td/text()[contains(.,'fait partie')]/..",
								document, null, 9, null).singleNodeValue;
	cdm = td.innerHTML;
	cdm = cdm.replace(/.* MONSTRES sur une? ([^(]+) \(([0-9]+)\)(.*partie des : )([^<]+)<br>/,
						"$3$4 ($1 - N�$2)<br>");
	cdm = cdm.replace(/Blessure :[\s]*[0-9]+ % \(approximativement\)/,
						'Blessure : XX % (approximativement)');
	// Supprime la d�composition P/M de l'Armure
	var bgn = cdm.indexOf('Armure Physique');
	if (bgn!=-1) {
		var end = cdm.indexOf('Vue')-2;
		var lines = cdm.substring(bgn,end).split('<br>');
		var armp = getNNInt(lines[0]);
		var armm = getNNInt(lines[1]);
		if (lines[0].indexOf('(inf')!=-1)
			armp = [0,armp[0]];
		if (lines[1].indexOf('(inf')!=-1)
			armm = [0,armm[0]];
		var insrt = 'Armure : ';
		if (lines[0].indexOf('(sup')!=-1 || lines[1].indexOf('(sup')!=-1)
			insrt += 'adj (sup�rieur � '+(armp[0]+armm[0]);
		else
			insrt += 'adj (entre '+(armp[0]+armm[0])+' et '+(armp[1]+armm[1]);
		cdm = cdm.replace(cdm.substring(bgn,end),insrt+')<br>');
		}
	cdm = cdm.replace(/<br>/g,'\n');
	
	FF_XMLHttpRequest({
				method: 'GET',
				url: pageDispatcher+'?cdm='+escape(cdm),
				headers : {
					'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml'
					},
				onload: function(responseDetails) {
					buttonCDM.value=responseDetails.responseText;
					buttonCDM.disabled = true;
					}
				});
	}

function traiteCdM() {
	// Teste si ce message du bot est un message de CdM
	var td = document.evaluate("//td/text()[contains(.,'fait partie')]/..",
								document, null, 9, null).singleNodeValue;
	if (!td) return false;
		
	cdm = td.innerHTML;
		
	// Insertion de l'estimation des PV restants
	var des = cdm.indexOf('D�s');
	var pv = cdm.slice(cdm.indexOf('Points de Vie'),cdm.indexOf('Blessure'));
	pv = getPVsRestants(pv, cdm.slice(cdm.indexOf('Blessure :'),des) );
	if(pv)
		td.innerHTML = cdm.slice(0,des-4)+'<br />'+(pv[0]+pv[1]) + cdm.substring(des-4);

	// Insertion bouton envoi + espace
	buttonCDM = insertButtonCdm('bClose',sendCDM);
	}

/*function traitePouvoir() {
	// Teste si ce message du bot est un message de CdM
	// le test "capa" �vite les pouvoirs type Chonchon (pas de SR)
	var td = document.evaluate("//td/text()[contains(.,'POUVOIR')]/../text()[contains(.,'capacit� sp�ciale')]/..",
			document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (!td)
		return false;
		
	var infos = td.innerHTML;
	var id = /monstre n�([0-9]+) /.exec(infos)[1];
	var nomMonstre = /\(une? ([^)]+)\)/.exec(infos)[1];
	var nomPouvoir = /sp�ciale : ([^<]+)/.exec(infos)[1];
	var date = /alors : ([^<]+)\./.exec(infos)[1];
	date = new Date(date.replace(/([0-9]+)\/([0-9]+)\//,"$2/$1/"));
	var effetPouvoir="";
	var full=false;
	if(infos.indexOf("REDUIT")!=-1) {
		effetPouvoir = /effet REDUIT : ([^<]+)/.exec(infos)[1];
		}
	else {
		effetPouvoir = /effet : ([^<]+)/.exec(infos)[1];
		full=true;
		}
	var dureePouvoir = /dur�e de ([0-9]+)/.exec(infos)[1];
	// On ins�re le bouton et un espace
	//var url = pageEffetDispatcher + "?pouv="+escape(nomPouvoir)+"&monstre="+escape(nomMonstre)+"&id="+escape(id)+"&effet="+escape(effetPouvoir)+"&duree="+escape(dureePouvoir)+"&date="+escape(Math.round(date.getTime()/1000));
	// ce type d'URL est obsol�te (se fait par msgId dor�navant)
	if(!MZ_getValue('AUTOSENDPOUV'))
	{
		var button = insertButtonCdm('bClose',null,"Collecter les infos du pouvoir");
		button.setAttribute("onClick", "window.open('" + url
				+ "', 'popupEffet', 'width=400, height=240, toolbar=no, status=no, location=no, resizable=yes'); "
				+ "this.value='Merci de votre participation'; this.disabled = true;");
	}
	else
	{
		FF_XMLHttpRequest({
				method: 'GET',
				url: url,
				headers : {
					'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml'
				}});
	}
}*/

traiteCdM();
//traitePouvoir(); m�thode d'envoi obsol�te et gestion inconnue niveau DB
