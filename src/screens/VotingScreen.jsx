import React, { useState } from "react";
import { useGame } from "../context/useGame";

function VotingScreen() {
	const { gameState, castVote } = useGame();
	const [selectedVote, setSelectedVote] = useState(""); // Store the ID of the player being voted for

	const currentPlayerIndex = gameState.currentPlayerTurnIndex;

	if (
		currentPlayerIndex === null ||
		currentPlayerIndex >= gameState.players.length
	) {
		return <div>Calculating results...</div>; // Should transition to ResultsScreen
	}

	const currentPlayer = gameState.players[currentPlayerIndex];
	const otherPlayers = gameState.players.filter(
		(p) => p.id !== currentPlayer.id
	);

	const handleVoteChange = (event) => {
		setSelectedVote(event.target.value);
	};

	const handleSubmitVote = (event) => {
		event.preventDefault();
		if (!selectedVote) {
			alert("Please select a player to vote for.");
			return;
		}
		castVote(currentPlayer.id, parseInt(selectedVote)); // Ensure ID is number if needed
		setSelectedVote(""); // Reset selection for next player
	};

	return (
		<div>
			<h2>Voting Phase</h2>
			<h3>Pass the device to: {currentPlayer.name}</h3>
			<p style={{ color: "#d8dde2" }}>
				Select the player you want to vote for:
			</p>
			<form
				onSubmit={handleSubmitVote}
				className="player-list-vote"
			>
				{otherPlayers.map((player) => (
					<label
						key={player.id}
						style={{ color: "#d8dde2" }}
					>
						<input
							type="radio"
							name="vote"
							value={player.id}
							checked={
								selectedVote ===
								String(player.id)
							}
							onChange={handleVoteChange}
						/>
						{player.name}
					</label>
				))}
				<button type="submit" disabled={!selectedVote}>
					Cast Vote for{" "}
					{gameState.players.find(
						(p) => p.id === parseInt(selectedVote)
					)?.name || "..."}
				</button>
			</form>
		</div>
	);
}

export default VotingScreen;
