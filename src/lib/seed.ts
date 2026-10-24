export interface Question {
  q: string;
  expectedPoints: string[];
}
export interface Level {
  id: string;
  title: string;
  questions: Question[];
}
export interface Chapter {
  id: string;
  title: string;
  levels: Level[];
}
export interface Course {
  id: string;
  title: string;
  chapters: Chapter[];
}

const L = (id: string, title: string, questions: [string, string[]][]): Level => ({
  id,
  title,
  questions: questions.map(([q, expectedPoints]) => ({ q, expectedPoints })),
});

export const SEED_COURSE: Course = {
  id: "cinema",
  title: "History of Italian Cinema",
  chapters: [
    {
      id: "neo",
      title: "Neorealism",
      levels: [
        L("cinema-rome", "Rome Open City", [
          ["Why is Rome Open City (1945) considered the founding film of Italian Neorealism?", ["Directed by Roberto Rossellini in 1945", "Shot right after the liberation of Rome, in real locations", "Used scarce, mixed film stock and non-professional actors alongside stars", "Depicts the Resistance against Nazi occupation with documentary-like realism"]],
          ["Describe the role of Pina, played by Anna Magnani, and why her death scene is so famous.", ["Anna Magnani plays Pina, a working-class widow about to remarry", "She is shot running after the truck that arrests her fiancé Francesco", "The scene is raw, sudden and unsentimental", "It became an iconic image of civilian suffering under occupation"]],
          ["How does the film portray the alliance between Catholics and Communists in the Resistance?", ["Don Pietro, a priest, helps the partisans", "Manfredi is a Communist Resistance leader", "Both are captured and killed by the Nazis", "It suggests national unity across ideologies against fascism"]],
        ]),
        L("cinema-bike", "Bicycle Thieves", [
          ["What is the plot of Bicycle Thieves (1948) and why is the bicycle so important?", ["Directed by Vittorio De Sica, written with Cesare Zavattini", "Antonio Ricci gets a job putting up posters that requires a bicycle", "The bicycle is stolen on his first day", "Losing it means losing his livelihood in postwar poverty"]],
          ["Why did De Sica cast non-professional actors, and who were they?", ["Lamberto Maggiorani was a factory worker", "Enzo Staiola played the son Bruno", "Non-professionals gave authenticity", "De Sica refused producer pressure to cast a star like Cary Grant"]],
          ["Interpret the ending of Bicycle Thieves.", ["Antonio tries to steal a bicycle himself and is caught", "He is humiliated in front of his son", "Bruno takes his hand: dignity and love despite defeat", "No resolution: society offers no solution to poverty"]],
        ]),
        L("cinema-desica", "De Sica vs Rossellini", [
          ["Compare the styles of De Sica and Rossellini within Neorealism.", ["Rossellini: more documentary, rough, historical and later spiritual", "De Sica: more emotional, humanist, focused on individual suffering", "De Sica's partnership with Zavattini shaped everyday-life stories", "Both used real locations and non-professionals"]],
          ["What was Cesare Zavattini's theory of cinema?", ["Screenwriter and main theorist of Neorealism", "Cinema should follow the 'shadowing' of everyday reality", "Rejected invented plots and spectacle", "Ideal film: 90 minutes of a person's ordinary life"]],
          ["Why did Neorealism decline in the early 1950s?", ["Economic recovery and changing audience tastes", "Government hostility, e.g. Andreotti criticising Umberto D.", "Andreotti law and censorship pressures", "Directors moved toward more personal or 'pink neorealism' styles"]],
        ]),
      ],
    },
    {
      id: "comm",
      title: "Commedia all'italiana",
      levels: [
        L("cinema-sorpasso", "Il Sorpasso", [
          ["What is Il Sorpasso (1962) about?", ["Directed by Dino Risi", "Bruno (Vittorio Gassman) and Roberto (Jean-Louis Trintignant)", "Road trip along the Aurelia during Ferragosto", "Brash extrovert drags a shy student into adventure"]],
          ["How does Il Sorpasso portray the Italian economic miracle?", ["Set during the 'boom' of the late 1950s-early 60s", "Cars, speed, consumerism and beaches as symbols", "Superficial optimism and moral emptiness", "Critique of a society rushing forward without values"]],
          ["Why is the ending of Il Sorpasso so shocking?", ["Comedy turns into tragedy", "Roberto dies in a car crash caused by Bruno's overtaking", "Bruno survives, barely knowing him", "Shows the dark side and cost of the boom's recklessness"]],
        ]),
        L("cinema-toto", "Totò and Italian comedy", [
          ["Who was Totò and what made his comedy unique?", ["Antonio de Curtis, Neapolitan comedian", "Rooted in variety theatre and commedia dell'arte", "Surreal wordplay, mime and physical comedy", "Played poor, cunning characters fighting hunger and authority"]],
          ["How does Totò's comedy differ from the later commedia all'italiana?", ["Totò is more farcical and mask-like", "Commedia all'italiana mixes comedy with social satire and bitterness", "Later films feature Sordi, Gassman, Tognazzi, Manfredi", "Commedia all'italiana often ends in defeat or tragedy"]],
          ["Name a key collaboration of Totò with an auteur director.", ["Pier Paolo Pasolini's Uccellacci e uccellini (1966)", "Also with Ninetto Davoli", "Showed his dramatic, melancholic side", "Gained critical reevaluation late in his career"]],
        ]),
        L("cinema-fantozzi", "Fantozzi", [
          ["Who is Ugo Fantozzi?", ["Character created and played by Paolo Villaggio", "First film Fantozzi (1975), directed by Luciano Salce", "A clumsy, humiliated office clerk", "Victim of bosses and corporate hierarchy"]],
          ["What does Fantozzi satirise about Italian society?", ["Corporate alienation and servility", "Rigid class hierarchy in companies", "Mass culture, holidays and consumer rituals", "The frustrated lower-middle class"]],
          ["Explain the famous 'Corazzata Potëmkin' scene.", ["Employees are forced to watch Eisenstein's film at a cineforum", "Fantozzi declares it 'una cagata pazzesca'", "Receives 92 minutes of applause", "Mocks imposed elitist culture and intellectual conformism"]],
        ]),
      ],
    },
    {
      id: "fellini",
      title: "Fellini",
      levels: [
        L("cinema-dolce", "La Dolce Vita", [
          ["What is La Dolce Vita (1960) about?", ["Directed by Federico Fellini", "Marcello Mastroianni as a gossip journalist in Rome", "Episodic structure over seven days and nights", "Search for meaning in a decadent high society"]],
          ["Describe the Trevi Fountain scene and its meaning.", ["Anita Ekberg as Sylvia wades into the fountain", "Marcello joins her", "Dreamlike moment of desire and beauty", "The magic ends abruptly: unattainable ideal"]],
          ["What words or concepts did La Dolce Vita give to the world?", ["The word 'paparazzi' from the photographer Paparazzo", "'La dolce vita' as an expression for glamorous life", "Won the Palme d'Or at Cannes", "Scandal and condemnation from the Catholic press"]],
        ]),
        L("cinema-8", "8½", [
          ["Why is the film called 8½?", ["Fellini had made roughly seven and a half films before", "Self-referential numbering", "Released 1963", "It is about a director's creative block"]],
          ["Who is Guido Anselmi and what is his crisis?", ["Played by Marcello Mastroianni", "Alter ego of Fellini", "A director unable to make his next film", "Overwhelmed by women, producers, memories and guilt"]],
          ["How does 8½ mix reality, memory and fantasy?", ["Seamless shifts between dreams, flashbacks and reality", "Opening traffic jam dream", "Harem fantasy sequence", "Final circus-like parade of all characters: acceptance"]],
        ]),
        L("cinema-amarcord", "Amarcord", [
          ["What does 'Amarcord' mean and what is the film about?", ["Romagnol dialect for 'I remember'", "Fellini's 1973 film", "A year in a small town modelled on Rimini", "Seen largely through the teenager Titta"]],
          ["How does Amarcord depict fascism?", ["Fascism as collective childish immaturity", "The parade and giant Mussolini head", "Father humiliated with castor oil", "Grotesque comedy rather than heroic drama"]],
          ["Describe one iconic scene of Amarcord.", ["The Rex ocean liner passing at night", "Townspeople in boats dreaming of modernity", "Or the peacock in the snow / the 'manine' spring fluff", "Mix of nostalgia, myth and irony; won the Oscar for Best Foreign Film"]],
        ]),
      ],
    },
  ],
};
