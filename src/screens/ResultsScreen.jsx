import React, { useEffect } from "react";
import { useGame } from "../context/useGame";
import LoadingScreen from "./LoadingScreen";

function ResultsScreen() {
	const { gameState, resetGame } = useGame();

	if (gameState.winners === null) {
		return <LoadingScreen message="Calculating results..." />;
	}

	
	// const displayWinners = gameState.winners || determineWinner() || "Undetermined";
	const displayWinners = gameState.winners || "Undetermined";

	return (
		<div className="wdkr_game_over_container">
			<div className="n7gt_header_section">
				<h2 className="jk2p_game_over_title">Game Over!</h2>
				<h3 className="b5lm_winner_announcement">
					{displayWinners.includes("Win") ? "🏆 " : ""}
					{displayWinners}
				</h3>
			</div>

			<div className="f9qz_results_section">
				<h4 className="p3xs_section_title">Player Roles:</h4>
				<ul className="v8tc_player_list">
					{gameState.players.map((player) => (
						<li key={player.id} className="m2hd_player_item">
							<strong className="r6yv_player_name">{player.name}</strong>
							<div className="g4pf_role_info">
								<span className="z9xw_role_label">Started as:</span>
								<span className="y3qc_role_value">
									{player.GetOriginalRole()?.roleName || "N/A"}
								</span>
							</div>
							<div className="g4pf_role_info">
								<span className="z9xw_role_label">Ended as:</span>
								<span className="y3qc_role_value">
									{player.GetRole()?.roleName || "N/A"}
								</span>
							</div>
						</li>
					))}
				</ul>
			</div>

			<div className="f9qz_results_section">
				<h4 className="p3xs_section_title">Ground Cards:</h4>
				<ul className="t5kj_cards_list">
					{gameState.groundCards.map((card, index) => (
						<li key={index} className="c8rm_card_item">
							<span className="h1pd_card_label">Center Card {index + 1}:</span>
							<span className="s4vb_card_role">
								{card.roleName} (team: {card.team})
							</span>
						</li>
					))}
				</ul>
			</div>

			<div className="f9qz_results_section">
				<h4 className="p3xs_section_title">Voting Results:</h4>
				<ul className="t5kj_cards_list">
					{Object.entries(gameState.playerVotes).map(
						([voterId, votedForId]) => {
							const voter = gameState.players.find(
								(p) => p.id === parseInt(voterId)
							);
							const votedFor = gameState.players.find(
								(p) => p.id === parseInt(votedForId)
							);
							return (
								<li key={voterId} className="c8rm_card_item">
									{voter?.name || `Player ${voterId}`} voted for{" "}
									{votedFor?.name || `Player ${votedForId}`}
								</li>
							);
						}
					)}
				</ul>
			</div>

			<button onClick={resetGame} className="x9jq_play_again_button">
				Play Again?
			</button>
		</div>
	);
}

export default ResultsScreen;