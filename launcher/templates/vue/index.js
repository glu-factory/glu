import Vue from 'https://unpkg.com/vue@2.6.0/dist/vue.esm.browser.min.js';

const App = {
  name: 'App',
  data: () => ({ dirname: '', nodeVersion: '' }),
  methods: {
    start() {
      glu('code .')(console.log);
    }
  },
  template: `
    <div>
      <header>
        <img src="./logo.png" />
        <button @click="start">
          Start Coding
        </button>
      </header>
      <footer>
        <span>~{{__dirname.split('/').pop()}}</span>
        <span>{{nodeVersion}}</span>
      </footer>
    </div>
  `
};

new Vue({ render: h => h(App) }).$mount('#app');
