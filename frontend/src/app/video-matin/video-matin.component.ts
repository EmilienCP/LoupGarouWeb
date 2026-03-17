import * as THREE from 'three';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Socket } from 'socket.io-client';
import { AudioService } from '../services/audio.service';
import { CommunicationService } from '../services/communication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InfoEvenement } from '../../../../common/infoEvenement';
import { InfoVideo } from '../../../../common/infoVideo';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-video-matin',
  templateUrl: `./video-matin.component.html`,
  styleUrls: ['./video-matin.component.css'],
  animations: [ 
    trigger('Fond', [ 
      transition(':enter', [ 
        query('.image', [ 
          style({ opacity: 0 }), 
          stagger(1200, [ 
            animate('2300ms ease', 
              style({ opacity: 1 })) 
            ]) 
          ]) 
        ]) 
      ]) ,
    trigger("PendantLaNuit", [
      transition(":leave",[
        style({opacity: 1, visibility: 'visible'}),
        animate("2s ease-in", style({opacity: 0, visibility: 'visible'}))
      ])
    ]),
    trigger("JourSeLeve", [
      transition(":enter",[
        style({opacity: 0, visibility: 'visible'}),
        animate("2s ease-in", style({opacity: 1, visibility: 'visible'}))
      ]),
      transition(":leave",[
        style({opacity: 1, visibility: 'visible'}),
        animate("2s ease-in", style({opacity: 0, visibility: 'visible'}))
      ])
    ])
    ]
})
export class VideoMatinComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererContainerContainer') container!: ElementRef;

  couleurFond = "black";

  // Éléments Three.js
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  personnage!: Personnage;
  morts: Personnage[] = [];
  ambientLight!: THREE.AmbientLight;

  startTime!: number;
  angleCamera: number = 0;
  vitesseAngleCamera: number = 0.002;
  overlay!: THREE.Mesh;

  listeBuissons: THREE.Group[] = [];

  indexMessage: number = 0;
  opacityNarrateur: number = 0;
  textePendantLaNuit: string = "texte pendant la nuit";
  texteJourSeLeve: string = "texte jour se leve";
  isTextePendantLaNuit: boolean = false;
  isTexteJourSeLeve: boolean = false;
  nomsMorts: string[] = ["mort 1", "mort 2","mort 1", "mort 2","mort 1", "mort 2"];

  tempsMarche: number = 7500;
  tempsMarcheBuissons: number = 3500;
  tempsAttente: number = 500;
  tempsZoom: number= 4500;
  tempsDecouverte: number = 3500;
  tempsRecul: number = 5000;

  animationFinie = false;

  socket: Socket;
  infoEvenement?: InfoEvenement;
  nomVivant: string = "nom";
  
  isInfoAppareil: boolean = false;

  constructor(private audioService: AudioService, public communicationService: CommunicationService, private router: Router, private route: ActivatedRoute) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      this.infoEvenement = JSON.parse(params["infoEvenement"]);
      if(this.infoEvenement!.passer){
        this.socket.on("prochaineEtape", ()=>{
          this.audioService.jouerJour();
          this.socket.off("prochaineEtape")
          this.router.navigate(["jeuComponent"])
        })
      }
    })
    if(this.communicationService.infoPartie.isMeneurDeJeu){
      this.socket.on("prochaineEtape", ()=>{
        this.audioService.jouerJour();
        this.socket.off("prochaineEtape")
        this.router.navigate(["jeuComponent"])
      })
    }
    this.communicationService.getInfoVideo().subscribe((info: InfoVideo)=>{
      this.audioService.jouerMatin();
      this.nomVivant = info.nomJoueurAMontrer;
      this.nomsMorts = info.nomJoueursMorts;
      this.texteJourSeLeve = info.texteJourSeLeve;
      this.textePendantLaNuit = info.textePendantLaNuit;
      this.initThree();
      this.audioService.jouerMatin();
      this.animate();
      window.addEventListener('resize', () => this.onWindowResize());
    })
  }

  ngAfterViewInit() {
      // this.initThree();
      // this.audioService.jouerMatin();
      // this.animate();
      // window.addEventListener('resize', () => this.onWindowResize());
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    const container = this.container.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // On adapte le moteur aux dimensions du DIV
    this.renderer.setSize(width, height);

    // On recalcule le ratio basé sur le DIV
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  initThree() {
    this.startTime = Date.now();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x082436); // Ciel bleu

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    
    const container = this.container.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // On adapte le moteur aux dimensions du DIV
    this.renderer.setSize(width, height);

    // On recalcule le ratio basé sur le DIV
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.container.nativeElement.appendChild(this.renderer.domElement);

    //lumière
    const moonLight = new THREE.DirectionalLight(0xddeeff, 1.4);
    // Augmenter la zone de projection de la shadow map
moonLight.shadow.camera.left = -100;
moonLight.shadow.camera.right = 100;
moonLight.shadow.camera.top = 100;
moonLight.shadow.camera.bottom = -100;

moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 200;

// Qualité de l'ombre
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
    moonLight.castShadow = true;
    moonLight.position.set(-20, 20, -10);
    this.scene.add(moonLight);// Réglages de shadow

    // Lumière ambiante très faible (sinon tout est trop clair)
    this.ambientLight = new THREE.AmbientLight(0xb0b0c0, 0.3);
    this.scene.add(this.ambientLight);

    // Un brouillard bleu ciel qui commence à 5m et cache tout à 20m
    this.scene.fog = new THREE.Fog(0x082436, 5, 30);

    // Création du sol
    const floorGeometry = new THREE.PlaneGeometry(150, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x224b22 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Création du rideau noir
    const overlayGeom = new THREE.PlaneGeometry(10, 10);
    const overlayMat = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true, 
      opacity: 1 
    });
    this.overlay = new THREE.Mesh(overlayGeom, overlayMat);

    // On le place très près de la caméra (0.1m)
    this.overlay.position.z = -0.5; 
    this.camera.add(this.overlay);
    this.scene.add(this.camera); // Important : la caméra devient un parent

    const vivant = this.creerPersonnage();
    
    const label = this.creerLabel(this.nomVivant);

    label.position.y = 3.6; // au dessus de la tête
    vivant.add(label);

    this.personnage = vivant;
    this.scene.add(this.personnage);
    this.nomsMorts.forEach((nomMort: string, index: number)=>{
      const mort = this.creerPersonnage();
      const label = this.creerLabel(nomMort);

      label.position.z = -1; // au dessus de la tête
      label.position.y = 1.5; // au dessus de la tête
      mort.add(label);
      mort.rotation.x=Math.PI/2;
      mort.position.y=-10;
      mort.position.x=this.getX(index);
      mort.position.z=this.getZ(index);
      this.morts.push(mort);
      this.scene.add(mort);
    })

    this.ajouterForet();
    this.ajouterBuissons();
  }

  getX(index: number): number{
    let nbCouches: number = Math.ceil(this.nomsMorts.length/2);
    let nCouche: number = index%nbCouches;
    let min: number = 9;
    let max: number = 12;
    return ((-1*(2)**(-nCouche))+1)*(max-min)+min;
  }

  getZ(index: number): number{
    let milieu: number = -16.5;
    let plage: number = 8;
    let separation: number = plage/(this.nomsMorts.length+1);
    return separation*(index+1)-plage/2+milieu;
  }

  creerPersonnage() :Personnage{
    const personnage = new THREE.Group() as Personnage;

    // Matériaux avec un peu de brillance pour la peau
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.6 }); 
    const clothesMat = new THREE.MeshStandardMaterial({ color: 0x8b6d4b, roughness: 0.8 }); 
    const jeanMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.9 });

    // 1. TRONC (plus large en haut, plus fin en bas)
    const bodyGeom = new THREE.CylinderGeometry(0.5, 0.4, 1.1, 8); // Rayon haut, bas, hauteur
    const body = new THREE.Mesh(bodyGeom, clothesMat);
    body.position.y = 1.7; // Légèrement plus haut
    body.castShadow = true;
    body.receiveShadow = true;
    personnage.add(body);

    // 2. TÊTE (plus ovale)
    const headGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const head = new THREE.Mesh(headGeom, skinMat);

    // --- Matériaux pour le visage ---
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, metalness: 0 }); // Noir pour les yeux/bouche
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xffdbac }); // Couleur peau pour le nez

    // --- Les Yeux (petites sphères noires) ---
    const eyeGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeom, faceMat);
    const eyeR = new THREE.Mesh(eyeGeom, faceMat);

    // Positionnement relatif à la tête
    // (Un peu en avant sur Z, et décalés sur X)
    eyeL.position.set(-0.15, 2.6, -0.3); 
    eyeR.position.set(0.15, 2.6, -0.3);
    eyeL.castShadow = true;
    eyeL.receiveShadow = true;
    eyeR.castShadow = true;
    eyeR.receiveShadow = true;
    personnage.add(eyeL, eyeR);

    // --- Le Nez (un petit cône) ---
    const noseGeom = new THREE.ConeGeometry(0.05, 0.15, 8);
    const nose = new THREE.Mesh(noseGeom, noseMat);

    // Positionné au centre, un peu en bas des yeux
    nose.position.set(0, 2.45, -0.35);
    nose.rotation.x = Math.PI / 2; // Pointé vers l'avant
    nose.castShadow = true;
    nose.receiveShadow = true;
    personnage.add(nose);

    // --- La Bouche (un cylindre fin) ---
    const mouthGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
    const mouth = new THREE.Mesh(mouthGeom, faceMat);

    // Positionnée en bas du nez
    mouth.position.set(0, 2.3, -0.25);
    mouth.rotation.z = 0; // Horizontale
    mouth.rotation.x = Math.PI/2
    mouth.castShadow = true;
    mouth.receiveShadow = true;
    personnage.add(mouth);

    head.scale.set(1, 1.2, 1); // La tête est plus haute que large
    head.position.y = 2.6;
    head.castShadow = true;
    head.receiveShadow = true;
    personnage.add(head);

    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness:0.5 });

    const hairGeom = new THREE.SphereGeometry(0.38, 16, 16);
    const hair = new THREE.Mesh(hairGeom, hairMat);

    hair.scale.y = 0.6; // aplati
    hair.position.y = 2.85;
    hair.position.z = 0.05;
    hair.castShadow = true;
    hair.receiveShadow = true;

    personnage.add(hair);

    // 3. COU
    const neckGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8);
    const neck = new THREE.Mesh(neckGeom, skinMat);
    neck.position.y = 2.4;
    neck.castShadow = true;
    neck.receiveShadow = true;
    personnage.add(neck);

    // 4. JAMBES (Cylindres pour les cuisses et les mollets)
    const jambeG = this.creerMembreArticule(0.2, 0.15, 1.1, jeanMat); // Rayon haut, bas, hauteur
    const jambeD = this.creerMembreArticule(0.2, 0.15, 1.1, jeanMat);

    const footGeom = new THREE.BoxGeometry(0.35, 0.15, 0.6);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x4b3621, roughness: 0.6, metalness: 0.1 });

    const piedG = new THREE.Mesh(footGeom, footMat);
    piedG.position.set(0, -0.55, -0.15);

    const piedD = new THREE.Mesh(footGeom, footMat);
    piedD.position.set(0, -0.55, -0.15);
    piedD.castShadow = true;
    piedD.receiveShadow = true;
    piedG.castShadow = true;
    piedG.receiveShadow = true;

    (jambeG as any).partieInferieure.add(piedG);
    (jambeD as any).partieInferieure.add(piedD);

    jambeG.position.set(-0.25, 1.1, 0);
    jambeD.position.set(0.25, 1.1, 0);
    jambeG.castShadow = true;
    jambeG.receiveShadow = true;
    jambeD.castShadow = true;
    jambeD.receiveShadow = true;
    personnage.add(jambeG, jambeD);

    

    // 5. BRAS (plus fins)
    const brasG = this.creerMembreArticule(0.12, 0.1, 1.0, clothesMat);
    const brasD = this.creerMembreArticule(0.12, 0.1, 1.0, clothesMat);

    const handGeom = new THREE.SphereGeometry(0.12, 8, 8);

    const mainG = new THREE.Mesh(handGeom, skinMat);
    mainG.position.y = -0.55;

    const mainD = new THREE.Mesh(handGeom, skinMat);
    mainD.position.y = -0.55;

    (brasG as any).partieInferieure.add(mainG);
    (brasD as any).partieInferieure.add(mainD);

    brasG.position.set(-0.6, 2.2, 0);
    brasD.position.set(0.6, 2.2, 0);
    brasG.castShadow = true;
    brasG.receiveShadow = true;
    brasD.castShadow = true;
    brasD.receiveShadow = true;
    personnage.add(brasG, brasD);

    personnage.brasD = brasD;
    personnage.brasG = brasG;
    personnage.jambeD = jambeD;
    personnage.jambeG = jambeG;

    return personnage;
  }

  creerMembreArticule(rayonHaut: number, rayonBas: number, hauteur: number, mat: any): THREE.Group {
    const group = new THREE.Group();

    // Partie supérieure (ex: Cuisse)
    const supGeom = new THREE.CylinderGeometry(rayonHaut, (rayonHaut+rayonBas)/2, hauteur/2, 8);
    const sup = new THREE.Mesh(supGeom, mat);
    sup.position.y = -hauteur/4; // Pivot en haut
    sup.castShadow = true;
    sup.receiveShadow = true;
    group.add(sup);

    // Articulation (ex: Genou - une petite sphère)
    const jointGeom = new THREE.SphereGeometry((rayonHaut+rayonBas)/2, 8, 8);
    const joint = new THREE.Mesh(jointGeom, mat);
    joint.position.y = -hauteur/2;
    joint.castShadow = true;
    joint.receiveShadow = true;
    group.add(joint);

    // Partie inférieure (ex: Mollet)
    const infGroup = new THREE.Group(); // On crée un sous-groupe pour l'animation
    infGroup.position.y = -hauteur/2; // L'articulation est le point de pivot
    
    const infGeom = new THREE.CylinderGeometry((rayonHaut+rayonBas)/2, rayonBas, hauteur/2, 8);
    const inf = new THREE.Mesh(infGeom, mat);
    inf.castShadow = true;
    inf.receiveShadow = true;
    inf.position.y = -hauteur/4;
    infGroup.add(inf);
    
    group.add(infGroup);

    // On stocke la référence de la partie inférieure pour l'animer
    // (C'est un hack temporaire, dans un vrai projet on utiliserait des "Bones")
    (group as any).partieInferieure = infGroup; 

    return group;
  }

  // Fonction utilitaire pour créer un membre articulé par le haut
  creerMembre(largeur: number, hauteur: number, mat: any, pivotY: number): THREE.Group {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(largeur, hauteur, largeur), mat);
    mesh.position.y = -pivotY; // On décale le mesh pour que le point de rotation soit en haut
    group.add(mesh);
    return group;
  }

  animate() {
    requestAnimationFrame(() =>{ if(!this.animationFinie){this.animate()}});
    
    if (this.personnage) {
      const tempsPasse = Date.now() - this.startTime;

      // Distance de la caméra par rapport au personnage
      const distance = 5; 

      // Calcul des positions X et Z pour faire un cercle
      // On ajoute la position du personnage pour que le cercle se déplace avec lui
      let posX = this.personnage.position.x + Math.sin(this.angleCamera) * distance;
      let posZ = this.personnage.position.z + Math.cos(this.angleCamera) * distance;
      let posY = 4;
      if(tempsPasse > this.tempsMarche+this.tempsZoom+this.tempsAttente+this.tempsMarcheBuissons+this.tempsDecouverte+this.tempsRecul){
        this.animationFinie = true;
        posX = this.personnage.position.x+5 + Math.sin(this.angleCamera+Math.PI/2) * distance -5;
        posY=1+8;
      }
      else if (tempsPasse > this.tempsMarche+this.tempsZoom+this.tempsAttente+this.tempsMarcheBuissons+this.tempsDecouverte && !this.animationFinie) {
        const proportion: number= (tempsPasse-this.tempsMarche-this.tempsAttente-this.tempsMarcheBuissons-this.tempsZoom-this.tempsDecouverte)/this.tempsRecul;
        posX = this.personnage.position.x+5 + Math.sin(this.angleCamera+Math.PI/2) * distance - proportion*5;
        posZ = this.personnage.position.z-5 + Math.cos(this.angleCamera+Math.PI/2) * distance;
        posY=1+proportion*8;
        const couleurJour = new THREE.Color(0x9894c6);
        const couleurNuit = new THREE.Color(0x082436);
        this.scene.background = couleurNuit.clone().lerp(couleurJour, proportion**3);
        //this.ambientLight.color = couleurNuit.clone().lerp(couleurJour, proportion**3)
        this.scene.fog = new THREE.Fog(couleurNuit.clone().lerp(couleurJour, proportion**3), 5+40*proportion, 30+40*proportion);
        
        this.isTexteJourSeLeve = true;
      }
      else if(tempsPasse > this.tempsMarche+this.tempsZoom+this.tempsAttente+this.tempsMarcheBuissons){
        const proportion: number= (tempsPasse-this.tempsMarche-this.tempsAttente-this.tempsMarcheBuissons-this.tempsZoom)/this.tempsDecouverte;
        this.camera.lookAt(this.personnage.position.x+15, 0.5, this.personnage.position.z);
        posX = this.personnage.position.x+5 + Math.sin(this.angleCamera+Math.PI/2) * distance;
        posZ = this.personnage.position.z-5 + Math.cos(this.angleCamera+Math.PI/2) * distance;
        posY=1;
      }
      else if (tempsPasse > this.tempsMarche+this.tempsAttente+this.tempsMarcheBuissons) {
        const proportion: number= (tempsPasse-this.tempsMarche-this.tempsAttente-this.tempsMarcheBuissons)/this.tempsZoom;
        const proportionbuissons: number = (tempsPasse-this.tempsMarche)/(this.tempsAttente+this.tempsZoom)
        this.vitesseAngleCamera = 0;
        this.angleCamera = proportion*(Math.PI/2)+Math.PI;
        this.personnage.position.y = 0.1


        const positionEntiteZ = this.personnage.position.z+15-proportionbuissons*20; // L'entité parcourt 150 unités

        this.listeBuissons.forEach((buisson) => {
          // On calcule la distance entre le buisson et l'entité invisible
          const distance = Math.abs(buisson.position.z - positionEntiteZ);

          // Si l'entité est proche du buisson (moins de 5 unités), il bouge
          if (distance < 5) {
            // Intensité du mouvement : plus on est proche, plus ça bouge
            const force = (5 - distance) / 5;
            const t = Date.now() * 0.02;
            
            buisson.rotation.z = Math.sin(t) * 0.2 * force;
            buisson.rotation.x = Math.cos(t) * 0.1 * force;
          } else {
            // Retour progressif au calme
            buisson.rotation.z *= 0.9;
            buisson.rotation.x *= 0.9;
          }
        });
        
        posX = this.personnage.position.x+5 + Math.sin(this.angleCamera+Math.PI/2) * distance;
        posZ = this.personnage.position.z-5 + Math.cos(this.angleCamera+Math.PI/2) * distance;
        posY = 4-proportion*3;
        this.camera.lookAt(this.personnage.position.x+(proportion*15), 1.5-proportion, this.personnage.position.z);

      } else if(tempsPasse > this.tempsMarche+this.tempsMarcheBuissons){
        const proportion: number= (tempsPasse-this.tempsMarche-this.tempsMarcheBuissons)/this.tempsAttente;
        this.bougerBuissons(tempsPasse);

        // --- SURPRISE + REGARD VERS LES BUISSONS ---
        const ease = Math.sin(proportion * Math.PI);

        // 👀 TOURNE PLUS VERS LES BUISSONS
        this.personnage.rotation.y = -ease * Math.PI * 0.6;

        // 🙆 BRAS (surprise = bras vers l'arrière)
        this.personnage.brasG.rotation.x = -0.7 * ease;
        this.personnage.brasD.rotation.x = -0.7 * ease;

        // coudes
        (this.personnage.brasG as any).partieInferieure.rotation.x = 0.1 * ease;
        (this.personnage.brasD as any).partieInferieure.rotation.x = 0.1 * ease;

        // 🦵 jambes qui se raidissent un peu
        this.personnage.jambeG.rotation.x = -0.25 * ease;
        this.personnage.jambeD.rotation.x = -0.25 * ease;

        // petit sursaut
        this.personnage.position.y = 0.1 + 0.18 * ease;

        // petit déséquilibre (plus naturel)
        this.personnage.rotation.z = -0.12 * ease;

        this.isTextePendantLaNuit = false;


      }  
      else if (tempsPasse > this.tempsMarche){
        const proportion: number= (tempsPasse-this.tempsMarche)/this.tempsMarcheBuissons;


        this.bougerBuissons(tempsPasse);

        let retour: number[] = this.marche(tempsPasse, distance);
        posX = retour[0];
        posZ = retour[1];
      } else {
        const proportion = tempsPasse/this.tempsMarche;

        let retour: number[] = this.marche(tempsPasse, distance);
        posX = retour[0];
        posZ = retour[1];
        this.isTextePendantLaNuit = true;
      }

      // On applique les positions
      this.camera.position.set(posX, posY, posZ);
    }

    // --- Effet de Fondu ---
    if (this.overlay && (this.overlay.material as THREE.MeshBasicMaterial).opacity > 0) {
      (this.overlay.material as THREE.MeshBasicMaterial).opacity -= 0.002; // Vitesse du fondu
    } else if (this.overlay) {
      this.overlay.visible = false; // On le cache complètement une fois fini
    }
    this.renderer.render(this.scene, this.camera);
  }

  marche(tempsPasse: number, distance: number): number[]{
    let isMoving = 1;
    const proportionMarche = tempsPasse/(this.tempsMarche+this.tempsMarcheBuissons);
    distance = ((proportionMarche*2-1)**2 * (distance-3))+3
    // On augmente l'angle au fil du temps
    this.angleCamera = proportionMarche*(Math.PI+Math.PI/4)-Math.PI/4; 
    let posX = this.personnage.position.x + Math.sin(this.angleCamera) * distance;
    let posZ = this.personnage.position.z + Math.cos(this.angleCamera) * distance;
    // La caméra regarde toujours le torse du personnage
    this.camera.lookAt(this.personnage.position.x, 1.5, this.personnage.position.z);
    this.personnage.position.z = -proportionMarche*15;
    
    const t = Date.now() * 0.004;
    const amplitude = 0.3 * isMoving;
    // 1. Balancement des membres principaux (inversé bras/jambes)
    this.personnage.brasG.rotation.x = Math.sin(t) * amplitude;
    this.personnage.brasD.rotation.x = -Math.sin(t) * amplitude;
    this.personnage.jambeG.rotation.x = -Math.sin(t) * amplitude;
    this.personnage.jambeD.rotation.x = Math.sin(t) * amplitude;

    // 2. PLIURE DES ARTICULATIONS (Le secret du réalisme !)
    // On plie le genou/coude quand le membre est en arrière
    const pliureAmplitude = 0.3 * isMoving;
    
    // Genoux (pliure max quand la jambe est en arrière, Math.sin est négatif)
    (this.personnage.jambeG as any).partieInferieure.rotation.x = -Math.max(0, Math.sin(t)) * pliureAmplitude;
    (this.personnage.jambeD as any).partieInferieure.rotation.x = -Math.max(0, -Math.sin(t)) * pliureAmplitude;

    // Coudes (pliure légère constante + pliure de marche)
    const pliureCoudeBase = 0.3 * isMoving;
    (this.personnage.brasG as any).partieInferieure.rotation.x = pliureCoudeBase + Math.max(0, Math.sin(t)) * 0.2;
    (this.personnage.brasD as any).partieInferieure.rotation.x = pliureCoudeBase + Math.max(0, -Math.sin(t)) * 0.2;
    // Rebond (double fréquence de la marche)
    this.personnage.position.y = 0.1+ Math.abs(Math.sin(t)) * 0.05;
    
    // Balancement latéral du bassin (rotation Z)
    this.personnage.rotation.z = Math.sin(t) * 0.05;
    
    // Rotation légère du tronc (rotation Y inversée aux jambes)
    this.personnage.rotation.y = Math.sin(t) * 0.1;
    return [posX, posZ]
  }

  bougerBuissons(tempsPasse: number){
    const proportionbuissons: number = (tempsPasse-this.tempsMarche)/(this.tempsAttente+this.tempsMarcheBuissons+this.tempsZoom)
    
    this.morts.forEach((mort)=>mort.position.y = 0);
    this.vitesseAngleCamera = 0;

    const positionEntiteZ = this.personnage.position.z+15-proportionbuissons*20; // L'entité parcourt 150 unités

    this.listeBuissons.forEach((buisson) => {
      // On calcule la distance entre le buisson et l'entité invisible
      const distance = Math.abs(buisson.position.z - positionEntiteZ);

      // Si l'entité est proche du buisson (moins de 5 unités), il bouge
      if (distance < 5) {
        // Intensité du mouvement : plus on est proche, plus ça bouge
        const force = (5 - distance) / 5;
        const t = Date.now() * 0.02;
        
        buisson.rotation.z = Math.sin(t) * 0.2 * force;
        buisson.rotation.x = Math.cos(t) * 0.1 * force;
      } else {
        // Retour progressif au calme
        buisson.rotation.z *= 0.9;
        buisson.rotation.x *= 0.9;
      }
    });
  }

  ajouterForet() {
    const groupeSapins: THREE.Group = new THREE.Group();

    for (let i = 0; i < 360; i++) {
      const sapin = this.creerUnSapin(); // Crée une petite fonction helper
      
      // On place les arbres à gauche et à droite, mais pas au milieu (le sentier)
      sapin.position.x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 60 +3); 
      sapin.position.z = (Math.random() -0.8) * 40; // Un long chemin
      
      if(sapin.position.x > 12 || sapin.position.x < 2 || sapin.position.z > -10 || sapin.position.z<-20){
        groupeSapins.add(sapin);
      }
    }
    this.scene.add(groupeSapins);
  }

  creerUnSapin(): THREE.Group {
    const sapin = new THREE.Group();

    // Création d'un canvas pour simuler le bois
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Fond marron clair
    ctx.fillStyle = '#5a320d';
    ctx.fillRect(0, 0, 64, 64);

    // Quelques traits foncés pour les nervures
    ctx.strokeStyle = '#3e220d';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 64, 0);
      ctx.lineTo(Math.random() * 64, 64);
      ctx.stroke();
    }

    // On crée la texture Three.js
    const troncTexture = new THREE.CanvasTexture(canvas);

    // Tronc avec cette texture
    const troncGeom = new THREE.CylinderGeometry(0.4, 0.5, 7, 16);
    const troncMat = new THREE.MeshStandardMaterial({ map: troncTexture, roughness: 0.8 });
    const tronc = new THREE.Mesh(troncGeom, troncMat);
    tronc.position.y = 3.5;
    tronc.castShadow = true;
    sapin.add(tronc);

    const canvasF = document.createElement('canvas');
    canvasF.width = 64;
    canvasF.height = 64;
    const ctx2 = canvasF.getContext('2d')!;

    // Fond vert sapin
    ctx2.fillStyle = '#0b4315';
    ctx2.fillRect(0, 0, 64, 64);

    // Points pour simuler des aiguilles
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = 1 + Math.random() * 2;
      const shade = 20 + Math.random() * 50; // nuances de vert
      ctx2.fillStyle = `rgb(0, ${shade + 50}, 0)`;
      ctx2.beginPath();
      ctx2.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx2.fill();
    }

    const feuillesTexture = new THREE.CanvasTexture(canvasF);
    feuillesTexture.wrapS = THREE.RepeatWrapping;
    feuillesTexture.wrapT = THREE.RepeatWrapping;
    feuillesTexture.repeat.set(2, 2);

    // 2. Les Feuilles (Cône vert foncé)
    // Premier cône
    const feuillesGeom = new THREE.ConeGeometry(1.9, 5, 8);
    const feuillesMat = new THREE.MeshStandardMaterial({
      map: feuillesTexture,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const feuilles = new THREE.Mesh(feuillesGeom, feuillesMat);
    feuilles.position.y = 7.7;
    feuilles.castShadow = true;
    sapin.add(feuilles);

    // Deuxième cône
    const feuillesGeom2 = new THREE.ConeGeometry(2.5, 4, 8);
    const feuillesMat2 = new THREE.MeshStandardMaterial({
      map: feuillesTexture,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const feuilles2 = new THREE.Mesh(feuillesGeom2, feuillesMat2);
    feuilles2.position.y = 5;
    feuilles2.castShadow = true;
    sapin.add(feuilles2);

    return sapin;
  }

  creerBuisson(): THREE.Group {
    const buisson = new THREE.Group();
    const vertMat = new THREE.MeshStandardMaterial({ color: 0x1e592f }); // Vert foncé différent des sapins

    // On crée un amas de 3 sphères pour un look organique
    for (let i = 0; i < 3; i++) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), vertMat);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.position.set(
        (Math.random() - 0.5) * 0.5, 
        0.3, 
        (Math.random() - 0.5) * 0.5
      );
      sphere.scale.set(1, 1, 1); // Un peu écrasées
      buisson.add(sphere);
    }
    return buisson;
  }

  ajouterBuissons() {
    const distanceDuCentre = 2.5; // Largeur du couloir
    const nombreDeBuissons = 200; // On augmente pour boucher les trous

    for (let i = 0; i < nombreDeBuissons; i++) {
      const buisson = this.creerBuisson();
      
      // Aligné à gauche (-1) ou à droite (1)
      const cote = Math.random() > 0.5 ? 1.5 : -1.5;
      
      // X est fixe (le mur) avec juste une minuscule variation pour le naturel
      buisson.position.x = cote * distanceDuCentre + (Math.random() - 0.8) * 0.8;
      
      // Z réparti tout le long du chemin
      buisson.position.z = (Math.random()-1) * 100;
      
      // On les fait un peu plus hauts pour l'effet "mur"
      const s = 0.8 + Math.random() * 0.5;
      buisson.scale.set(s, s * 1.5, s);
      
      this.scene.add(buisson);
      this.listeBuissons.push(buisson);
    }
    const buisson = this.creerBuisson();
      
    // Aligné à gauche (-1) ou à droite (1)
    const cote = 1.5;
    
    // X est fixe (le mur) avec juste une minuscule variation pour le naturel
    buisson.position.x = cote * distanceDuCentre;
    
    // Z réparti tout le long du chemin
    buisson.position.z = -16.5;
    
    // On les fait un peu plus hauts pour l'effet "mur"
    const s = 0.8 + 0.5;
    buisson.scale.set(s, s * 1.8, s);
    
    this.scene.add(buisson);
    this.listeBuissons.push(buisson);

  }

creerLabel(nom: string): THREE.Sprite {

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 6;
    context.font = "Bold 40px Arial";
    context.textAlign = "center";

    context.strokeText(nom, 256, 80);
    context.fillText(nom, 256, 80);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);

    return sprite;
  }

  
  ok(): void{
    this.audioService.jouerJour();
    this.router.navigate(["jeuComponent"]);
  }

  switchInfoAppareil(): void {
    this.isInfoAppareil=!this.isInfoAppareil;
  }
}

interface Personnage extends THREE.Group {
  brasG: THREE.Group
  brasD: THREE.Group
  jambeG: THREE.Group
  jambeD: THREE.Group
}