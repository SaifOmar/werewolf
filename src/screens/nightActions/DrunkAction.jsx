import React, { useState } from "react";

function DrunkAction({ groundCards, actingPlayerId, onSubmit }) {
	const [selectedCard, setSelectedCard] = useState("");
	const groundCardIndices = groundCards.map((_, index) => index);

	const handleSubmit = () => {
		if (selectedCard === "") {
			alert("Please select a center card to swap with.");
			return;
		}
		onSubmit(actingPlayerId, {
			chosenAction: "default",
			groundCards: [parseInt(selectedCard)],
		});
	};

	// Drunk *must* swap
	if (groundCards.length === 0) {
		return (
			<div style={{ color: "#d8dde2" }}>
				No ground cards available for Drunk to swap with. (This
				shouldn't happen in standard rules){" "}
				<button
					onClick={() =>
						onSubmit(actingPlayerId, {
							chosenAction: "skip",
						})
					}
				>
					OK
				</button>
			</div>
		);
	}

	return (
		<div>
			<h4 style={{ color: "#d8dde2" }}>Drunk Action</h4>
			<p style={{ color: "#d8dde2" }}>
				Choose one center card to exchange your card with. You
				will not see your new card.
			</p>
			<label style={{ color: "#d8dde2" }}>
				Select Center Card:{" "}
			</label>
			<select
				value={selectedCard}
				onChange={(e) => setSelectedCard(e.target.value)}
				style={{
					padding: "10px",
					fontSize: "16px",
					borderRadius: "5px",
					border: "1px solid #ccc",
				}}
			>
				<option value="">--Select--</option>
				{groundCardIndices.map((i) => (
					<option key={i} value={i}>
						Center Card {i + 1}
					</option>
				))}
			</select>
			<button onClick={handleSubmit} disabled={selectedCard === ""}>
				Swap with Center Card
			</button>
		</div>
	);
}

export default DrunkAction;
