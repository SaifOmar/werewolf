import React, { useState } from "react";

function SeerAction({ players, groundCards, actingPlayerId, onSubmit }) {
	const [actionType, setActionType] = useState(""); // 'player' or 'ground'
	const [selectedPlayer, setSelectedPlayer] = useState("");
	const [selectedGround1, setSelectedGround1] = useState("");
	const [selectedGround2, setSelectedGround2] = useState("");

	const otherPlayers = players.filter((p) => p.id !== actingPlayerId);
	const groundCardIndices = groundCards.map((_, index) => index);

	const handleSubmit = () => {
		if (actionType === "player" && selectedPlayer) {
			onSubmit(actingPlayerId, {
				chosenAction: "default",
				players: [parseInt(selectedPlayer)],
			});
		} else if (
			actionType === "ground" &&
			selectedGround1 !== "" &&
			selectedGround2 !== ""
		) {
			if (
				selectedGround1 === selectedGround2 &&
				groundCards.length > 1
			) {
				alert("Please select two different ground cards.");
				return;
			}
			onSubmit(actingPlayerId, {
				chosenAction: "secondary",
				groundCards: [
					parseInt(selectedGround1),
					parseInt(selectedGround2),
				],
			});
		} else {
			alert("Please complete your selection.");
		}
	};

	return (
		<div>
			<h4 style={{ color: "#d8dde2" }}>Seer Action</h4>
			<p style={{ color: "#d8dde2" }}>
				Choose to look at one other player's card OR two center
				cards.
			</p>

			<div>
				<button
					onClick={() => setActionType("player")}
					disabled={actionType === "player"}
				>
					Look at Player
				</button>
				<button
					onClick={() => setActionType("ground")}
					disabled={
						actionType === "ground" ||
						groundCards.length < 2
					}
				>
					Look at Center Cards
				</button>
			</div>

			{actionType === "player" && (
				<div>
					<label style={{ color: "#d8dde2" }}>
						Select Player:{" "}
					</label>
					<select
						style={{
							padding: "10px",
							fontSize: "16px",
							borderRadius: "5px",
							border: "1px solid #ccc",
						}}
						value={selectedPlayer}
						onChange={(e) =>
							setSelectedPlayer(e.target.value)
						}
					>
						<option value="">Select</option>
						{otherPlayers.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>
			)}

			{actionType === "ground" && (
				<div>
					<label style={{ color: "#d8dde2" }}>
						Select Card 1:{" "}
					</label>
					<select
						style={{
							padding: "10px",
							fontSize: "16px",
							borderRadius: "5px",
							border: "1px solid #ccc",
						}}
						value={selectedGround1}
						onChange={(e) =>
							setSelectedGround1(e.target.value)
						}
					>
						<option value="">Select</option>
						{groundCardIndices.map((i) => (
							<option key={i} value={i}>
								Center Card {i + 1}
							</option>
						))}
					</select>
					<label style={{ color: "#d8dde2" }}>
						Select Card 2:{" "}
					</label>
					<select
						style={{
							padding: "10px",
							fontSize: "16px",
							borderRadius: "5px",
							border: "1px solid #ccc",
						}}
						value={selectedGround2}
						onChange={(e) =>
							setSelectedGround2(e.target.value)
						}
					>
						<option value="">Select</option>
						{groundCardIndices
							.filter(
								(i) =>
									i !==
									parseInt(selectedGround1)
							)
							.map((i) => (
								<option key={i} value={i}>
									Center Card {i + 1}
								</option>
							))}
						{/* Handle case where only 1 card selected and only 1 ground card */}
						{groundCards.length === 1 &&
							groundCardIndices.length > 0 && (
								<option
									key={groundCardIndices[0]}
									value={
										groundCardIndices[0]
									}
								>
									Center Card{" "}
									{groundCardIndices[0] + 1}
								</option>
							)}
					</select>
				</div>
			)}

			<button
				onClick={handleSubmit}
				disabled={
					!actionType ||
					(actionType === "player" && !selectedPlayer) ||
					(actionType === "ground" &&
						(selectedGround1 === "" ||
							selectedGround2 === ""))
				}
			>
				Perform Seer Action
			</button>
		</div>
	);
}

export default SeerAction;
