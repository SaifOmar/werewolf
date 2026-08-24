import { ROLE_ID_BY_NAME } from "@werewolf/shared";

export function roleIdOf(name: string): string {
  return ROLE_ID_BY_NAME[name] ?? name.toLowerCase();
}
