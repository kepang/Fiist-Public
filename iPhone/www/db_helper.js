/*
 * 
 * 
 * 	Get
 * 	Add
 * 	Delete
 */
var http			= require('http');
/*
var	mysql 			= require('mysql'),
	
	connection		= mysql.createConnection({
        host        : 'localhost',
        user        : 'root',
        password    : '',
        database    : 'websocket'
    });


connection.connect(function(err) {
	// connected! (unless `err` is set)
	var msg;
	if (err) {
		msg = "connect err: " + err;
	}
	else {
		msg = "DB connected";
	}
	console.log(msg);
	});

// Get Users
exports.getUsers = function(callback) {
	connection.query('SELECT * FROM users', function(err, results, fields) {
		// callback function returns employees array
		callback(results);
  });
};
*/

// Get Waitlist
exports.getWaitlist = function(bus_id, callback) {
	
	var requestData = 
	{
		'business_id':		bus_id,
		'min_time':			1366948800,
		'max_time':			new Date().getTime() + (24 * 60 * 60 * 1000)
	};
	
	//var now = new Date().getTime();
	

	 // GET.   
	 var options = {  
	           host: 	'fiistserver.herokuapp.com',   
	           //port: 3000,   
	           path: 	'/waitlists.json?business_id=' + requestData.business_id + '&min_timestamp=' + 
	           			requestData.min_time + '&max_timestamp=' + requestData.max_time,  
	           method: 	'GET'  
	      };   
	 console.log('*********Entered getWaitlist******');
	 var json = '';
	 http.get(options, function(res) {
		    res.on('data', function(data) {
		        // collect the data chunks to the variable named "html"
		        json += data;
		    }).on('end', function() {
		        // the whole of webpage data has been collected. parsing time!
		    	console.log("body: \n" + json);
		    	callback(json);
		    });
	 });
};



// Add to waitlist
exports.addToWaitlist = function(data, callback) {


	// POST.   
	
	 
	// We need this to build our post string
	var querystring = require('querystring');

	// Build the post string from an object
	var post_data = querystring.stringify( {
		       'customer_id' : 		data.user_id,
		       'business_id': 		data.business_id,
		       'guest_num': 		data.guests
	});

	// An object of options to indicate where to post to
	var post_options = {
	       host: 'fiistserver.herokuapp.com',
	       port: '80',
	       path: '/waitlists.json',
	       method: 'POST',
	       headers: {
	           'Content-Type': 'application/x-www-form-urlencoded',
	           'Content-Length': post_data.length
	       }
	};

	var json = '';
	// Set up the request
	var post_req = http.request(post_options, function(res) {
	       res.setEncoding('utf8');
	       res.on('data', function (chunk) {
	           console.log('Response: ' + chunk);
	       });
	       res.on('end', function() {
	    	   console.log('******* HTTP POST REQUEST ON END EVENT *********');
	    	   callback(1);
	       });

	});
	
	// post the data
	post_req.write(post_data);
	post_req.end();
	
};

/*

// Add User
exports.addUser = function(data, callback) {
	connection.query('INSERT INTO users (username, guests, status) VALUES ("?", ?, "?")', 
			[data.username, data.guests, data.status], function(err, info) {
		// callback returns last insert id
		console.log('data: ' + data);
		callback(info.insertId);

		//console.log('ID: ' + data.ID + ' name: ' + data.username);
	});
};

// Delete User
exports.deleteUser = function(data, callback) {
	connection.query('DELETE FROM users WHERE ID=?', [data.ID], function(err, info) {
		callback();
	});
};

*/

