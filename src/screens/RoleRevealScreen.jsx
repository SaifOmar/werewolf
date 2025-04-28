import React, { useState } from "react";
import { useGame } from "../context/useGame";
import RoleCard from "../components/RoleCard";

function RoleRevealScreen() {
	const { gameState, advanceRoleReveal } = useGame();
	const [showRole, setShowRole] = useState(false);
	const [isFlipped, setIsFlipped] = useState(false);

	const currentPlayerIndex = gameState.currentPlayerTurnIndex;
	const currentPlayer = gameState.players[currentPlayerIndex];

	if (!currentPlayer) {
		return <div>Loading player data...</div>;
	}

	const handleReveal = () => {
		setShowRole(true);
	};

	const handleNext = () => {
		toggleFlip();
		setShowRole(false);
		advanceRoleReveal();
	};

	const toggleFlip = () => {
		setIsFlipped((prev) => !prev);
	};

	const handleButtonClick = () => {
		handleReveal();
		toggleFlip();
	};

	return (
		<div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
			<div className="flip-card-inner">
				<div className="flip-card-front">
					<div className="role-wolf-decoration"></div>
					<div className="card-content">
						<h2 className="role-text">
							Pass the device to{" "}
							{currentPlayer.name}
						</h2>
						{!showRole && (
							<button
								className="show-role-btn"
								onClick={handleButtonClick}
							>
								Show My Role
							</button>
						)}
					</div>
				</div>
				<div className="flip-card-back">
					<div className="role-wolf-decoration"></div>
					<div className="card-content">
						{showRole && (
							<div>
								<h3 className="role-title">
									Your Role
								</h3>
								<RoleCard
									role={currentPlayer.GetOriginalRole()}
								/>
								<button
									className="show-role-btn confirm-btn"
									onClick={handleNext}
								>
									OK, I've seen my role
								</button>
								<p className="reminder-text">
									Remember your role!
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default RoleRevealScreen;
