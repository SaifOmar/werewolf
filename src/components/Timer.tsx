import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const TimerContainer = styled.div`
    background-color: ${theme.colors.surface};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    text-align: center;
    font-size: 2rem;
    margin: ${theme.spacing.md} 0;
`;

interface TimerProps {
  seconds: number;
  onComplete: () => void;
}

export const Timer: React.FC<TimerProps> = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContainer>
      {formatTime(timeLeft)}
    </TimerContainer>
  );
};
