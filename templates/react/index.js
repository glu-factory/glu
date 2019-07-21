import { React, ReactDOM } from 'https://unpkg.com/es-react@16.8.30';

import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(React.createElement);

const App = () => {
  const [cwd, setCwd] = React.useState('');
  const [nodeVersion, setNodeVersion] = React.useState('');

  React.useEffect(() => {
    glu('pwd')(setCwd);
    glu('node -v')(setNodeVersion);
  }, []);

  return html`
    <header>
      <img src="./logo.png" />
      <button onClick=${e => glu('code .')(console.log)}>
        Start Coding
      </button>
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
