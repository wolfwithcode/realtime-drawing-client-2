import React, { Component } from 'react'
import {
    subscribeToDrawings,
} from './api';

export default class DrawingList extends Component {
    constructor(props){
        console.log(" DrawingList ");
        super(props);
        subscribeToDrawings((drawing) => {
            console.log(" DrawingList subscribeToDrawings ", drawing)
            this.setState(prevState => ({
                drawings: prevState.drawings.concat([drawing]),
            }));
        });
    }

    state = {
        drawings: [],
    };

    render() {
        const drawings = this.state.drawings.map(drawing => (
            <li
                className="DrawingList-item"
                key={drawing.id}
                onClick={event => this.props.selectDrawing(drawing)}
            >
                {drawing.name}
            </li>
        ));
        return (
            <ul
                className="DrawingList"                
            >
                {drawings}
            </ul>
        );
    }
}
