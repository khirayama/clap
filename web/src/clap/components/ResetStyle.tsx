import { createGlobalStyle } from 'styled-components';

export const ResetStyle = createGlobalStyle`
  * {
    font-family: sans-serif;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    outline: 0;
    border: 0;
    border-radius: 0;
    vertical-align: baseline;
    -webkit-appearance: none;
  }
`;
