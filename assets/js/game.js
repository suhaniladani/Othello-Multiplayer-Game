import React from 'react';
import Board from './grid.js';
import socket from './socket';
import run_demo from "./demo";

var channel;

function init() {
	let root = document.getElementById('root');
	if(!root) {
		return;
	}

	let channel = socket.channel("game:" + name, {observer: othello_cfg.observer});
	run_demo(root, channel);

}

$(init);

function clickEvent(i) {
	const clickLog = this.state.clickLog.slice(0, this.state.clickCount + 1);
	const present = clickLog[this.state.clickCount];

	if (this.gameResult(present.xCount, present.oCount) || present.tiles[i]) {
		return;
	}

	const changedTiles = this.changeTiles(present.tiles, i, this.state.xTurn);

	if (changedTiles === null) {
		return;
	}

	const xCount = changedTiles.reduce((acc, present) => { return present === 'X' ? acc + 1 : acc }, 0);
	const oCount = changedTiles.reduce((acc, present) => { return present === 'O' ? acc + 1 : acc }, 0);

	let skipTurn = this.possibleMoves(!this.state.xTurn, changedTiles).length > 0 ? !this.state.xTurn : this.state.xTurn

	this.setState({
		clickLog: clickLog.concat([{
			tiles: changedTiles,
			xCount: xCount,
			oCount: oCount,
			wasXTurn: skipTurn
		}]),
		clickCount: clickLog.length,
		xTurn: skipTurn,
	});
}

function gameResult(xCount, oCount) {
	return (xCount + oCount < 64) ? null : (xCount === oCount) ? 'XO' : (xCount > oCount ? 'X' : 'O');
}

function changeTiles(tiles, location, xTurn) {
	let changedGrid = null;

	let [beginX, beginY] = [location % 8, (location - location % 8) / 8];

	if (tiles[location] !== null) {
		return null;
	}

	[1, 7, 8, 9, -1, -7, -8, -9].forEach((weight) => {
		let changedTiles = changedGrid ? changedGrid.slice() : tiles.slice();
		let oneOrMoreChanged = false;
		let [previousXLocation, previousYLocation] = [beginX, beginY];

		for (let y = location + weight; y < 64; y = y + weight) {

			let [xLocation, yLocation] = [y % 8, (y - y % 8) / 8];

			if (Math.abs(previousXLocation - xLocation) > 1 || Math.abs(previousYLocation - yLocation) > 1) {
				break;
			}

			if (changedTiles[y] === (!xTurn ? 'X' : 'O')) {
				changedTiles[y] = xTurn ? 'X' : 'O';
				oneOrMoreChanged = true;
				[previousXLocation, previousYLocation] = [xLocation, yLocation];
				continue;
			}

			else if ((changedTiles[y] === (xTurn ? 'X' : 'O')) && oneOrMoreChanged) {
				changedTiles[location] = xTurn ? 'X' : 'O';
				changedGrid = changedTiles.slice();
			}
			break;
		}
	});

	return changedGrid;
}

function possibleMoves(color, tiles) {
	return tiles
		.map((value, index) => { return this.changeTiles(tiles, index, color) ? index : null; })
		.filter((element) => { return element !== null; });
}

function gotView(msg) {
	this.setState(msg.game);
}

export default class Game extends React.Component {

	constructor(props) {

		super(props);

		this.channel = socket.channel("game:" + othello_cfg.game, {user: othello_cfg.user, host: othello_cfg.host, observer: othello_cfg.observer});

		const tilesInitial = Array(64).fill(null);
		[tilesInitial[8 * 3 + 3], tilesInitial[8 * 3 + 4], tilesInitial[8 * 4 + 4], tilesInitial[8 * 4 + 3]] = ['X', 'O', 'X', 'O'];

		this.state = {
			clickLog: [{
				tiles: tilesInitial,
				xCount: 2,
				oCount: 2,
				wasXTurn: true
			}],
			clickCount: 0,
			xTurn: true,

		}

		this.channel.join()
			.receive("ok", resp => {console.log("Joined Successfully", resp)})
			.receive("error", resp => {console.log("Unable to Join", resp);});

		const tilesInitial1 = Array(64).fill(null);
		[tilesInitial1[8 * 3 + 3], tilesInitial1[8 * 3 + 4], tilesInitial1[8 * 4 + 4], tilesInitial1[8 * 4 + 3]] = ['X', 'O', 'X', 'O'];

		const nextSquares = Array(64).fill(null);
		nextSquares[20] = 'X';
		nextSquares[27] = 'X';
		nextSquares[28] = 'X';
		nextSquares[35] = 'O';
		nextSquares[36] = 'X';

		this.channel.on("clickEvent", state => {

			this.setState({
				clickLog: state["clickLog"],
				xTurn: state["xTurn"],
				clickCount: state["clickCount"]});

		});

		this.channel.on("reset", state => {

			this.setState({
				clickLog: state["clickLog"],
				xTurn: state["xTurn"],
				clickCount: state["clickCount"]});

		});

	}

	gotView(msg) {
		this.setState(msg.game);
	}

	gameResult(xCount, oCount) {
		return (xCount + oCount < 64) ? null : (xCount === oCount) ? 'XO' : (xCount > oCount ? 'X' : 'O');
	}

	changeTiles(tiles, location, xTurn) {
		let changedGrid = null;

		let [beginX, beginY] = [location % 8, (location - location % 8) / 8];

		if (tiles[location] !== null) {
			return null;
		}

		[1, 7, 8, 9, -1, -7, -8, -9].forEach((weight) => {
			let changedTiles = changedGrid ? changedGrid.slice() : tiles.slice();
			let oneOrMoreChanged = false;
			let [previousXLocation, previousYLocation] = [beginX, beginY];

			for (let y = location + weight; y < 64; y = y + weight) {

				let [xLocation, yLocation] = [y % 8, (y - y % 8) / 8];

				if (Math.abs(previousXLocation - xLocation) > 1 || Math.abs(previousYLocation - yLocation) > 1) {
					break;
				}

				if (changedTiles[y] === (!xTurn ? 'X' : 'O')) {
					changedTiles[y] = xTurn ? 'X' : 'O';
					oneOrMoreChanged = true;
					[previousXLocation, previousYLocation] = [xLocation, yLocation];
					continue;
				}

				else if ((changedTiles[y] === (xTurn ? 'X' : 'O')) && oneOrMoreChanged) {
					changedTiles[location] = xTurn ? 'X' : 'O';
					changedGrid = changedTiles.slice();
				}
				break;
			}
		});

		return changedGrid;
	}

	possibleMoves(color, tiles) {
		return tiles
			.map((value, index) => { return this.changeTiles(tiles, index, color) ? index : null; })
			.filter((element) => { return element !== null; });
	}

	render() {

		const clickLog = this.state.clickLog.slice();
		const present = clickLog[this.state.clickCount];

		const xTurn = this.state.xTurn;

		let winner = this.gameResult(present.xCount, present.oCount);

		let movesPossible = this.possibleMoves(present.wasXTurn, present.tiles);
		let availableMovesOpposite = this.possibleMoves(!present.wasXTurn, present.tiles);

		if ((movesPossible.length === 0) && (availableMovesOpposite.length === 0))
		{
			winner = present.xCount === present.oCount ? 'XO' : present.xCount > present.oCount ? 'X' : 'O';
		}

		let gameStatus =
			winner ?
				(winner === 'XO') ? 'It\'s a draw' : 'The winner is ' + (winner === 'X' ? 'Host(White)' : 'black(Other Player)') :
				[this.state.xTurn ? 'Hosts(Whites) turn' : 'Other Players(Blacks) turn', ' with ', movesPossible.length, ' available moves'].join('');

		return (

			<div>
			<div className="rules">
			<h1 align="center"> Rules </h1>
			<ul>
			<li>
			The player can reverse opponent's disc when the newly placed disc surrounds the opponent's disc in a straight line in horizontal, vertical or diagonal manner.
			</li>
			<br />
			<li>
			Legal move is only considered when the disc could be placed where it outflanks atleast one of the opponent's disc. Otherwise the player has to pass his turn and wait till he can make a legal move.
			</li>
			<br />
			<li>
			The player has to play his move and cannot forfeit until a legal move is possible even if forfeiting the move could be advantageous to the player.
			</li>
			<br />
			<li>
			The player can flip all possible discs of the opponent that are outflanked by the current player in a single move in all the direction.
			</li>
			</ul>
			</div>
			<div className="game">
			<div className="top">{gameStatus}&nbsp;{winner ? <button className="reset" onClick={() => this.resetClickCondition()}>Play again</button> : ''}</div>


			<div className="game-left-side">

				<div className="game-grid">

					  <Board tiles={present.tiles} movesPossible={movesPossible} onClick={(index) => this.clickCondition(index)}/>

				</div>

				<div className="resetDiv"><button id="reset" className="reset"onClick={() => this.resetClickCondition()}>Reset Game</button></div>

				<div></div>
			</div>
				<div className="info">

					<div> User: <b> {othello_cfg.user} </b> </div>
					<div> Name:<b>  {othello_cfg.game} </b> </div>
					<br />
					<br />
					<div>Host(White) count: <b> {present.xCount} </b> </div>

					<div>Other Player(Black) count: <b> {present.oCount} </b> </div>
					<br />

				</div>
				<div>
				</div>
			</div>
			</div>
		);
	}

	resetClickCondition() {
		const isObserver = othello_cfg.observer;
		if(isObserver=="false") {
			this.channel.push("reset",{state: this.state}).receive("ok", resp => {this.gotView(resp)})
		}

	}

	clickCondition(index) {
		const host = othello_cfg.host;
		const isObserver = othello_cfg.observer;

		if((host == "true") && (this.state.xTurn) && !(isObserver=="true")) {
			this.channel.push("clickEvent",{index: index, state: this.state}).receive("ok", resp => {this.gotView(resp)});
		}
		else if((host == "false") && (!this.state.xTurn) && !(isObserver=="true")) {
			this.channel.push("clickEvent",{index: index, state: this.state}).receive("ok", resp => {this.gotView(resp)});
		}
	}
}
