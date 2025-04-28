import React, { useState, useEffect } from "react";
import { useGame } from "../context/useGame";
import LoadingScreen from "./LoadingScreen";

// Import Action Components (Create these files!)
import GenericActionViewer from "./nightActions/GenericActionViewer"; // For roles that just view
import SeerAction from "./nightActions/SeerAction";
import RobberAction from "./nightActions/RobberAction";
import TroublemakerAction from "./nightActions/TroublemakerAction";
import DrunkAction from "./nightActions/DrunkAction";
// Add imports for Werewolf, Minion, Mason, Insomniac if they need specific UI

function NightPhaseScreen() {
	const {
		gameState,
		performNightAction,
		advanceNightAction,
		NIGHT_ACTION_ORDER,
	} = useGame();
	const [actionSubmitted, setActionSubmitted] = useState(false); // Track if action for *this role step* is done

	const currentRoleIndex = gameState.currentNightRoleIndex;
	console.log(`this is the current night role index ${currentRoleIndex}`);

	useEffect(() => {
		// Reset submission state when the role index changes
		setActionSubmitted(false);
	}, [currentRoleIndex]);

	if (
		currentRoleIndex < 0 ||
		currentRoleIndex >= NIGHT_ACTION_ORDER.length
	) {
		// Should transition away, but show loading/message briefly
		return <LoadingScreen message="Finishing night phase..." />;
	}

	const activeRoleName = NIGHT_ACTION_ORDER[currentRoleIndex];
	// Find players who *started* with this role - usually night actions depend on initial role
	// Except maybe Doppelganger, which needs special logic
	const playersWithActiveRole = gameState.players.filter(
		(p) => p.GetOriginalRole()?.roleName === activeRoleName
	);

	// Roles that typically just view information without specific choices presented here
	const viewingRoles = ["Werewolf", "Minion", "Maison", "Insomniac"]; // Adjust as needed

	const handleActionSubmit = async (playerId, args) => {
		if (actionSubmitted) return; // Prevent double submission
		setActionSubmitted(true); // Mark as submitted for this step
		const result = await performNightAction(playerId, args);
		// Optionally show feedback based on result before advancing
		if (result?.success) {
			console.log("result actually came back");
			// Maybe show gameState.actionResult briefly? Or just advance.
			// For simplicity, we'll rely on the "Next Role" button after result is shown.
		} else {
			// Error is handled by context, message shown in App.jsx
			setActionSubmitted(false); // Allow retry on error? Or force advance? Judge's call.
		}
	};

	const handleSkipOrContinue = () => {
		// For viewing roles or when action is done/error occurred
		advanceNightAction();
	};

	const renderActionComponent = () => {
		if (gameState.isLoading) {
			return (
				<LoadingScreen
					message={`Processing ${activeRoleName} action...`}
				/>
			);
		}

		// Display results if an action was just processed
		if (actionSubmitted && gameState.actionResult) {
			// Filter sensitive info if needed before stringifying
			const resultToShow =
				gameState.actionResult.results?.map(
					(item) => item?.roleName || item?.name || item
				) || "OK";
			return (
				<div>
					<h4>Action Result for {activeRoleName}:</h4>
					{/* Be careful about revealing too much info here depending on role */}
					<pre>{JSON.stringify(resultToShow, null, 2)}</pre>
					<button onClick={handleSkipOrContinue}>
						Next Role
					</button>
				</div>
			);
		}

		// If no players have this role, show message and allow skipping
		if (playersWithActiveRole.length === 0) {
			return (
				<div>
					<p style={{ color: "#d8dde2" }}>
						No players started as {activeRoleName}.
					</p>
					<button onClick={handleSkipOrContinue}>
						Next Role
					</button>
				</div>
			);
		}

		// --- Render Specific Action UI ---
		const actingPlayer = playersWithActiveRole[0]; // Simplification: Assume first player acts or receives info

		if (viewingRoles.includes(activeRoleName)) {
			// Component that shows relevant info (other wolves, masons, etc.)
			return (
				<GenericActionViewer
					roleName={activeRoleName}
					players={gameState.players}
					actingPlayerId={actingPlayer?.id}
					onAcknowledge={handleSkipOrContinue} // Simple OK button
				/>
			);
		}

		// Specific action components
		switch (activeRoleName) {
			case "Seer":
				return (
					<SeerAction
						players={gameState.players}
						groundCards={gameState.groundCards}
						actingPlayerId={actingPlayer.id}
						onSubmit={handleActionSubmit}
					/>
				);
			case "Robber":
				return (
					<RobberAction
						players={gameState.players}
						actingPlayerId={actingPlayer.id}
						onSubmit={handleActionSubmit}
					/>
				);
			case "TroubleMaker":
				return (
					<TroublemakerAction
						players={gameState.players}
						actingPlayerId={actingPlayer.id}
						onSubmit={handleActionSubmit}
					/>
				);
			case "Drunk":
				return (
					<DrunkAction
						groundCards={gameState.groundCards}
						actingPlayerId={actingPlayer.id}
						onSubmit={handleActionSubmit}
					/>
				);
			// Add cases for other roles like Doppelganger if they have interactive actions
			default:
				return (
					<div>
						<p>
							{activeRoleName} action UI not
							implemented yet.
						</p>
						<button onClick={handleSkipOrContinue}>
							Skip (Dev)
						</button>
					</div>
				);
		}
	};

	return (
		<div>
			<h2>Night Phase</h2>
			<h3>Judge: "{activeRoleName}, wake up!"</h3>
			<p style={{ color: "#d8dde2" }}>
				Player(s) with the role {activeRoleName}, perform your
				action.
			</p>
			{renderActionComponent()}
			{/* Optional: Add a general "Force Next Role" button for the judge if someone gets stuck */}
			{/* <button onClick={advanceNightAction} style={{backgroundColor: '#ffc107', color: 'black'}}>Judge: Force Next</button> */}
		</div>
	);
}

export default NightPhaseScreen;
