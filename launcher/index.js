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
  var id = `glu-${Math.random()
    .toString(16)
    .replace('0.', '')
    .slice(5)}`;
  await glu(`mkdir ${id}`)(console.log);
  await glu(`cp -r ${__dirname}/templates/${template}/. ${id}/`)(console.log);
  glu(`glu ${id}`);
};
