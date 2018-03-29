
var mz_ie = (window.attachEvent)? true:false;
if ("function" !== typeof addEvent) {
	if (mz_ie) {
		function addEvent(obj, typ, fn, sens) {
			obj["e"+typ+fn] = fn; obj[typ+fn] = function() {
				obj["e"+typ+fn]( window.event );
			}
			obj.attachEvent("on"+typ, obj[typ+fn] );
		}
	}
	else  {
		function addEvent(obj, typ, fn, sens) {
			obj.addEventListener(typ, fn, sens);
		}
	}
}

/* Utilisation de la gestion de l'enregistrement des données de
GreaseMonkey, avec partage entre scripts via le localStorage, par
Vapulabehemot (82169) 07/02/2017 */
// Correction Roule' pour les boolean, le JSON decode pose problème car MZ utilise JSON
// Nécessite la présence de @grant GM_getValue, @grant GM_deleteValue et @grant GM_setValue
function MY_getValue(key) {
	var v = window.localStorage.getItem(key);
	vGM = GM_getValue(key);
	if ((vGM == null)
		|| (v != null && v != vGM)){
		GM_setValue(key, v);
	} else if (v == null && vGM != null) {
		v = vGM;
		window.localStorage[key] = vGM;
	}
	return v;
}
function MY_removeValue(key) {
	GM_deleteValue(key);
	window.localStorage.removeItem(key);
}
function MY_setValue(key, val) {
	if (val === true)	// conversion des booléens en 0 ou 1 à cause du localStorage infoutu de gérer les booléens
		val = 1;
	else if (val === false)
		val = 0;
	try {
	GM_setValue(key, val);
	} catch(e) {
		window.console.log('[MZ ' + GM_info.script.version + '] MY_setValue echec GM_setValue(' + key + ', ' + val + ')');
	}
	try {
		window.localStorage[key] = val;
	} catch(e) {
		window.console.log('[MZ ' + GM_info.script.version + '] MY_setValue echec localStorage[' + key + '] = ' + val);
	}
}

function traceStack(e, sModule) {
	var version  = '';
	if (GM_info && GM_info.script && GM_info.script.version)
		version = ' ' + GM_info.script.version;
	sRet = '[MZ' + version + ']'
	if (sModule) sRet += ' {' + sModule + '}';
	try {
		if (e.message) sRet += ' ' + e.message;
	} catch (e2) {
		sRet += ' <exception acces message>';//+ e2.message;
	}
	try {
		if (e.stack) {
			var sStack = e.stack;
			// enlever les infos confidentielles
			sRet += "\n" + sStack.replace(/file\:\/\/.*gm_scripts/ig, '...');
		}
	} catch (e2) {
		sRet += ' <exception acces stack>'; // + e2.message;
	}
	return sRet;
}

/**********************
* glissière en mode objet 
* Roule 29/12/2016 à partir du code des trajets gowap doCallback_glissiere et Vapulabehemot
* Une glissière est un curseur permettant, par exemple de changer le zoom des cartes
*
* Usage:
*	gliss = new glissiere_MZ(ref, labelHTML, target, bDynamic);
*		ref : utilisé pour diversifier les IDs HTML
*		labelHTML : le label qui apparaît devant la glissière (peut contenir des balises HTML)
*		target : peut être de 3 types
*			- élément HTML : l'élément HTML à zoomer
*			- string : l'ID de l'élément à zoomer (qui doit exister au moment de la création de la glissière
*			- function : callback quand le curseur bouge
*		bDynamic : par défaut, le fonctionnement n'est pas dynamique (la callback est appellé au click)
*					dans le mode dynamique, la callback est appelée sur mouseMove
*		valDef : valeur par défaut si l'outil n'a jamais été utilisé
*		valMin, valMax : les valeurs entre lesquelles le curseur varie
*	autres méthodes
*		gliss.getElt();			// rend la div de la glissière (par exemple pour la positionner)
**********************/

function glissiere_MZ(ref, labelHTML, paramTarget, bDynamic, valDef, valMin, valMax) {
	try {
		var mouseDown = false;
		var div_gliss = document.createElement("div");	// la DIV mère
		div_gliss.id = "MZ_gliss_"+ref;
		var div_label = document.createElement("span");	// le label
		div_label.innerHTML = labelHTML;
		div_gliss.appendChild(div_label);
		div_gliss.className = "choix_zoom";
		var dessin = document.createElement("canvas");	// le dessin lui-même
		dessin.id = "MZ_gliss_dessin_"+ref;
		dessin.style.cursor = "pointer";
		dessin.width = 104;
		dessin.height = 12;
		dessin.style.marginLeft = '2px';
		dessin.style.marginRight = '2px';
		div_gliss.appendChild(dessin);
		var pourcent = document.createElement("span");	// le pourcentage
		pourcent.id = "MZ_gliss_pourcent_"+ref;
		var pourcent_text = document.createTextNode('');
		var previousVal;
		var flouPourCurseurDoubleFleche = (valMax - valMin) / 40;

		// alignement vertical
		dessin.style.verticalAlign = 'middle';
		div_label.style.verticalAlign = 'middle';
		pourcent.style.verticalAlign = 'middle';

		pourcent.appendChild(pourcent_text);
		div_gliss.appendChild(pourcent);

		var bulle_pourcent = document.createElement("div");	// la bulle
		bulle_pourcent.id = "MZ_gliss_bulle_"+ref;
		bulle_pourcent.style.display = 'block';
		bulle_pourcent.style.visibility = 'hidden';
		bulle_pourcent.style.position =  'absolute';
		bulle_pourcent.style.zIndex = 3500;
		bulle_pourcent.style.border = '1px solid  #a1927f';
		var bulle_pourcent_text = document.createTextNode('');
		bulle_pourcent.appendChild(bulle_pourcent_text);
		document.body.appendChild(bulle_pourcent);

		this.getElt = function() {return div_gliss;};

		////////////////////////////////////
		// dessine et redessine le curseur
		////////////////////////////////////
		var dessine_glissiere = function(val) {
			pos_0_100 = ((val - valMin) * 100) / (valMax - valMin);
			var ctx = dessin.getContext('2d');
			ctx.clearRect(0, 0,104, 12);
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillRect(0,0,2,12);
			ctx.fillRect(102,0,2,12);
			ctx.fillRect(0,5,104,2);

			ctx.fillStyle = "rgb(80,80,80)";
			ctx.fillRect(pos_0_100,0,5,12);
			ctx.fillStyle = "rgb(200,200,200)";
			ctx.fillRect(pos_0_100+1,1,3,10);
			pourcent_text.nodeValue = val+'%';
			previousVal = parseInt(val);
		};

		////////////////////////////////////
		// action sur mousedown et mousemove
		//		stocker la nouvelle valeur
		//		redessiner
		//		afficher la nouvelle valeur
		//		action selon ce qui a été demandé
		////////////////////////////////////
		var doCallback_glissiere = function (evt) {
			try {
				if (evt.type === 'mousedown') mouseDown = true;
				if (evt.offsetX) {
					var xsouris = evt.offsetX;
					var xpos = evt.clientX;
					var ypos = evt.clientY + document.body.scrollTop;
				}
				else {
					var xsouris = evt.layerX;
					var xpos = evt.pageX;
					var ypos = evt.pageY;
				}
				var val = Math.floor(Math.min(valMax,Math.max(valMin,((xsouris-1) * (valMax - valMin) / 100)+valMin)));
				dessin.style.cursor = (val <= (previousVal+flouPourCurseurDoubleFleche) && val >= (previousVal-flouPourCurseurDoubleFleche)) ? "e-resize":"pointer";
				//		afficher la nouvelle valeur dans la bulle
				bulle_pourcent_text.nodeValue = val + '%';
				bulle_pourcent.style.top = (ypos+3)+'px';
				bulle_pourcent.style.left = (xpos+16)+'px';
				if (evt.buttons === undefined) {
					// mode utilisant les evt mouseup/down (mauvaise méthode, utilisé si on ne peut pas faire autrement)
					if (!mouseDown) return;	// simple survol, on ne fait rien de plus
				} else {
					if (!(evt.buttons & 1)) return;	// simple survol, on ne fait rien de plus
				}
				//		stocker la nouvelle valeur
				MY_setValue("MZ_glissiere_" + ref, val);
				//		redessiner la glissière avec le curseur où il faut
				dessine_glissiere(val);
				//		action selon ce qui a été demandé
				//for(var key in evt) window.console.log('evt key ' + key + ' => ' + evt[key]);
				if ((!bDynamic) && (evt.type !== 'mousedown')) return;
				if (typeof paramTarget === 'object') {
					var elt = paramTarget;
				} else if (typeof paramTarget === 'string') {
					var elt = document.getElementById(paramTarget);
				} else if (typeof paramTarget === 'function') {
					paramTarget(val);
					return;
				}
				if (elt.setZoom != undefined) elt.setZoom(val);
			} catch (e) {window.console.log(traceStack(e, 'glissiere_MZ.doCallback'))}
		};

		////////////////////////////////////
		// event mousedown et mousemove : redessiner et callback
		////////////////////////////////////
		addEvent(dessin, "mousedown", doCallback_glissiere, true);
		addEvent(dessin, "mousemove", doCallback_glissiere, true);
		////////////////////////////////////
		// event mouseup : mémoriser mouseup (utile seulement si le navigateur ne supporte pas evt.buttons
		////////////////////////////////////
		addEvent(dessin, "mouseup", function() {mouseDown = false;}, true);
		////////////////////////////////////
		// event mouseout & mouseover : afficher/cacher la bulle
		////////////////////////////////////
		addEvent(dessin, "mouseout", function() {bulle_pourcent.style.visibility="hidden";}, true);
		addEvent(dessin, "mouseover", function() {bulle_pourcent.style.visibility="visible";}, true);

		////////////////////////////////////
		// dessiner la première fois
		////////////////////////////////////
		var val_init = MY_getValue("MZ_glissiere_" + ref);
		if (val_init === undefined) val_init = valDef;
		dessine_glissiere(val_init);
	} catch (e) {window.console.log(traceStack(e, 'glissiere_MZ'))}
}

// calcul du point intermédiaire de déplacement gowap (x et y uniquement)
// reçoit 2 objets avec des propriétés x et y
// rend un objet avec x et y (rend undefined si le trajet est direct)
function pointIntermediaireMonstre2D(locDepart, locArrivee) {
	var deltaX = locArrivee.x - locDepart.x;
	if (deltaX == 0) return; // pas de point intermédiaire
	var deltaY = locArrivee.y - locDepart.y;
	if (deltaY == 0) return; // pas de point intermédiaire
	var absDeltaX = Math.abs(deltaX);
	var absDeltaY = Math.abs(deltaY);
	if (absDeltaX > absDeltaY) {
		return {x: locDepart.x + Math.sign(deltaX) * Math.sign(deltaY) * deltaY, y: locArrivee.y};
	} else if (absDeltaY > absDeltaX) {
		return {x: locArrivee.x, y: locDepart.y + Math.sign(deltaX) * Math.sign(deltaY) * deltaX};
	} else {
		return;	// égalité, pas de point intermédiaire
	}
}

/**********************
* carte en mode objet 
* Roule 14/01/2017 à partir du code des trajets gowap de Vapulabehemot
*
* Usage:
*	carte = new carte_MZ(ref, tabDepl);
*		ref : utilisé pour diversifier les IDs HTML
*		tabDepl : table de tables d'objets contenant x, y et n (positions successives des différents suivants)
*		          pour l'affichage, le premier objet doit contenir nom et id (et typ pour des cibles particulières)
*	autres méthodes
*		carte.getElt();			// rend la div de la carte (par exemple pour la positioner dans la page)
**********************/

function carte_MZ(ref, tabDepl) {
	try {
		var div1_carte = document.createElement("div");	// la DIV mère. Elle prend toute la largeur
		div1_carte.id = "MZ_carte_"+ref;
		div1_carte.className = "mh_tdpage";	// le mh_tdpage sert à faire cacher la carte par les scripts trajet_gowap
		div1_carte.style.backgroundImage = 'none';
		div1_carte.style.backgroundColor = 'transparent';
		var div2_carte = document.createElement("div");	// la DIV mère. Elle prend toute la largeur
		div2_carte.className = "carte_MZ";
		div2_carte.style.display = 'inline-block';	// pour que la div ait la taille du contenu
		var dessin = document.createElement("canvas");	// le dessin lui-même
		dessin.id = "MZ_carte_dessin_"+ref;
		dessin.style.backgroundImage = 'url("/mountyhall/MH_Packs/packMH_parchemin/tableau/tableau1.jpg")';
		div1_carte.appendChild(div2_carte);
		div2_carte.appendChild(dessin);

		var position_trous_MZ = [[-70.5, -7.5, 2, 1.5, -69]	// x, y, ?, rayon du cercle, profondeur
			, [-66.5, -37.5, 2, 1.5, -69]
			, [-63.5, 8.5, 2, 1.5, -69]
			, [-59.5, -32.5, 2, 1.5, -69]
			, [-52, 57, 0.25, 0.8, -59]
			, [-50.5, -22.5, 2, 1.5, -69]
			, [-35.5, -51.5, 2, 1.5, -69]
			, [-34.5, 14.5, 2, 1.5, -69]
			, [-34.5, 64.5, 2, 1.5, -69]
			, [-11.5, 72.5, 2, 1.5, -69]
			, [5.5, -49.5, 2, 1.5, -69]
			, [5.5, 31.5, 2, 1.5, -69]
			, [10.5, 63.5, 2, 1.5, -69]
			, [12, -15, 0.25, 0.8, -59]
			, [21.5, 35.5, 2, 1.5, -69]
			, [30, -52, 0.25, 0.8, -59]
			, [46.5, 51.5, 2, 1.5, -69]
			, [48, -39, 0.25, 0.8, -59]
			, [55, 70, 0.25, 0.8, -59]	// correction Roule 10/10/2016 -59 au lieu de -69
			, [56.5, 23.5, 75, 8.7, -99]
			, [64, 70, 0.25, 0.8, -59]
			, [74.5, 31.5, 2, 1.5, -69]];

		var couleur_depl_normal = 'rgba(0,0,200,0.5)';
		var couleur_cible = 'rgba(0,0,0,0.5)';
		var couleur_depl_collision_trou = 'rgba(150,0,0, 0.5)';
		var couleur_trou = 'rgb(200,0,0)';

		var coord_x = function(val) {
			return decalh+coeff*(val+100);
		};
		var coord_y = function(val) {
			return decalv+coeff*(100-val);
		};

		var ctx = dessin.getContext('2d');
		var coeff = MY_getValue("MZ_glissiere_" + ref);	// ce qui a été sauvé précédement par la glissiere
		if (coeff) coeff /= 50;
		else       coeff = 2;
		var decalv=30, decalh=30;

		var detecteCollisionTrou = function (pos0, pos1) {	// fonction volée à feldspath et Vapulabehemot, merci à eux (voir calc_inter dans Trajet_Gowap)
			//var res = false
			var x0 = pos0.x;
			var y0 = pos0.x;
			var tmax = Math.max(Math.abs(pos1.x - pos0.x), Math.abs(pos1.y - pos0.y));
			var px = Math.sign(pos1.x - pos0.x);
			var py = Math.sign(pos1.y - pos0.y);
			var a = 0, b = 0, c = 0, delta = 0, t0 = 0, t1 = 0;
			//window.console.log('verif collision gowap-trou [x0=' + x0 + ',y0=' + y0 + ', px=' + px + ', py=' + py + ', tmax=' + tmax + ']');

			for(var k in position_trous_MZ) {
				a = parseFloat(px*px+py*py);
				b = parseFloat((x0-position_trous_MZ[k][0])*px+(y0-position_trous_MZ[k][1])*py);
				c = parseFloat((x0-position_trous_MZ[k][0])*(x0-position_trous_MZ[k][0])+(y0-position_trous_MZ[k][1])*(y0-position_trous_MZ[k][1])-position_trous_MZ[k][2]);
				delta = b*b-a*c
				if(delta >= 0) {
					t0 = Math.ceil(-b/a-Math.sqrt(delta)/a);
					t1 = Math.floor(-b/a+Math.sqrt(delta)/a);
					if(t0 <= tmax && t1 >= 0) {
						// Roule' 10/10/2016 J'ai déplacé le flag res=true à l'intérieur de la boucle for ci-dessous car il y avait de fausses détections
						//res = true;
						//window.console.log('***** collision gowap-trou [x0=' + x0 + ',y0=' + y0 + ', px=' + px + ', py=' + py + ', tmax=' + tmax + ']');
						for(var l=Math.max(0,t0); l<=Math.min(tmax,t1); l++) {
							//window.console.log('***** collision gowap-trou en ' + (x0+l*px) + ', ' + (y0+l*py));
							// Roule : pas utile pour nous
							//res = true;
							//chute.push([x0+l*px, y0+l*py]);
							return true;
						}
					}
				}
			}
			//return res;
			return false;
		};

		var dessine_carte = function () {
			dessin.width = 200*coeff+2*decalh;
			dessin.height = 200*coeff+2*decalv;

			//repere
			ctx.beginPath();
			ctx.moveTo(coord_x(0), coord_y(100));
			ctx.lineTo(coord_x(0), coord_y(-100));
			ctx.moveTo(coord_x(-100), coord_y(0));
			ctx.lineTo(coord_x(100), coord_y(0));
			ctx.stroke();
			ctx.strokeRect(coord_x(-100), coord_y(100), coord_x(100) - coord_x(-100), coord_y(-100) - coord_y(100));

			//trous
			ctx.fillStyle = couleur_trou;
			for(var i in position_trous_MZ) {
				ctx.beginPath();
				ctx.arc(coord_x(position_trous_MZ[i][0]), coord_y(position_trous_MZ[i][1]), coeff*position_trous_MZ[i][3], 0, Math.PI*2,  true);
				ctx.fill();
			}
			// trajets
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			for (var iSuivant in tabDepl) {
				//window.console.log('carte_MZ, suivant n°' + iSuivant);
				var tabDeplOneSuivant = tabDepl[iSuivant];
				var x0 = coord_x(tabDeplOneSuivant[0].x);
				var y0 = coord_y(tabDeplOneSuivant[0].y);
				// La "cible" au départ
				var typeDepart = tabDeplOneSuivant[0].typ;
				switch (typeDepart) {
					case 'tp':
						ctx.beginPath();
						ctx.lineWidth = 2;
						ctx.strokeStyle = couleur_cible;
						ctx.fillStyle = couleur_cible;
						ctx.moveTo(x0 + coeff * 3, y0 + coeff * 3);
						ctx.lineTo(x0 + coeff * 3, y0 - coeff * 3);
						ctx.lineTo(x0 - coeff * 3, y0 - coeff * 3);
						ctx.lineTo(x0 - coeff * 3, y0 + coeff * 3);
						ctx.lineTo(x0 + coeff * 3, y0 + coeff * 3);
						ctx.moveTo(x0 + coeff * 3, y0);
						ctx.lineTo(x0 - coeff * 3, y0);
						ctx.moveTo(x0, y0 + coeff * 3);
						ctx.lineTo(x0, y0 - coeff * 3);
						ctx.stroke();
						break;
					default:
						ctx.beginPath();
						ctx.lineWidth = 1;
						ctx.strokeStyle = couleur_cible;
						ctx.fillStyle = couleur_cible;
						ctx.arc(x0, y0, coeff * 4, 0, Math.PI*2,  true);
						ctx.moveTo(x0 + coeff * 4, y0);
						ctx.lineTo(x0 - coeff * 4, y0);
						ctx.moveTo(x0, y0 + coeff * 4);
						ctx.lineTo(x0, y0 - coeff * 4);
						ctx.stroke();
						break;
				}
				// les segments
				var nb_pts = tabDeplOneSuivant.length;
				var pointPrecedent = tabDeplOneSuivant[0];
				for (var i=1; i<nb_pts; i++) {
					ctx.beginPath();
					ctx.lineWidth = coeff;
					ctx.moveTo(coord_x(pointPrecedent.x), coord_y(pointPrecedent.y));
					ctx.strokeStyle = couleur_depl_normal;
					var pointIntermediaire = pointIntermediaireMonstre2D(pointPrecedent, tabDeplOneSuivant[i]);
					if (pointIntermediaire === undefined) {
						if (detecteCollisionTrou(pointPrecedent, tabDeplOneSuivant[i]))
							ctx.strokeStyle = couleur_depl_collision_trou;
						else
							ctx.strokeStyle = couleur_depl_normal;
						ctx.lineTo(coord_x(tabDeplOneSuivant[i].x), coord_y(tabDeplOneSuivant[i].y));
					} else {
						if (detecteCollisionTrou(pointPrecedent, pointIntermediaire)
								|| detecteCollisionTrou(pointIntermediaire, tabDeplOneSuivant[i]))
							ctx.strokeStyle = couleur_depl_collision_trou;
						else
							ctx.strokeStyle = couleur_depl_normal;
						ctx.lineTo(coord_x(pointIntermediaire.x), coord_y(pointIntermediaire.y));
						ctx.lineTo(coord_x(tabDeplOneSuivant[i].x), coord_y(tabDeplOneSuivant[i].y));
					}
					pointPrecedent = tabDeplOneSuivant[i];
					ctx.stroke();
				}
				// Les points à chaque étape
				ctx.fillStyle = couleur_depl_normal;
				for (var i=1; i<nb_pts; i++) {
					ctx.beginPath();
					var x = coord_x(tabDeplOneSuivant[i].x);
					var y = coord_y(tabDeplOneSuivant[i].y);
					ctx.arc(x, y, coeff, 0, Math.PI*2,  true);
					ctx.fill();
				}
			}
		}

		this.setZoom = function (val) {
			ctx.clearRect(0, 0, dessin.width, dessin.height);
			coeff = val / 50;
			dessine_carte();
		}

		// glissiere
		var gliss = new glissiere_MZ(ref, "Zoom\u00A0:", this, true, 100, 50, 200);
		var eGliss = gliss.getElt();
		eGliss.style.position = 'absolute';
		eGliss.style.top = (coeff * 2) + 'px';
		eGliss.style.left = decalh + 'px';
		dessin.style.position = 'relative';
		div2_carte.style.position = 'relative';
		eGliss.style.zIndex = 9000;
		div2_carte.appendChild(eGliss);

		// affichage au survol de la souris
		var bulle = document.createElement('div');
		bulle.style.visibility = 'hidden';
		bulle.style.position = 'absolute';
		bulle.style.zIndex = 3100;
		bulle.style.border = 'solid 1px #a1927f';
		bulle.className = 'mh_tdpage';
		bulle.style.display = 'block';	// ATTENTION, display doit être après className pour forcer le display
		var bulleHaut = document.createElement('div');
		bulleHaut.style.display = 'block';
		bulleHaut.style.paddingRight = '3px';
		bulleHaut.className = 'mh_tdtitre';
		bulleHaut.appendChild(document.createTextNode(' '));	// prépare texte
		bulle.appendChild(bulleHaut);
		var bulleBas = document.createElement('div');
		bulleBas.style.display = 'block';
		bulleBas.style.whiteSpace = "nowrap";
		bulleBas.style.paddingRight = '3px';

		//bulleBas.appendChild(document.createTextNode(' '));	// prépare texte
		bulle.appendChild(bulleBas);
		div2_carte.appendChild(bulle);
		var affichePosition = function(evt) {
			if (evt.offsetX) {
				var xsouris = evt.offsetX;
				var ysouris = evt.offsetY;
				var xpos = evt.clientX;
				var ypos = evt.clientY + document.body.scrollTop;
			}
			else {
				var xsouris = evt.layerX;
				var ysouris = evt.layerY;
				var xpos = evt.pageX;
				var ypos = evt.pageY;
			}
			var xUser = Math.round(((xsouris - decalh) / coeff) - 100);// l'inverse de decalh+coeff*(val+100);
			var yUser = Math.round(100-((ysouris - decalv) / coeff));// l'inverse de decalv+coeff*(100-val);
			bulleHaut.firstChild.nodeValue = 'x=' + xUser + ', y=' + yUser;
			var tabHTMLbas = [];
			// message pour les trous
			for (var i in position_trous_MZ) {
				var ceTrou = position_trous_MZ[i];
				var dist = (xUser-ceTrou[0])*(xUser-ceTrou[0])+(yUser-ceTrou[1])*(yUser-ceTrou[1])-ceTrou[2];
				if(dist <= 0) {
					tabHTMLbas.push("Trous de Météorite : n=-1 -> n="+ceTrou[4]);
					break;
				}
			}
			// messages pour les suivants
			for (var i in tabDepl) {
				var ceGowap = tabDepl[i][0];	// position courante du suivant
				if (Math.abs(xUser - ceGowap.x) < 3 && Math.abs(yUser - ceGowap.y) < 3)
					tabHTMLbas.push('(' + ceGowap.x + ', ' + ceGowap.y + ', ' + ceGowap.n + ') ' + ceGowap.id + ' ' + ceGowap.nom);
			}
			bulleBas.innerHTML = tabHTMLbas.join('<br />');
			bulle.style.top = (ysouris+8) + 'px';
			bulle.style.left = (xsouris+16) + 'px';
		};
		addEvent(dessin, "mousemove", affichePosition, true);
		addEvent(dessin, "mouseout", function() { bulle.style.visibility = 'hidden' }, true);
		addEvent(dessin, "mouseover",  function() { bulle.style.visibility = 'visible' }, true);

		// dessin initial
		dessine_carte();

		this.getElt = function() {return div1_carte;};

	} catch (e) {window.console.log(traceStack(e, 'carte_MZ'))}
}

