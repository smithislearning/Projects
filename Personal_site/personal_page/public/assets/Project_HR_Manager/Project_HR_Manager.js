var app = angular.module('myApp', ['ngRoute', 'services']);

app.filter('deep', function() {
	return function(ori, target) {
		ori = ori || [];
		target = target ||'';
		var out = [];
		for(var i = 0; i < ori.length; i ++) {
			if(ori[i].fName.includes(target)) {
				out.push(ori[i]);
			} else if(ori[i].lName.includes(target)) {
				out.push(ori[i]);
			} else if(typeof ori[i].title !== 'undefined' && ori[i].title.includes(target)) {
				out.push(ori[i]);
			} else if(typeof ori[i].gender !== 'undefined' && ori[i].gender.includes(target)) {
				out.push(ori[i]);
			} else if(typeof ori[i].age !== 'undefined' && (ori[i].age === target || ori[i].age === Number(target))) {
				out.push(ori[i]);
			}
		}
		return out;
	}
});

app.config(function($routeProvider) {
	$routeProvider.
		when('/New_User', {
			templateUrl: 'New_User.html',
			controller: 'newCtrl'
		}).
		when('/Edit_user', {
			templateUrl: 'Edit_User.html',
			controller: 'editCtrl'
		}).
		when('/', {
			templateUrl: 'User_List.html',
			controller: 'userCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});
});

app.controller('userCtrl', ['$scope', 'deepFilter', 'hrService', function($scope, deepFilter, hrService) {
	$scope.chg = 1;
	$scope.users = hrService.getAll();
	$scope.search = function() {
		$scope.filteredUsrs = deepFilter($scope.users, $scope.containStr);
	}
	
	$scope.changePage = function(val) {
		$scope.currentPage = val;

	}
	
	$scope.$watch('numPerPage', function() {
		$scope.pages = [];
		for(var i = 0; i < Math.ceil($scope.users.length / $scope.numPerPage); i ++) {
			$scope.pages[i] = i + 1;
		}
	});
	
	$scope.$watch('currentPage + numPerPage + chg', function() {
		$scope.users = hrService.getAll();
		var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
		$scope.filteredRst = $scope.users.slice(begin, end);
	});
	
	$scope.editUser = function(val) {
		hrService.cacheId(val - 1);
		$scope.users = hrService.getAll();
		$scope.chg *= -1;
	}
	
	$scope.newUser = function() {
		$scope.users = hrService.getAll();
		$scope.chg *= -1;
	}
	
	$scope.deleteUser = function(id) {
		console.log(id);
		$scope.users = hrService.deleteById(id - 1);
		$scope.chg *= -1;
	}
}]);

app.controller('editCtrl', ['$scope', 'hrService', function($scope, hrService) {
	$scope.edit = true;
	$scope.error = false;
	$scope.incomplete = false;
	var UID = hrService.getId();
	$scope.user = hrService.getById(UID);
	$scope.fName = $scope.user.fName;
	$scope.lName = $scope.user.lName;
    $scope.title = $scope.user.title;
	$scope.gender = $scope.user.gender;
	$scope.save = function() {
		var obj = {
			id: UID,
			fName: $scope.fName,
			lName: $scope.lName,
			title: $scope.title,
			gender: $scope.gender,
			age: $scope.age};
		console.log(UID);
		hrService.edit(obj, UID);
	}
}]);

app.controller('newCtrl', ['$scope', 'hrService', function($scope, hrService) {
	$scope.fName = "";
	$scope.lName = "";
	$scope.title = "";
	$scope.gendr = "";
	$scope.age = "";
	$scope.passw1 = "";
	$scope.passw2 = "";
	$scope.error = false;
	$scope.incomplete = false; 
	$scope.$watch('passw1',function() {$scope.test();});
	$scope.$watch('passw2',function() {$scope.test();});
	$scope.$watch('fName', function() {$scope.test();});
	$scope.$watch('lName', function() {$scope.test();});
	$scope.test = function() {
		if ($scope.passw1 !== $scope.passw2) {
		    $scope.error = true;
	    } else {
		    $scope.error = false;
		}
		$scope.incomplete = false;
		if (!$scope.fName.length ||
			!$scope.lName.length ||
			!$scope.passw1.length || !$scope.passw2.length) {
		    $scope.incomplete = true;
  		}
	}
	$scope.id = hrService.getAll().length
	$scope.save = function() {
		var obj = {
			id: $scope.id,
			fName: $scope.fName,
			lName: $scope.lName,
			title: $scope.title,
			gender: $scope.gender,
			age: $scope.age};
		hrService.append(obj);
	}
}]);

angular.module('services',[])
	.factory('hrService', function() {
	var cachedId;
	var users = [
		{id:1, fName:'Hege', lName:"Pege", title:"Mrs.", gender:"female", age:"38"},
		{id:2, fName:'Kim',  lName:"Pim" },
		{id:3, fName:'Sal',  lName:"Smith" },
		{id:4, fName:'Jack', lName:"Jones" },
		{id:5, fName:'John', lName:"Doe" },
		{id:6, fName:'Peter',lName:"Pan" }];
	return {
		cacheId: function(id) {
			cachedId = id;
		},
		getId: function() {
			return cachedId;
		},
		edit: function(cntnt, id) {
			if(id >= users.length) {
				id = user.length;
				users.push(cntnt);
			} else {
				users[id] = cntnt;
			}
			return "Success!";
		},
		append: function(cntnt) {
			users.push(cntnt);
		},
		getById: function(id) {
			return users[id];
		},
		getAll: function() {
			return users;
		},
		deleteById: function(id) {
			users.splice(id, 1);
			for(var idx = id; idx < users.length; idx ++) {
				users[idx].id --;
			}
			return users;
		}
	}
});
