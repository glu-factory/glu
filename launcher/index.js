import { React, ReactDOM, html } from './utils/webModules.js';
import { StateProvider, useStateValue } from './utils/globalState.js';

import LoginPage from './components/LoginPage.js';
import HomePage from './components/HomePage.js';

const getGithubAccessTokenCookie = () =>
  `; ${document.cookie}`
    .split('; github_access_token=')
    .pop()
    .split(';')
    .shift();

const initialState = {
  githubAccessToken: getGithubAccessTokenCookie(),
  projects: null,
  templates: null,
  hasSearched: false,
  searchTerm: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'setGithubAccessToken':
      return { ...state, githubAccessToken: action.payload };
    case 'setProjects':
      return { ...state, projects: action.payload };
    case 'setTemplates':
      return { ...state, templates: action.payload };
    case 'setSearchTerm':
      return { ...state, hasSearched: true, searchTerm: action.payload };
    default:
      return { ...state };
  }
}

const Main = () => {
  const [state] = useStateValue();
  const { githubAccessToken } = state;
  return html`
    ${!githubAccessToken
      ? html`
          <${LoginPage} />
        `
      : html`
          <${HomePage} />
        `}
  `;
};

const App = () => {
  return html`
    <${StateProvider} initialState=${initialState} reducer=${reducer}
      ><${Main}
    /><//>
  `;
};

const temporaryAccessToken = new URLSearchParams(window.location.search).get(
  'code'
);
if (temporaryAccessToken && window.opener) {
  window.DONT_KILL = true;
  window.opener.sendTemporaryAccessToken(temporaryAccessToken);
} else {
  ReactDOM.render(
    html`
      <${App} />
    `,
    document.getElementById('root')
  );
}
