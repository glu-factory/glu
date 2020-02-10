import { React, html, css } from '../utils/webModules.js';
import { useStateValue } from '../utils/globalState.js';

import Project from './Project.js';

function Projects() {
  const [state, dispatch] = useStateValue();
  const { searchTerm, projects, featuredProjects, clonable } = state;

  const [featuredProject, setFeaturedProject] = React.useState(null);

  const getFeaturedProject = () => {
    const shuffledProjects = featuredProjects.sort(() => Math.random() - 0.5);
    return shuffledProjects.find(
      project =>
        !Object.values(projects).some(
          ({ user, name }) => project[0] === user && project[1] === name
        )
    );
  };

  React.useEffect(() => {
    if (
      projects &&
      featuredProjects &&
      (!featuredProject ||
        Object.values(projects).some(
          project =>
            project.name === featuredProject[1] &&
            project.user === featuredProject[0]
        ))
    ) {
      setFeaturedProject(getFeaturedProject());
    }
  }, [projects]);

  return html`
    <ul className=${style.projects}>
      ${featuredProject &&
        html`
          <${Project}
            meta=${{
              name: featuredProject[1],
              user: featuredProject[0],
              repo: `${featuredProject[0]}/${featuredProject[1]}`
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
        // .filter(([k]) => k.match(searchTerm))
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
    padding: 0 0.62rem 2.62rem;
  `
};

export default Projects;
