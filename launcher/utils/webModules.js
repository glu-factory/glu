import { React, ReactDOM } from '../web_modules/es-react.js';
import css from '../web_modules/csz.js';
import htm from '../web_modules/htm.js';

const html = htm.bind(React.createElement);

export { React, ReactDOM, html, css };
