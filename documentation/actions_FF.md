actions_FF.js
=============

Script lancé à la fois lorsqu'une action est réalisée
ou qu'on ouvre un message du Bot.
Sa fonction principale est de calculer la MM ou la RM adverse
lorsqu'un SR est fourni.

## Fonctions
* **getLevel()**  ___WARNING: Obsolète?___  
Censé calculer le niveau de la cible abattue lors d'un kill
à partir des PX obtenus.
* **insertInfoMagie(node[Node], intitule[String], magie[String])**  
Insère les infos relatives à un jet de SR après le noeud `node`.
* **getMM(sr[String]) > [String]**  
Calcule la MM d'un attaquant à partir du jet de SR fourni.
Le résultat est soit un nombre, soit une chaîne du type `< XXX`.
* **traiteMM()**  
Recherche un jet de SR défensif dans la page,
calcule la MM de l'assaillant avec `getMM`,
et réinjecte les données obtenues.
* **getRM(sr[String]) > [String]**  
Calcule la RM d'une cible à partir du jet de SR obtenu.
Le résultat est soit un nombre, soit une chaîne du type `> XXX`.
* **traiteRM()**  
Recherche tous les jets de SR offensifs dans la page,
calcule la RM des cibles avec `getRM`,
et réinjecte les données obtenues.
* **sendDices()**  
Envoie les jets de dés au Poissotron.
(Sera prochainement supprimé puisque le Poissotron n'est plus maintenu.)
* **function getIdt()** ___WARNING: Désactivée___  
Fonction envoyant les résultats d'IdT à un collecteur (par Raistlin).
Actuellement désactivée car non fonctionnelle.
* **prochainMundi()**  
Insère dans le cadre d'action le nombre de jours avant le prochain Mundidey.
* **dispatch()**  
Fonction principale qui gère le choix de la fonction à lancer
suivant la page traitée.
