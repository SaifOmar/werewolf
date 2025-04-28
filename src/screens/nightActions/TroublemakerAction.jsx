import React, { useState } from "react";

function TroublemakerAction({ players, actingPlayerId, onSubmit }) {
	const [player1, setPlayer1] = useState("");
	const [player2, setPlayer2] = useState("");

	const otherPlayers = players.filter((p) => p.id !== actingPlayerId);

	const handleSubmit = () => {
		if (!player1 || !player2 || player1 === player2) {
			alert("Please select two different players to swap.");
			return;
		}
		onSubmit(actingPlayerId, {
			chosenAction: "default",
			players: [parseInt(player1), parseInt(player2)],
		});
	};

	const handleSkip = () => {
		// Troublemaker *can* choose not to swap
		onSubmit(actingPlayerId, { chosenAction: "skip", players: [] });
		console.log("Troublemaker chose not to swap.");
	};

	return (
		<div>
			<h4 style={{ color: "#d8dde2" }}>Troublemaker Action</h4>
			<p style={{ color: "#d8dde2" }}>
				Choose two other players to swap their cards.
			</p>
			<label style={{ color: "#d8dde2" }}>Player 1: </label>
			<select
				style={{
					padding: "10px",
					fontSize: "16px",
					borderRadius: "5px",
					border: "1px solid #ccc",
				}}
				value={player1}
				onChange={(e) => setPlayer1(e.target.value)}
			>
				<option value="">Select</option>
				{otherPlayers
					.filter((p) => p.id !== parseInt(player2))
					.map((p) => (
						<option key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
			</select>
			<label style={{ color: "#d8dde2" }}>Player 2: </label>
			<select
				style={{
					padding: "10px",
					fontSize: "16px",
					borderRadius: "5px",
					border: "1px solid #ccc",
				}}
				value={player2}
				onChange={(e) => setPlayer2(e.target.value)}
			>
				<option value="">Select</option>
				{otherPlayers
					.filter((p) => p.id !== parseInt(player1))
					.map((p) => (
						<option key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
			</select>
			<button
				onClick={handleSubmit}
				disabled={!player1 || !player2 || player1 === player2}
			>
				Swap Players
			</button>
			{/* <button onClick={handleSkip}>Don't Swap</button> */}
		</div>
	);
}

export default TroublemakerAction;
