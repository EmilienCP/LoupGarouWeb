import { OpenAI } from "openai";

export class ChatgptService {

    private key: string = process.env.OPEN_AI_KEY!;
    private openai: OpenAI;
    public finiDeGenerer: boolean = true;
    private seed: boolean;
    private discussionPrecendente:OpenAI.Chat.Completions.ChatCompletionMessageParam[]; 
    constructor(seed: boolean = false){
        this.openai = new OpenAI({apiKey: this.key});
        this.seed = seed;
        this.discussionPrecendente = [];
    }

    async test(): Promise<string>{
        this.openai = new OpenAI({apiKey: this.key});
        const chatCompletion = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Peux tu parler francais' }],
            model: 'gpt-3.5-turbo-0125',
          });
        return chatCompletion.choices[0].message.content as string
    }

    async genererIntro(noms: string[]): Promise<string>{
        this.finiDeGenerer = false;
        let texte: string = "";
        noms.forEach((nom: string, index: number)=>{
            texte+=nom
            if(index <= noms.length-3){
                texte+=", "
            } else if(index == noms.length-2){
                texte+=" et "
            }
        })
        let question: string = "Génère l'introduction d'environ 100 mots à propos de l'histoire d'un village dans lequel certains d'entre eux sont des loups-garous et tuent un innocent chaque nuit. Parmi les survivants du village, il y a "+texte+
        ". On ne sait pas qui est loup-garou. Définir leur domaine d'expertise à chacun dans le village. Donner un nom au village."
        if(this.discussionPrecendente.length>0){
            question  = "Génère l'introduction d'environ 100 mots à propos de l'histoire d'un autre village tout près dans lequel le même phénomène se produit. Nommer ce village. Parmi les survivants de cet autre village, il y a "+texte+"."
        }
        let reponse: string = await this.generer(question);
        this.finiDeGenerer =true;
        return reponse;
    }
    async genererTextePendantLaNuit(nomJoueurQuiMarcheLaNuit: string): Promise<string>{
        this.finiDeGenerer = false;
        let question: string = "Raconte en 20 mots que "+nomJoueurQuiMarcheLaNuit+" est en train de marcher pendant la nuit dans le village.";
        let reponse: string = await this.generer(question);
        this.finiDeGenerer = true;
        return reponse;
    }

    async genererTextejourSeLeve(joueursMorts: string[]): Promise<string>{
        this.finiDeGenerer = false;
        let question: string;
        if(joueursMorts.length>0){
            question = "En nommant ce même village, raconte en 20 mots qu'une autre journée se prépare avec une personne en moins.";
        } else {
            question = "En nommant ce même village, raconte en 20 mots qu'une autre journée commence sans personne de mort la nuit.";
        }
        let reponse: string = await this.generer(question);
        this.finiDeGenerer = true;
        return reponse;
    }

    async genererTexteAccusation(accuseur: string, accuse: string): Promise<string>{
        this.finiDeGenerer = false;
        let question: string;
        question = "Donne une raison valable en 10 mots à " + accuseur +" d'accuser "+ accuse;
        let reponse: string = await this.generer(question);
        this.finiDeGenerer = true;
        return reponse;
    }

    private async generer(texte: string): Promise<string>{
        if(!this.seed){
            this.discussionPrecendente.push({role: "user", content: texte});
            const chatCompletion = await this.openai.chat.completions.create({
                messages: this.discussionPrecendente,
                model: 'gpt-3.5-turbo-0125',
              });
            this.discussionPrecendente.push(chatCompletion.choices[0].message);
            return chatCompletion.choices[0].message.content as string
        } else {
            return "";
        }
    }


}
