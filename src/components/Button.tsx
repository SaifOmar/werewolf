import styled from 'styled-components';
import { theme } from '../theme';

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'error' }>`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: opacity 0.2s ease;
    
    background-color: ${props =>
    props.variant === 'secondary' ? theme.colors.secondary :
      props.variant === 'error' ? theme.colors.error :
        theme.colors.primary};
        
    color: ${props =>
    props.variant === 'secondary' ? theme.colors.onSecondary :
      props.variant === 'error' ? theme.colors.onError :
        theme.colors.onPrimary};

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
