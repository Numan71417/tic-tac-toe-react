import { useState, useEffect, useRef } from "react";
import Board from "./Board";
import GameOver from "./GameOver";
import GameState from "./GameState";
import Reset from "./Reset";
import gameOverSoundAsset from "../sounds/game_over.wav";
import clickSoundAsset from "../sounds/click.wav";
import bgSoundAsset from '../sounds/bg.wav'
import Confetti from "react-confetti";
import useWindowSize from 'react-use/lib/useWindowSize'
import axios from'axios';
import play from '../play.png'
import pause from '../pause.png'


const gameOverSound = new Audio(gameOverSoundAsset);
gameOverSound.volume = 0.5;
const clickSound = new Audio(clickSoundAsset);
clickSound.volume = 0.5;
const bgSound = new Audio(bgSoundAsset);
bgSound.volume = 0.2;

const PLAYER_X = "X";
const PLAYER_O = "O";

const winningCombinations = [
  //Rows
  { combo: [0, 1, 2], strikeClass: "strike-row-1" },
  { combo: [3, 4, 5], strikeClass: "strike-row-2" },
  { combo: [6, 7, 8], strikeClass: "strike-row-3" },

  //Columns
  { combo: [0, 3, 6], strikeClass: "strike-column-1" },
  { combo: [1, 4, 7], strikeClass: "strike-column-2" },
  { combo: [2, 5, 8], strikeClass: "strike-column-3" },

  //Diagonals
  { combo: [0, 4, 8], strikeClass: "strike-diagonal-1" },
  { combo: [2, 4, 6], strikeClass: "strike-diagonal-2" },
];

function checkWinner(tiles, setStrikeClass, setGameState, setWin, datafetch) {
  for (const { combo, strikeClass } of winningCombinations) {
    const tileValue1 = tiles[combo[0]];
    const tileValue2 = tiles[combo[1]];
    const tileValue3 = tiles[combo[2]];

    if (
      tileValue1 !== null &&
      tileValue1 === tileValue2 &&
      tileValue1 === tileValue3
    ) {
      setStrikeClass(strikeClass);
      if (tileValue1 === PLAYER_X) {
        setGameState(GameState.playerXWins);
        setWin(true);
        datafetch();
      } else {
        setGameState(GameState.playerOWins);
        setWin(true);
        datafetch();
      }
      return;
    }
  }

  const areAllTilesFilledIn = tiles.every((tile) => tile !== null);
  if (areAllTilesFilledIn) {
    setGameState(GameState.draw);
  }
}

function TicTacToe( {handleMode, mode, apikey}) {
  //confetti
  const { width, height } = useWindowSize()
  
  const [win,setWin] = useState(false);
  const [tiles, setTiles] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(PLAYER_X);
  const [strikeClass, setStrikeClass] = useState();
  const [gameState, setGameState] = useState(GameState.inProgress);
  const [quote , setQuote] = useState({});
  const [soundIcon, setSoundIcon] = useState(play)
  
// fetch quote
  const datafetch = async()=>{
    axios.get(`https://api.api-ninjas.com/v1/quotes?category=success`, {
      headers:{
        'X-Api-Key': apikey
        }
      }).then((response) => {
        console.log(response.data[0])
      setQuote(response.data[0]);
    });
  }
 

  const soundHandle = ()=>{
    if(soundIcon === pause){
      setSoundIcon(play);
      bgSound.play();
    }else{
      setSoundIcon(pause);
      bgSound.pause();
    }
  }

  const handleTileClick = (index) => {
    if (gameState !== GameState.inProgress) {
      setWin(flase)
      return;
    }

    if (tiles[index] !== null) {
      return;
    }

    const newTiles = [...tiles];
    newTiles[index] = playerTurn;
    setTiles(newTiles);
    if (playerTurn === PLAYER_X) {
      setPlayerTurn(PLAYER_O);
    } else {
      setPlayerTurn(PLAYER_X);
    }
  };

  const handleReset = () => {
    setGameState(GameState.inProgress);
    setTiles(Array(9).fill(null));
    setPlayerTurn(PLAYER_X);
    setStrikeClass(null);
    setWin(false);
    setQuote({})
  
  };

  useEffect(() => {
    checkWinner(tiles, setStrikeClass, setGameState, setWin, datafetch);
  }, [tiles]);

  useEffect(() => {
    if (tiles.some((tile) => tile !== null)) {
      clickSound.play();
      
    }
  }, [tiles]);

  useEffect(() => {
    if (gameState !== GameState.inProgress) {
      gameOverSound.play();
      bgSound.pause();
    }else{
      bgSound.play();
      
    }
  }, [gameState]);


  return (
    <div className={`${mode} main`} >
      {win && <Confetti numberOfPieces={150}  width={width} height={height}  />}
    <div className="container">
      <div className="head">
      <h1>Tic Tac Toe</h1>
      <div>
        <input type="checkbox" class="checkbox" id="checkbox" onChange={handleMode}/>
          <label htmlFor="checkbox" class="checkbox-label">
            <p >🌘</p>
            <p>🌞</p>
            <span class="ball"></span>
          </label>
          <button style={{background:'none',border:'none',cursor:'pointer'}} onClick={soundHandle}><img src={soundIcon} width={'20px'} alt=""  className={mode} style={{background:'none',  filter:'brightness(2)}'}}
    /></button>
      </div>
      </div>
      <Board
        playerTurn={playerTurn}
        tiles={tiles}
        onTileClick={handleTileClick}
        strikeClass={strikeClass}
      />
      <div className="win" >
      <GameOver gameState={gameState} quote={quote}  />
      <Reset gameState={gameState} onReset={handleReset} />
      </div>

    </div>

    </div>
  );
}

export default TicTacToe;
