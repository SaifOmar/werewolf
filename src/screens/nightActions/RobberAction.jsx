import React, { useState } from "react";

function RobberAction({ players, actingPlayerId, onSubmit }) {
	const [selectedPlayer, setSelectedPlayer] = useState("");
	const otherPlayers = players.filter((p) => p.id !== actingPlayerId);

	const handleSubmit = () => {
		if (!selectedPlayer) {
			alert("Please select a player to rob.");
			return;
		}
		onSubmit(actingPlayerId, {
			chosenAction: "default",
			players: [parseInt(selectedPlayer)],
		});
	};

	const handleSkip = () => {
		// Robber *can* choose not to rob
		onSubmit(actingPlayerId, { chosenAction: "skip", players: [] }); // Need to handle 'skip' in effect logic or context
		// For now, let's assume skip means advancing without action result
		console.log("Robber chose not to rob.");
		// This might require calling advanceNightAction directly or having onSubmit handle skips
	};

	return (
		<div>
			<h4 style={{ color: "#d8dde2" }}>Robber Action</h4>
			<p style={{ color: "#d8dde2" }}>
				Choose another player to swap cards with. You will see
				your new card.
			</p>
			<label style={{ color: "#d8dde2" }}>
				Select Player to Rob:{" "}
			</label>
			<select
				style={{
					padding: "10px",
					fontSize: "16px",
					borderRadius: "5px",
					border: "1px solid #ccc",
				}}
				value={selectedPlayer}
				onChange={(e) => setSelectedPlayer(e.target.value)}
			>
				<option value="">Select</option>
				{otherPlayers.map((p) => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
			<button onClick={handleSubmit} disabled={!selectedPlayer}>
				Rob Player
			</button>
			{/* <button onClick={handleSkip}>Don't Rob</button> */}{" "}
			{/* Add skip logic if needed */}
		</div>
	);
}

export default RobberAction;
