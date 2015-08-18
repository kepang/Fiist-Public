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
    if (window.localStorage.getItem("id") != null && window.localStorage.getItem("id") != "") {    
        init();
    } else {
        window.location = "registration.html";
    }
}

var map;
var businessMarkers = [];
var businesses = [];
var infoWindow;
var mapIcon = new google.maps.MarkerImage("img/mapmarker-icon.png", null, null, null, new google.maps.Size(35,45));

function init() {
    var onSuccess = function(position) {
    /*
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
    */
    
        drawMap(position);
        freshBusinessMarker(position.coords.latitude, position.coords.longitude, 10);
  
    };
    
    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
    
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

}

function getInfoWindowContent(name, address, city, province) {
    return '<div style="color: black;"><div>'+name+'</div><div>'+address+'</div><div>'+city+'&#44; '+province+'</div></div>';
}

function freshBusinessMarker(lat, lng, distance) {
    var requestData = {'latitude': lat, 'longitude': lng, 'distance': distance};
    var jqxhr = $.get(FIIST_GET_BUSINESS_URL, requestData, function(data) {
                        for (i in businessMarkers) {
                            businessMarkers[i].setMap(null);
                        }
                        businessMarkers.length = 0;
                        businesses.length = 0;
                        for (i in data.data) {
                            businesses.push(data.data[i]);
                        }
                        for (i in businesses) {
                            var myLatlng = new google.maps.LatLng(businesses[i].latitude, businesses[i].longitude);
                            var marker = new google.maps.Marker({
                                position: myLatlng,
                                map: map,
                                icon: mapIcon,
                                //shadow: '',
                                business: businesses[i]
                            });
                            businessMarkers.push(marker);
                            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                                return function() {
                                  infoWindow.setContent(getInfoWindowContent(marker.business.name, marker.business.address, marker.business.city, marker.business.province));
                                  infoWindow.open(map, marker);
                                }
                              })(marker, i));
                        }
                        // nearby restaurants
                        NearbyRestaurants(businesses);
                    })
                    .fail(function(data) { navigator.notification.alert("Unable to access server. Please try again later."); });
}

function drawMap(position) {

    var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
        //center: new google.maps.LatLng(-34.397, 150.644),
        center: myLatlng,
        zoom: 13,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    /*
    var marker2 = new google.maps.Marker({
                                         position: myLatlng,
                                         map: map,
                                         title: "my location"
                                         });*/
    var geoMarker = new GeolocationMarker();
    geoMarker.setMap(map);
    infoWindow = new google.maps.InfoWindow();
}

function NearbyRestaurants (data) {
    var out = "";
    var id, nameStr;
    $.each(data, function(index, business) {
    	id = business.id;
    	nameStr = escape(business.name);
    	out += 	"<div class='nullcell restaurant' onclick='goRestaurant(" + id + ",\"" + nameStr + "\")'>" +
    			"<p class='restaurantcelltitle'>" + business.name + "</p>" +
                        "<div class='cellinteraction forwardarrow restaurant'></div>" +
                        "<p class='restaurantcelladdress'>" + business.address + "</p>" +
                        "<p class='restaurantcelladdress'>" + business.city + "&#44;&#32;" + business.province + "</p></div>";
    });
    $("#nearbyRestaurantList").html(out);
}

function goRestaurant(id, restaurant) {
    window.localStorage.setItem("restaurant", unescape(restaurant));
    window.localStorage.setItem("restaurantID", id);
	//window.location = "restaurant.html?name=" + nameStr;
    window.location = "restaurant.html";
}

$(document).ready(function() {
    $("#logout").click(function() {
        window.localStorage.clear();
        window.location = "registration.html";
    });
});
