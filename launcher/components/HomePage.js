import { React, html, css } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

import Profile from './Profile.js';
import LoadingBar from './LoadingBar.js';
import Search from './Search.js';
import Projects from './Projects.js';
import Template from './Template.js';

function HomePage() {
  const cwd = glu.cwd();
  const [state, dispatch] = useStateValue();
  const { projects, templates, githubAccessToken, user } = state;

  React.useEffect(() => {
    fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${githubAccessToken}`,
        Accept: 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200) {
          dispatch({ type: 'setGithubAccessToken', payload: '' });
        } else {
          return res.json();
        }
      })
      .then(user => dispatch({ type: 'setUser', payload: user }));
  }, [githubAccessToken]);

  React.useEffect(() => {
    glu(`ls ${__dirname}/templates`)(data =>
      dispatch({ type: 'setTemplates', payload: data.trim().split('\n') })
    );
    glu('node ./functions/projects.js')(data =>
      dispatch({ type: 'setProjects', payload: JSON.parse(data.trim()) })
    );
  }, []);

  const launch = async template => {
    const { login } = user;
    const name =
      prompt('Name this project..') ||
      `project-` + ((Math.random() * 99999) << 0).toString(16);
    const dest = `${window.glu.APPDATA}/${login}@${name}`;
    await glu(`mkdir "${dest}"`)(console.log);
    await glu(`cp -r ${__dirname}/templates/${template}/. "${dest}/"`)(
      console.log
    );
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

  const Footer = html`
    <footer className=${style.footer} key="footer">
      <span>${cwd.replace(window.$HOME, '~')}</span>
    </footer>
  `;

  const TemplatesToolbar = () => html`
    <div className=${style.templatesToolbar}>
      <h5>Quickstart Templates:</h5>
      ${templates.map(
        x =>
          html`
            <button onClick=${() => launch(x)} key=${x}>
              <img src="/icons/${x}.png" />
            </button>
          `
      )}
    </div>
  `;

  return user
    ? projects
      ? html`
          ${Object.keys(projects).length === 0
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
                    <${Search} />
                    <${Profile} />
                  </div>
                </nav>
                <main className=${style.main} key="main">
                  <${TemplatesToolbar} />
                  <div>
                    <${Projects} />
                  </div>
                </main>
                ${Footer}
              `}
        `
      : null
    : html`
        <${LoadingBar} loading=${{ indeterminate: true }} active=${true} />
      `;
}

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
  templatesToolbar: css`
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.138);
    padding: 1rem;
    border-radius: 1rem;
    button {
      margin-left: 0.62rem;
      &:hover {
        transform: scale(1.2);
      }

      img {
        width: 1.38rem;
      }
    }
  `,
  main: css`
    padding: 1.38rem;
    > * + * {
      margin-top: 2rem;
    }
    h5 {
      color: rgba(255, 255, 255, 0.3);
      font-size: 1rem;
      margin-right: auto;
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

export default HomePage;
