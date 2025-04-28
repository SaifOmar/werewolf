import React, { useState, useEffect } from "react";

function GenericActionViewer({
	roleName,
	players,
	actingPlayerId,
	onAcknowledge,
}) {
	const [info, setInfo] = useState("");

	useEffect(() => {
		let revealedInfo = "No specific info revealed.";
		const actingPlayer = players.find((p) => p.id === actingPlayerId);
		if (!actingPlayer) return;

		switch (roleName) {
			case "Werewolf":
				const otherWolves = players.filter(
					(p) =>
						p.GetOriginalRole()?.roleName ===
							"Werewolf" && p.id !== actingPlayerId
				);
				revealedInfo =
					otherWolves.length > 0
						? `Other Werewolf: ${otherWolves
								.map((p) => p.name)
								.join(", ")}`
						: "You are the only Werewolf.";
				// Lone wolf might look at a center card - needs rule check & logic addition
				break;
			case "Maison":
				const otherMasons = players.filter(
					(p) =>
						p.GetOriginalRole()?.roleName ===
							"Maison" && p.id !== actingPlayerId
				);
				revealedInfo =
					otherMasons.length > 0
						? `Other Mason: ${otherMasons
								.map((p) => p.name)
								.join(", ")}`
						: "You are the only Mason.";
				break;
			case "Minion":
				const werewolves = players.filter(
					(p) =>
						p.GetOriginalRole()?.roleName === "Werewolf"
				);
				revealedInfo =
					werewolves.length > 0
						? `The Werewolf/ves is/are: ${werewolves
								.map((p) => p.name)
								.join(", ")}`
						: "There are no Werewolves in play.";
				break;
			case "Insomniac":
				// IMPORTANT: Insomniac sees their FINAL card AFTER all swaps.
				// This might need to run as the VERY last step of the night phase.
				// Or, the GameContext needs to pass the *final* role here.
				// Let's assume for now it gets the current role from player instance.
				revealedInfo = `You check your card. You are now: ${
					actingPlayer.GetRole()?.roleName
				}`;
				break;
			default:
				break;
		}
		setInfo(revealedInfo);
	}, [roleName, players, actingPlayerId]);

	return (
		<div>
			<h4 style={{ color: "#d8dde2" }}>{roleName} Action</h4>
			<p style={{ color: "#d8dde2" }}>{info}</p>
			<button onClick={onAcknowledge}>OK</button>
		</div>
	);
}

export default GenericActionViewer;
