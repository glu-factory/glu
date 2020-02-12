document.body.innerHTML = `
  <header>
    <img src="./logo.png" />
    <button onclick="glu('code .')">
      Start Coding
    </button>
  </header>
  <footer>
    <span>~${__dirname.split('/').pop()}</span>
    <span id='nodeVersion'></span>
  </footer>
`;

glu('node -v').then(
  nodeVersion =>
    (document.querySelector('#nodeVersion').innerText = nodeVersion)
);
