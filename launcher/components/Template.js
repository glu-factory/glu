import { React, css, html } from '../utils/webModules.js';

const style = {
  template: css`
    display: flex;
    align-items: center;
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

    > div > * + * {
      margin-top: 0.2rem;
    }
    > * + * {
      margin-left: 1rem;
    }
    :hover {
      box-shadow: 0 6px 0 0 rgba(0, 0, 0, 0.18);
      transform: translate(0, -3px);
      opacity: 1;
    }
    :active {
      box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.2);
      transform: translate(0, 0);
    }
    img {
      width: 2.4rem;
    }
    span {
      width: 100%;
      text-align: left;
    }
    small {
      color: rgba(255, 255, 255, 0.62);
    }
  `
};

const Template = ({ createFromTemplate, template }) =>
  html`
    <button
      onClick=${() => createFromTemplate(template)}
      className=${style.template}
    >
      <img src=${`/icons/${template}.png`} />
      <div>
        <span>${template}</span>
        <small>lukejacksonn</small>
      </div>
    </button>
  `;

export default Template;
