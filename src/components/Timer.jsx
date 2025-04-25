import React, { useState, useEffect, useRef, useCallback } from 'react';

// Constants (can be moved to a separate constants file if preferred)
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: { color: 'green' },
  warning: { color: 'orange', threshold: WARNING_THRESHOLD },
  alert: { color: 'red', threshold: ALERT_THRESHOLD },
};

// Helper Function to format time
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
};

function Timer() {
  const [timeLimit, setTimeLimit] = useState(360); // Default to 6 minutes (360 seconds)
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerIntervalRef = useRef(null); // Ref to hold interval ID

  // ----- Timer Logic Effect -----
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      // Start interval if active and time remaining
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Time's up
      setIsActive(false);
      setIsFinished(true);
      clearInterval(timerIntervalRef.current);
    }

    // Cleanup function: clear interval when component unmounts or isActive/timeLeft changes inappropriately
    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, [isActive, timeLeft]); // Re-run effect if isActive or timeLeft changes


  // ----- Reset Logic Effect -----
  // Reset timer display/state when timeLimit changes
  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsActive(false);
    setIsFinished(false);
    clearInterval(timerIntervalRef.current); // Clear any running interval
  }, [timeLimit]); // Re-run only when timeLimit changes


  // ----- Handlers -----
  const handleDurationChange = (event) => {
    setTimeLimit(parseInt(event.target.value, 10));
    // Resetting happens via the useEffect listening to timeLimit
  };

  const handleStart = () => {
    setIsFinished(false); // Ensure "time's up" message is cleared
    setTimeLeft(timeLimit); // Reset time to full duration before starting if needed/desired
    setIsActive(true);
  };

  const handleReset = () => {
    clearInterval(timerIntervalRef.current); // Stop timer
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(timeLimit); // Reset display to full time
  };

  const handleToggle = () => {
    if (isActive) {
      handleReset(); // If running, button acts as Reset
    } else {
      handleStart(); // If stopped, button acts as Start
    }
  };


  // ----- Calculated Values for Rendering -----
  const calculateTimeFraction = useCallback(() => {
    if (timeLimit === 0) return 0; // Prevent division by zero
    const rawTimeFraction = timeLeft / timeLimit;
    // Adjust calculation slightly for smoother animation start/end
    return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
  }, [timeLeft, timeLimit]);

  const getRemainingPathColor = useCallback(() => {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
      return alert.color;
    } else if (timeLeft <= warning.threshold) {
      return warning.color;
    } else {
      return info.color;
    }
  }, [timeLeft]);

  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} ${FULL_DASH_ARRAY}`;

  const remainingPathColor = getRemainingPathColor();
  const timerLabel = isFinished ? "time's up!" : formatTime(timeLeft);

  return (
    <>
      <div className="moon"></div>

      {/* Improved Trees */}
      <div className="tree tree1">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
          <div className="tree-layer tree-layer-3"></div>
        </div>
        <div className="tree-trunk"></div>
      </div>

      <div className="tree tree3">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
          <div className="tree-layer tree-layer-3"></div>
        </div>
        <div className="tree-trunk"></div>
      </div>
      <div className="ground"></div>

      {/* Timer Display SVG */}
      <div id="timer" className="base-timer"> {/* Added base-timer class */}
        <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g className="base-timer__circle">
            <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
            <path
              id="base-timer-path-remaining"
              strokeDasharray={circleDasharray}
              className={`base-timer__path-remaining ${remainingPathColor}`} // Apply color class dynamically
              d="
                                M 50, 50
                                m -45, 0
                                a 45,45 0 1,0 90,0
                                a 45,45 0 1,0 -90,0
                            "
            ></path>
          </g>
        </svg>
        <span id="base-timer-label" className="base-timer__label">
          {timerLabel}
        </span>
      </div>

      {/* Controls */}
      <select name="minutes" id="minutes" value={timeLimit} onChange={handleDurationChange}>
        <option value="360">6 minutes</option>
        <option value="480">8 minutes</option>
        <option value="600">10 minutes</option>
      </select>

      <button onClick={handleToggle} id="startTimer">
        {isActive ? 'Reset Timer' : 'Start Timer'} {/* Dynamic button text */}
      </button>
    </>
  );
}

export default Timer;
