import Game from './components/Game';

function App() {
  return (
    <div className="wrapper">
      <header>
        <h1>NOTWORDLE</h1>
      </header>
      <Game />
    </div>
  );
}

export default App

//create custom hook for useWordle - returns the board, keyboard, and handleInput?
