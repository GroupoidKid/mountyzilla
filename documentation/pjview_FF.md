pjview_FF.js
============

## Variables globales

* **DivInfo [Node]**  
Bulle utilisée pour afficher les informations sur le matériel survolé.
* **freezed [Boolean]**  
Booléen stockant l'état de freezing de la bulle.
* **mh_caracs [Object{str:Array[0:String,1+:Number]}]**  
Objet js contenant les stats de tous les items de base du jeu.
Les données sont stockées suivant :
```
 mh_caracs['Nom'] = 
 ['Type', 'AttP','AttM', 'DegP','DegM', 'Esq', 'ArmP','ArmM', 'Vue', 'Reg',
 'RM_Min', 'RM_Max', 'MM_Min', 'MM_Max', 'PV', 'DLA', 'Poids_Min', 'Poids_Max'];
```
* **mh_templates [Object{str:Array[0:String,1+:Number]}]**  
Objet js contenant les BM de stats de tous les templates du jeu.
Les données sont stockées suivant la même structure que mh_caracs.

## Fonctions
* **Array.prototype.clone**  
Crée un clone rapide de l'`array` auquel on applique la méthode.
* **addArray(arr1[Array[Number]],arr2[Array[Number]]) > [Array]**  
Génère un `array` dont les entrées sont les sommes
de celles de `arr1` et `arr2`.
* **getTemplates(nomItem[String]) > [Array[String]]**  
Déstructure le nom d'un item en array : `[nom, template1, ...]`.
* **addMithril(arrayCaracs[Array],typeItem[String]) > [Array]**  
Ajoute l'effet du Mithril sur les caractéristiques d'un item.
* **addRenfort(arrayCaracs[Array],template[String]) > [Array]**  
Ajoute l'effet des pseudo-templates sur les caractéristiques d'un item.
S'applique APRÈS le mithril.  
__WARNING__ La formule employée n'a rien d'officiel.
* **getCaracs(item[String]) > [Array]**  
Génère l'`array` contenant les caractéristiques de l'item templaté `item`.
* **getLine(tab[Array]) > [String]**  
Génère la chaîne qui sera affichée lors d'un mouseover sur un item de stats `tab`.
* **toolTipInit()**  
Initialise l'infobulle `DivInfo`.
* **getXY(evt)**  
Met à jour la position de l'infobulle.
* **changeFreezeStatus()**  
Bascule entre infobulle fixe ou mobile.
* **showInfos()**  
Affiche l'infobulle relative à l'item survolé.
* **hideInfos()**  
Masque l'infobulle.
* **treateEquipement()**  
Initialisation du script : récupère les données de la page
et génère les infos qui seront affichées.
