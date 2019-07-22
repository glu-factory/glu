const setNode = id => content =>
  (document.getElementById(id).innerHTML = content);

glu('node -v')(setNode('nodev'));
glu('pwd')(setNode('cwd'));
// setNode('cwd', window.__dirname);

let i = 0;

glu('ping google.com')((data, off) => {
  console.log(data);
  i++;
  i > 5 && off();
})
  .then(console.log)
  .catch(console.error);

window.launch = async template => {
  var id = `glu-${template}-${Math.random()
    .toString(16)
    .slice(3, 8)}`;
  await glu(`mkdir ${id}`)(console.log);
  await glu(`cp -r ${__dirname}/templates/${template}/. ${id}/`)(console.log);

  let cwd;
  await glu('pwd')(data => (cwd = data.trim()));
  await glu(
    `touch ${__dirname}/created/${`${cwd}/${id}`.replace(/\//g, '->')}`
  )(console.log);

  await glu(`ls ${__dirname}/created`)(data => {
    const projects = data.split('\n').map(x => x.replace(/\->/g, '/'));
    setNode('created')(projects.map(x => `<li>${x}</li>`).join(''));
  });

  glu(`glu ${id}`);
};
