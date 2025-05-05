





// Called by App.tsx when a player completes their night action selection

// Called by App.tsx AFTER all players have recorded their actions







// Called by App.tsx when a player submits their vote





// Helper for Drunk

// Helper for Werewolf/Minion/Mason - allows them to see other players/roles
// This info isn't stored permanently, it's just for the display phase.
// ActionResultDisplay component will call this sort of logic directly.

// Helper for Seer to get info (called by doAction)


// You might need helper methods for specific roles' doAction in roles.ts
// For example, RoleFactory could create roles that have a doAction method
// class SeerRole implements IRole { ... doAction(player, game, args) { game.lookAtPlayer(...) or game.lookAtCenter(...) return result; } }

