import { React, ReactDOM } from 'https://unpkg.com/es-react@16.8.30';

import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(React.createElement);

const App = () => {
  const [cwd, setCwd] = React.useState('');
  const [nodeVersion, setNodeVersion] = React.useState('');

  const launch = async template => {
    const id = `glu-${template}-${Math.random()
      .toString(16)
      .slice(3, 8)}`;

    await glu(`mkdir ${id}`)(console.log);
    await glu(`cp -r ${__dirname}/templates/${template}/. ${id}/`)(console.log);
    await glu(
      `touch ${__dirname}/created/${`${cwd}/${id}`.replace(/\//g, '->')}`
    )(console.log);

    await glu(`ls ${__dirname}/created`)(data => {
      const projects = data.split('\n').map(x => x.replace(/\->/g, '/'));
      setNode('created')(projects.map(x => `<li>${x}</li>`).join(''));
    });

    glu(`glu ${id}`);
  };

  React.useEffect(() => {
    glu('pwd')(setCwd);
    glu('node -v')(setNodeVersion);
  }, []);

  return html`
    <nav>
      <img src="./logo.png" alt="glu" />
      <input type="search" placeholder="Search for projects" />
    </nav>
    <main id="created"></main>
    <header>
      <h6>Quickstart Templates</h6>
      <ul>
        <button onclick=${e => launch('react')}>
          <img src="/icons/react.png" /><span>React</span>
        </button>
        <button onclick=${e => launch('vue')}>
          <img src="/icons/vue.png" /><span>Vue</span>
        </button>
        <button onclick=${e => launch('preact')}>
          <img src="/icons/preact.png" /><span>Preact</span>
        </button>
      </ul>
      <h1>
        It looks like you haven't started or opened any glu projects yet, choose
        a template!
      </h1>
    </header>
    <footer>
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
