import openSocket from 'socket.io-client';
import Rx from 'rxjs/Rx';

const port = 
    parseInt(window.location.search.replace('?',''),10) 
    || 8000;

const webSocketUrl = "https://realtime-drawing-server.herokuapp.com/";
const socket = openSocket(webSocketUrl);

function subscribeToDrawings(cb){
    socket.on('drawing', drawing => cb(drawing));
    socket.emit('subscribeToDrawings');
}

function createDrawing(name){
    socket.emit('createDrawing', {name});
}

function publishLine({drawingId, line}){
    socket.emit('publishLine', {drawingId, ...line});
}


function subscribeToDrawingLines( drawingId, cb ){

    const lineStream = Rx.Observable.fromEventPattern(
        h => socket.on(`drawingLine:${drawingId}`, h),
        h => socket.off(`drawingLine:${drawingId}`, h)
    );

    const bufferTimeStream = lineStream
    .bufferTime(100)
    .map(lines => ({lines}));

    const reconnectStream = Rx.Observable.fromEventPattern(
        h => socket.on('connect', h),
        h => socket.off('connect', h),
    );

    const maxStream = lineStream.map(l => new Date(l.timestamp).getTime()).scan((a,b) => ( (a>b) ? a : b), 0);

    reconnectStream
    .withLatestFrom(maxStream)
    .subscribe((joined) => {
        const lastReceivedTimestamp = joined[1];
        socket.emit('subscribeToDrawingLines', {drawingId, from: lastReceivedTimestamp});
    })
    
    
    bufferTimeStream.subscribe(linesEvent => cb(linesEvent));
    socket.emit('subscribeToDrawingLines', { drawingId });
}


function subscribeToConnectEvent(cb){
    socket.on('connect', () => cb({
        state: 'connected',
        port,
    }));
    socket.on('disconnect', () => cb({
        state: 'disconnected',
        port,
    }));
    socket.on('connect_error', () => cb({
        state: 'disconnected',
        port,
    }));
}

export {
    createDrawing,
    subscribeToDrawings,
    publishLine,
    subscribeToDrawingLines,
    subscribeToConnectEvent,
};