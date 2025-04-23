
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
        "action": "He knows the other maison in the game if existed to be able to find the truth easier"}},

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
        "roleName": "Trouble Maker",
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
    }
  ]`;

const teamJson = `{
    "Villians": "Werewolf",
    "GoodGuys": "Villagers"
  }`;


export const roles = JSON.parse(rolesJson);

export const teams = JSON.parse(teamJson);


