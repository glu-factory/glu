const setNode = id => content =>
  (document.getElementById(id).innerHTML = content);

glu('node -v')(setNode('nodev'));
glu('pwd')(setNode('cwd'));
