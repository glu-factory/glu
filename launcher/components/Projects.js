import { React, html, css } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

import Project from './Project.js';

function Projects() {
  const [state, dispatch] = useStateValue();
  const { searchTerm, projects, clonable, featuredProject } = state;

  return html`
    <ul className=${style.projects}>
      ${featuredProject &&
        html`
          <${Project}
            meta=${{
              name: featuredProject.split('/')[1],
              user: featuredProject.split('/')[0],
              repo: featuredProject
            }}
          />
        `}
      ${clonable &&
        !projects[searchTerm.replace('/', '@')] &&
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
        .sort(([, a], [, b]) => (a.mtime > b.mtime ? -1 : 0))
        .map(
          ([k, v]) =>
            html`
              <${Project}
                order=${searchTerm !== '' &&
                  (k
                    .toLowerCase()
                    .match(searchTerm.replace('/', '@').toLowerCase())
                    ? 0
                    : 1)}
                key=${k}
                id=${k}
                meta=${v}
              />
            `
        )}
    </ul>
  `;
}

const style = {
  projects: css`
    display: flex;
    flex-direction: column;
    margin-top: -0.62rem;
    padding: 0 0.38rem 3.2rem;
  `
};

export default Projects;
