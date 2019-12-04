// Make Connection

// require('dotenv').config()

// let port = process.env.SERVER_PORT

output = document.getElementById('output')

function updateView() {
    console.log("updating view!");

    socket.emit('updateAWS')
 }


var socket = io.connect('http://localhost:5000')

setInterval(updateView, 10000);


// Listen for Events 
socket.on('updateAWS', function(data) {
 
    data.forEach( (file, index) => {
        console.log(file)
        document.getElementById("img" + index ).src="/images/" +file + "?" + new Date().getTime();
    })
})