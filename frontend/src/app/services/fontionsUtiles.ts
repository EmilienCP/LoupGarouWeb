import { Role, RolePublic } from '../../../../common/Joueur';

export function convertirRoleTexte(role: Role, roleIndividuel: boolean = false): string {
    switch(role){
        case Role.VILLAGEOIS: return "un Villageois";
        case Role.LOUP_GAROU: return "un Loup-Garou";
        case Role.VILLAGEOIS_VILLAGEOIS: return "un Villageois-Villageois";
        case Role.VOYANTE: return "la Voyante";
        case Role.CUPIDON: return "le Cupidon";
        case Role.SORCIERE: return "la Sorcière";
        case Role.CHASSEUR: return "le Chasseur";
        case Role.INFECT_PERE_LOUPS: return "l'Infect Père des Loups";
        case Role.MONTREUR_OURS: return "le Montreur d'Ours";
        case Role.RENARD: return "le Renard";
        case Role.CORBEAU: return "le Corbeau";
        case Role.FEMME_DE_MENAGE: return "la Femme de Ménage";
        case Role.HYPNOTISEUR: return "l'Hypnotiseur";
        case Role.JOUEUR_DE_FLUTE: return "le Joueur de Flûte";
        case Role.ENFANT_SAUVAGE: return "l'Enfant Sauvage";
        case Role.LOUP_BLANC: return "le Loup-Garou Blanc";
        case Role.SERVANTE_DEVOUEE: return "la Servante Dévouée";
        case Role.CHEVALIER_A_LEPEE_ROUILLEE: return "le Chevalier À l'Épée Rouillée";
        case Role.DEUX_SOEURS: return roleIndividuel?"les Deux Soeurs":"l'une des Deux Soeurs";
        case Role.TROIS_FRERES: return roleIndividuel?"les Trois Frères":"l'un des Trois Frères";
        case Role.GRAND_MECHANT_LOUP: return "le Grand Méchant Loup";
      }
}

export function descriptionRole(role: Role): string{
    switch(role){
      case Role.VILLAGEOIS: return "Son objectif est de sauver le village. Il doit trouver les loups garous et les éliminer lors de la séance de vote le jour.";
      case Role.LOUP_GAROU: return "Son objectif est d'éliminer tous les villageois. Chaque nuit, il désigne un villageois à dévorer qui sera éliminé le lendemain.";
      case Role.VILLAGEOIS_VILLAGEOIS: return "Son objectif est de sauver le village, tout comme le villageois normal. Cependant, tout le monde sait qu'il est villageois, donc il est plus facile de lui faire confiance.";
      case Role.VOYANTE: return "Son objectif est de gagner avec les villageois. Chaque nuit, elle regarde le role d'un des personnages du village.";
      case Role.CUPIDON: return "Son objectif est de gagner avec les villageois, ou de laisser les amoureux gagner. Au début de la partie, il désigne deux joueurs qu'il mettra en amour. Ces deux joueurs devront survivre ensemble, peut importe leur role. Si l'un des deux amoureux est éliminé, l'autre mourra par amour.";
      case Role.SORCIERE: return "Son objectif est de gagner avec les villageois. Chaque nuit, elle protège un joueur. Si ce joueur est désigné par les loups, il restera en vie. La soricère a aussi une potion mortelle qu'elle peut utiliser une fois dans la partie.";
      case Role.CHASSEUR: return "Son objectif est de gagner avec les villageois. Lorsqu'il est éliminé, il choisi un autre joueur qui mourra avec lui.";
      case Role.INFECT_PERE_LOUPS: return "Son objectif est de gagner avec les loups garous. Une fois dans la partie, il peut convertir un villageois en loup garou.";
      case Role.MONTREUR_OURS: return "Son objectif est de gagner avec les villageois. Le montreur d'ours possède un flair qui lui permet de détecter un loup garou à sa droite ou à sa gauche. Si c'est le cas, l'ours grognera pendant la nuit.";
      case Role.RENARD: return "Son objectif est de gagner avec les villageois. Chaque nuit, il vérifie s'il y a un loup garou parmi un groupe de 3 personnes consécutives de son choix.";
      case Role.CORBEAU: return "Son objectif est de gagner avec les villageois. Chaque nuit, il choisi un joueur qu'il pense etre un loup garou. Ce joueur aura déjà une accusation et un vote contre lui le lendemain.";
      case Role.FEMME_DE_MENAGE: return "Son objectif est de gagner avec les villageois. Chaque nuit, elle va faire le ménage chez un joueur de son choix, où elle mourra si les loups garous choisissent ce joueur. Par contre, si les loup garous la choisissent, elle restera en vie";
      case Role.HYPNOTISEUR: return "Son objectif est de gagner avec les villageois. Chaque nuit, il force quelqu'un à voter pour la même personne que lui lors du vote de jour.";
      case Role.JOUEUR_DE_FLUTE: return "Son objectif est de gagner seul. Chaque nuit, il peut charmer jusqu'à 2 joueurs. Les joueurs charmés se connaissent entre eux. S'il réussi a charmer tout le monde, il gagne.";
      case Role.ENFANT_SAUVAGE: return "Au début de la partie, il est un simple villageois. Il choisi un éternel associé en secret. Si cet associé meurt, l'enfant sauvage prend rage et devient loup garou.";
      case Role.LOUP_BLANC: return "Son objectif est de gagner seul. Il est un loup-garou, mais chaque deux nuits, il peut également éliminer un loup-garou.";
      case Role.SERVANTE_DEVOUEE: return "Son objectif est de gagner avec les villageois. Lorsqu'un joueur est éliminé, elle peut décider de dévoiler son rôle et prendre le personnage de l'éliminé avant que l'on dévoile son rôle.";
      case Role.CHEVALIER_A_LEPEE_ROUILLEE: return "Son objectif est de gagner avec les villageois. Lorsqu'il est éliminé, il donne le tetanos au premier loup garou à sa gauche, qui va mourir la prochaine nuit.";
      case Role.DEUX_SOEURS: return "Son objectif est de gagner avec les villageois. Les deux soeurs se connaissent entre elles et savent que l'autre est une simple villageoise."
      case Role.TROIS_FRERES: return "Son objectif est de gagner avec les villageois. Les trois frères se connaissent entre eux et savent que l'autre est un simple villageois."
      case Role.GRAND_MECHANT_LOUP: return "Son objectif est de gagner avec les loup-garous. Le Grand Méchant Loup peut dévorer un deuxième villageois au choix pendant la nuit, s'il n'y a pas eu encore de loup-garous morts pendant la partie."
    }
}

export function imageRole(role: Role): string{
  switch(role){
    case Role.VILLAGEOIS: return "villageois.png";
    case Role.LOUP_GAROU: return "loupGarou.png";
    case Role.VILLAGEOIS_VILLAGEOIS: return "villageois.png";
    case Role.VOYANTE: return "voyante.jpg";
    case Role.CUPIDON: return "cupidon.png";
    case Role.SORCIERE: return "soricere.png";
    case Role.CHASSEUR: return "chasseur.png";
    case Role.INFECT_PERE_LOUPS: return "infectPereDesLoups.png";
    case Role.MONTREUR_OURS: return "montreurDours.png";
    case Role.RENARD: return "renard.png";
    case Role.CORBEAU: return "corbeau.png";
    case Role.FEMME_DE_MENAGE: return "femmeDeMenage.png";
    case Role.HYPNOTISEUR: return "hypnotiseur.jfif";
    case Role.JOUEUR_DE_FLUTE: return "joueurDeFlute.png";
    case Role.ENFANT_SAUVAGE: return "enfantSauvage.png";
    case Role.LOUP_BLANC: return "loupBlanc.jpg";
    case Role.SERVANTE_DEVOUEE: return "servanteDevouee.jpg";
    case Role.CHEVALIER_A_LEPEE_ROUILLEE: return "chevalierALepeeRouillee.jpg";
    case Role.DEUX_SOEURS: return "deuxSoeurs.jpg";
    case Role.TROIS_FRERES: return "troisFreres.jpg";
    case Role.GRAND_MECHANT_LOUP: return "grandMechantLoup.jpg";
  }
}

export function convertirRolePublicTexte(rolePublic: RolePublic): string {
  switch(rolePublic){
    case RolePublic.VAGABOND: return "un Vagabond";
    case RolePublic.FERMIER: return "un Fermier";
    case RolePublic.INSTITUTRICE: return "l'Institutrice";
  }
}

export function imageRolePublic(rolePublic: RolePublic): string{
  switch(rolePublic){
    case RolePublic.VAGABOND:return "Vagabond.png"
    case RolePublic.FERMIER: return "Fermier.png"
    case RolePublic.INSTITUTRICE: return "Institutrice.png"
  }
}

export function descriptionRolePublic(rolePublic: RolePublic): string{
    switch(rolePublic){
      case RolePublic.VAGABOND: return "Un vagabon n'a pas de pouvoir en particulier. Cependant, il est protégé de toutes les attaques des autres joueurs qui doivent viser des joueurs ayant un toit.";
      case RolePublic.FERMIER: return "Les fermiers sont les seuls qui peuvent élire un capitaine. Ce dernier sera l'un d'entre eux tant qu'il y aura des fermiers en vie.";
      case RolePublic.INSTITUTRICE: return "L'institutrice peut faire taire une personne dans les votes du jour, à condition qu'il ne soit pas vagabond.";
    }
}
