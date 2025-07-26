import { Player } from "./player";
import { Role } from "./role";

enum SeerActionType {
    SeePlayerRole = "seer_player_role",
    SeeGroundRoles = "seer_ground_roles"
}

interface WerewolfAction {
    type: "werewolf";
}

interface MasonAction {
    type: "mason";
}

interface MinionAction {
    type: "minion";
}

interface RobberAction {
    type: "robber";
    targetPlayer: Player; 
}

interface TroublemakerAction {
    type: "troublemaker";
    player1: Player;
    player2: Player;
}

interface DrunkAction {
    type: "drunk";
    targetRoleId: string; 
}


interface SeerSeePlayerAction {
    type: SeerActionType.SeePlayerRole;
    targetPlayer: Player;
}

interface SeerSeeGroundRolesAction {
    type: SeerActionType.SeeGroundRoles;
    groundRole1: Role;
    groundRole2: Role;
}

type Action =
    | WerewolfAction
    | MinionAction
    | RobberAction
    | TroublemakerAction
    | DrunkAction
    | SeerSeePlayerAction
    | SeerSeeGroundRolesAction
    | MasonAction;


const createAction = {
    werewolf: (): WerewolfAction => ({type: "werewolf"}),
    minion: (): MinionAction => ({ type: "minion" }),
    robber: (targetPlayer: Player): RobberAction => ({ type: "robber", targetPlayer }),
    troublemaker: (player1: Player, player2: Player): TroublemakerAction => ({ 
        type: "troublemaker", player1, player2 
    }),
    mason: (): MasonAction => ({ type: "mason" }),
    drunk: (targetRoleId: string): DrunkAction => ({ type: "drunk", targetRoleId }),
    seerSeePlayer: (targetPlayer: Player): SeerSeePlayerAction => ({ 
        type: SeerActionType.SeePlayerRole, targetPlayer 
    }),
    seerSeeGroundRoles: (groundRole1: Role, groundRole2: Role): SeerSeeGroundRolesAction => ({ 
        type: SeerActionType.SeeGroundRoles, groundRole1, groundRole2 
    })
}

export {createAction, Action, SeerActionType}
