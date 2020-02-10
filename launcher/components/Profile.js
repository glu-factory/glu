import { React, html, css } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

function Profile() {
  const [state, dispatch] = useStateValue();
  const { user } = state;

  return html`
    <div className=${style.profileContainer}>
      <img className=${style.profileImg} src=${user.avatar_url} />
    </div>
  `;
}

const style = {
  profileContainer: css`
    position: relative;
    padding: 0.69rem;
  `,
  profileImg: css`
    height: 3rem
    width: 3rem
    object-fit: contain;
    border-radius: 50%;
    border: 1px solid #1d1d1d;
    background: #1d1d1d;
  `
};

export default Profile;
