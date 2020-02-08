import { React, ReactDOM } from './web_modules/es-react.js';
import css from './web_modules/csz.js';
import htm from './web_modules/htm.js';

import LoadingBar from './components/LoadingBar.js';
import Search from './components/Search.js';
import Project from './components/Project.js';
import Template from './components/Template.js';
import Tooltip from './components/Tooltip.js';
import Login from './components/Login.js';

const html = htm.bind(React.createElement);

const style = {
  nav: css`
    position: sticky;
    top: 0;
    box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
    z-index: 1;
  `,
  navItems: css`
    display: flex;
    align-items: center;
    background: #333;
  `,
  welcome: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;

    > * + * {
      margin-top: 2rem;
    }

    h1 {
      font-size: 1rem;
      letter-spacing: 0.1rem;
      font-weight: lighter;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.38);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0 2rem 1rem;
    }

    p {
      font-size: 1rem;
      line-height: 162%;
      max-width: 40ex;
      text-align: center;
      font-weight: lighter;
      color: rgba(255, 255, 255, 0.3);
    }

    ul {
      button {
        flex-direction: column;
        img {
          width: 3rem;
        }
        div {
          margin-left: 0;
          > span {
            margin-top: 0.38rem;
          }
          > small {
            display: none;
          }
        }
      }
    }
  `,
  templates: css`
    display: flex;
    overflow-x: scroll;
    &:not(:empty) {
      padding: 1rem 0;
    }
    &::-webkit-scrollbar {
      height: 0.38rem;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
    }

    > * + * {
      margin-left: 1rem;
    }
  `,
  projects: css`
    padding: 1.38rem 0;
  `,
  main: css`
    padding: 2rem;
    > * + * {
      margin-top: 2rem;
    }
    h5 {
      padding-bottom: 1.38rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.3);
      font-size: 1rem;
    }
  `,
  footer: css`
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #333;
    color: rgba(0, 0, 0, 0.5);
    padding: 0.62rem;
    font-family: monospace;
    font-weight: bold;
    font-size: 1.2rem;
  `
};

const setGithubAccessTokenCookie = val => {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 1);
  document.cookie = `github_access_token=${val};expires=${now.toGMTString()};path=/`;
};

const getGithubAccessTokenCookie = () =>
  `; ${document.cookie}`
    .split('; github_access_token=')
    .pop()
    .split(';')
    .shift();

const App = () => {
  const cwd = glu.cwd();
  const [githubAccessToken, setGithubAccessToken] = React.useState(
    getGithubAccessTokenCookie()
  );
  const [launcherVersion, setLauncherVersion] = React.useState('');
  const [projects, setProjects] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [hasSearched, setHasSearched] = React.useState(false);
  const [templates, setTemplates] = React.useState([]);

  React.useEffect(() => {
    setGithubAccessTokenCookie(githubAccessToken);
  }, [githubAccessToken]);

  const launch = async template => {
    fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${githubAccessToken}`,
        Accept: 'application/json'
      }
    })
      .then(res => res.json())
      .then(async ({ login }) => {
        const name = prompt('Name this project..');
        const dest = `${window.glu.APPDATA}/${login}@${name}`;
        await glu(`mkdir "${dest}"`)(console.log);
        await glu(`cp -r ${__dirname}/templates/${template}/. "${dest}/"`)(
          console.log
        );
      });
  };

  const publish = async template => {
    glu('git config user.name')(async user => {
      const name = prompt('Name this project..');
      const pass = prompt('Enter GitHub password for CURL');
      glu(
        `curl -u '${user.trim()}:${pass}' https://api.github.com/user/repos -d '{"name":"${name}","private":"true"}'`
      )(console.log);
    });
  };

  const handleSearch = val => {
    setHasSearched(true);
    setSearch(val);
  };

  React.useEffect(() => {
    glu(`ls ${__dirname}/templates`)(data =>
      setTemplates(data.trim().split('\n'))
    );
    glu('node ./functions/projects.js')(
      data => console.log(data) || setProjects(JSON.parse(data.trim()))
    );
  }, []);

  const Footer = html`
    <footer className=${style.footer} key="footer">
      <span>${cwd.replace(window.$HOME, '~')}</span>
      <span>${launcherVersion && `v${launcherVersion}`}</span>
    </footer>
  `;

  return !githubAccessToken
    ? html`
        <${Login} setGithubAccessToken=${setGithubAccessToken} />
      `
    : html`
        ${projects
          ? Object.keys(projects).length === 0
            ? html`
                <main className=${style.welcome} key="main">
                  <h1>Quickstart Templates</h1>
                  <ul className=${style.templates}>
                    ${templates.map(
                      x =>
                        html`
                          <${Template}
                            key=${x}
                            template=${x}
                            launch=${launch}
                          />
                        `
                    )}
                  </ul>
                  <p>
                    It looks like you haven't started or opened any glu projects
                    yet, choose a template!
                  </p>
                </main>
                ${Footer}
              `
            : html`
                <nav className=${style.nav} key="nav">
                  <div className=${style.navItems}>
                    <${Search} value=${search} onChange=${handleSearch} />
                    <${Tooltip}
                      show=${!hasSearched && Object.keys(projects).length < 2}
                      onChange=${handleSearch}
                    />
                  </div>
                </nav>
                <main className=${style.main} key="main">
                  <div>
                    <h5>Quickstart Templates</h5>
                    <ul className=${style.templates}>
                      ${templates
                        .filter(x => x.match(search))
                        .map(
                          x =>
                            html`
                              <${Template}
                                key=${x}
                                template=${x}
                                launch=${launch}
                              />
                            `
                        )}
                    </ul>
                  </div>
                  <div>
                    <h5>Recent Projects</h5>
                    <ul className=${style.projects}>
                      ${Object.entries(projects)
                        .filter(([k, v]) => k.match(search))
                        .map(
                          ([k, v]) =>
                            html`
                              <${Project} key=${k} id=${k} meta=${v} />
                            `
                        )}
                    </ul>
                  </div>
                </main>
                ${Footer}
              `
          : null}
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
