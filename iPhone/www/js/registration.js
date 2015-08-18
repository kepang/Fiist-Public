// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//
function onDeviceReady() {
    setTimeout(function() {
        navigator.splashscreen.hide();
    }, 2000);
    
    init();
}

function init() {
    
}

function RegistrationCtrl($scope, $http, $templateCache) {
    $scope.method = 'POST';
    $scope.logIn = function() {
        var loginData = {'email': $scope.email, 'password': $scope.password};
        $http({method: $scope.method, url: FIIST_USER_SIGNIN_URL, data: loginData, cache: $templateCache}).
            success(function(data, status) {
                if (data.data.user.type != "Customer") {
                    navigator.notification.alert("Error: Doesnt support login as Business currently. Coming soon...");
                    return;
                }
                window.localStorage.clear();
                window.localStorage.setItem("email", data.data.user.email);
                window.localStorage.setItem("auth_token", data.data.auth_token);
                window.localStorage.setItem("id", data.data.user.id);
                window.localStorage.setItem("first_name", data.data.user.first_name);
                window.localStorage.setItem("last_name", data.data.user.last_name);
                window.location = "home.html";
            }).
            error(function(data, status) {
                navigator.notification.alert("Error: " + data.meta.message);
            });
    };
    $scope.signUp = function() {
        var signupData = {'email': $scope.email, 'password': $scope.password, 'first_name': $scope.firstName, 'last_name': $scope.lastName,
                        'type': "Customer"};
        $http({method: $scope.method, url: FIIST_USER_REGISTRATION_URL, data: signupData, cache: $templateCache}).
            success(function(data, status) {
                window.localStorage.clear();
                window.localStorage.setItem("email", data.data.user.email);
                window.localStorage.setItem("auth_token", data.data.auth_token);
                window.localStorage.setItem("id", data.data.user.id);
                window.localStorage.setItem("first_name", data.data.user.first_name);
                window.localStorage.setItem("last_name", data.data.user.last_name);
                window.location = "home.html";
            }).
            error(function(data, status) {
                navigator.notification.alert("Error: " + JSON.stringify(data));
            });
    }
    
    $scope.signUpBusiness = function() {
        var signupData = {'email': $scope.email, 'password': $scope.password, 'name': $scope.name, 'address': $scope.address,
                        'city': $scope.city, 'province': $scope.province, 'country':$scope.country, 'type': "Business"};
        $http({method: $scope.method, url: FIIST_USER_REGISTRATION_URL, data: signupData, cache: $templateCache}).
            success(function(data, status) {
                //window.location = "index.html";
                navigator.notification.alert("Success: " + data.data.user.email + " : " + data.data.user.name);
                window.location = "registration.html";
            }).
            error(function(data, status) {
                navigator.notification.alert("Error: " + data.meta.message);
            });
    }
}