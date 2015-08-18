/*
 * 
 * 
 * 
 * 
 * 
 */


var app                 = require('http').createServer(handler),
    io                  = require('socket.io').listen(app),
    fs                  = require('fs'),
    
    connectionsArray    = [],

    db_helper			= require ("./db_helper.js");

// variable port for heroku
var port = process.env.PORT || 3000;


// Configure for long polling instead of websockets (for Heroku)
io.configure(function () {
	io.set("transports", ["xhr-polling"]);
	io.set("polling duration", 10); 
});


// creating the server ( localhost:8000 )
app.listen(port);

// on server started we can load our client.html page
function handler ( req, res ) {
    fs.readFile( __dirname + '/restaurant.html' , function ( err, data ) {
        if ( err ) {
            console.log("handler err: " + err );
            res.writeHead(500);
            
            return res.end( 'Error loading mysqlclient.html' );
        }
        res.writeHead( 200 );
        res.end( data );
    });
}

// Begin here
// > On connection
//		> populate client 
//		> On add user
//		> On delete user
//		> ...

io.sockets.on('connection', function (client) {
    // just viewing the waitlist
	/*
    db_helper.getWaitlist(function(data) {
    	//data.time = new Date();
        //console.log('POPULATE!!!' + data);
    	client.join('room');
    	client.emit('populate', data); 	
    });
    */
    
    // add user to waitlist
    client.on ('add user', function (data) {
    	// create user, wait until done
    	db_helper.addToWaitlist(data, function (lastId) {
    		// broadcast to re-populate clients
    		db_helper.getWaitlist(data.business_id, function(users) {
    			//client.emit('populate', users);
    			//client.broadcast.emit('populate', users);
    			io.sockets.in('room_' + data.business_id).emit('populate', users);
    			//client.in('room_' + data.business_id).emit('populate', users);


    		});
    	});
    });
    
    // delete user from waitlist
    client.on ('delete user', function (data) {
    	db_helper.deleteUser(data, function() {
    		// broadcast to re-populate clients
    		db_helper.getUsers (function (users) {
    			io.sockets.in('room').emit('populate', users);
    		});
    	});
    });
    
    // subscribing to a restaurant's room.
    client.on ('subscribe', function (business_id) {
		// join room
    	client.join('room_' + business_id);
    	db_helper.getWaitlist(business_id, function(data) {
    		// populate data to client
    		client.in('room_' + business_id).emit('populate', data);
    	});
    });
    	
    // disconnecting a client
    client.on('disconnect', function () {
        var socketIndex = connectionsArray.indexOf( client );
        console.log('socket = ' + socketIndex + ' disconnected');
        if (socketIndex >= 0) {
            connectionsArray.splice( socketIndex, 1 );
        }
        console.log('Number of connections:' + connectionsArray.length);
    });

    
    console.log( 'A new socket is connected!' );
    connectionsArray.push(client);
    console.log('Number of connections:' + connectionsArray.length);
    
});

