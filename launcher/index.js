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
    padding-left: 1.38rem;
    background: #333;
    box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
    z-index: 1;

    > * + * {
      margin-left: 1.38rem;
    }

    > img[src='./logo.png'] {
      width: 4rem;
      opacity: 0.2;
    }

    > input {
      flex: 1 1 100%;
      background: rgba(0, 0, 0, 0.1);
      border: 0;
      font-size: 1.38rem;
      padding: 1.62rem;
      color: #fff;
      outline: none;
    }
    svg {
      position: absolute;
      right: 1.38rem;
      top: 50%;
      transform: translateY(-50%);
      width: 2.2rem;
      height: 2.2rem;
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
      border: 0;
      background: rgba(0, 0, 0, 0.1);
      color: #fff;
      padding: 1rem 1.38rem;
      font-size: 1rem;
      box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.2);
      transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border-radius: 0.5rem;
      opacity: 0.62;
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
      margin-top: 0.62rem;
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

    > a {
      flex: 1 1 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.5s;
      color: inherit;
      text-decoration: none;
      padding: 0.38rem;
      > * + * {
        margin-top: 0.38rem;
      }
    }

    &:hover > a {
      transform: translateX(-1%);
    }

    img {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      flex: none;
      opacity: 0.8;
      transition: opacity 0.3s;
    }

    &:hover img {
      opacity: 1;
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

    aside {
      display: flex;
    }

    button {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: none;
      padding: 0.62rem;
      border: 0;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      text-transform: uppercase;
      font-size: 0.5rem;
      opacity: 0.38;

      &:hover {
        opacity: 0.9;
      }

      > * + * {
        margin-top: 0.38rem;
      }

      svg {
        width: 1.38rem;
        fill: #fff;
      }
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

const Project = (removeProject, listProjects) => x =>
  html`
    <li key=${x} className=${style.project}>
      <img
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
      />
      <a
        href="#"
        onClick=${e => {
          e.preventDefault();
          glu(`glu ${x}`)(listProjects);
        }}
      >
        <h3>${x.split('/').pop()}</h3>
        <small>${x}</small>
      </a>
      <aside>
        <button onClick=${() => glu(`open ${x}`)(console.log)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"
            />
          </svg>
          <span>Browse</span>
        </button>
        <button onClick=${() => glu(`code ${x}`)(console.log)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g>
              <g>
                <path
                  d="M296,232c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.52,0,10-4.48,10-10S301.52,232,296,232z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M256,172c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.52,0,10-4.48,10-10S261.52,172,256,172z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M136,432c-5.52,0-10,4.48-10,10c0,5.52,4.48,10,10,10s10-4.48,10-10C146,436.48,141.52,432,136,432z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  stroke="white"
                  stroke-width="12px"
                  d="M454.416,407.678L326,179.381V58.286c11.641-4.127,20-15.248,20-28.286c0-16.542-13.458-30-30-30H196
                        c-16.542,0-30,13.458-30,30c0,13.038,8.359,24.159,20,28.286v121.095L57.584,407.678c-12.328,21.916-12.109,47.959,0.584,69.663
                        C70.86,499.043,93.448,512,118.59,512h274.82c25.142,0,47.729-12.957,60.422-34.659
                        C466.525,455.637,466.744,429.594,454.416,407.678z
                        M204.716,186.902c0.842-1.496,1.284-3.185,1.284-4.902V60h10
                        c5.522,0,10-4.478,10-10s-4.478-10-10-10h-20c-5.514,0-10-4.486-10-10s4.486-10,10-10h120c5.514,0,10,4.486,10,10s-4.486,10-10,10
                        h-20c-5.522,0-10,4.478-10,10s4.478,10,10,10h10v122c0,1.718,0.442,3.405,1.284,4.902l58.941,104.787
                        c-35.995-2.915-71.865,4.365-104.821,21.43c-42.366,21.924-89.529,25.784-134,11.227L204.716,186.902z
                        M436.567,467.244
                        C427.502,482.745,411.368,492,393.41,492H118.59c-17.958,0-34.092-9.255-43.157-24.756c-9.067-15.503-9.224-34.106-0.417-49.762
                        l42.408-75.392c20.576,7.185,41.84,10.812,63.437,10.812c3.197,0,6.402-0.079,9.613-0.238
                        c27.905-1.382,54.862-8.711,80.124-21.784c33.792-17.496,70.959-23.536,107.783-17.581l58.604,104.183
                        C445.791,433.138,445.635,451.741,436.567,467.244z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M216,232c-16.542,0-30,13.458-30,30s13.458,30,30,30s30-13.458,30-30S232.542,232,216,232z M216,272
                  			c-5.514,0-10-4.486-10-10c0-5.514,4.486-10,10-10c5.514,0,10,4.486,10,10C226,267.514,221.514,272,216,272z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M376,432H176c-5.522,0-10,4.478-10,10c0,5.522,4.478,10,10,10h200c5.522,0,10-4.478,10-10
                  			C386,436.478,381.522,432,376,432z"
                />
              </g>
            </g>
          </svg>
          <span>Develop</span>
        </button>
        <button onClick=${() => removeProject(x)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z" />
            <path
              d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.81.97H5.44l.8-.97zM5 19V8h14v11H5zm8.45-9h-2.9v3H8l4 4 4-4h-2.55z"
            />
          </svg>
          <span>Archive</span>
        </button>
      </aside>
    </li>
  `;

const Template = launch => x => html`
  <button onClick=${() => launch(x)}>
    <img src=${`/icons/${x}.png`} /><span>${x}</span>
  </button>
`;

const App = () => {
  const [cwd, setCwd] = React.useState('');
  const [nodeVersion, setNodeVersion] = React.useState('');
  const [projects, setProjects] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [templates, setTemplates] = React.useState([]);

  const listProjects = () =>
    glu(`node ${__dirname}/launcher/functions/getProjects.js`)(data => {
      const projects = JSON.parse(data);
      setProjects(
        Object.keys(projects).sort(
          (a, b) => projects[b].openTime - projects[a].openTime
        )
      );
    });

  const removeProject = async x => {
    await glu(`node ${__dirname}/launcher/functions/removeProject.js ${x}`);
    listProjects();
  };

  const launch = async template => {
    const id = `glu-${template}-${Math.random()
      .toString(16)
      .slice(3, 8)}`;
    await glu(`mkdir ${id}`)(console.log);
    await glu(`cp -r ${__dirname}/templates/${template}/. ${id}/`)(console.log);

    glu(`glu ${id}`)(listProjects);
  };

  React.useEffect(() => {
    glu('pwd')(setCwd);
    glu('node -v')(setNodeVersion);
    glu(`ls ${__dirname}/templates`)(data =>
      setTemplates(data.trim().split('\n'))
    );
    listProjects();
  }, []);

  const Footer = html`
    <footer className=${style.footer}>
      <span>${cwd}</span>
      <span>${nodeVersion}</span>
    </footer>
  `;

  return html`
    ${projects
      ? projects.length === 0
        ? html`
            <main className=${style.welcome}>
              <h1>Quickstart Templates</h1>
              <ul className=${style.templates}>
                ${templates.map(Template(launch))}
              </ul>
              <p>
                It looks like you haven't started or opened any glu projects
                yet, choose a template!
              </p>
            </main>
            ${Footer}
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
                  ${templates.map(Template(launch))}
                </ul>
              </div>
              <div>
                <h5>Recent Projects</h5>
                <ul>
                  ${projects
                    .filter(x => x.match(search))
                    .map(Project(removeProject, listProjects))}
                </ul>
              </div>
            </main>
            ${Footer}
          `
      : null}
  `;
};

ReactDOM.render(
  html`
    <${App} />
  `,
  document.body
);
