import { React, css, html } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

import LoadingBar from './LoadingBar.js';

const LoginPage = ({ setGithubAccessToken }) => {
  const [state, dispatch] = useStateValue();
  const { githubAccessToken } = state;
  const [loading, setLoading] = React.useState(false);
  const loginWindow = React.useRef(null);

  const sendTemporaryAccessToken = temporaryAccessToken => {
    setLoading(true);
    loginWindow.current && loginWindow.current.close();
    fetch(
      `https://glu-auth.now.sh/api/auth?access_token=${temporaryAccessToken}&redirect_uri=${window.location.origin}`
    )
      .then(res => res.json())
      .then(({ access_token }) => {
        if (access_token) {
          setLoading(false);
          dispatch({ type: 'setGithubAccessToken', payload: access_token });
        }
      });
  };

  const login = () => {
    loginWindow.current = window.open(
      `https://github.com/login/oauth/authorize?client_id=e12fed97f41a2b4e6cf1&scope=read:user&redirect_uri=${window.location.origin}&state=glu`,
      '_blank',
      'height=635,width=623,toolbar=0,location=0,menubar=0'
    );
    window.sendTemporaryAccessToken = sendTemporaryAccessToken;
  };

  return html`
    <div className=${style.container}>
      <div className=${style.loadingBarWrapper}>
        <${LoadingBar}
          active=${loading}
          loading=${{
            indeterminate: true
          }}
        />
      </div>
      <button className=${style.button} onClick=${login}>
        Login with Github
      </button>
    </div>
  `;
};

const style = {
  container: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
  `,
  loadingBarWrapper: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  `,
  button: css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 0;
    background: rgba(0, 0, 0, 0.1);
    color: #fff;
    padding: 1rem;
    font-size: 1rem;
    box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border-radius: 0.5rem;
    opacity: 0.62;
    transition: transform 0.3s, opacity 0.2s, box-shadow 0.2s;

    :hover {
      box-shadow: 0 6px 0 0 rgba(0, 0, 0, 0.18);
      transform: translate(0, -3px);
      opacity: 1;
    }
    :active {
      box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.2);
      transform: translate(0, 0);
    }
  `
};

export default LoginPage;
