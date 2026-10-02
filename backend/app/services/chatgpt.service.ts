import { OpenAI } from "openai";

export class ChatgptService {

    private key: string;
    private openai: OpenAI;
    public finiDeGenerer: boolean = true;
    private seed: boolean;
    private discussionPrecendente:OpenAI.Chat.Completions.ChatCompletionMessageParam[]; 
    constructor(seed: boolean = false){
        this.key = process.env.OPEN_AI_KEY!;
        this.openai = new OpenAI({apiKey: this.key});
        this.seed = seed;
        this.discussionPrecendente = [];
        if(!this.key){
            throw new Error("pas de OPEN_AI_KEY.");
        }
    }

    async test(): Promise<string>{
        this.openai = new OpenAI({apiKey: this.key});
        const chatCompletion = await this.openai.chat.completions.create({
            messages: this.discussionPrecendente,
            model: 'gpt-5.6-luna',
        });
        return chatCompletion.choices[0].message.content as string
    }

    async genererSpeech(texte: string): Promise<Buffer>{
        console.log("alloooo");
    //     const speech = await this.openai.audio.speech.create({
    //     model: "gpt-4o-mini-tts",
    //     voice: "onyx",
    //     input: texte,
    //     instructions: `
    //     Perform this narration as a real human voice actor in a cinematic dark-fantasy film.

    // VOICE:
    // - Very deep, resonant, mature male baritone
    // - Extremely low and rich vocal register
    // - Strong chest resonance
    // - Dark, warm and powerful timbre
    // - Authoritative but natural
    // - Never artificially deepen or exaggerate the voice

    // PERFORMANCE:
    // - Do not simply read the words.
    // - ACT the text and emotionally experience what you are saying.
    // - Every sentence should have a clear intention and emotion.
    // - React emotionally to the meaning of each sentence.
    // - Build tension progressively when the story becomes darker.
    // - Sound genuinely intrigued, concerned, mysterious, threatening or solemn
    //   depending on what the text says.
    // - Use natural variations in pitch, volume, rhythm and intensity.
    // - Let important words carry emotional weight.
    // - Use subtle breaths and natural pauses where appropriate.
    // - Do not give every sentence the same intonation.
    // - Avoid repetitive speech patterns.

    // DELIVERY:
    // - Slow and deliberate, but NOT unnaturally slow.
    // - Natural human phrasing.
    // - Dramatic pauses before important revelations.
    // - Vary the rhythm from sentence to sentence.
    // - Sometimes whisper slightly when the story calls for secrecy.
    // - Become more powerful when announcing something important.
    // - Become quieter and more intimate during mysterious moments.
    // - Never sound like an AI assistant.
    // - Never sound like a GPS, audiobook robot or automated announcement.

    // CINEMATIC STYLE:
    // - Premium cinematic movie trailer / television commercial narration.
    // - Dark fantasy atmosphere.
    // - Ancient storyteller who has witnessed centuries of history.
    // - Wise, imposing and mysterious.
    // - The listener should feel that something important and dangerous is about to happen.

    // Most importantly:
    // FEEL THE STORY.
    // Do not mechanically pronounce the text.
    // Perform it as an experienced human actor would.
    // `
    //     });
        const speech = await this.openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: texte
        });
        const buffer = Buffer.from(await speech.arrayBuffer());


        return buffer;
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
