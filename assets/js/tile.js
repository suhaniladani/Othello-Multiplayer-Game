import React from 'react';

export default function Tile(props) {
	let tileClasses = `tile ${props.isAvailable ? 'available-tile' : 'not-available-tile'}`;
	let colorMarkerClasses = props.value === 'X' ? 'marker white' : props.value === 'O' ? 'marker black' : '';

	return (
		<div className={tileClasses} onClick={props.onClick}>
			{props.value ? <div className={colorMarkerClasses}></div> : ''}
		</div>
	);
}
