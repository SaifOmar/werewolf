function TimerDisplay({ seconds }) {
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="timer-display">
      Time Remaining: {formatTime(seconds)}
    </div>
  );
}

export default TimerDisplay;
