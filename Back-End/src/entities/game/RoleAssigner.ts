import { ROLE_NAMES, NUMBER_OF_GROUND_ROLES, MIN_PLAYERS } from "@werewolf/shared";
import { Role, RoleClasses } from "../roles";
import { Player } from "../Player";
import { Logger } from "../../utils/Logger";
import { roleIdOf } from "../roles/roleId";

function getRoleDistribution(playerCount?: number) {
  let werewolfCount = 2;
  if (playerCount && playerCount >= 9) {
    werewolfCount = 3;
  }
  return {
    [ROLE_NAMES.WEREWOLF]: werewolfCount,
    [ROLE_NAMES.MINION]: 1,
    [ROLE_NAMES.SEER]: 1,
    [ROLE_NAMES.MASON]: 2,
    [ROLE_NAMES.ROBBER]: 1,
    [ROLE_NAMES.TROUBLEMAKER]: 1,
    [ROLE_NAMES.CLONE]: 1,
    [ROLE_NAMES.DRUNK]: 1,
    [ROLE_NAMES.INSOMNIAC]: 1,
    [ROLE_NAMES.JOKER]: 1,
    [ROLE_NAMES.WARLOCK]: 1,
    [ROLE_NAMES.ORACLE]: 1,
  };
}

export class RoleAssigner {
  private numberOfWerewolf: number;
  private numberOfMasons: number;
  private numberOfGroundRoles: number = NUMBER_OF_GROUND_ROLES;

  constructor(private logger: Logger) {
    const roleDistribution = getRoleDistribution(MIN_PLAYERS);
    this.numberOfWerewolf = roleDistribution[ROLE_NAMES.WEREWOLF];
    this.numberOfMasons = roleDistribution[ROLE_NAMES.MASON];
  }

  createRoles(): Role[] {
    let roles: Role[] = [];
    const roleNames = ["werewolf", "mason", "seer", "drunk", "troublemaker", "robber", "minion"];

    for (let i = 0; i < roleNames.length; i++) {
      let role: Role;

      if (roleNames[i] === "mason") {
        continue;
      }

      if (roleNames[i] === "werewolf") {
        for (let j = 0; j < this.numberOfWerewolf; j++) {
          role = new RoleClasses[roleNames[0].toLowerCase()]();
          roles.push(role);
          if (j < this.numberOfMasons) {
            role = new RoleClasses[roleNames[1].toLowerCase()]();
            roles.push(role);
          }
        }
        continue;
      }

      role = new RoleClasses[roleNames[i].toLowerCase()]();
      roles.push(role);
    }

    return roles;
  }

  addRoles(availableRoles: Role[], playerCount: number): void {
    const extraRolesInOrder = ["clone", "insomniac", "joker", "werewolf", "warlock", "oracle"];
    const needed = playerCount + this.numberOfGroundRoles - availableRoles.length;

    for (let i = 0; i < needed && i < extraRolesInOrder.length; i++) {
      const role = new RoleClasses[extraRolesInOrder[i].toLowerCase()]();
      availableRoles.push(role);
    }
  }

  assignRandomRoles(players: Player[], availableRoles: Role[], currentGameRolesMap: Map<string, number>): void {
    this.logger.info(`available roles: ${availableRoles.map((r) => r.name)}`);

    if (availableRoles.length < players.length + this.numberOfGroundRoles) {
      this.addRoles(availableRoles, players.length);
      this.logger.warn("added roles");
    }

    for (let i = 0; i < players.length; i++) {
      const randomIndex = Math.floor(Math.random() * availableRoles.length);
      const role = availableRoles[randomIndex];
      players[i].AddRole(role);

      const current = currentGameRolesMap.get(role.name) ?? 0;
      currentGameRolesMap.set(role.name, current + 1);
      availableRoles.splice(randomIndex, 1);
    }

    currentGameRolesMap.forEach((value, key) => {
      this.logger.info(`key: ${key}, value: ${value}`);
    });

    this.ensureRolesForPlayers(players, availableRoles, currentGameRolesMap);
  }

  /**
   * Dev/test-only hook (WEREWOLF_ENSURE="clone,insomniac"): guarantees the
   * listed roles are dealt to PLAYERS rather than landing in the ground or
   * staying in the pool. No effect when the env var is unset.
   */
  private ensureRolesForPlayers(players: Player[], availableRoles: Role[], currentGameRolesMap: Map<string, number>): void {
    const ensureEnv = process.env.WEREWOLF_ENSURE;
    if (!ensureEnv) return;

    for (const roleId of ensureEnv.split(",").map((s) => s.trim()).filter(Boolean)) {
      const alreadyDealt = players.some((p) => roleIdOf(p.getOriginalRole().name) === roleId);
      if (alreadyDealt) continue;

      const poolIdx = availableRoles.findIndex((r) => roleIdOf(r.name) === roleId);
      if (poolIdx === -1) {
        this.logger.warn(`ensureRoles: ${roleId} not in pool — cannot guarantee`);
        continue;
      }

      const victimIdx = Math.floor(Math.random() * players.length);
      const swappedOut = players[victimIdx].getRole();
      players[victimIdx].AddRole(availableRoles[poolIdx]);
      availableRoles.splice(poolIdx, 1);
      availableRoles.push(swappedOut);

      const addedName = players[victimIdx].getOriginalRole().name;
      currentGameRolesMap.set(addedName, (currentGameRolesMap.get(addedName) ?? 0) + 1);
      const prevOut = currentGameRolesMap.get(swappedOut.name) ?? 1;
      if (prevOut <= 1) currentGameRolesMap.delete(swappedOut.name);
      else currentGameRolesMap.set(swappedOut.name, prevOut - 1);

      this.logger.warn(`ensureRoles: forced ${roleId} onto player ${players[victimIdx].name} (swapped out ${swappedOut.name})`);
    }
  }

  createRoleQueue(): string[] {
    const roleOrder = [ROLE_NAMES.WEREWOLF, ROLE_NAMES.MINION, ROLE_NAMES.CLONE, ROLE_NAMES.SEER, ROLE_NAMES.MASON, ROLE_NAMES.ROBBER, ROLE_NAMES.TROUBLEMAKER, ROLE_NAMES.DRUNK, ROLE_NAMES.WARLOCK, ROLE_NAMES.INSOMNIAC, ROLE_NAMES.JOKER, ROLE_NAMES.ORACLE];

    this.logger.info(`role order template: ${roleOrder.join(", ")}`);
    console.log(`role order template: ${roleOrder.join(", ")}`);

    return roleOrder;
  }

  buildActiveRoleQueue(players: Player[], groundRoles: Role[], roleTimers: Map<string, number>): string[] {
    const roleOrder = [ROLE_NAMES.WEREWOLF, ROLE_NAMES.MINION, ROLE_NAMES.CLONE, ROLE_NAMES.SEER, ROLE_NAMES.MASON, ROLE_NAMES.ROBBER, ROLE_NAMES.TROUBLEMAKER, ROLE_NAMES.DRUNK, ROLE_NAMES.WARLOCK, ROLE_NAMES.INSOMNIAC, ROLE_NAMES.JOKER, ROLE_NAMES.ORACLE];

    const rolesInGame = new Set<string>();
    players.forEach((p) => rolesInGame.add(p.getOriginalRole().name));
    groundRoles.forEach((r) => rolesInGame.add(r.name));

    const activeQueue = roleOrder.filter((roleName) => rolesInGame.has(roleName));

    console.log(`🎭 Roles in game: ${Array.from(rolesInGame).join(", ")}`);
    console.log(`📋 Active role queue: ${activeQueue.join(", ")}`);

    let totalTime = 0;
    activeQueue.forEach((role) => {
      totalTime += roleTimers.get(role) || 10;
    });
    console.log(`⏱️ Total night duration: ${totalTime}s`);

    return activeQueue;
  }
}
