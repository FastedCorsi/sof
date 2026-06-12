# Sea of fire - fichier de reference projet

Ce document consolide le cahier des charges fourni pour refaire Sea of fire en 3D avec Unreal Engine 5, Blender, un backend multijoueur serveur autoritaire, une architecture mobile-first, et une chaine DevOps GitHub/VPS.

Il sert de source de reference pour les choix techniques, le vertical slice, les tests et la roadmap.

## Vision

Sea of fire est un jeu fantasy cartoon pirate en 3D.

Le jeu doit etre :

- mobile-first Android/iOS ;
- jouable sur Windows ;
- potentiellement portable sur Mac plus tard ;
- multijoueur ;
- base sur un serveur autoritaire ;
- lisible de loin ;
- stylise, colore, pirate fantasy cartoon ;
- concu pour une evolution MMO avec environ 500 joueurs sur une grande mer ouverte.

## Repository

Structure cible :

- `/UnrealProject` : projet Unreal Engine 5.
- `/BlenderAssets` : sources et exports Blender.
- `/Backend` : serveur autoritaire REST/WebSocket.
- `/Launcher` : launcher et mise a jour.
- `/Docs` : documents de reference, architecture, roadmap, production.
- `/Deploy` : scripts de deploiement VPS.

Branches :

- `main` : stable/release.
- `develop` : integration.
- `feature/*` : developpement par fonctionnalite.

## Joueur

Le joueur est une entite serveur avec :

- profil de stats ;
- skin actif ;
- canons ;
- munitions ;
- equipage ;
- skills ;
- inventaire ;
- reputation ;
- progression.

Joueur de base :

- reload canon : 3.5 secondes ;
- canons basiques ;
- pas d'equipage ;
- pas de skill.

Les canons, equipages et skills peuvent modifier :

- degats ;
- portee ;
- reload ;
- critique ;
- bonus or ;
- bonus fragments.

## Direction artistique

Style cible :

- fantasy cartoon 3D ;
- pirate stylise ;
- mer claire et coloree ;
- personnages et bateaux stylises ;
- skins visuels forts ;
- effets lisibles : canon, impact, fumee, feu, loot ;
- interface moderne, mobile-first et lisible.

Contraintes visuelles :

- low-poly stylise ;
- silhouettes fortes ;
- couleurs differenciees ;
- VFX courts et clairs ;
- lisibilite prioritaire a distance ;
- aucune surcharge visuelle en combat mobile.

## Camera

La camera est un element central du gameplay.

Vue :

- vue du dessus en 3D ;
- camera legerement inclinee ;
- style top-down/isometrique leger ;
- joueur maintenu au centre de l'ecran ;
- recentrage permanent sur le joueur.

Lisibilite :

- la camera doit montrer assez de mer autour du joueur pour anticiper :
  - PNJ ;
  - joueurs proches ;
  - tirs ;
  - obstacles ;
  - loot.
- les barres HP, noms, indicateurs de cible et loot doivent rester lisibles depuis cette vue ;
- le style fantasy cartoon doit rester lisible de loin.

Mobile :

- camera stable ;
- pas de mouvements brusques ;
- zoom limite pour garder la lisibilite ;
- pas besoin de controler la camera en combat ;
- aucune interaction camera obligatoire pendant les combats.

PC :

- molette pour zoom leger optionnel ;
- camera toujours recentree sur le joueur ;
- le zoom ne doit jamais casser la lisibilite des HP, cibles et loot.

Implementation Unreal recommandee :

- camera spring arm fixe sur le joueur ;
- angle top-down incline ;
- lag camera tres faible ou desactive sur mobile ;
- zoom min/max clamp ;
- FOV stable ;
- decal/indicator de destination visible ;
- widgets monde avec taille lisible et distance clamp ;
- priorite a la stabilite plutot qu'a une camera cinematographique.

## Controles

Mobile :

- joystick virtuel ;
- boutons tactiles ;
- UI grosse et claire ;
- pas de controle camera requis en combat.

PC :

- WASD/ZQSD/fleches ;
- clic deplacement ;
- souris pour cibler ;
- raccourcis clavier ;
- molette pour zoom leger optionnel.

Regles d'input UI :

- cliquer un menu ne doit pas tirer ;
- ecrire dans le chat ne doit pas bouger le joueur ;
- le joueur peut bouger au clic seulement si le clic est dans le monde ;
- les champs texte capturent uniquement quand ils ont le focus.

## Backend autoritaire

Le serveur est responsable de :

- position validee ;
- anti-triche mouvement ;
- degats ;
- portee ;
- reload ;
- mort ;
- rewards ;
- skins autorises ;
- inventaire ;
- reputation ;
- progression ;
- guildes ;
- chat ;
- shop ;
- auction ;
- anti-duplication.

Technologies ciblees :

- API REST pour comptes, shop, inventory, guild, launcher ;
- WebSocket realtime ;
- PostgreSQL ;
- shard principal au depart ;
- spatial interest management autour du joueur.

Debug multijoueur :

- ping ;
- shard ;
- joueurs proches ;
- remote count ;
- interpolation ;
- packet loss ;
- snapshot age ;
- dernier message serveur.

## Mouvement

Le serveur valide :

- vitesse trop elevee ;
- teleportation ;
- position hors map ;
- mort du joueur.

Client :

- mobile : joystick virtuel ;
- PC : clavier + clic deplacement ;
- clic deplacement avec indicateur de destination ;
- interpolation fluide des joueurs et PNJ distants.

## Combat

Combat canon serveur autoritaire.

Le serveur valide :

- cadence de tir ;
- portee ;
- degats ;
- munitions ;
- cible valide ;
- cible vivante ;
- etat mort.

Feedback obligatoire :

- cible hors portee ;
- canons en recharge ;
- tir refuse serveur ;
- manque de munitions ;
- cible morte.

## Health system

Meme systeme HP pour :

- joueur local ;
- autres joueurs ;
- PNJ.

Regles :

- la barre HP baisse selon les PV reels serveur ;
- couleur selon pourcentage :
  - vert : HP hauts ;
  - orange : HP moyens ;
  - rouge : HP bas.
- a 0 HP :
  - entite non ciblable ;
  - entite n'attaque plus ;
  - entite ne bouge plus ;
  - entite disparait ou passe en etat detruit.

## PNJ initiaux

Seuls ces PNJ doivent etre crees au depart.

### Raider

- PNJ basique ;
- attaque le joueur le plus proche ;
- patrouille dans sa zone ;
- stop quand il tire ;
- stop 1 a 3 secondes quand touche ;
- donne XP, or, ressources communes, chance fragment skin Raider ;
- ne donne pas de PE ;
- 30 Raiders coules peuvent faire spawn un Admiral.

### Hunter

- PNJ traqueur ;
- suit une cible detectee ;
- va au dernier emplacement connu quelques secondes ;
- ne suit jamais a l'infini ;
- stop quand il tire ;
- stop 2 secondes quand touche ;
- donne PE, ressources offensives, chance fragment skin Hunter ;
- ne donne pas d'XP.

### Bounty Hunter

- cible le joueur avec forte reputation ;
- spawn si un joueur devient trop recherche ;
- message serveur possible : `Un chasseur de primes traque PlayerName.` ;
- stop quand il tire ;
- stop 2 secondes quand touche ;
- donne or eleve, PE, ressources rares, chance fragment skin Bounty.

### Admiral

- spawn apres 30 Raiders coules ;
- cible les joueurs hostiles ;
- peut appeler une Escort ;
- stop quand il tire ;
- stop 2 secondes quand touche ;
- recompenses selon degats faits par chaque joueur ;
- donne beaucoup d'or, beaucoup de PE, ressources Navy, materiaux d'amelioration, chance fragment skin Admiral.

### Escort

- protege l'Admiral ;
- cible le joueur qui attaque l'Admiral ;
- stop quand elle tire ;
- stop 2 secondes quand touchee ;
- donne PE, ressources defensives, ressources Navy, chance fragment skin Escort.

### Boss

- visible serveur ;
- cible surtout les joueurs qui font le plus de degats ;
- peut changer de cible ;
- stop quand il tire ;
- stop 2 secondes quand touche ;
- recompenses selon degats faits par chaque joueur ;
- donne beaucoup d'or, gros montant de PE, ressources tres rares, materiau unique, chance fragment skin Boss.

## Recompenses et fragments

Regles :

- les PNJ drop uniquement des fragments pour les skins ;
- chaque type de PNJ a une utilite claire ;
- Boss et Admiral recompensent selon contribution degats ;
- popup reward obligatoire.

Popup reward :

- XP ;
- or ;
- PE ;
- ressources ;
- fragments ;
- contribution pour Boss/Admiral.

Fragments :

- chaque type de PNJ peut drop son fragment ;
- skins debloques avec assez de fragments ;
- UI progression fragments obligatoire.

## Progression

Systeme :

- XP ;
- niveaux ;
- 1 point de skill par niveau ;
- leveling pas trop rapide ;
- paliers tous les X niveaux ;
- chaque palier demande une quete difficile mais faisable dans un temps limite ;
- reussite de quete = palier suivant debloque.

Arbre de skill initial :

- degats canon ;
- reload canon ;
- portee canon ;
- HP max ;
- reparation ;
- critique ;
- bonus or ;
- bonus drop fragment ;
- defense.

## Reputation

Gagnee quand le joueur coule :

- PNJ ;
- joueurs.

Regles :

- plus la cible est importante, plus le gain est eleve ;
- quand le joueur coule, la reputation active revient a zero ;
- sert a declencher Bounty Hunter, Admiral hostile, events serveur, classement temporaire.

## Skins

Table skins obligatoire :

- `skinId` ;
- `name` ;
- `assetPath` ;
- `rarity` ;
- `condition` ;
- `bonus` eventuel ;
- `serverSignature`.

Le serveur valide :

- skin possede ;
- skin actif autorise ;
- bonus signe.

## Shop

Un seul shop regroupe boutique et auction.

Fonctions :

- achat direct serveur ;
- vente entre joueurs ;
- encheres ;
- achat immediat ;
- historique ;
- validation serveur ;
- anti-duplication.

Le shop permet :

- achat munitions ;
- achat canons ;
- achat equipage ;
- achat ressources utiles ;
- achat cosmetiques si autorise ;
- mise en vente d'items ;
- encheres sur items joueurs ;
- achat direct d'items joueurs.

UI mobile :

- onglets/filtres :
  - boutique ;
  - marche joueurs ;
  - encheres ;
  - ventes en cours ;
  - historique.
- categorie ;
- item ;
- prix ;
- quantite ;
- bouton acheter ;
- bouton vendre ;
- bouton encherir ;
- message succes/erreur.

## Inventory

L'inventory remplace aussi le shipyard.

Il gere :

- objets possedes ;
- profil joueur ;
- loadout ;
- skins ;
- canons ;
- equipage ;
- munitions ;
- ressources ;
- fragments ;
- ameliorations.

Actions :

- changer skin ;
- voir bonus skin ;
- equiper canons ;
- equiper equipage ;
- choisir munitions ;
- ameliorer profil de stats ;
- ameliorer coque ;
- reparer ;
- comparer stats ;
- voir fragments skins ;
- voir materiaux upgrade.

Stats visibles :

- HP ;
- degats ;
- portee ;
- reload ;
- vitesse ;
- defense ;
- bonus actifs.

## Guild

Fonctions :

- creation guilde ;
- nom ;
- tag ;
- membres ;
- chat guilde ;
- contributions ;
- quetes de guilde ;
- niveau de guilde ;
- recompenses collectives ;
- classement guilde ;
- bonus legers, pas trop puissants.

## Chat

Canaux :

- global ;
- guilde ;
- messages systeme ;
- messages evenements.

Evenements :

- boss spawn ;
- Admiral spawn ;
- Bounty Hunter traque PlayerName ;
- joueur coule ;
- recompense importante.

Contraintes :

- anti-spam serveur ;
- UI mobile compacte.

## UI

Mobile-first.

HUD minimal :

- HP ;
- niveau ;
- XP ;
- or ;
- PE ;
- cible ;
- reload canon.

Menus :

- Shop ;
- Inventory ;
- Skills ;
- Guild ;
- Chat ;
- Debug.

Panneau cible :

- nom ;
- type ;
- HP exact ;
- barre HP ;
- distance ;
- portee ;
- statut.

Panneau progression :

- niveau ;
- XP ;
- points skill ;
- PE ;
- reputation ;
- fragments skins.

Panneau debug :

- ping ;
- shard ;
- joueurs proches ;
- interpolation ;
- packet loss ;
- snapshot age.

## Map

Grande mer ouverte avec :

- zones de danger ;
- ports ;
- iles ;
- zones marchandes ;
- zones de guilde ;
- zones boss ;
- points d'interet visibles ;
- spawns PNJ repartis ;
- aucun entassement de PNJ.

## Blender

Assets low-poly stylises :

- joueur fantasy ;
- skins joueur ;
- skins PNJ ;
- Raider ;
- Hunter ;
- Bounty ;
- Admiral ;
- Escort ;
- Boss ;
- canons ;
- projectiles ;
- iles ;
- rochers ;
- ports ;
- loot crates ;
- fragments ;
- VFX simples.

Export vers Unreal :

- FBX ou glTF ;
- LOD mobile ;
- collisions simples ;
- materiaux stylises optimises.

## Unreal Engine

Projet UE5 C++ ou Blueprint hybride.

Systemes separes :

- PlayerController ;
- MovementComponent ;
- CombatComponent ;
- HealthComponent ;
- InventoryComponent ;
- SkinComponent ;
- SkillComponent ;
- ReputationComponent ;
- NPC AI ;
- UI widgets ;
- NetworkClient.

Contraintes :

- widgets mobile-first ;
- camera top-down 3D legerement inclinee ;
- mer stylisee optimisee mobile ;
- barres HP et indicateurs lisibles ;
- client fluide mais serveur autoritaire.

## Optimisation

Contraintes :

- low poly ;
- LOD ;
- instancing ;
- materiaux simples ;
- VFX legers ;
- peu de lumieres dynamiques ;
- UI scalable ;
- reseau optimise avec interet spatial.

## Launcher et release

Manifest serveur :

- version ;
- Android URL ;
- Windows URL ;
- Mac URL si disponible ;
- backend URL ;
- websocket URL ;
- sha256.

Regles :

- le launcher telecharge toujours la derniere version ;
- artefacts uploades sur VPS ;
- backend redemarre proprement apres release.

## GitHub Actions

Workflows cibles :

- build backend ;
- tests backend ;
- build Android si possible ;
- build Windows si possible ;
- generation artefacts ;
- generation manifest ;
- deploiement VPS.

Les builds Unreal peuvent necessiter un runner self-hosted avec Unreal Engine installe.

## VPS

Informations cible :

- Host : `vps-a67953f0.vps.ovh.net`
- IPv4 : `51.38.35.62`
- IPv6 : `2001:41d0:305:2100::6d98`
- User : `ubuntu`
- connexion par cle SSH.

Secrets GitHub obligatoires :

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_DEPLOY_PATH`
- `DATABASE_URL`
- `BACKEND_ENV`

Regle absolue :

- ne jamais commit de secret.

## Tests obligatoires

Tests serveur :

- degats modifies client refuses ;
- cadence de tir impossible ;
- position trop rapide ;
- skin non possede ;
- reward Boss/Admiral selon degats ;
- PNJ mort non ciblable ;
- chat anti-spam ;
- persistence inventory/rewards ;
- persistence guild ;
- shop achat direct ;
- shop auction ;
- anti-duplication marche.

Tests client a ajouter :

- camera recentree joueur ;
- zoom mobile clamp ;
- zoom PC optionnel clamp ;
- HP/noms/loot lisibles depuis la camera top-down ;
- clic UI ne declenche pas tir ;
- chat focus bloque mouvement ;
- clic monde declenche destination.

## Ordre de developpement

1. GitHub + structure projet.
2. Backend minimal + WebSocket.
3. Prototype Unreal mobile/PC deplacement.
4. Joueurs visibles en multijoueur.
5. HealthComponent + barres HP.
6. Combat canon serveur autoritaire.
7. Raider.
8. Hunter.
9. Rewards XP/or/PE/fragments.
10. Inventory/loadout.
11. Shop avec boutique + auction.
12. Skills/progression.
13. Reputation.
14. Chat global/guilde.
15. Guild.
16. Bounty Hunter.
17. Admiral + Escort.
18. Boss.
19. Map MMO + points d'interet.
20. Launcher + release VPS.
21. Optimisation mobile.

## Premier vertical slice obligatoire

Le premier vertical slice doit contenir :

- 1 joueur mobile/PC ;
- deplacement 3D ;
- camera propre top-down/isometrique leger ;
- joueur centre ecran ;
- zoom mobile limite ;
- zoom PC leger optionnel ;
- 1 Raider ;
- 1 Hunter ;
- tir canon ;
- serveur autoritaire degats/reload/portee ;
- barre HP qui baisse reellement ;
- entite morte non ciblable ;
- recompense visible ;
- inventory simple avec loadout ;
- shop simple avec achat direct + base auction ;
- UI mobile propre ;
- build Android ;
- build Windows ;
- deploiement VPS via GitHub Actions.

