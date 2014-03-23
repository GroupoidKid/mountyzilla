libs_FF.js
==========

C'est la bibliothèque universelle de fonctions de MountyZilla. Elle est chargée systématiquement sur toutes les pages du jeu.


## Variables globales
* **MZimg**  
Url racine des icônes utilisées par MountyZilla
* **numTroll, nivTroll, mmTroll, rmTroll**  
Respectivement numéro, niveau, MM et RM du trõll actuellement joué.
Ces données sont mises à jour lors de la connexion, MM & RM peuvent donc ne pas être tout à fait à jour.
* **date_debut**  
Date générée par la fonction `start_script`.
Généralement, correspond à la date à laquelle un script est lancé.
* **numQualite, qualiteNum**    
Objets js permettant de convertir une qualité de compo en son indice (et réciproquement) suivant la correspondance :  
Très Mauvaise = 1  
Mauvaise = 2  
Moyenne = 3  
Bonne = 4  
Très Bonne = 5
* **nival**  
Objet js fournissant le niveau (de base, i.e. sans templates) des monstres du jeu.
E.g. `nival['Cube Gelatineux']==32`.
(La clé doit être nettoyée de ses éventuels caractères non ASCII.)
* **tabEM**  
Objet js fournissant les informations EM des monstres, suivant la structure :
```javascript
	monstre: [compo exact, sort, position, localisation]
```
* **mundiChampi**  
Objet js fournissant le mundidey EM des champignons.
E.g. `mundiChampi['Bolet Péteur']=='du Démon'`.
* **arrayTalents**  
Objet js contenant les codes mémoire utilisés par MZ pour stocker les talents.
E.g. `arrayTalents['Ecriture Magique']=='EM'`.
(La clé doit être nettoyée de ses éventuels caractères non ASCII.)
* **listeTitres** ___!!___  
Liste des éléments gérés par MZ dans les CdM des monstres.
Ne devrait logiquement pas être une variable globale...
* **listeMonstreEnchantement, listeEquipementEnchantement, listeInfoEnchantement** ___!!___  
???
Ne devraient logiquement pas être des variables globales...
* **c**  
Matrice des coefficients binomiaux déjà calculés.
Évite de répéter des calculs et permet d'accélérer le calcul d'autres coefficients binomiaux.
* **coeff**  
??? Matrice de coefficients d'une loi triangulaire ?
* **tagPopup, nbTagFile, nbTagFileAnalyzed, infoTagTrolls, infoTagGuildes**  
??? Variables liées aux tags


## Fonctions de durée de script
* **function start_script(nbJours_exp)**  
Génère une date de début de script stockée dans la variable globale `date_debut`.
Si `nbJours_exp` est précisé crée une date d'expiration située dans ce nombre de jours.
* **function displayScriptTime()**  
Affiche dans le footer de la page la durée écoulée depuis `date_debut` (initialisée par `start_script`).


## Insertion de scripts
* **function isPage(url)**  
Retourne `true` si la page actuelle est la page `url` du serveur MH renseigné dans MZ, `false` sinon.
* **function chargerScript(script)**  
Si `script` est une chaîne commençant par `http://`, charge le script `script`.
Sinon, charge le script MZ nommé `script`.
* **function addScript(src)** ___WARNING: susceptible de disparaître___  
_!? lancée par `attaque_FF.js` uniquement_
* **function appendNewScript(src,paren)** ___WARNING: OBSOLETE___  
_!! n'est utilisé nulle part dans MZ_


## Modifications du DOM
___WARNING___ L'utilisation des attributs `name` dans MZ est appelée à disparaître (sauf là où elle est indispensable). Préférez l'utilisation d'attributs `id`.

* **function insertBefore(next,el)**  
Insère l'élément `el` avant le noeud `next`.
* **function appendTr(tbody,clas)**  
Ajoute un `tr` à la fin de `tbody`. Si spécifié, la classe du `tr` est `clas`.
Retroune ce `tr`.
* **function insertTr(next,clas)**  
Insère un `tr` avant le noeud `next`. Si spécifié, la classe du `tr` est `clas`.
Retroune ce `tr`.
* **function appendTd(tr)**  
Ajoute un `td` à la fin de `tr`.
Retroune ce `tr`.
* **function insertTd(next)**  
Insère un `td` avant le noeud `next`.
Retroune ce `td`.
* **function appendTdCenter(tr,colspan)**  
Ajoute à la fin de `tr` un `td` d'attribut `td.align=center`.
Si spécifié, le colSpan du `td` est `colspan`.
Retroune ce `td`.
* **function insertTdElement(next,el)**  
Insère un `td` contenant l'élément `el` avant le noeud `next`.
Retroune ce `td`.
* **function appendText(paren,text,bold)**  
Ajoute à la fin de `paren` le texte `text` à la fin de `paren`.
Si `bold` est évalué à `true`, alors le texte est en gras.
* **function insertText(next,text,bold)**  
Insère le texte `text` avant le noeud `next`.
Si `bold` est évalué à `true`, alors le texte est en gras.
* **function appendTdText(tr,text,bold)**  
Ajoute à la fin de `paren` un `td` contenant le texte `text`.
Si `bold` est évalué à `true`, alors le texte est en gras.
Retroune ce `td`.
* **function insertTdText(next,text,bold)**  
Insère un `td` contenant le texte `text` avant le noeud `next`.
Si `bold` est évalué à `true`, alors le texte est en gras.
Retroune ce `td`.
* **function appendBr(paren)**  
Ajoute un saut de ligne à la fin de `paren`.
* **function insertBr(next)**  
Insère un saut de ligne avant le noeud `next`.
* **function appendLI(ul,text)**  ___WARNING: susceptible d'être déplacé dans `options_FF.js`___  
Ajoute un `li` contenant le texte `text` à la fin de `ul`.
Retourne ce `li`.
* **function appendTextbox(paren,type,nam,size,maxlength,value)**  
Ajoute à la fin de `paren` une textbox de classe `TextboxV2` (standard MH) avec les attributs spécifiés (`nam` est affecté comme name _et_ comme id).
Retourne cette textbox.
* **function appendCheckBox(paren,nam,checked,onClick)**  
Ajoute à la fin de `paren` une checkbox de name et d'id valant `nam`.
Si `checked` est spécifié, l'état de la checkbox est `checked`.
Si une fonction `onClick` est spécifiée, elle est ajoutée comme listener onclick.
* **function appendNobr(paren,id,delgg,text)**  ___WARNING: FUCKIN' OBSOLETE___  
Pas besoin de préciser d'aide, sera viré de MZ _dès que possible_.
* **function appendOption(select,value,text)**  
Ajoute au menu déroulant `select` une `option` de valeur `value` et de texte `text`.
Retourne cette `option`.
* **function appendHidden(form,nam,value)**  
Ajoute au formulaire `form` un `input` de type `hidden` de valeur `value` ayant pour name et id `nam`.
* **function appendButton(paren,value,onClick)**  
Ajout à la fin de `paren` un bouton de classe `mh_form_submit` (standard MH) et de valeur `value`.
La fonction `onClick` est requise et ajoutée comme listener onclick.
* **function insertButton(next,value,onClick)**  
Insère avant le noeud `next` un bouton de classe `mh_form_submit` (standard MH) et de valeur `value`.
La fonction `onClick` est requise et ajoutée comme listener onclick.
* **function appendSubmit(paren,value,onClick)**  
Ajout à la fin de `paren` un bouton de classe `mh_form_submit` (standard MH) et de valeur `value`.
La fonction `onClick` est requise et ajoutée comme listener onclick.
* **function createImage(url,title)**  
Crée une une `img` avec les attributs spécifiés.
* **function createAltImage(url,alt,title)**  
Crée une une `img` avec les attributs spécifiés.
* **function createImageSpan(url,alt,title,text,bold)**  
Crée un `span` de titre `title` contenant :  
-- une `img` avec les attributs `url` et `alt` spécifiés,  
-- le texte `text`, en gras si `blod` est évalué à `true`.  
Retourne ce `span`.
* **function createCase(titre,table,width)**  
Fonction servant à créer les lignes des tableaux de CdM.
Ajoute à la fin de `table` un `tr` contenant :  
un premier `td` de classe `mh_tdtitre` et de largeur `width` (120 si non spécifiée), contenant le titre `titre`,  
un second `td` de classe `mh_tdpage`.  
Retourne ce second `td`.
* **function getMyID(e)**  ___WARNING: sera retiré de MZ___  
Retourne la position de l'élément `e` parmi les fils de son père.
I.e. `e==e.parentNode.childNodes[getMyID(e)]`.
N'est actuellement utilisé que pour la fonction `insertAfter`... et ne lui est pas indispensable.
* **function insertAfter(elt,newElt)**  
Insère l'élément `newElt` après le noeud `elt`.


## Mise en forme du texte 
* **function aff(nb)**  
Retourne le nombre `nb` sous forme de chaîne avec affichage forcé du signe.
E.g. `aff(5)=='+5'`.
* **function getNumber(str)**  
Retourne le premier nombre rencontré dans la chaîne `str`.
* **function getNumbers(str)**  
Retourne un `array` contenant tous les nombres rencontrés dans la chaîne `str`.
* **function trim(str)**  
Retire les éventuels espaces au début et à le fin de la chaîne `str`.
* **String.prototype.trim**  
Version method de la fonction `trim`.
* **function epure(texte)**  
Transforme en ASCII les éventuels caractères accentués de la chaîne `str`.
* **String.prototype.epure**  
Version method de la fonction `epure`.
* **function bbcode(texte)**  ___! appelée à changer de nom___  
Contrairement à ce que son nom suggère, cette fontion convertit le `texte` fournit en HTML _à partir_ du bbcode.


## Gestion / Transformation des Dates 
* **function addZero(i)**  
Bourrage à 2 caractères d'un chiffre.
E.g. `addZero(9)=='09'`.
* **function DateToString(date)**  
Convertit la date `date` en chaîne de caractères au format `JJ/MM/AAAA hh:mm:ss`.
* **function StringToDate(str)**  
Convertit la chaîne `str` en _chaîne_ interprétable en date par `Date()`.
L'appel classique est donc `new Date(StringToDate(str))`.


## Calculs expérience / niveau 
* **function getPXKill(niv)**  
Retourne le nombre de PX gagnés lors du kill d'un adversaire de niveau `niv` par le trõll joué.
* **function getPXDeath(niv)**  
Retourne le nombre de PX gagnés par un adversaire de niveau `niv` lors du kill du trõll joué.
* **function analysePX(niv)**  
Retourne une chaine le nombre (ou un encadrement du -) de PX gagnés lors du kill d'une cible dont les infos de niveau sont donnés dans la chaîne `niv`.
* **function analysePXTroll(niv)**  
Retourne une chaine rappelant les PX gagnés par un trõll de niveau `niv` lors du kill du trõll joué.


## Gestion Compos / Champis 
* **function addInfoMM(node,mob,niv,qualite,effetQ)**  
Ajoute à la fin du noeud `node` un `span` contenant une icône Mélange Magique et le pourcentage de bonus au Mélange conféré par un compo du monstre `mob` de qualité `qualite`.
Un titre rappelle les détails du bonus.
Il est nécessaire de préciser le niveau `niv` du monstre et l'effet `effetQ` de cette qualité.
* **function addInfoEM(node,mob,compo,qualite,localisation)**  
Ajoute à la fin du noeud `node` un `span` contenant une icône Écriture Magique et le pourcentage de bonus à l'Écriture Magique conféré par le composant `compo` du monstre `mob` de qualité `qualite` et de localisation `localisation`.
Un titre précise de quel sort il s'agit.
* **function insererInfosEM(tbody)**  
Applique la fonction `addInfoEM` à tous les composants trouvés dans `tbody`.
* **function getQualite(qualite)**  
Retourne l'indice de la qualité `qualite`. 
* **function getEM(nom)**  
Retourne `nom` (débarassé des éventuels templates d'âge) si `nom` est un monstre EM, une chaîne vide sinon.
* **function compoMobEM(mob), function titreCompoEM(mob,compo,localisation,qualite), function compoEM(mob), function composantEM(mob,compo,localisation,qualite)**  ___WARNING: DEPRECATED___  
Fonctions liées aux qualités EM des compos et des mobs, seront prochainement modifiées (fusion gestions EM/MM).


## Stockage des Talents 
* **function getSortComp(nom,niveau)**  ___WARNING: OBSOLETE, préférer `getTalent`___  
Retourne le pourcentage de maîtrise du talent `nom` de niveau `niveau` stocké en mémoire pour le trõll courant.
* **function getTalent(nom,niveau)**  
Retourne le pourcentage de maîtrise du talent `nom` de niveau `niveau` stocké en mémoire pour le trõll courant.
* **function removeAllTalents()**  
Efface du pref de Firefox tous les talents du trõll joué et stockés par MZ.
* **function isProfilActif()** ___WARNING: appelé à disparaître___  
Vérifie si le pref de Firefox contient l'intégralité des infos nécessaires à l'analyse tactique.
Foireux, ne reconnaît pas le trõll joué et n'a aucune notion de date.
Au joueur de s'assurer que ses infos sont à jour.


## Gestions des CDMs 
* **function getPVsRestants(pv,bless,vue)** ___!! l'output changera sûrement___  
Calcule les PV restants d'une cible ayant un encadrement de Pv donné dans la chaîne `pv`, un pourcentage de blessure `bless` et 
* **function insertButtonCdm(nextName,onClick,texte)**  
Ajoute le bouton d'envois d'une CdM vers la base.
Le bouton est placé avant le noeud de nom `nextName`.
Il a pour valeur `texte`, ou _'Participer au bestiaire'_ si non précisé.
Si la fonction onClick est pécisée, elle est ajoutée comme listener onclick.
* **function createCDMTable(id,nom,donneesMonstre)**  
RAD.


## Gestion des enchantements 
Ces fonctions seront revues lors de la révision globale de la gestion des enchantements par MZ.
* **function computeCompoEnchantement()**  
* **function isEnchant(nom)**  
* **function getInfoEnchantementFromMonstre(nom)**  
* **function composantEnchant(Monstre,composant,localisation,qualite)**  
* **function insertEnchantInfos(tbody)**  
* **function computeEnchantementEquipement(fontionTexte,formateTexte)**  


## Analyse Tactique 
* **function cnp(n,k)**  
Calcule le coefficient binomial d'indices (n,k).
* **function binom(n,p)**  
Idem, implémentation différente.
* **function coef(n,p)** 
??? calcule les coefficients d'une loi triangulaire ?
* **function chanceEsquiveParfaite(a,d,ba,bd)**  
RAD.
* **function chanceTouche(a,d,ba,bd)**  
RAD.
* **function chanceCritique(a,d,ba,bd)**  
RAD.
* **function getTexteAnalyse(modificateur,chiffre)**  
RAD.
* **function getAnalyseTactique(id,nom)**  
RAD.
* **function analyseTactique(donneesMonstre,nom)**  
???


## Gestion des tags de trõlls 
* **function initTagPopup()**  
???
* **function showTagPopup(evt)**  
???
* **function hideTagPopup()**  
???
* **function performTagComputation()**  
??? uniquement lancé par libs
* **function getTag(fonctionAnalyse,fonctionAffiche)**  
???
* **function createTagImage(url,text)**  
???
* **function showTags()**  
??? uniquement dans libs
* **function analyseTags(data)**  
???
