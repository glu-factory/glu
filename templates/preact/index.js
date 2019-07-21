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
      cwd: '',
      setNodeVersion: ''
    };
  }

  componentDidMount() {
    glu('pwd')(cwd => this.setState({ cwd }));
    glu('node -v')(nodeVersion => this.setState({ nodeVersion }));
  }

  render(props, state) {
    return html`
      <header>
        <img src="./logo.png" />
        <button onClick=${e => glu('code .')(console.log)}>
          Start Coding
        </button>
      </header>
      <footer>
        <span>${state.cwd}</span>
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
