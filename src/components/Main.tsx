import React from "react";
import { styled } from "styled-components";

export function Main(): JSX.Element {
  return <Background>main!</Background>;
}

export const Background = styled.div`
  background-color: blue;
  flex-grow: 1;
  color: white;
  font-size: 5rem;
`;
