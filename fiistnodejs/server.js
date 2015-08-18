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

var waitlist_entries = {};				// Waitlist socket management for confirmation feature

var port = process.env.PORT || 3000;	// variable port for heroku
app.listen(port);						// creating the server


// Configure for long polling instead of websockets (for Heroku)
io.configure(function () {
	io.set("transports", ["xhr-polling"]);
	io.set("polling duration", 10); 
});

// Configure confirmation message socket channel
var clients = {};
io.of('/confirmation').on('confirmation', function (consocket) {
    clients[consocket.id] = consocket;
});

// on server started we can load our client.html page
function handler ( req, res ) {
 
    fs.readFile( __dirname + '/restaurant.html' , function ( err, data ) {
        if ( err ) {
            console.log("handler err: " + err );
            res.writeHead(500);
        
            return res.end( 'Error loading client html page' );
        }
        res.writeHead( 200 );
        res.end( data );
    });

}

// Message handlers
// > On connection
//		> populate client 
//		> On 'add user'
//		> On 'mgr delete user'
//		> On 'confirmation request from host'
//		> On 'confirmation ack from client'
//		> On 'subscribe'
//		> On 'disconnect'
//		> ...

io.sockets.on('connection', function (client) {
    // just viewing the waitlist on connection
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
    	db_helper.addToWaitlist(data, function (lastID) {
    		// manage waitlist_entries by waitlistID
    		waitlist_entries['wid:' + lastID] = client;
    		// or waitlist.lastID = client;
    		
    		// broadcast to re-populate clients
    		db_helper.getWaitlist(data.business_id, function(users) {
    			//client.emit('populate', users);
    			//client.broadcast.emit('populate', users);
    			io.sockets.in('room_' + data.business_id).emit('populate', users);

    		});
    	});
    });
    
    // manager delete user from waitlist
    // data = { business_id,  waitlist_id }
    client.on ('mgr delete user', function (data) {
    	// delete from db
    	console.log('******* [MSG: mgr delete user] *********');
    	db_helper.mgrDeleteFromWaitlist(data, function() {
    		// broadcast to re-populate clients
        	console.log('******* [MSG:Called db_helper] *********' + data.business_id);
    		db_helper.getWaitlist (data.business_id, function (users) {
    			console.log('******* [MSG:Retrieve waitlist and broadcast] *********');
    			io.sockets.in('room_' + data.business_id).emit('populate', users);
    		});
    		// manage waitlist_entries
    		delete waitlist_entries['wid:' + data.waitlist_id];
    	});
    });
    
    // confirmation request from host - relay to client
    client.on ('confirmation request from host', function (data) {
    	var client_socket = waitlist_entries['wid:' + data.waitlist_id];
    	client_socket.emit('confirmation request to client', data);
    });
    
    // confirmation acknowledgement from client - broadcast updated waitlist
    client.on('confirmation ack from client', function (data) {
    	// Update DB
    	// ...put code here
    	// broadcast to repopulate clients in same business waitlist (room)
    	db_helper.getWaitlist (data.business_id, function(users) {
    		io.sockets.in('room_' + data.business_id).emit('populate', users);
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

    // on connect: track clients
    console.log( 'A new socket is connected!' );
    connectionsArray.push(client);
    console.log('Number of connections:' + connectionsArray.length);
    
});
