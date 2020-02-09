import { React, css, html } from '../utils/webModules.js';

const style = {
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    height: 5px;
    width: 100%;
    background: #2e2e2e;
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.active {
      opacity: 1;
    }
  `,
  bar: css`
    position: absolute;
    top: 0;
    left: 0;
    height: 5px;
    background: #222222;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.indeterminate {
      width: 100%;
      transition: none;

      &.inc {
        @keyframes increase {
          from {
            left: -5%;
            width: 5%;
          }
          to {
            left: 130%;
            width: 100%;
          }
        }
        animation: increase 2s infinite;
      }
      &.dec {
        opacity: 0;
        @keyframes decrease {
          from {
            opacity: 1;
            left: -80%;
            width: 80%;
          }
          to {
            opacity: 1;
            left: 110%;
            width: 10%;
          }
        }
        animation: decrease 2s 0.5s infinite;
      }
    }
  `
};

function LoadingBar({ active, loading }) {
  return html`
    <div className=${`${style.container} ${active && 'active'} `}>
      <div
        className=${`${style.bar} ${loading.indeterminate &&
          'indeterminate'} inc`}
        style=${!loading.indeterminate
          ? {
              width: `${loading.progress}%`
            }
          : {}}
      />
      <div
        className=${`${style.bar} ${loading.indeterminate &&
          'indeterminate'} dec`}
      />
    </div>
  `;
}

export default LoadingBar;
