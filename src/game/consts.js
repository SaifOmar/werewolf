const rolesJson = `[
  {
    "roleName": "Werewolf",
    "team": "Villians",
    "description": "He's the devil that when villagers vote on, they win",
    "effect":{
    "effectName":"silentHowl",
    "action": "he knows every werewolf in the game"
    }
  },

  {
    "roleName": "Minion",
    "team": "Villians",
    "description": "He knows all the werewolves in the game and tries to manipulate the game making werewolves unknown",
    "effect":{
    "effectName":"wolfFanboy",
    "action": "He acts like a 5anzeer until the match ends (he might not get back as a human after tho)"
    }
  },

  {
    "roleName": "Maison",
    "team": "GoodGuys",
    "description": "He's the watcher of the village trying to find the truth",
    "effect":{
    "effectName":"truthSeeker.exe",
    "action": "He knows the other maison in the game if existed to be able to find the truth easier"
    }
  },

  {
    "roleName": "Seer",
    "team": "GoodGuys",
    "description": "He sees what others can see!",
    "effect":{
    "effectName":"doublePeek",
    "action": "he see a player card or two ground cards"
    }
  },

  {
    "roleName": "Robber",
    "team": "GoodGuys",
    "description": "He's a thief but SHAREEF!",
    "effect":{
    "effectName":"ninjaHeist",
    "action": "he swaps his robber card with someone else's card and become the new role he took"
    }
  },

  {
    "roleName": "TroubleMaker",
    "team": "GoodGuys",
    "description": "He's making a scene all over the place!",
    "effect":{
    "effectName":"switcharoo",
    "action": "He swaps two player cards without seeing or knowing them and without those players knowing it too"
    }
  },

  {
    "roleName": "Drunk",
    "team": "GoodGuys",
    "description": "He is a weirdo moving around here and there doing something but drinking and acting strange not even remembering who he's",
    "effect":{
    "effectName":"oopsIClickedIt",
    "action": "He swaps his drunk card with one of the cards on the ground he chooses but he doesn't know it tho"
    }
  },

  {
    "roleName": "Clone",
    "team": "GoodGuys",
    "description": "He's YOU but probably better.",
    "effect":{
    "effectName":"MirrorImage",
    "action": "At night, he looks at one player and copies their role, becoming that role for the rest of the game."
    }
  },

  {
    "roleName": "Joker",
    "team": "Neutral",
    "description": "He hates his job, hates everyone, just wants to die!",
    "effect": {
    "effectName": "SelfDestruct",
    "action": "If Joker gets voted out, he wins and no one else!"
    }
  },

  {
    "roleName": "Insominac",
    "team": "GoodGuys",
    "description": "In a toxic relationship with his bed so that he finds out the painful truth.",
    "effect": {
    "effectName": "CaffeinePoweredSpy",
    "action": "He wakes up at the end of the night phase to know his new role if changed"
    }
  },

  {
    "roleName": "MysticWolf",
    "team": "Villians",
    "description": "She's beauty, she's grace, she'll stare right into your face...then destroy your village.",
    "effect": {
    "effectName": "SniffingSecrets",
    "action": "He's a Werewolf but basically a Seer too"
    }
  },
  {
    "roleName": "Witch",
    "team": "GoodGuys",
    "description": "Spin the bottle, literally. The Witch can either save someone with a magical 'here's a chance' potion or send someone to the grave with her 'oops' potion.",
    "effect": {
    "effectName": "PotionRoulette",
    "action": "She chooses a card from the ground cards to see and give to someone she decides to give it to."
    }
  },
  {
    "roleName": "DreamWolf",
    "team": "Villians",
    "description": "Lucid dreams that feel more real than reality itself. these dreams are filled with lies, designed to confuse and mislead their victims into doubting their own perceptions.",
    "effect": {
    "effectName": "LucidLiar",
    "action": "He's a Werewolf but wakes up alone to mislead and distract other villagers from truth, not even werewolves know about him."
    }
  },
  {
    "roleName": "Sentinel",
    "team": "GoodGuys",
    "description": "Like Batman, but with better sleep schedules and less brooding.",
    "effect": {
    "effectName": "CapedGuard",
    "action": "He chooses someone to guard him from any effect going on him."
    }
  }
  ]`;

const teamJson = `{
    "Villians": "Werewolves",
    "GoodGuys": "Villagers",
    "Neutral": "Joker"
  }`;

export const roles = JSON.parse(rolesJson);

export const teams = JSON.parse(teamJson);


