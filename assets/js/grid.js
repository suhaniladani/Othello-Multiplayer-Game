import React from 'react';
import Tile from './tile.js';

export default class Board extends React.Component {

	renderTile(i) {
		return (
			<Tile key={i} isAvailable={this.props.movesPossible.indexOf(i) > -1} value={this.props.tiles[i]} onClick={() => this.props.onClick(i)} />
		);
	}

	render() {
		const rows = [];
		for (let j = 0; j < 8; j++) {
			const cols = [];
			for (let i = 0; i < 8; i++) {
				cols.push(this.renderTile(i + (j * 8)))
			}
			rows.push(<div className="grid-row" key={j}>{cols}</div>);
		}
		return (<div>{rows}</div>);
	}
}
