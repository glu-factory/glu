document.body.innerHTML = `
  <header>
    <img src="./logo.png" />
    <button onclick="glu('code .')(console.log)">
      Start Coding
    </button>
  </header>
  <footer>
    <span id='cwd'></span>
    <span id='nodeVersion'></span>
  </footer>
`;

glu('pwd')(cwd => (document.querySelector('#cwd').innerText = cwd));
glu('node -v')(
  nodeVersion =>
    (document.querySelector('#nodeVersion').innerText = nodeVersion)
);
