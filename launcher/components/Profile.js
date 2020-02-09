import { React, html, css } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

function Profile() {
  const [state, dispatch] = useStateValue();
  const { user } = state;

  const containerRef = React.useRef(null);
  const [menuActive, setMenuActive] = React.useState(false);

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  const handleMouseDown = e => {
    if (containerRef.current && containerRef.current.contains(e.target)) {
      return;
    }
    closeMenu();
  };

  const openMenu = () => {
    setMenuActive(true);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
  };

  const closeMenu = () => {
    setMenuActive(false);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
  };

  return html`
    <div className=${style.profileContainer} ref=${containerRef}>
      <button className=${style.profileButton} onClick=${openMenu}>
        <img className=${style.profileImg} src=${user.avatar_url} />
      </button>
      <div className=${`${style.optionsMenu} ${menuActive && style.active}`}>
        <button className=${style.option}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z"
              fill="currentColor"
            />
          </svg>
          <span>${user.name}</span>
        </button>
        <button
          className=${style.option}
          onClick=${() => {
            closeMenu();
            setTimeout(() => {
              dispatch({ type: 'setGithubAccessToken', payload: '' });
            }, 300);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
              fill="currentColor"
            />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </div>
  `;
}

const style = {
  profileContainer: css`
    position: relative;
    padding: 0.69rem;
  `,
  profileButton: css``,
  profileImg: css`
    height: 3rem
    width: 3rem
    object-fit: contain;
    border-radius: 50%;
    border: 1px solid #1d1d1d;
    background: #1d1d1d;
  `,
  optionsMenu: css`
    position: absolute;
    top: 100%;
    right: 0;
    width: 25vw;
    max-width: 12rem;
    min-width: 8rem;
    padding: 1rem 0;
    margin: 0 1rem;
    background: #333;
    box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.3);
    border-radius: 0.25rem;

    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
  `,
  active: css`
    opacity: 1;
    pointer-events: all;
  `,
  option: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding: 0.62rem;
    color: rgba(255, 255, 255, 0.3);

    &:hover,
    &:active {
      background: rgba(0, 0, 0, 0.138);
    }

    svg {
      width: 1.5rem;
      height: 1.5rem;
      flex-shrink: 0;
    }
    span {
      margin-left: 1rem;
      font-size: 1rem;
      line-height: 1.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
    }
  `
};

export default Profile;
