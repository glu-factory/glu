import { React, ReactDOM } from 'https://unpkg.com/es-react-production@16.8.30';
import css from 'https://unpkg.com/csz';
import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(React.createElement);

const style = {
  nav: css`
    display: flex;
    padding: 3vmin;
    background: rgba(0, 0, 0, 0.1);

    > * + * {
      margin-left: 3vmin;
    }

    > img[src='./logo.png'] {
      width: 10vmin;
      opacity: 0.2;
    }

    > input {
      flex: 1 1 100%;
      background: rgba(0, 0, 0, 0.2);
      border: 0;
      font-size: 3vmin;
      padding: 2vmin;
    }
  `,
  welcome: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    > * + * {
      margin-top: 5vmin;
    }

    h1 {
      font-size: 2vmin;
      letter-spacing: 0.3vmin;
      font-weight: lighter;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.38);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0 5vmin 2vmin;
    }

    p {
      font-size: 2.4vmin;
      line-height: 162%;
      max-width: 40ex;
      text-align: center;
      font-weight: lighter;
      color: rgba(255, 255, 255, 0.38);
    }

    ul {
      display: flex;
      align-items: center;
      list-style: none;
    }

    ul > * + * {
      margin-left: 3vmin;
    }

    button {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      background: transparent;
      border: 0;
      background: rgba(0, 0, 0, 0.1);
      color: #fff;
      font-weight: bold;
      padding: 3vmin 4vmin;
      font-size: 3vmin;
      box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.2);
      transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      cursor: pointer;
      border-radius: 0.5rem;
      opacity: 0.8;
    }

    button:hover {
      box-shadow: 0 6px 0 0 rgba(0, 0, 0, 0.18);
      transform: translate(0, -3px);
      opacity: 1;
    }

    button:active {
      box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.2);
      transform: translate(0, 0);
    }

    button img {
      width: 8vmin;
    }

    button span {
      width: 100%;
      text-align: center;
      margin-top: 2vmin;
    }
  `,
  projects: css`
    padding: 2rem;
    ul > * + * {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
  `,
  project: css`
    display: flex;
    align-items: center;
    opacity: 0.62;
    &:hover {
      opacity: 1;
      cursor: pointer;
    }
    > * + * {
      margin-left: 1rem;
    }
    > div {
      flex: 1 1 100%;
      display: flex;
      flex-direction: column;
      > * + * {
        margin-top: 0.38rem;
      }
    }
    img {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      flex: none;
    }
    small {
      opacity: 0.62;
    }
    button {
      flex: none;
      padding: 0.38rem 0.62rem;
      border: 0;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      text-transform: uppercase;
    }
  `
};

const Project = x =>
  html`
    <li key=${x} className=${style.project}>
      <img
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
      />
      <div onClick=${() => glu(`glu ${x}`)(console.log)}>
        <h3>${x.split('/').pop()}</h3>
        <small>${x}</small>
      </div>
      <button onClick=${() => glu(`code ${x}`)(console.log)}>Develop</button>
    </li>
  `;

const App = () => {
  const [cwd, setCwd] = React.useState('');
  const [nodeVersion, setNodeVersion] = React.useState('');
  const [projects, setProjects] = React.useState(null);

  const launch = async template => {
    const id = `glu-${template}-${Math.random()
      .toString(16)
      .slice(3, 8)}`;
    await glu(`mkdir ${id}`)(console.log);
    await glu(`cp -r ${__dirname}/templates/${template}/. ${id}/`)(console.log);
    glu(`glu ${id}`);
  };

  React.useEffect(() => {
    glu('pwd')(setCwd);
    glu('node -v')(setNodeVersion);
    glu(`ls ${__dirname}/created`)(data =>
      setProjects(
        data
          .trim()
          .replace(/\->/g, '/')
          .split('\n')
      )
    );
  }, []);

  return (
    projects &&
    html`
      ${projects.length === 0
        ? html`
            <main className=${style.welcome}>
              <h1>Quickstart Templates</h1>
              <ul>
                <button onClick=${() => launch('react')}>
                  <img src="/icons/react.png" /><span>React</span>
                </button>
                <button onClick=${() => launch('vue')}>
                  <img src="/icons/vue.png" /><span>Vue</span>
                </button>
                <button onClick=${() => launch('preact')}>
                  <img src="/icons/preact.png" /><span>Preact</span>
                </button>
              </ul>
              <p>
                It looks like you haven't started or opened any glu projects
                yet, choose a template!
              </p>
            </main>
          `
        : html`
            <nav className=${style.nav}>
              <img src="./logo.png" alt="glu" />
              <input type="search" placeholder="Search for projects" />
            </nav>
            <main className=${style.projects}>
              <ul>
                ${projects.map(Project)}
              </ul>
            </main>
          `}
      <footer>
        <span>${cwd}</span>
        <span>${nodeVersion}</span>
      </footer>
    `
  );
};

ReactDOM.render(
  html`
    <${App} />
  `,
  document.body
);
