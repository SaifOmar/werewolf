import React from "react";

function PlayerInput({ index, value, onChange }) {
	return (
		<div className="player-entry">
			<label htmlFor={`player-${index}`} className="player-label">
				Player {index + 1}:{" "}
			</label>
			<input
				type="text"
				id={`player-${index}`}
				value={value}
				onChange={(e) => onChange(index, e.target.value)}
				placeholder={`Enter name for Player ${index + 1}`}
				required={index < 6} // Example: require first 6
				className="player-input"
			/>
		</div>
	);
}

export default PlayerInput;
