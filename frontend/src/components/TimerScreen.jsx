// src/components/TimerScreen.js (Rename ShowTimer to TimerScreen)
import React from "react";
import Timer from "./Timer"; // Assuming Timer.js is in the same folder
import ThemeToggle from "./ThemeToggle"; // Assuming ThemeToggle.js is in the same folder
// Note: No need to import timer.css here if App imports it and styles are global

// Props expected: theme, toggleTheme (passed down from App)
function TimerScreen({ theme, toggleTheme }) {
	// const handleNext = () => {
	// 	// Navigate to the next phase (e.g., voting)
	// 	window.location.href = "vote.html"; // Keep simple navigation for now
	// 	// Or use React Router: navigate('/vote');
	// };

	// The main container's theme class (`game-container`) is handled by App.
	// We only need the specific elements for this screen.
	return (
		<>
			{" "}
			{/* Use Fragment as we don't need an extra wrapper div */}
			{/* Theme Toggle - App could render this globally, or pass props */}
			<ThemeToggle theme={theme} toggleTheme={toggleTheme} />
			{/* Timer Component */}
			<Timer />
			{/* Navigation Button */}
			<div className="btn">
				<button id="movement" >
					Next
				</button>
			</div>
			{/* Decorative elements are now rendered in App */}
		</>
	);
}

export default TimerScreen;
