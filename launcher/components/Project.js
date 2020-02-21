import { React, css, html } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

const Project = ({ id, meta, order }) => {
  const [state, dispatch] = useStateValue();
  const { cloning, user, githubAccessToken } = state;

  const publish = async ({ name, path }) => {
    await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${githubAccessToken}`
      },
      body: JSON.stringify({ name, private: true })
    });
    const message = prompt('Add a note to this deploy (optional):');
    glu(`node functions/push.js "${path}" ${user.login} ${name} "${message}"`)
      .then(console.log)
      .catch(console.error);
  };

  const fork = async meta => {
    const dest = `${window.glu.APPDATA}/${user.login}@${meta.name}`;
    await glu(`mkdir "${dest}"`);
    await glu(`cp -r "${meta.path}/" "${dest}/"`);
  };

  const imgPath =
    !cloning.includes(meta.repo) && !!meta.path
      ? `${window.glu.APPDATA_SERVER}/${id}/icon.png`
      : `https://raw.githubusercontent.com/${meta.repo}/master/icon.png`;

  return html`
    <li
      className=${[
        style.project,
        order === 0 ? style.match : order === 1 ? style.nomatch : false
      ]
        .filter(Boolean)
        .join(' ')}
      key=${id}
    >
      <button
        onClick=${e => {
          e.preventDefault();
          glu(`node ../index.js ${id}`);
        }}
      >
        <img
          key=${imgPath}
          src=${imgPath}
          onError=${e => {
            const src = e.target.src;
            src.match('icon.png')
              ? (e.target.src = src.replace('icon.png', 'logo.png'))
              : src.match('logo.png')
              ? (e.target.src = src.replace('logo.png', 'favicon.ico'))
              : (e.target.src = './icons/missing.png');
          }}
        />
        <div>
          <h3>${meta.name}</h3>
          <small>${meta.user}</small>
        </div>
      </button>
      <aside>
        ${cloning.includes(meta.repo)
          ? html`
              <span>INSTALLING</span>
            `
          : meta.mtime
          ? html`
              ${user.login === meta.user
                ? html`
                    ${meta.diff &&
                      html`
                        <button onClick=${e => publish(meta)}>
                          <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M10 7H9V6H10V7ZM9 9H10V8H9V9ZM13 9L10 13H12V20H14V13H16L13 9ZM17 4H7C6.45 4 6 4.45 6 5V17C6 17.55 6.45 18 7 18H11V17H7V15H11V14H8V5H17.02L17 14H15V15H17V17H15V18H17C17.55 18 18 17.55 18 17V5C18 4.45 17.55 4 17 4Z"
                            />
                          </svg>
                        </button>
                      `}
                    <button
                      onClick=${() => {
                        glu(`code "${meta.path}"`);
                        glu(`node ../index.js ${id}`);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.37036 14.8155V17.507H10.0619L17.2395 10.3295L14.5479 7.63793L7.37036 14.8155ZM10.0619 16.6098H8.26755V14.8155H9.16474V15.7126H10.0619V16.6098ZM19.303 8.26596L18.1367 9.43231L15.4451 6.74074L16.6114 5.57439C16.6944 5.49122 16.793 5.42523 16.9016 5.38021C17.0101 5.33519 17.1264 5.31201 17.2439 5.31201C17.3615 5.31201 17.4778 5.33519 17.5863 5.38021C17.6949 5.42523 17.7935 5.49122 17.8765 5.57439L19.303 7.00092C19.6529 7.35083 19.6529 7.91606 19.303 8.26596V8.26596Z"
                        />
                      </svg>
                    </button>
                  `
                : html`
                    <button onClick=${e => fork(meta)}>
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.0696 5.31202C14.6499 5.31091 14.2415 5.44854 13.908 5.7035C13.5746 5.95847 13.3347 6.31648 13.2257 6.72186C13.1167 7.12724 13.1448 7.55726 13.3055 7.94506C13.4661 8.33286 13.7505 8.6567 14.1142 8.86621V10.0892L12.2033 12L10.2925 10.0892V8.86621C10.6562 8.6567 10.9406 8.33286 11.1012 7.94506C11.2619 7.55726 11.2899 7.12724 11.181 6.72186C11.072 6.31648 10.8321 5.95847 10.4987 5.7035C10.1652 5.44854 9.75683 5.31091 9.33706 5.31202C8.91729 5.31091 8.50892 5.44854 8.17545 5.7035C7.84198 5.95847 7.60211 6.31648 7.49314 6.72186C7.38417 7.12724 7.4122 7.55726 7.57288 7.94506C7.73356 8.33286 8.01788 8.6567 8.38163 8.86621V10.5669L11.2479 13.4332V15.1338C10.8842 15.3433 10.5998 15.6672 10.4392 16.055C10.2785 16.4428 10.2505 16.8728 10.3594 17.2782C10.4684 17.6836 10.7083 18.0416 11.0417 18.2965C11.3752 18.5515 11.7836 18.6891 12.2033 18.688C12.6231 18.6891 13.0315 18.5515 13.365 18.2965C13.6984 18.0416 13.9383 17.6836 14.0473 17.2782C14.1562 16.8728 14.1282 16.4428 13.9675 16.055C13.8068 15.6672 13.5225 15.3433 13.1588 15.1338V13.4332L16.0251 10.5669V8.86621C16.3888 8.6567 16.6731 8.33286 16.8338 7.94506C16.9945 7.55726 17.0225 7.12724 16.9135 6.72186C16.8046 6.31648 16.5647 5.95847 16.2312 5.7035C15.8978 5.44854 15.4894 5.31091 15.0696 5.31202V5.31202ZM9.33706 8.36939C8.70647 8.36939 8.19054 7.8439 8.19054 7.22288C8.19054 6.60185 8.71603 6.07636 9.33706 6.07636C9.95809 6.07636 10.4836 6.60185 10.4836 7.22288C10.4836 7.8439 9.95809 8.36939 9.33706 8.36939ZM12.2033 17.9237C11.5728 17.9237 11.0568 17.3982 11.0568 16.7772C11.0568 16.1561 11.5823 15.6306 12.2033 15.6306C12.8244 15.6306 13.3499 16.1561 13.3499 16.7772C13.3499 17.3982 12.8244 17.9237 12.2033 17.9237ZM15.0696 8.36939C14.439 8.36939 13.9231 7.8439 13.9231 7.22288C13.9231 6.60185 14.4486 6.07636 15.0696 6.07636C15.6907 6.07636 16.2161 6.60185 16.2161 7.22288C16.2161 7.8439 15.6907 8.36939 15.0696 8.36939V8.36939Z"
                        />
                      </svg>
                    </button>
                  `}
              <button
                onClick=${() =>
                  confirm(`Are you sure you want to remove ${meta.name}?`) &&
                  glu(`rm -rf "${meta.path}"`)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.3796 6.2674H14.4688C14.4688 5.74194 14.0389 5.31201 13.5134 5.31201H10.6473C10.1218 5.31201 9.69186 5.74194 9.69186 6.2674H7.78108C7.25561 6.2674 6.82568 6.69733 6.82568 7.2228V8.17819C6.82568 8.70366 7.25561 9.13358 7.78108 9.13358V17.7321C7.78108 18.2576 8.211 18.6875 8.73647 18.6875H15.4242C15.9497 18.6875 16.3796 18.2576 16.3796 17.7321V9.13358C16.9051 9.13358 17.335 8.70366 17.335 8.17819V7.2228C17.335 6.69733 16.9051 6.2674 16.3796 6.2674ZM15.4242 17.7321H8.73647V9.13358H9.69186V16.7767H10.6473V9.13358H11.6026V16.7767H12.558V9.13358H13.5134V16.7767H14.4688V9.13358H15.4242V17.7321ZM16.3796 8.17819H7.78108V7.2228H16.3796V8.17819Z"
                  />
                </svg>
              </button>
            `
          : html`
              <span>FEATURED</span>
              <button
                onClick=${async () => {
                  dispatch({ type: 'addCloning', payload: meta.repo });
                  await glu(
                    `git clone https://github.com/${meta.repo} "${
                      glu.APPDATA
                    }/${meta.repo.replace('/', '@')}"`
                  );
                  dispatch({ type: 'removeCloning', payload: meta.repo });
                }}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9912 16.2329H15.9912L12.9912 19.2329L9.99121 16.2329H11.9912V11.2329H13.9912V16.2329ZM16.9912 8.23291C16.9912 7.79291 16.0812 5.23291 12.4912 5.23291C10.0712 5.23291 7.99121 7.15291 7.99121 9.23291C6.01121 9.23291 4.99121 10.7529 4.99121 12.2329C4.99121 13.7629 5.99121 15.2329 7.99121 15.2329H10.9912V13.9329H7.99121C6.37121 13.9329 6.29121 12.5129 6.29121 12.2329C6.29121 12.0629 6.34121 10.5329 7.99121 10.5329H9.29121V9.23291C9.29121 7.84291 10.8512 6.53291 12.4912 6.53291C15.0412 6.53291 15.6212 8.08291 15.6912 8.33291V9.53291H16.9912C17.8012 9.53291 19.6912 9.75291 19.6912 11.7329C19.6912 13.8229 17.4412 13.9329 16.9912 13.9329H14.9912V15.2329H16.9912C19.0712 15.2329 20.9912 14.0729 20.9912 11.7329C20.9912 9.29291 19.0712 8.23291 16.9912 8.23291Z"
                  />
                </svg>
              </button>
            `}
      </aside>
    </li>
  `;
};

const style = {
  project: css`
    display: flex;
    align-items: center;
    padding: 1rem;
    opacity: 0.8;
    transition: opacity 0.1s;
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.38rem;
    margin-top: 0.62rem;

    &:hover {
      opacity: 1;
    }

    > button {
      flex: 1 1 100%;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      align-items: center;
      transition: transform 0.5s;
      color: inherit;
      text-decoration: none;

      img {
        width: 2.8rem;
        height: 2.8rem;
        border-radius: 16%;
        flex: none;
        opacity: 0.8;
        transition: opacity 0.3s;
      }
      &:hover img {
        opacity: 1;
      }

      div {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: hidden;
        margin-left: 1rem;

        h3 {
          max-width: 100%;
          text-align: left;
          font-size: 1rem;
          line-height: 162%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow-x: hidden;
          font-weight: bold;
          opacity: 0.8;
        }
        small {
          max-width: 100%;
          text-align: left;
          font-size: 0.62rem;
          line-height: 138%;
          opacity: 0.62;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }

    aside {
      display: flex;
      align-items: center;

      > span {
        margin-right: 1rem;
        background: #111;
        padding: 0.38rem;
        font-size: 0.62rem;
        border-radius: 0.38rem;
      }

      button + button {
        border-left: 1px solid #000;
      }

      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: none;
        padding: 0.38rem;
        border: 0;
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        opacity: 0.38;

        &:hover {
          opacity: 0.9;
        }

        > * + * {
          margin-top: 0.38rem;
        }

        svg {
          width: 2rem;
          fill: #fff;
        }
      }
    }
  `,
  match: css`
    opacity: 0.8;
    order: 0;
  `,
  nomatch: css`
    order: 1;
    opacity: 0.2;
  `
};

export default Project;
