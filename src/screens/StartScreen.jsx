import React from "react";
import PlayerSetupScreen from "./PlayerSetupScreen";

function StartScreen() {
	// Directly render the setup screen as the starting point
	// Or have a button here that sets gameState.phase to 'setup' via context if needed
	return (
		<div className="container">
			<h1 className="title">One Night Ultimate Werewolf</h1>
			<p className="welcome">Welcome to the night...</p>
			<p className="instruction">
				Enter player names to begin the hunt
			</p>
			<PlayerSetupScreen />
		</div>
	);
}

export default StartScreen;
