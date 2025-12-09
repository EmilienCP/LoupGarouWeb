import { Request, Response, Router } from 'express'
import { JoindrePartieInfo } from '../../../common/joindrePartieInfo'
import { InfoAppareilDetail } from '../../../common/infoAppareilDetail'
import { inject, injectable } from 'inversify'
import { Equipe, Joueur, JoueurExtensionLoups, Role } from '../../../common/Joueur'
import { PartiesService } from '../services/parties.service'
import Types from '../types'
import { Villageois } from '../gestionnaire/Personnages/villageois'
import { Voyante } from '../gestionnaire/Personnages/voyante'
import { EvenementDeGroupe, EvenementIndividuel, Victoire } from '../../../common/evenements'
import { Partie } from '../gestionnaire/partie'
import { Sorciere } from '../gestionnaire/Personnages/sorciere'
import { InfoEvenement } from '../../../common/infoEvenement'
import { Appareil } from '../gestionnaire/appareil'
import { MontreurOurs } from '../gestionnaire/Personnages/montreurOurs'
import { Renard } from '../gestionnaire/Personnages/renard'
import { Action } from '../gestionnaire/gestionBugs/historiquePartie'
import { EnfantSauvage } from '../gestionnaire/Personnages/enfantSauvage'
import { ServanteDevouee } from '../gestionnaire/Personnages/servanteDevouee'
import { DJAIService } from '../services/djai.service'
import { Intro } from '../gestionnaire/temps/intro'
import { DeuxSoeurs } from '../gestionnaire/Personnages/deuxSoeurs'
import { TroisFreres } from '../gestionnaire/Personnages/troisFreres'

// Database Controller. Frontend will send requests to this router, which will call the right queries located in the service.

@injectable()
export class DatabaseController {
  public constructor(@inject(Types.PartiesService) public partiesService: PartiesService,
                     @inject(Types.DJAIService) public djaiService: DJAIService) {
   }

  public get router(): Router {
    const router: Router = Router()

    router.get('/infoPartie/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getInfosJeu(req.params.idSocket));
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.get('/joindrePartieInfo/',
      async (req: Request, res: Response) => {
        try {
          const infos: JoindrePartieInfo[] = this.partiesService.getJoindrePartieInfo();
          res.json(infos)
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.get('/infoEvenement/:idSocket',
      async (req: Request, res: Response) => {
        try {
          const partie: Partie = this.partiesService.getPartie(req.params.idSocket);
          const appareil: Appareil = this.partiesService.getAppareil(req.params.idSocket);
          const evenement: EvenementIndividuel|EvenementDeGroupe = appareil.getUnEvenement();
          if(evenement !== EvenementIndividuel.ATTENTE){
            partie.ajouterActionHistorique([Action.GET_UN_EVENEMENT, partie.appareils.indexOf(appareil)]);
          }
          const infoEvenement: InfoEvenement = {
            evenement: evenement,
            passer: (appareil.passer) && (partie.victoire == Victoire.AUCUN),
            peutPasser: (appareil.getJoueursRestants(partie.joueursVivants).length == 0) && (partie.victoire == Victoire.AUCUN),
            timer: partie.getTimer(evenement)
          }
          res.json(infoEvenement);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.get('/infoJoueurPresent/:idSocket',
      async (req: Request, res: Response) => {
        try {
          let villageois: Villageois = this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent();
          let joueur: Joueur = {
            nom: villageois.nom,
            role: villageois.role,
            rolePublic: villageois.rolePublic,
            estCapitaine: villageois.estCapitaine,
            equipeApparente: villageois.equipeApparente,
            equipeReelle: villageois.equipeReelle,
            amoureux: villageois.amoureux?.nom,
            estInfecte: villageois.estInfecte,
            soiMeme: true,
            estCharmer: villageois.estCharmer,
            estAssocier: false,
            estSoeur: false,
            estFrere: false
          }
          res.json(joueur);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })
    
    router.get('/roleVoyante/:idSocket',
      async (req: Request, res: Response) => {
        try {
          let voyante: Voyante = this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent() as Voyante;
          
          res.json(voyante.voirRole());
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/infoVillage/:idSocket',
      async (req: Request, res: Response) => {
        try {
          let joueurPresent: Villageois;
          let partie: Partie = this.partiesService.getPartie(req.params.idSocket);
          let appareil: Appareil = this.partiesService.getAppareil(req.params.idSocket);
          if((appareil.indexJoueurPresent ==  -1 && appareil.getJoueursRestants(partie.joueursVivants).length>1) || appareil.siMeneurDeJeu()){
            joueurPresent = new Villageois(false, partie)
          } else {
            joueurPresent = appareil.getJoueurPresent();
          }
          let infoVillage: Joueur[] = [];
          partie.joueursVivants.forEach((villageois: Villageois)=>{
            infoVillage.push({
              nom: villageois.nom,
              estCapitaine: villageois.estCapitaine,
              role: (villageois == joueurPresent || villageois.role == Role.VILLAGEOIS_VILLAGEOIS || (joueurPresent.role == Role.VOYANTE && (joueurPresent as Voyante).villageoisRolesConnus.includes(villageois)))?villageois.role:undefined,
              rolePublic: villageois.rolePublic,
              //Si le loup garou du village ne sait pas encore quil est infecte, alors les autres loups ne doivent pas le voir non plus dans leur liste
              equipeApparente: villageois.equipeApparente == Equipe.LOUPS && !villageois.evenementsIndividuels.includes(EvenementIndividuel.INFO_INFECTE) && joueurPresent.equipeApparente == Equipe.LOUPS && !(partie.gestionnaireEtape.gestionnaireDeTemps instanceof Intro) && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_INFECTE) && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_ASSOCIER_MORT)? Equipe.LOUPS:Equipe.VILLAGEOIS,
              equipeReelle: villageois.equipeReelle,
              amoureux: ((joueurPresent.amoureux == villageois || (villageois.amoureux !== undefined && joueurPresent.role == Role.CUPIDON)) && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_AMOUREUX)? villageois.nom: undefined),
              estInfecte: villageois.estInfecte,
              soiMeme: joueurPresent == villageois,
              estCharmer: (joueurPresent.estCharmer || joueurPresent.role == Role.JOUEUR_DE_FLUTE) && villageois.estCharmer && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_CHARMER),
              estAssocier: (joueurPresent.role == Role.ENFANT_SAUVAGE && (joueurPresent as EnfantSauvage).joueurAssocie == villageois),
              estSoeur: (joueurPresent.role == Role.DEUX_SOEURS && (joueurPresent as DeuxSoeurs).deuxiemeSoeur == villageois && !(partie.gestionnaireEtape.gestionnaireDeTemps instanceof Intro)),
              estFrere: (joueurPresent.role == Role.TROIS_FRERES && (joueurPresent as TroisFreres).deuxFreres.includes(villageois) && !(partie.gestionnaireEtape.gestionnaireDeTemps instanceof Intro))
            })
          })
          res.json(infoVillage);
        }
        catch (err) {
          console.log(err)
          res.status(500)
        }
      })

      router.get('/infoVillageExtensionLoups/:idSocket',
        async (req: Request, res: Response) => {
          try {
            let partie: Partie = this.partiesService.getPartie(req.params.idSocket);
            let infoVillage: JoueurExtensionLoups[] = [];
            partie.joueursVivants.forEach((villageois: Villageois)=>{
              infoVillage.push({
                nombreVotes: partie.voteCourant.getTailleElecteurs()[partie.voteCourant.getAccuses().indexOf(villageois)],
                joueursQuiLePointent: (partie.voteCourant.getJoueursPointes()[partie.voteCourant.getAccuses().indexOf(villageois)])?(partie.voteCourant.getJoueursPointes()[partie.voteCourant.getAccuses().indexOf(villageois)].map((joueur: Villageois)=>{return joueur.nom})):[]
              })
            })
            res.json(infoVillage);
          }
          catch (err) {
            console.log(err)
            res.status(500).end()
          }
        })

      

      router.get('/infoVillageArriverMilieuDePartie/:idSocket',
        async (req: Request, res: Response) => {
          try {
            let partie: Partie = this.partiesService.getPartie(req.params.idSocket);
            let infoVillage: Joueur[] = [];
            partie.appareils.forEach((appareil: Appareil)=>{
              if(appareil.siMeneurDeJeu()){
                infoVillage.push({
                  nom: "Meneur de jeu",
                  estCapitaine: false,
                  role: undefined,
                  rolePublic: undefined,
                  equipeApparente: Equipe.VILLAGEOIS,
                  equipeReelle: Equipe.VILLAGEOIS,
                  amoureux: undefined,
                  estInfecte: false,
                  soiMeme: false,
                  estCharmer: false,
                  estAssocier: false,
                  estSoeur: false,
                  estFrere: false
                })
              }
              appareil.joueurs.forEach((joueur: Villageois)=>{
                infoVillage.push({
                  nom: joueur.nom,
                  estCapitaine: false,
                  role: undefined,
                  rolePublic: undefined,
                  equipeApparente: Equipe.VILLAGEOIS,
                  equipeReelle: Equipe.VILLAGEOIS,
                  amoureux: undefined,
                  estInfecte: false,
                  soiMeme: false,
                  estCharmer: false,
                  estAssocier: false,
                  estSoeur: false,
                  estFrere: false
                })
              })
            })
            res.json(infoVillage);
          }
          catch (err) {
            console.log(err)
            res.status(500).end()
          }
        })
      

      router.get('/infoVillageMort/:idSocket',
      async (req: Request, res: Response) => {
        try {
          let joueurPresent!: Villageois;
          if(this.partiesService.getAppareil(req.params.idSocket).indexJoueurPresent ==  -1){
            joueurPresent = new Villageois(false, this.partiesService.getPartie(req.params.idSocket))
          } else {
            joueurPresent = this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent();
          }
          let infoVillageMort: Joueur[] = [];
          this.partiesService.getPartie(req.params.idSocket).joueursDejaMorts.forEach((villageois: Villageois)=>{
            infoVillageMort.push({
              nom: villageois.nom,
              estCapitaine: villageois.estCapitaine,
              role: villageois.role,
              rolePublic: villageois.rolePublic,
              equipeApparente: villageois.equipeApparente == Equipe.LOUPS && joueurPresent.equipeApparente == Equipe.LOUPS? Equipe.LOUPS:Equipe.VILLAGEOIS,
              equipeReelle: villageois.equipeReelle,
              amoureux: ((joueurPresent.amoureux == villageois || (villageois.amoureux !== undefined && joueurPresent.role == Role.CUPIDON))? villageois.nom: undefined),
              estInfecte: villageois.estInfecte,
              soiMeme: joueurPresent == villageois,
              estCharmer: false,
              estAssocier: (joueurPresent.role == Role.ENFANT_SAUVAGE && (joueurPresent as EnfantSauvage).joueurAssocie == villageois),
              estSoeur: (joueurPresent.role == Role.DEUX_SOEURS && (joueurPresent as DeuxSoeurs).deuxiemeSoeur == villageois),
              estFrere: (joueurPresent.role == Role.TROIS_FRERES && (joueurPresent as TroisFreres).deuxFreres.includes(villageois))
            })
          })
          res.json(infoVillageMort);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.get('/infoVillageVerite/:idSocket',
      async (req: Request, res: Response) => {
        try {
          let infoVillage: Joueur[] = [];
          this.partiesService.getPartie(req.params.idSocket).joueursVivants.forEach((villageois: Villageois)=>{
            infoVillage.push({nom: villageois.nom,
              estCapitaine: villageois.estCapitaine,
              role: villageois.role,
              rolePublic: villageois.rolePublic,
              equipeApparente: villageois.equipeApparente,
              equipeReelle: villageois.equipeReelle,
              amoureux: villageois.amoureux?.nom,
              estInfecte: villageois.estInfecte,
              soiMeme: false,
              estCharmer: villageois.estCharmer,
              estAssocier: false,
              estSoeur: false,
              estFrere: false
            })
          })
          res.json(infoVillage);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.post('/voterVillageois/',
      async (req: Request, res: Response) => {
        try {
          if(+req.body.evenement == EvenementDeGroupe.ACCUSER){
            this.partiesService.getAppareil(req.body.idSocket).setJoueurPresentPourAccusation(
              this.partiesService.getPartie(req.body.idSocket).joueursVivants[+req.body.index],
              this.partiesService.getPartie(req.body.idSocket)
            )
          } else if(+req.body.evenement == EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE){
            this.partiesService.getPartie(req.body.idSocket).remplacerIAEnJoueur(+req.body.index, req.body.idSocket);
          } else {
            const partie: Partie = this.partiesService.getPartie(req.body.idSocket);
            const joueurPresent: Villageois = this.partiesService.getAppareil(req.body.idSocket).getJoueurPresent();
            const cible: Villageois = partie.joueursVivants[+req.body.index];
            joueurPresent.choisirJoueur(cible, req.body.evenement, false);
            partie.ajouterActionHistorique([Action.VOTER_VILLAGEOIS, +req.body.evenement,
              partie.joueursVivants.indexOf(joueurPresent), +req.body.index])
          }
          res.json(true)
        }
        catch (err) {
          console.log(err);
          res.status(500).end()
        }
      })

    router.post('/ouiServanteDevouee/',
      async (req: Request, res: Response) => {
        try {
          const appareil: Appareil = this.partiesService.getAppareil(req.body.idSocket);
          if(appareil.ouiServanteDevouee(this.partiesService.getPartie(req.body.idSocket))){
            this.partiesService.getPartie(req.body.idSocket).ajouterActionHistorique([Action.OUI_SERVANTE_DEVOUEE]);
            (this.partiesService.getPartie(req.body.idSocket).getPersonnages(Role.SERVANTE_DEVOUEE)[0] as ServanteDevouee).ouiVeutPrendrePersonnage();
          }
          res.json(true)
        }
        catch (err) {
          console.log(err);
          res.status(500).end()
        }
      })

    router.get('/isDerniereAccusation/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(!this.partiesService.getPartie(req.params.idSocket).siqqnPeutAccuser());
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/nouvellesRaisonsPasVoter/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json(this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent().getRaisonsPasVoterLoups());
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/historiqueEvenements/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getPartie(req.params.idSocket).historiqueEvenements);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/infoVideo/:idSocket',
    async (req: Request, res: Response) => {
      try {
        const partie: Partie = this.partiesService.getPartie(req.params.idSocket);
        res.json(partie.infoVideo);
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/victoire/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getPartie(req.params.idSocket).victoire);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/raisonsPasVoter/:idSocket',
      async (req: Request, res: Response) => {
        try {
          const joueurPresent: Villageois = this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent();
          const partie: Partie = this.partiesService.getPartie(req.params.idSocket);
          partie.ajouterActionHistorique([Action.POP_RAISON_PAS_VOTER, partie.joueursVivants.indexOf(joueurPresent)])
          res.json(joueurPresent.popRaisonsPasVoter());
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/raisonsPasVoterAccusation/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getAppareil(req.params.idSocket).getRaisonsPasVoterAccusation(this.partiesService.getPartie(req.params.idSocket)));
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/raisonsPasVoterAccusationQuiEtesVous/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json(this.partiesService.getAppareil(req.params.idSocket).getRaisonsPasVoterAccusationQuiEtesVous(
          this.partiesService.getPartie(req.params.idSocket).joueursVivants,
          this.partiesService.getPartie(req.params.idSocket)
        ));
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/raisonsPasVoterSortMortel/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json((this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent() as Sorciere).getRaisonsPasVoterSortMortel());
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/raisonsPasVoterInstitutrice/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json((this.partiesService.getAppareil(req.params.idSocket).getJoueurPresent() as Villageois).getRaisonsPasVoterInstitutrice());
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/raisonsPasVoterArriverMilieuDePartie/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json((this.partiesService.getPartie(req.params.idSocket)).getRaisonsPasVoterArriverMilieuDePartie());
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/siPlusieursPersonnesPeuventAccuser/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json(this.partiesService.getAppareil(req.params.idSocket).siPlusieursPersonnesPeuventAccuser(this.partiesService.getPartie(req.params.idSocket)));
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/infoAppareilDetails/:idSocket',
      async (req: Request, res: Response) => {
        try {
          let infoAppareilDetails: InfoAppareilDetail[] = [];
          this.partiesService.getPartie(req.params.idSocket).appareils.forEach((appareil: Appareil)=>{
            infoAppareilDetails.push({pret: appareil.pret, disconnect: appareil.disconnect})
          })
          res.json(infoAppareilDetails);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
      }
    })

    router.post('/switchAppareilDisconnect/',
      async (req: Request, res: Response) => {
        try {
          let appareil: Appareil = this.partiesService.getPartie(req.body.idSocket).appareils[+req.body.index];
          appareil.disconnect = !appareil.disconnect;
          res.json(true)
        }
        catch (err) {
          console.log(err);
          res.status(500).end()
        }
      })

    router.post('/retirerAppareil/',
      async (req: Request, res: Response) => {
        try {
          this.partiesService.getPartie(req.body.idSocket).appareils.splice(+req.body.index, 1);
          res.json(true)
        }
        catch (err) {
          console.log(err);
          res.status(500).end()
        }
    })

    router.get('/oursGrogne/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getPartie(req.params.idSocket).getPersonnages(Role.MONTREUR_OURS).filter((montreurOurs: Villageois)=>{
            return (montreurOurs as MontreurOurs).oursGrogne();
          }).length > 0);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.get('/reponseRenard/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json(this.partiesService.getPartie(req.params.idSocket).getPersonnages(Role.RENARD).filter((renard: Villageois)=>{
          return (renard as Renard).regarderGroupeDeTrois();
        }).length > 0);
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/infosPointsDeVictoire/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json(this.partiesService.getInfosPointsDeVictoire(req.params.idSocket));
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/getUnMomentFort/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getPartie(req.params.idSocket).getUnMomentFort());
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
      })

    router.get('/joueursEnAttente/:idSocket',
    async (req: Request, res: Response) => {
      try {
        res.json(this.partiesService.getJoueursEnAttente(req.params.idSocket));
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.get('/introHistoire/:idSocket',
      async (req: Request, res: Response) => {
        try {
          res.json(this.partiesService.getPartie(req.params.idSocket).texteCourant);
        }
        catch (err) {
          console.log(err)
          res.status(500).end()
        }
    })

    router.get('/historique/',
    async (req: Request, res: Response) => {
      try {
        res.json(JSON.stringify(this.partiesService.parties[0].getHistorique()).replace(/"/g,""));
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    router.post('/convert-mp3/',
    async (req: Request, res: Response) => {
      try {
        //const response: any = {"link":"https://mgamma.123tokyo.xyz/get.php/a/96/ur57IunS9To.mp3?cid=MmEwMTo0Zjg6YzAxMDo5ZmE2OjoxfE5BfERF&h=YbCXMPQ7qkw5Y_pjkfPVlQ&s=1666410541&n=Back%20In%20Time","title":"Back In Time","progress":0,"duration":258.92571436136,"status":"ok","msg":"success"}
        const response: any = await this.djaiService.getNouveauLink(req.body.videoId, req.body.ajouterDansFichier);
        console.log("return "+JSON.stringify(response));
        if(response){
          res.json(JSON.stringify(response));
        } else {
          res.status(500).end();
        }
      }
      catch (err) {
        console.log(err);
        res.status(500).end()
      }
    })

    router.post('/creerToune/',
    async (req: Request, res: Response) => {
      try {
        await this.djaiService.creerNouvelleToune(req.body.toune);
        res.json(true);
      }
      catch (err) {
        console.log(err);
        res.status(500).end()
      }
    })

    router.post('/modifierToune/',
    async (req: Request, res: Response) => {
      try {
        await this.djaiService.modifierToune(req.body.toune, +req.body.index);
        res.json(true);
      }
      catch (err) {
        console.log(err);
        res.status(500).end()
      }
    })
    
    router.get('/tounes/',
    async (req: Request, res: Response) => {
      try {
        res.json(this.djaiService.getTounes());
      }
      catch (err) {
        console.log(err)
        res.status(500).end()
      }
    })

    return router
  }
}
