import React from 'react';

// Expects theme ('light' or 'dark') and toggleTheme (function) as props
function ThemeToggle({ theme, toggleTheme }) {
  return (
    <div className="theme-toggle">
      <div
        className="toggle-switch"
        id="themeToggle"
        onClick={toggleTheme} // Call the function passed via props
        role="switch" // Accessibility
        aria-checked={theme === 'light'} // Accessibility
        tabIndex={0} // Make it focusable
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && toggleTheme()} // Keyboard activation
      ></div>
      <span className="toggle-text">Night/Day</span>
    </div>
  );
}

export default ThemeToggle;
