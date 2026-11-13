/** Every word on the site lives here, so wording can change without touching layout. */

export type GameId =
  | "mouseHunt"
  | "fishPond"
  | "birdGarden"
  | "bugSafari"
  | "critterPeek"
  | "laserChase"
  | "yarnString"
  | "floatPop"
  | "pawPaint"
  | "catTV"
  | "purrRoom";

export const copy = {
  meta: {
    title: "Paw Party: iPad games your cat can play",
    description:
      "Eleven iPad games for cats. Mice, fish, birds and bugs run across the screen and your cat catches them. Free, with no ads and no in-app purchases.",
  },

  nav: [
    { label: "Games", href: "#games" },
    { label: "For paws", href: "#paws" },
    { label: "For you", href: "#humans" },
    { label: "Questions", href: "#questions" },
  ],

  hero: {
    title: "iPad games your cat can actually play.",
    body: "Mice, fish, birds and bugs run across the screen. Your cat handles the rest. Paw Party is free, with no ads and nothing to buy inside.",
    promises: ["Free", "No ads", "No in-app purchases"],
    comingSoon: "On the App Store soon.",
    reelLabel: "A short reel of Paw Party: the cat mascot, four of the games, and the words Free on iPad.",
  },

  demo: {
    eyebrow: "Try it",
    title: "You be the cat.",
    body: "Click or tap the mouse. Miss, and it bolts, same as in the app. Catch a few and more show up, faster.",
    aside: "Your cat will be better at this than you are.",
    start: "Start",
    score: "Score",
    caught: "Caught",
    loading: "Fetching a mouse",
    failed: "The demo couldn't load in this browser. The app itself is fine.",
    canvasLabel: "Mouse-catching demo. Click or tap a mouse to catch it.",
  },

  games: {
    eyebrow: "The games",
    title: "Eleven of them.",
    body: "Eight keep score and get harder as your cat gets better. Three are for watching, painting and calming down.",
    items: [
      {
        id: "mouseHunt",
        name: "Mouse Hunt",
        line: "Mice dart, freeze, and bolt for a hole in the floorboards. Later levels bring a rat that takes three swats.",
      },
      {
        id: "fishPond",
        name: "Fish Pond",
        line: "Koi and goldfish under rippling water. The pufferfish inflates when poked, so poke it twice.",
      },
      {
        id: "birdGarden",
        name: "Bird Garden",
        line: "Birds fly in, hop around and peck, each with its own call. Miss by a little and they leave.",
      },
      {
        id: "bugSafari",
        name: "Bug Safari",
        line: "Ladybugs, a trail of ants, and a spider that drops in on a thread.",
      },
      {
        id: "critterPeek",
        name: "Critter Peek",
        line: "A mole, a frog and a hedgehog pop out of burrows, look around, and duck back in.",
      },
      {
        id: "laserChase",
        name: "Laser Chase",
        line: "The red dot, except it's green, because cats see green better than red.",
      },
      {
        id: "yarnString",
        name: "Yarn & String",
        line: "Yarn balls that roll when batted, and a feather hanging from a string.",
      },
      {
        id: "floatPop",
        name: "Float & Pop",
        line: "Bubbles, feathers and leaves drift across the screen. The bubbles pop.",
      },
      {
        id: "pawPaint",
        name: "Paw Paint",
        line: "Every touch leaves a paw print in paint. Save the result and tell people it was on purpose.",
      },
      {
        id: "catTV",
        name: "Cat TV",
        line: "A bird feeder, a pond and some fireflies. Nothing to catch, plenty to stare at.",
      },
      {
        id: "purrRoom",
        name: "Purr Room",
        line: "A slow glow and a purr, for winding down after all that hunting.",
      },
    ] satisfies { id: GameId; name: string; line: string }[],
    partyMix: {
      title: "Can't pick? Party Mix.",
      body: "One tap rotates through the games every few minutes and leans toward the ones your cat catches the most in.",
    },
  },

  paws: {
    eyebrow: "For paws",
    title: "Built around how a cat plays.",
    items: [
      {
        title: "Prey is life size",
        body: "A mouse is the same size on an iPad mini as on a 13-inch Pro. Bigger screens get more mice.",
        art: "paw",
      },
      {
        title: "It keeps up with your cat",
        body: "Catch a lot and everything speeds up. Miss a lot and it slows down. If the paws go quiet, the prey wanders closer.",
        art: "pounce",
      },
      {
        title: "There's no losing",
        body: "No timer running out, no game over. Levels only go up, and new animals arrive as they do.",
        art: "loaf",
      },
      {
        title: "Only you can leave",
        body: "Exiting a game takes a three-second hold on one corner. Cats tap and swipe. They don't hold.",
        art: "surprised",
      },
    ],
  },

  humans: {
    eyebrow: "For you",
    title: "A few things for the human.",
    body: "Hold the Humans button on the home screen and there's a whole back office.",
    items: [
      {
        title: "Stats",
        body: "Sessions, catches, reaction time, and a heat map of where the paws land.",
      },
      {
        title: "The Cat-alog",
        body: "65 animals to collect. The ones your cat hasn't caught yet stay as silhouettes.",
      },
      {
        title: "Trophies",
        body: "Twenty, from First Pounce to Apex Predator.",
      },
      {
        title: "Pounce Cam",
        body: "Takes a photo of your cat's face at the moment of a catch. It stays off until you turn it on.",
      },
      {
        title: "A session timer",
        body: "After ten minutes play winds down and you get a reminder to hand over a treat, since a screen never lets a cat hold what it caught.",
      },
      {
        title: "More than one cat",
        body: "Each cat gets its own levels, stats and trophies.",
      },
    ],
    screens: [
      { id: "stats", alt: "The stats screen: sessions, play time, catches, accuracy and a chart of play time by day." },
      { id: "catalog", alt: "The Cat-alog: a grid of animals, some caught and some still shown as grey silhouettes." },
      { id: "trophies", alt: "The trophies screen, with earned trophies in yellow and locked ones in grey." },
    ],
  },

  free: {
    title: "It's free.",
    body: "No ads. No in-app purchases. Every game is included, and the animals unlock by playing.",
    promises: ["No ads", "No in-app purchases"],
  },

  questions: {
    eyebrow: "Questions",
    title: "Things people ask.",
    items: [
      {
        q: "Which iPads does it run on?",
        a: "Any iPad on iPadOS 17 or later. That goes back to models from 2018, so the old one in the drawer probably works.",
      },
      {
        q: "Will my cat care?",
        a: "Some cats ignore screens completely, and no app fixes that. Try Fish Pond or Bug Safari first. Slow movers on a calm background are the easiest way in.",
      },
      {
        q: "How do I stop my cat swiping out of the app?",
        a: "Turn on Guided Access: open Settings, then Accessibility, then Guided Access. Open Paw Party, triple-click the top button (or the Home button on older iPads) and tap Start. Swipes and the Home gesture stop working until you triple-click again and enter your passcode.",
      },
      {
        q: "Will claws scratch the screen?",
        a: "Paw pads won't hurt glass. Grit caught under a claw can, so a glass screen protector is cheap insurance.",
      },
      {
        q: "How long should a session be?",
        a: "Ten to fifteen minutes is plenty. Finish with a treat or a toy your cat can grab, because catching something it can't hold gets frustrating.",
      },
      {
        q: "Is it really free?",
        a: "Yes. No ads and no in-app purchases.",
      },
      {
        q: "Is there an iPhone version?",
        a: "No, iPad only. A phone is a small hunting ground.",
      },
    ],
  },

  footer: {
    line: "Games for cats, on iPad.",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Support", href: "/support" },
    ],
    appleNote: "Apple, iPad and App Store are trademarks of Apple Inc.",
  },

  privacy: {
    title: "Privacy",
    draftNote: "This page is a draft and hasn't been through a final review yet.",
    sections: [
      {
        heading: "What the app stores",
        body: [
          "Paw Party keeps your cats' names, levels, play history, trophies and settings on your iPad.",
          "If you turn on Pounce Cam, the photos it takes are saved inside the app on your iPad. A photo goes to your photo library only when you tap Save.",
        ],
      },
      {
        heading: "The camera",
        body: [
          "The app asks for camera access only when you turn on Pounce Cam. While Pounce Cam is on, the front camera is active during play. Turn it off in the app's settings at any time.",
        ],
      },
      {
        heading: "Accounts, ads and purchases",
        body: ["The app has no accounts or sign-in. It shows no ads and has no in-app purchases."],
      },
      {
        heading: "This website",
        body: [
          "This site doesn't use cookies or analytics scripts. Like any website, the company that hosts it keeps standard server logs.",
        ],
      },
      {
        heading: "Changes",
        body: ["If any of this changes, this page will be updated before the change ships."],
      },
    ],
  },

  support: {
    title: "Support",
    body: "Most questions are answered below. If yours isn't, get in touch.",
    contactPrefix: "Email",
    noContact: "A contact address will be listed here when the app launches.",
    tipsTitle: "Getting set up",
    tips: [
      "Lay the iPad flat on the floor or a low table, on a rug or towel so it doesn't slide when pounced on.",
      "Start with the volume low. Cats hear far more than we do, and the squeaks carry.",
      "Dim the room a little. Prey stands out best when the screen is the brightest thing around.",
      "To leave a game, press and hold the corner badge for three seconds.",
    ],
  },
} as const;
