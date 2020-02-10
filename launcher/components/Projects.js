import { useStateValue } from '../utils/globalState.js';
import { html, css } from '../utils/webModules.js';

import Project from './Project.js';

function Projects() {
  const [state, dispatch] = useStateValue();
  const { searchTerm, projects, clonable } = state;

  return html`
    <ul className=${style.projects}>
      ${clonable &&
        html`
          <${Project}
            key=${searchTerm}
            id=${searchTerm}
            meta=${{
              name: searchTerm.split('/')[1],
              user: searchTerm.split('/')[0],
              repo: searchTerm
            }}
            }
          />
        `}
      ${Object.entries(projects)
        .filter(([k]) => k.match(searchTerm))
        .sort(([, a], [, b]) => (a.mtime > b.mtime ? -1 : 0))
        .map(
          ([k, v]) =>
            html`
              <${Project} key=${k} id=${k} meta=${v} />
            `
        )}
    </ul>
  `;
}

const style = {
  projects: css`
    padding: 0 0.62rem 2.62rem;
  `
};

export default Projects;
