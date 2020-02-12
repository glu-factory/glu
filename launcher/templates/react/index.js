import { React, ReactDOM } from 'https://unpkg.com/es-react@16.8.30';

import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(React.createElement);

const App = () => {
  const [nodeVersion, setNodeVersion] = React.useState('');

  React.useEffect(() => {
    glu('node -v').then(setNodeVersion);
  }, []);

  return html`
    <header>
      <img src="./logo.png" />
      <button onClick=${e => glu(`code .`)}>
        Start Coding
      </button>
    </header>
    <footer>
      <span>~${__dirname.split('/').pop()}</span>
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
