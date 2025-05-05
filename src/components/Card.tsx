import styled from 'styled-components';
import { theme } from '../theme';

export const Card = styled.div`
    background-color: ${theme.colors.surface};
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.lg};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: ${theme.spacing.md} 0;
`;
