import { React, css, html } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

const Tooltip = ({ show, onChange }) => {
  const [state, dispatch] = useStateValue();
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setTimeout(setActive, 2000, true);
  }, []);

  return html`
    <div className=${`${style.tooltip} ${active && show && 'active'}`}>
      Try entering a Github URL to clone a project!
      <button
        className=${style.button}
        onClick=${() =>
          dispatch({ type: 'setSearchTerm', payload: 'lukejacksonn/perflink' })}
      >
        Show Me
      </button>
    </div>
  `;
};

const style = {
  tooltip: css`
    position: absolute;
    top: 93%;
    right: 1rem;
    display: flex;
    align-items: center;
    padding: 0.62rem 0.62rem 0.62rem 1rem;
    background: rgb(25, 25, 24);
    color: rgba(255, 255, 255, 0.38);
    border-radius: 0.5rem;
    box-shadow: 0px 4px 0 0 rgb(14, 14, 14);

    opacity: 0;
    pointer-events: none;
    transform: scale(0.8) translateY(2.5rem);
    transition: opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::after {
      position: absolute;
      bottom: 100%;
      right: 0.5rem;
      display: block;
      content: '';
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 0.75rem 0.75rem 0.75rem;
      border-color: transparent transparent rgb(25, 25, 24) transparent;
    }

    &.active {
      opacity: 1;
      pointer-events: all;
      transform: scale(1) translateY(0);
    }
  `,
  button: css`
    margin-left: 1rem;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.38);
    padding: 0.38rem;
    border-radius: 0.3rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1rem;
    cursor: pointer;

    transition: all 0.1s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.7);
      color: rgba(255, 255, 255, 0.7);
    }
  `
};

export default Tooltip;
