/* myApp Module
*
* Description:
* A simple SPA using Angularjs for the AlgaeCal test project
* I have included all of my controllers and directives in one file for eease of review.
* Usually I would separate these concerns into isolated folders, which I have included in my file struccture.
*/
var app = angular.module('myapp', [
	'ngSanitize'
	/// ngSanitaize so that we may bind the json html to the Bootstrap modal window.
])


/////////////////////////////////////////////
///////// MAIN CONTROLLER FOR VIEW //////////
/////////////////////////////////////////////
.controller('myCtrl', ['$scope', '$api', function($scope, $api, $sce){

	///// Get DATA from provided AlgaeCal API by calling $api Factory ($api)
	$api.getData().then(function(res){
    	var obj = res.data.acf
		$scope.DATA = obj
		// console.log(obj)
	})

	///// Show products even if video paused before 2:13 and user scrolls to bottom and clicks "buy now"
	///// This was not in the instructions, but seemed like a use case that may have been omitted.
	$scope.activateProducts = function(){
		$scope.SHOW_PACKAGES = true
	}

	///// Products for hidden boxes. Could be swapped easily for JSON data from $api service.
	$scope.ITEMS = [{
		title: "3 Month Supply",
		set1: "4 AlgaeCal Plus",
		set2: "3 Strontium Boost",
		image: "./img/img_001.jpg",
		price: 233,
		currency: "USD",
		price_by_day: 2.58,
		discount: 20,
		popular: false
	},{
		title: "6 Month Supply",
		set1: "8 AlgaeCal Plus",
		set2: "6 Strontium Boost",
		image: "./img/img_002.jpg",
		price: 337,
		currency: "USD",
		price_by_day: 2.09,
		discount: 35,
		popular: true
	},{
		title: "12 Month Supply",
		set1: "4 AlgaeCal Plus",
		set2: "3 Strontium Boost",
		image: "./img/img_003.jpg",
		price: 717,
		currency: "USD",
		price_by_day: 1.97,
		discount: 38,
		popular: false
	}]

	///// Wistia Video Controls and Events
	window._wq = window._wq || [];

	// target our video by the first 3 characters of the hashed ID
	_wq.push({ id: "cecdwaq3dz", onReady: function(video) {
	  // at 10 seconds, do something amazing
		video.bind('secondchange', function(s) {
		    if (s === 133) {
		      	// Insert code to do something amazing here
		      	$scope.SHOW_PACKAGES = true
		      	///// update digest cycle
		      	$scope.$apply()
		    }
		});
		video.bind("timechange", function(t) {
		  if(t >= 133){
		  	$scope.SHOW_PACKAGES = true
		  	///// update digest cycle
		    $scope.$apply()
		  }
		});
	}});

}])

/////////////////////////////////////////////
///////// MAIN FACTORY FOR API DATA /////////
/////////////////////////////////////////////
/*
Factory created so that the call could be used in any controller or directive. Using $q allows for promised 
based calls to the URI and allows for asynchronous behavior in app.
*/

.factory('$api', ['$http', '$q', function($http, $q){
	var obj = {
		getData: function(){
			// init deferred promises
			var deferred = $q.defer()
			try{
				$http.get("https://www.algaecal.com/wp-json/acf/v3/options/options").then(function(res){
					deferred.resolve(res)
				})
			}
			catch(e){
				/// resolve error
				alert(e)
				deferred.resolve(e)
			}
			//return promise
			return deferred.promise
		}
	}
	return obj
}])

/////////////////////////////////////////////
///////// HEADER DIRECTIVE - REUSABLE ///////
/////////////////////////////////////////////
/*
I have built this as a directive so that it could easily be reused,
which I have done for the modal, keeping your contact info and branding visible.
Ideally, I would use the $api call in here for the time check, making this directive 
completely reusable and independant from controlleers. I did not include here so as to 
minimize calls to the server.

For now, simply passing in the original DATA object from the scope provides info needed to
calculate the open/close hours.
*/
.directive('header', function() {
    return {
        restrict: 'E', //E = element, A = attribute, C = class, M = comment         
        scope: {
	      mydata: '=' // accept the DATA object passed in from template
	    },
        replace: true,
        transclude: true,
        template:   '<div class="header container">'+
        				'<div class="row">'+
					        '<div class="col-sm logo">'+
					        	'<img src="./img/logo.jpg">'+
					    	'</div>'+
					    	'<div class="col-sm contact">'+
					    		'<p class="tap-talk">Tap to Talk <a href="tel:{{mydata.default_phone_number}}">{{mydata.default_phone_number}}</a></p>'+
					      		'<p class="speak-tagline" ng-if="openForBiz"><i class="fa fa-phone"></i> Speak to our Bone Health Specialists!</p>'+
					    	'</div>'+
					  	'</div>'+
                    '</div>',
        controller: function($scope, $element) {
        	///// watch for variable to change. This is needed because 'mydata' is coming from $api RESTful call. Timing is the issue.
           	$scope.$watch('mydata', function (oldValue, newValue) {
           		//// try to calculate business hours according to instructions provided
           		try{
           			var val = newValue || oldValue //// watch for $api data to arrive in scope.
		           	var check = val.office_hours.filter(function(obj){ /// filter through for correct day data
		           		var today = new Date();
						var now = today.getHours()+today.getMinutes().toString() /// get current time in hrs
		           		if(parseInt(obj.day) == today.getDay()){ /// check against today
		           			// console.log(now, obj.starting_time, obj.closing_time)
		           			if(obj.starting_time < now && obj.closing_time > now){ /// check hrs
		           				$scope.openForBiz = true //// show message
		           			}else{
		           				$scope.openForBiz = false //// hide message
		           			}
		           		}
		           	})
           		}
           		catch(e){
           			// console.warn(e)
           		}
           	});
        },
        
        link: function(scope, element, attrs) {
            
        }
    }
})


/////////////////////////////////////////////
///////// FOOTER DIRECTIVE - REUSABLE //////////
/////////////////////////////////////////////
/*
Also built as a directive for reusability in modal
*/
.directive('footer', function() {
    return {
        restrict: 'E', //E = element, A = attribute, C = class, M = comment         
        scope: {
	      mydata: '='
	    },
        replace: true,
        transclude: true,
        template:   '<div class="footer container">'+
        				'<div class="row">'+
					        '<div class="logo">'+
					        	'<img src="./img/logo.jpg">'+
					    	'</div>'+
					    	'<div class="text">'+
					    		'<p class="links"><a href="#">Shipping & Returns</a> | <a href="#">Health Disclaimer</a> | <a href="#">Legal and Privacy Policy</a> | <a href="#">Contact</a> | <a href="#">Order Now</a> </p>'+
					    		'<p>Copyright 2017 AlgaeCal</p>'+
					    	'</div>'+
					  	'</div>'+
                    '</div>',
        controller: function($scope, $element, $api) {
            
        },
        
        link: function(scope, element, attrs) {
            
        } //DOM manipulation
    }
})