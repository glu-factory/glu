document.body.innerHTML = `
  <header>
    <img src="./logo.png" />
    <button onclick="glu('code .')(console.log)">
      Start Coding
    </button>
  </header>
  <footer>
    <span>~${__dirname.split('/').pop()}</span>
    <span id='nodeVersion'></span>
  </footer>
`;

glu('node -v')(
  nodeVersion =>
    (document.querySelector('#nodeVersion').innerText = nodeVersion)
);
