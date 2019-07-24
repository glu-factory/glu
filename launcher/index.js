import { React, ReactDOM } from 'https://unpkg.com/es-react-production@16.8.30';
import css from 'https://unpkg.com/csz';
import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(React.createElement);

const style = {
  nav: css`
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    padding-left: 1rem;
    background: #333;
    box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
    z-index: 1;

    > * + * {
      margin-left: 1rem;
    }

    > img[src='./logo.png'] {
      width: 4rem;
      opacity: 0.2;
    }

    > input {
      flex: 1 1 100%;
      background: rgba(0, 0, 0, 0.1);
      border: 0;
      font-size: 1.5rem;
      padding: 1.62rem;
      color: #fff;
      outline: none;
    }
    svg {
      position: absolute;
      right: 1.62rem;
      top: 50%;
      transform: translateY(-50%);
      width: 2rem;
      height: 2rem;
      fill: rgba(255, 255, 255, 0.38);
    }
  `,
  welcome: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

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
  `,
  templates: css`
    display: flex;
    align-items: center;
    list-style: none;

    > * + * {
      margin-left: 1rem;
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
      padding: 1.38rem;
      font-size: 1rem;
      box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.2);
      transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      cursor: pointer;
      border-radius: 0.5rem;
      opacity: 0.8;
      transition: transform 0.3s, opacity 0.2s;
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
      width: 3rem;
    }

    button span {
      width: 100%;
      text-align: center;
      margin-top: 1rem;
    }
  `,
  projects: css`
    padding: 2rem;
    > * + * {
      margin-top: 2rem;
    }
    h5 {
      padding-bottom: 1.38rem;
      margin-bottom: 1.38rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.3);
      font-size: 1rem;
    }
  `,
  project: css`
    display: flex;
    align-items: center;
    opacity: 0.62;
    transition: opacity 0.1s;

    & + & {
      border-top: 1px solid rgba(255, 255, 255, 0.062);
      padding-top: 1rem;
      margin-top: 1rem;
    }

    &:hover {
      opacity: 1;
    }

    > * + * {
      margin-left: 1rem;
    }

    > div {
      flex: 1 1 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.5s;
      > * + * {
        margin-top: 0.38rem;
      }
      &:hover {
        cursor: pointer;
      }
    }

    &:hover > div {
      transform: translateX(1%);
    }

    img {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      flex: none;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.1);
      border-radius: 0.62rem;
    }

    h3 {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    small {
      opacity: 0.62;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    button {
      flex: none;
      padding: 0.38rem 0.62rem;
      border: 0;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      text-transform: uppercase;
    }
  `,
  footer: css`
    position: sticky;
    bottom: 0;
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
      <aside>
        <button onClick=${() => glu(`open ${x}`)(console.log)}>Open</button>
        <button onClick=${() => glu(`code ${x}`)(console.log)}>Edit</button>
      </aside>
    </li>
  `;

const App = () => {
  const [cwd, setCwd] = React.useState('');
  const [nodeVersion, setNodeVersion] = React.useState('');
  const [projects, setProjects] = React.useState(null);
  const [search, setSearch] = React.useState('');

  const listProjects = () =>
    glu(`ls ${__dirname}/created`)(data =>
      setProjects(
        data
          .trim()
          .replace(/\->/g, '/')
          .split('\n') || []
      )
    );

  const launch = async template => {
    const id = `glu-${template}-${Math.random()
      .toString(16)
      .slice(3, 8)}`;
    await glu(`mkdir ${id}`)(console.log);
    await glu(`cp -r ${__dirname}/templates/${template}/. ${id}/`)(console.log);
    await glu(
      `touch ${__dirname}/created/${`${cwd.trim()}/${id}`.replace(/\//g, '->')}`
    )(console.log);
    listProjects();
    glu(`glu ${id}`);
  };

  React.useEffect(() => {
    glu('pwd')(setCwd);
    glu('node -v')(setNodeVersion);
    listProjects();
  }, []);

  return html`
    ${!projects || projects.length === 0
      ? html`
          <main className=${style.welcome}>
            <h1>Quickstart Templates</h1>
            <ul className=${style.templates}>
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
              It looks like you haven't started or opened any glu projects yet,
              choose a template!
            </p>
          </main>
        `
      : html`
          <nav className=${style.nav}>
            <img src="./logo.png" alt="glu" />
            <input
              onInput=${e => setSearch(e.target.value)}
              type="search"
              placeholder="Search for projects.."
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          </nav>
          <main className=${style.projects}>
            <div>
              <h5>Quickstart Templates</h5>
              <ul className=${style.templates}>
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
            </div>
            <div>
              <h5>Recent Projects</h5>
              <ul>
                ${projects.filter(x => x.match(search)).map(Project)}
              </ul>
            </div>
          </main>
        `}
    <footer className=${style.footer}>
      <span>${cwd}</span>
      <span>${nodeVersion}</span>
    </footer>
  `;
};

ReactDOM.render(
  html`
    <${App} />
  `,
  document.body
);
