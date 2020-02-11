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

const setGithubAccessTokenCookie = val => {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 1);
  document.cookie = `github_access_token=${val};expires=${now.toGMTString()};path=/`;
};

const initialState = {
  githubAccessToken: getGithubAccessTokenCookie(),
  user: null,
  projects: null,
  featuredProjects: [],
  templates: null,
  hasSearched: false,
  searchTerm: '',
  clonable: false,
  cloning: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'setGithubAccessToken':
      return { ...state, githubAccessToken: action.payload };
    case 'setUser':
      return { ...state, user: action.payload };
    case 'setFeaturedProjects':
      return { ...state, featuredProjects: action.payload };
    case 'setFeaturedProject':
      return { ...state, featuredProject: action.payload };
    case 'setProjects':
      return { ...state, projects: action.payload };
    case 'setTemplates':
      return { ...state, templates: action.payload };
    case 'setSearchTerm':
      return { ...state, hasSearched: true, searchTerm: action.payload };
    case 'setClonable':
      return { ...state, clonable: action.payload };
    case 'setCloning':
      return { ...state, cloning: action.payload };
    default:
      return { ...state };
  }
}

const Main = () => {
  const [state] = useStateValue();
  const { githubAccessToken } = state;

  React.useEffect(() => {
    setGithubAccessTokenCookie(githubAccessToken);
  }, [githubAccessToken]);

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
