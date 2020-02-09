import { React, css, html } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

import LoadingBar from './LoadingBar.js';
import Tooltip from './Tooltip.js';

function debounce(callback, time) {
  let interval;
  return function() {
    clearTimeout(interval);
    interval = setTimeout(() => {
      interval = null;
      callback(...arguments);
    }, time);
  };
}

const initialState = {
  clonable: false,
  fetching: false,
  cloning: false,
  cloneProgress: 0
};

// use a reducer to coordinate fetching logic
const reducer = (state, action) => {
  switch (action.type) {
    case 'fetching': {
      return {
        ...state,
        fetching: true,
        clonable: false,
        cloning: false
      };
    }
    case 'clonable': {
      return {
        ...state,
        fetching: false,
        clonable: action.payload
      };
    }
    case 'cloning': {
      return {
        ...state,
        fetching: false,
        cloning: action.payload.isCloning,
        clonable: action.payload.isCloning,
        cloneProgress: action.payload.progress
      };
    }
    default:
      return state;
  }
};

const Search = () => {
  const [globalState, globalDispatch] = useStateValue();
  const { searchTerm, hasSearched, projects } = globalState;

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const [loading, setLoading] = React.useState({
    indeterminate: false,
    progress: 0
  });

  const debouncedGithubFetch = React.useCallback(
    debounce(input => {
      const isValidGithubUrl = /^[a-zA-Z\-]+\/[a-zA-Z\-]/.test(input);
      isValidGithubUrl
        ? fetch(`https://raw.githubusercontent.com/${input}/master/index.html`)
            .then(async res => ({ status: res.status, text: await res.text() }))
            .then(({ status, text }) =>
              dispatch({ type: 'clonable', payload: status === 200 })
            )
        : dispatch({ type: 'clonable', payload: false });
    }, 400),
    []
  );

  React.useEffect(() => {
    dispatch({ type: 'fetching' });
    debouncedGithubFetch(searchTerm);
  }, [searchTerm]);

  let queue = [];
  let queuePos = 0;
  // queues an array of values to update the progress bar with
  const updateProgressBar = values => {
    // if new values take priority over currently queued values
    const priority = values[0] === 0 || values[0] === 100;
    queue = priority
      ? [...queue.slice(0, queuePos), ...values]
      : [...queue, ...values];
    for (let i = queuePos; i < queue.length; i++) {
      (index =>
        setTimeout(
          () => {
            dispatch({
              type: 'cloning',
              payload: {
                isCloning: queue[index] > 0,
                progress: queue[index]
              }
            });
            queuePos++;
          },
          priority && index === queuePos ? 0 : i * 500 - queuePos * 500
        ))(i);
    }
  };

  const cloneProject = async url => {
    const projectName = url.split('/')[1];
    updateProgressBar([40, 75]);
    await glu(`glu ${url}`)(output => {
      if (output.match(`Cloning into 'lukejacksonn@perflink'...`)) {
        updateProgressBar([100, 0]);
        globalDispatch({ type: 'setSearchTerm', payload: '' });
      }
    })
      .then(() => {})
      .catch(
        err => (
          updateProgressBar([0]),
          globalDispatch({ type: 'setSearchTerm', payload: '' }),
          console.error('err', err)
        )
      );
  };

  return html`
    <${LoadingBar}
      loading=${{
        indeterminate: state.fetching,
        progress: state.cloneProgress
      }}
      active=${state.cloning || state.fetching}
      key="loadingBar"
    />
    <form
      key="form"
      className=${style.form}
      onSubmit=${async e => {
        e.preventDefault();
        state.clonable && cloneProject(searchTerm);
      }}
    >
      <input
        onChange=${e =>
          globalDispatch({ type: 'setSearchTerm', payload: e.target.value })}
        placeholder="Search for projects.."
        value=${searchTerm}
        className=${style.input}
      />
      <label className=${style.label}>
        <svg
          viewBox="0 0 18 18"
          fill="none"
          className=${`${style.svg} ${style.downloadIcon} ${state.cloning &&
            'cloning'} ${state.clonable && 'active'}`}
        >
          <path
            d="M9 13.5L14 8.5L12.5 7.09L10 9.66992V0H8V9.67L5.41 7.09L4 8.5L9 13.5Z"
            fill="currentColor"
          />
          <path
            d="M16 9V16H2V9H0V16.7778C0 18 0.9 19 2 19H16C17.1 19 18 18 18 16.7778V9H16Z"
            fill="currentColor"
          />
        </svg>
        <input type="submit" value="" />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className=${`${style.svg} ${style.searchIcon} ${state.fetching &&
            'fetching'} ${!state.clonable && 'active'}`}
        >
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
      </label>
      <${Tooltip} show=${!hasSearched && Object.keys(projects).length < 2} />
    </form>
  `;
};

const style = {
  form: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 0.69rem 0 0;

    position: relative;
    flex: 1 1 100%;
  `,
  label: css`
    position: relative;
    width: 2.2rem;
    height: 2.2rem;
    cursor: pointer;

    > input[type='submit'] {
      display: none;
    }
  `,
  input: css`
    width: 100%;
    border: 0;
    font-size: 1.38rem;
    padding: 1.62rem 2rem;
    color: #fff;
    background: none;
    outline: none;
  `,
  svg: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: rgb(255, 255, 255);
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &.active {
      opacity: 0.38;
    }
  `,
  searchIcon: css``,
  downloadIcon: css`
    @keyframes arrow {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(100%);
      }
    }
    &.cloning > path:first-of-type {
      animation: arrow 0.8s cubic-bezier(0.4, 0, 0.2, 1) -0.3s infinite;
    }
  `
};

export default Search;
