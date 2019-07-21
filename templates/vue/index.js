import Vue from 'https://unpkg.com/vue@2.6.0/dist/vue.esm.browser.min.js';

const App = {
  name: 'App',
  data: () => ({ cwd: '', nodeVersion: '' }),
  methods: {
    start() {
      glu('code .')(console.log);
    }
  },
  template: `
    <header>
      <img src="./logo.png" />
      <button @click="start">
        Start Coding
      </button>
    </header>
    <footer>
      <span>{{cwd}}</span>
      <span>{{nodeVersion}}</span>
    </footer>
  `
};

new Vue({ render: h => h(App) }).$mount('#app');
