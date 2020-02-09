import { React, html } from './webModules.js';

const { createContext, useContext, useReducer } = React;

export const StateContext = createContext();
export const StateProvider = ({ reducer, initialState, children }) => html`
  <${StateContext.Provider} value=${useReducer(reducer, initialState)}>
    ${children}
  <//>
`;

export const useStateValue = () => useContext(StateContext);
