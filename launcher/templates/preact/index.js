import {
  h,
  render,
  Component
} from 'https://unpkg.com/preact@10.0.0-rc.0?module';

import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(h);

class App extends Component {
  constructor() {
    super();
    this.state = {
      setNodeVersion: ''
    };
  }

  componentDidMount() {
    glu('node -v').then(nodeVersion => this.setState({ nodeVersion }));
  }

  render(props, state) {
    return html`
      <header>
        <img src="./icon.png" />
        <button onClick=${e => glu(`code .`)}>
          Start Coding
        </button>
      </header>
      <footer>
        <span>~${__dirname.split('/').pop()}</span>
        <span>${state.nodeVersion}</span>
      </footer>
    `;
  }
}

render(
  html`
    <${App} />
  `,
  document.body
);
