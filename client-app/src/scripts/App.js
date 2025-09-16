import logo from '../assets/logo.svg';
import '../styles/App.css';
import React from 'react';

export function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export const TestComponent = () => {
  return (
    <div id="Test" class="">
      <h1> Event Tracker App </h1>
      <h2> 😬 </h2>
      <p>some filler text</p>
    </div>
  );
}