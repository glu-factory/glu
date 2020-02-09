import { React, css, html } from '../utils/webModules.js';

const Project = ({ id, meta }) =>
  html`
    <li className=${style.project}>
      <img
        src=${`${window.glu.APPDATA_SERVER}/${id}/logo.png`}
        onError=${e => (e.target.src = './icons/missing.png')}
      />
      <a
        href="#"
        onClick=${e => {
          e.preventDefault();
          glu(`glu ${id}`)(console.log);
        }}
      >
        <h3>${meta.name}</h3>
        <small>${meta.user}</small>
      </a>
      <aside>
        <button onClick=${() => glu(`open "${meta.path}"`)(console.log)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"
            />
          </svg>
          <span>Browse</span>
        </button>
        <button onClick=${() => glu(`code "${meta.path}"`)(console.log)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
            />
          </svg>
          <span>Develop</span>
        </button>
        <button
          onClick=${() =>
            confirm(`Are you sure you want to remove ${meta.name}?`) &&
            glu(`rm -rf "${meta.path}"`)(console.log)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"
            />
            <path d="M0 0h24v24H0V0z" fill="none" />
          </svg>
          <span>Remove</span>
        </button>
      </aside>
    </li>
  `;

const style = {
  project: css`
    display: flex;
    align-items: center;
    opacity: 0.62;
    transition: opacity 0.1s;

    & + & {
      border-top: 1px solid rgba(255, 255, 255, 0.062);
      padding-top: 1rem;
      margin-top: 1rem;
    }

    &:hover {
      opacity: 1;
    }

    > * + * {
      margin-left: 1rem;
    }

    > a {
      flex: 1 1 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.5s;
      color: inherit;
      text-decoration: none;
      padding: 0.38rem;
      > * + * {
        margin-top: 0.38rem;
      }
    }

    span {
      display: none;
    }

    img {
      width: 3rem;
      height: 3rem;
      border-radius: 1rem;
      flex: none;
      opacity: 0.8;
      transition: opacity 0.3s;
    }

    &:hover img {
      opacity: 1;
      transform: scale(1.1);
    }

    h3 {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    small {
      opacity: 0.62;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    aside {
      display: flex;
    }

    button {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: none;
      padding: 0.62rem;
      border: 0;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      text-transform: uppercase;
      font-size: 0.5rem;
      opacity: 0.38;

      &:hover {
        opacity: 0.9;
      }

      > * + * {
        margin-top: 0.38rem;
      }

      svg {
        width: 1.38rem;
        fill: #fff;
      }
    }
  `
};

export default Project;
