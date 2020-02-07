import { React, ReactDOM } from '../web_modules/es-react.js';
import css from '../web_modules/csz.js';
import htm from '../web_modules/htm.js';

const html = htm.bind(React.createElement);

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

    &:hover > a {
      transform: translateX(-1%);
    }

    img {
      width: 3.6rem;
      height: 3.6rem;
      border-radius: 1rem;
      flex: none;
      opacity: 0.8;
      transition: opacity 0.3s;
    }

    &:hover img {
      opacity: 1;
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

const Project = ({ id, meta }) =>
  console.log(id, meta) ||
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
        <button onClick=${() => glu(`open ${id}`)(console.log)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"
            />
          </svg>
          <span>Browse</span>
        </button>
        <button onClick=${() => glu(`code ${id}`)(console.log)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g>
              <g>
                <path
                  d="M296,232c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.52,0,10-4.48,10-10S301.52,232,296,232z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M256,172c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.52,0,10-4.48,10-10S261.52,172,256,172z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M136,432c-5.52,0-10,4.48-10,10c0,5.52,4.48,10,10,10s10-4.48,10-10C146,436.48,141.52,432,136,432z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  stroke="white"
                  strokeWidth="12px"
                  d="M454.416,407.678L326,179.381V58.286c11.641-4.127,20-15.248,20-28.286c0-16.542-13.458-30-30-30H196
                      c-16.542,0-30,13.458-30,30c0,13.038,8.359,24.159,20,28.286v121.095L57.584,407.678c-12.328,21.916-12.109,47.959,0.584,69.663
                      C70.86,499.043,93.448,512,118.59,512h274.82c25.142,0,47.729-12.957,60.422-34.659
                      C466.525,455.637,466.744,429.594,454.416,407.678z
                      M204.716,186.902c0.842-1.496,1.284-3.185,1.284-4.902V60h10
                      c5.522,0,10-4.478,10-10s-4.478-10-10-10h-20c-5.514,0-10-4.486-10-10s4.486-10,10-10h120c5.514,0,10,4.486,10,10s-4.486,10-10,10
                      h-20c-5.522,0-10,4.478-10,10s4.478,10,10,10h10v122c0,1.718,0.442,3.405,1.284,4.902l58.941,104.787
                      c-35.995-2.915-71.865,4.365-104.821,21.43c-42.366,21.924-89.529,25.784-134,11.227L204.716,186.902z
                      M436.567,467.244
                      C427.502,482.745,411.368,492,393.41,492H118.59c-17.958,0-34.092-9.255-43.157-24.756c-9.067-15.503-9.224-34.106-0.417-49.762
                      l42.408-75.392c20.576,7.185,41.84,10.812,63.437,10.812c3.197,0,6.402-0.079,9.613-0.238
                      c27.905-1.382,54.862-8.711,80.124-21.784c33.792-17.496,70.959-23.536,107.783-17.581l58.604,104.183
                      C445.791,433.138,445.635,451.741,436.567,467.244z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M216,232c-16.542,0-30,13.458-30,30s13.458,30,30,30s30-13.458,30-30S232.542,232,216,232z M216,272
                      c-5.514,0-10-4.486-10-10c0-5.514,4.486-10,10-10c5.514,0,10,4.486,10,10C226,267.514,221.514,272,216,272z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M376,432H176c-5.522,0-10,4.478-10,10c0,5.522,4.478,10,10,10h200c5.522,0,10-4.478,10-10
                      C386,436.478,381.522,432,376,432z"
                />
              </g>
            </g>
          </svg>
          <span>Develop</span>
        </button>
      </aside>
    </li>
  `;

export default Project;
