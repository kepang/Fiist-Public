/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//
function onDeviceReady() {
    init();
}

function init() {

}


$(document).ready(function() {
// 1. Grab waitlist data

	// creating a new websocket
	var socket = io.connect(FIIST_NODEJS_URL);
        
	var requestData = 
	{
	};
	
	var out = '';
    
    var data = {
            business_id: 20,
            waitlist_id: 259
    };

    //socket.emit('mgr delete user', data);

	$.get(FIIST_WAITLIST_URL, requestData, function(data) {


		var waitlists = $.parseJSON(data.data);
            $.each(waitlists, function(index, waitlist) {
                    out += "<tr><td>" + waitlist.customer.first_name + "</td>" + "<td>" + waitlist.business.name + "</td><td><button class='delete' waitlistid='" +waitlist.id+ "' businessid='"+ waitlist.business_id +"'>delete</button></td></tr>";
            });
            
            $('#diners').html(out);
            $('.delete').click(function() {
                var deleteData = {
                    business_id: parseInt($(this).attr("businessid")),
                    waitlist_id: parseInt($(this).attr("waitlistid"))
                };
                // NOT WORKING
                socket.emit('mgr delete user', deleteData);
                setTimeout(function () { window.location="waitlistMgr.html" }, 2000);
            });

	});

});



