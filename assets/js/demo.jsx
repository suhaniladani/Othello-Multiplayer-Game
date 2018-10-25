import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.js';

export default function run_demo(root, channel) {
  ReactDOM.render(<Game channel={channel}/>, root);
}
