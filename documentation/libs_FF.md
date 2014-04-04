libs_FF.js
==========

C'est la bibliothèque universelle de fonctions de MountyZilla.
Elle est chargée systématiquement sur toutes les pages du jeu.


## Variables globales
* **MZimg [String]**  
Url racine des icônes utilisées par MountyZilla
* **numTroll, nivTroll, mmTroll, rmTroll [Number]**  
Respectivement numéro, niveau, MM et RM du trõll actuellement joué.
Ces données sont mises à jour lors de la connexion,
MM & RM peuvent donc ne pas être tout à fait à jour.
* **date_debut [Date]**  
Date générée par la fonction `start_script`.
Généralement, correspond à la date à laquelle un script est lancé.
* **numQualite [Object{String:Number}], qualiteNum [Array[String]]**  
Objets js permettant de convertir une qualité de compo en son indice
(et réciproquement) suivant la correspondance :  
Très Mauvaise = 1  
Mauvaise = 2  
Moyenne = 3  
Bonne = 4  
Très Bonne = 5
* **nival [Object{String:Number}]**  
Objet js fournissant le niveau (de base, i.e. sans templates)
des monstres du jeu.  
E.g. `nival['Cube Gelatineux']==32`.
(La clé doit être nettoyée de ses éventuels caractères non ASCII.)
* **tabEM [Object{String:Array[String]}]**  
Objet js fournissant les informations EM des monstres, suivant la structure :
```javascript
	monstre:[compo exact, sort, position, localisation]
```
* **mundiChampi [Object{String:String}]**  
Objet js fournissant le mundidey EM des champignons.  
E.g. `mundiChampi['Bolet Péteur']=='du Démon'`.
* **arrayTalents [Object{String:String}]**  
Objet js contenant les codes mémoire utilisés par MZ pour stocker les talents.  
E.g. `arrayTalents['Ecriture Magique']=='EM'`.
(La clé doit être nettoyée de ses éventuels caractères non ASCII.)
* **listeTitres [Array[String]]** ___!!___  
Liste des éléments gérés par MZ dans les CdM des monstres.
Ne devrait logiquement pas être une variable globale...
* **listeMonstreEnchantement, listeEquipementEnchantement, listeInfoEnchantement** ___!!___  
???
Ne devraient logiquement pas être des variables globales...
* **c [Object{Number:Object{Number:Number}}]**  
Matrice des coefficients binomiaux déjà calculés.
Évite de répéter des calculs et permet d'accélérer le calcul
d'autres coefficients binomiaux.
* **coeff [Object{Number:Object{Number:Number}}]**  
??? Matrice de coefficients d'une loi triangulaire ?
* **tagPopup, nbTagFile, nbTagFileAnalyzed, infoTagTrolls, infoTagGuildes**  
??? Variables liées aux tags


## Fonctions: Durée de script
* **start_script(nbJours_exp[Number])**  
Génère une date de début de script stockée dans la variable globale `date_debut`.
Si `nbJours_exp` est précisé crée une date d'expiration située dans ce nombre de jours.
* **displayScriptTime()**  
Affiche dans le footer de la page la durée écoulée depuis `date_debut`
(initialisée par `start_script`).


## Fonctions: Insertion de scripts
* **isPage(url[String])**  
Retourne `true` si la page actuelle est la page `url` du serveur MH
renseigné dans MZ, `false` sinon.
* **chargerScript(script[String])**  
Si `script` est une chaîne commençant par `http://`, charge le script `script`.
Sinon, charge le script MZ nommé `script`.
* **addScript(src)** ___WARNING: susceptible de disparaître___  
_!? lancée par `attaque_FF.js` uniquement_
* **appendNewScript(src, paren)** ___WARNING: OBSOLETE___  
_!! n'est utilisé nulle part dans MZ_


## Fonctions: Modifications du DOM
___WARNING___ L'utilisation des attributs `name` dans MZ
est appelée à disparaître (sauf là où elle est indispensable).
Préférez l'utilisation d'attributs `id`.

* **insertBefore(next[Node], el[Node])**  
Insère l'élément `el` avant le noeud `next`.
* **appendTr(tbody[Node], clas[String]) > [Node]**  
Ajoute un `tr` à la fin de `tbody`. Si spécifié, la classe du `tr` est `clas`.
Retroune ce `tr`.
* **insertTr(next[Node], clas[String]) > [Node]**  
Insère un `tr` avant le noeud `next`. Si spécifié, la classe du `tr` est `clas`.
Retroune ce `tr`.
* **appendTd(tr[Node]) > [Node]**  
Ajoute un `td` à la fin de `tr`.
Retroune ce `tr`.
* **insertTd(next[Node]) > [Node]**  
Insère un `td` avant le noeud `next`.
Retroune ce `td`.
* **appendTdCenter(tr[Node], colspan[Number]) > [Node]**  
Ajoute à la fin de `tr` un `td` d'attribut `td.align=center`.
Si spécifié, le colSpan du `td` est `colspan`.
Retroune ce `td`.
* **insertTdElement(next[Node], el[Node]) > [Node]**  
Insère un `td` contenant l'élément `el` avant le noeud `next`.
Retroune ce `td`.
* **appendText(paren[Node], text[String], bold[Boolean])**  
Ajoute à la fin de `paren` le texte `text` à la fin de `paren`.
Si `bold` est évalué à `true`, alors le texte est en gras.
* **insertText(next[Node], text[String], bold[Boolean])**  
Insère le texte `text` avant le noeud `next`.
Si `bold` est évalué à `true`, alors le texte est en gras.
* **appendTdText(tr[Node], text[String], bold[Boolean]) > [Node]**  
Ajoute à la fin de `paren` un `td` contenant le texte `text`.
Si `bold` est évalué à `true`, alors le texte est en gras.
Retroune ce `td`.
* **insertTdText(next[Node], text[String], bold[Boolean]) > [Node]**  
Insère un `td` contenant le texte `text` avant le noeud `next`.
Si `bold` est évalué à `true`, alors le texte est en gras.
Retroune ce `td`.
* **appendBr(paren[Node])**  
Ajoute un saut de ligne à la fin de `paren`.
* **insertBr(next[Node])**  
Insère un saut de ligne avant le noeud `next`.
* **appendLI(ul[Node], text[String]) > [Node]**
___WARNING: susceptible d'être déplacé dans `options_FF.js`___  
Ajoute un `li` contenant le texte `text` à la fin de `ul`.
Retourne ce `li`.
* **appendTextbox(paren[Node], type[String], nam[String], size[Number], maxlength[Number], value[String]) > [Node]**  
Ajoute à la fin de `paren` une textbox de classe `TextboxV2` (standard MH)
avec les attributs spécifiés (`nam` est affecté comme name _et_ comme id).
Retourne cette textbox.
* **appendCheckBox(paren[Node], nam[String], checked[Boolean], onClick[Function]) > [Node]**  
Ajoute à la fin de `paren` une checkbox de name et d'id valant `nam`.
Si `checked` est spécifié, l'état de la checkbox est `checked`.
Si une fonction `onClick` est spécifiée, elle est ajoutée comme listener onclick.
* **appendNobr(paren, id, delgg, text)**  ___WARNING: FUCKIN' OBSOLETE___  
Pas besoin de préciser d'aide, sera viré de MZ _dès que possible_.
* **appendOption(select[Node], value[String], text[String]) > [Node]**  
Ajoute au menu déroulant `select` une `option` de valeur `value` et de texte `text`.
Retourne cette `option`.
* **appendHidden(form[Node], nam[String], value[String])**  
Ajoute au formulaire `form` un `input` de type `hidden` de valeur `value`
ayant pour name et id `nam`.
* **appendButton(paren[Node], value[String], onClick[Function]) > [Node]**  
Ajout à la fin de `paren` un bouton de classe `mh_form_submit` (standard MH)
et de valeur `value`.
La fonction `onClick` est requise et ajoutée comme listener onclick.
Retroune ce bouton.
* **insertButton(next[Node], value[String], onClick[Function]) > [Node]**  
Insère avant le noeud `next` un bouton de classe `mh_form_submit` (standard MH)
et de valeur `value`.
La fonction `onClick` est requise et ajoutée comme listener onclick.
Retroune ce bouton.
* **appendSubmit(paren[Node], value[String], onClick[Function]) > [Node]**  
Ajout à la fin de `paren` un bouton de classe `mh_form_submit` (standard MH)
et de valeur `value`.
La fonction `onClick` est requise et ajoutée comme listener onclick.
Retourne ce bouton.
* **createImage(url[String], title[String]) > [Node]**  
Crée une une `img` avec les attributs spécifiés.
* **createAltImage(url[String], alt[String], title[String]) > [Node]**  
Crée une une `img` avec les attributs spécifiés.
* **createImageSpan(url[String], alt[String], title[String], text[String], bold[Boolean]) > [Node]**  
Crée un `span` ayant pour titre `title` et contenant :  
 * une `img` avec les attributs `url` et `alt` spécifiés,  
 * le texte `text`, en gras si `blod` est évalué à `true`.  
Retourne ce `span`.
* **createCase(titre[String], table[Node], width[Number/String]) > [Node]**  
Fonction servant à créer les lignes des tableaux de CdM.
Ajoute à la fin de `table` un `tr` contenant :  
 * un premier `td` de classe `mh_tdtitre` et de largeur `width` (120 si non spécifiée),
contenant le titre `titre`,  
 * un second `td` de classe `mh_tdpage`.  
Retourne ce second `td`.
* **getMyID(e[Node]) > [Number]**  ___WARNING: sera retiré de MZ___  
Retourne la position de l'élément `e` parmi les fils de son père.  
I.e. `e==e.parentNode.childNodes[getMyID(e)]`.
N'est actuellement utilisé que pour la fonction `insertAfter`... et ne lui est pas indispensable.
* **insertAfter(elt[Node], newElt[Node])**  
Insère l'élément `newElt` après le noeud `elt`.


## Fonctions: Mise en forme du texte
* **aff(nb[Number]) > [String]**  
Retourne le nombre `nb` sous forme de chaîne avec affichage forcé du signe.
E.g. `aff(5)=='+5'`.
* **getNumber(str[String]) > [Number]**  
Retourne le premier nombre rencontré dans la chaîne `str`.
* **getNumbers(str[String]) > [Array[Number]]**  
Retourne un `array` contenant tous les nombres rencontrés dans la chaîne `str`.
* **trim(str[String]) > [String]**  
Retire les éventuels espaces au début et à le fin de la chaîne `str`.
* **String.prototype.trim**  
Version method de la fonction `trim`.
* **epure(texte[String]) > [String]**  
Transforme en ASCII les éventuels caractères accentués de la chaîne `str`.
* **String.prototype.epure**  
Version method de la fonction `epure`.
* **bbcode(texte[String]) > [String]**  ___! appelée à changer de nom___  
Contrairement à ce que son nom suggère,
cette fontion convertit le `texte` fournit en HTML _à partir_ du bbcode.


## Fonctions: Gestion / Transformation des Dates
* **addZero(i[Number]) > [String]**  
Bourrage à 2 caractères d'un chiffre.
E.g. `addZero(9)=='09'`.
* **DateToString(date[Date]) > [String]**  
Convertit la date `date` en chaîne de caractères au format `JJ/MM/AAAA hh:mm:ss`.
* **StringToDate(str[String]) _> [String]_**  
Convertit la chaîne `str` en _chaîne_ interprétable en date par `Date()`.
L'appel classique est donc `new Date(StringToDate(str))`.


## Fonctions: Calculs expérience / niveau
* **getPXKill(niv[Number]) > [Number]**  
Retourne le nombre de PX gagnés lors du kill d'un adversaire de niveau `niv`
par le trõll joué.
* **getPXDeath(niv[Number]) > [Number]**  
Retourne le nombre de PX gagnés par un adversaire de niveau `niv`
lors du kill du trõll joué.
* **analysePX(niv[String]) > [String]**  
Retourne une chaine contenant le nombre (ou un encadrement du -) de PX gagnés
lors du kill d'une cible dont les infos de niveau sont donnés dans la chaîne `niv`.
* **analysePXTroll(niv[Number]) > [String]**  
Retourne une chaine rappelant les PX gagnés par un trõll de niveau `niv`
lors du kill du trõll joué.  
E.g. `analysePXTroll(24)=='<br/>Vous lui rapportez <b>15</b> PX.'`.


## Fonctions: Gestion Compos / Champis
* **addInfoMM(node[Node], mob[String], niv[Number], qualite[String], effetQ[Number])**  
Ajoute à la fin du noeud `node` un `span` contenant une icône Mélange Magique
et le pourcentage de bonus au Mélange conféré par un compo
du monstre `mob` de qualité `qualite`.
Un titre rappelle les détails du bonus.
Il est nécessaire de préciser le niveau `niv` du monstre et l'effet `effetQ` de cette qualité.
* **addInfoEM(node[Node], mob[String], compo[String], qualite[String], localisation[String])**  
Ajoute à la fin du noeud `node` un `span` contenant une icône Écriture Magique
et le pourcentage de bonus à l'Écriture Magique conféré par le composant `compo`
du monstre `mob` de qualité `qualite` et de localisation `localisation`.
Un titre précise de quel sort il s'agit.
* **insererInfosEM(tbody[Node])**  
Applique la fonction `addInfoEM` à tous les composants trouvés dans `tbody`.
* **getQualite(qualite[String]) > [Number]** ___!! Susceptible de disparaître au profit d'un Object___  
Retourne l'indice de la qualité `qualite`. 
* **getEM(nom[String]) > [String]**  
Retourne `nom` (débarassé des éventuels templates d'âge) si `nom` est un monstre EM,
une chaîne vide sinon.
* **compoMobEM(mob), titreCompoEM(mob, compo, localisation, qualite), compoEM(mob), composantEM(mob, compo, localisation, qualite)**  ___WARNING: DEPRECATED___  
Fonctions liées aux qualités EM des compos et des mobs,
seront prochainement modifiées (fusion gestions EM/MM).


## Fonctions: Stockage des Talents
* **getSortComp(nom[String], niveau[Number]) > [String]**  ___WARNING: OBSOLETE, préférer `getTalent`___  
Retourne le pourcentage de maîtrise du talent `nom` de niveau `niveau`
stocké en mémoire pour le trõll courant.
* **getTalent(nom[String], niveau[Number]) > [String]**  
Retourne le pourcentage de maîtrise du talent `nom` de niveau `niveau`
stocké en mémoire pour le trõll courant.
* **removeAllTalents()**  
Efface du pref de Firefox tous les talents du trõll joué et stockés par MZ.
* **isProfilActif()** ___WARNING: appelé à disparaître___  
Vérifie si le pref de Firefox contient l'intégralité des infos nécessaires à l'analyse tactique.
Foireux, ne reconnaît pas le trõll joué et n'a aucune notion de date.
Au joueur de s'assurer que ses infos sont à jour.


## Fonctions: Gestions des CDMs
* **getPVsRestants(pv[String], bless[String], isVue[Boolean]) > [String/Array[String]]** ___!! l'output changera sûrement___  
Calcule les PV restants d'une cible ayant un encadrement de PV donné dans la chaîne `pv`,
un pourcentage de blessure `bless` et le met en forme la réponse suivant la valeur de `isVue`.
* **insertButtonCdm(nextName[String], onClick[Function], texte[String])**  
Ajoute le bouton d'envois d'une CdM vers la base.
Le bouton est placé avant le noeud de nom `nextName`.
Il a pour valeur `texte`, ou _'Participer au bestiaire'_ si non précisé.
Si la fonction onClick est pécisée, elle est ajoutée comme listener onclick.
* **createCDMTable(id[String], nom[String], donneesMonstre[Array])**  
RAD.


## Fonctions: Gestion des enchantements
Ces fonctions seront revues lors de la révision globale de la gestion des enchantements par MZ.
* **computeCompoEnchantement()**  
* **isEnchant(nom)**  
* **getInfoEnchantementFromMonstre(nom)**  
* **composantEnchant(Monstre, composant, localisation, qualite)**  
* **insertEnchantInfos(tbody)**  
* **computeEnchantementEquipement(fontionTexte, formateTexte)**  


## Fonctions: Analyse Tactique
* **cnp(n[Number], k[Number])**  
Calcule le coefficient binomial d'indices (n, k).
Ce coefficient est stocké pour mémoire dans `c[n][k]`.
* **binom(n[Number], p[Number])**  
Idem, implémentation différente.
* **coef(n[Number], p[Number])**  
??? calcule les coefficients d'une loi triangulaire ?
* **chanceEsquiveParfaite(a, d, ba, bd)**  
RAD.
* **chanceTouche(a, d, ba, bd)**  
RAD.
* **chanceCritique(a, d, ba, bd)**  
RAD.
* **getTexteAnalyse(modificateur, chiffre)**  
RAD.
* **getAnalyseTactique(id, nom)**  
RAD.
* **analyseTactique(donneesMonstre, nom)**  
???


## Fonctions: Gestion des tags de trõlls
* **initTagPopup()**  
???
* **showTagPopup(evt)**  
???
* **hideTagPopup()**  
???
* **performTagComputation()**  
??? uniquement lancé par libs
* **getTag(fonctionAnalyse, fonctionAffiche)**  
???
* **createTagImage(url, text)**  
???
* **showTags()**  
??? uniquement dans libs
* **analyseTags(data)**  
???
