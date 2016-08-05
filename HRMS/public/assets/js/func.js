var app = angular.module('myApp', ['ui.mask', 'ui.router', 'infinite-scroll', 'ngFileUpload', 'services']);//, 'ngFileUpload']);

app.filter('hr', function() {
	return function(employees, target) {
		employees = employees || [];
		target = target || "";
		var out = [];
		for(var i = 0; i < employees.length; i ++) {
			if((typeof employees[i].fName !== 'undefined' && employees[i].fName.includes(target)) || (typeof employees[i].lName !== 'undefined' &&employees[i].lName.includes(target)) || (typeof employees[i].position !== 'undefined' && employees[i].position.includes(target))) {
				out.push(employees[i]);
			}
		}
		return out;
	}
});

app.filter('showSub', function() {
	return function(employees, target) {
		employees = employees || [];
		target = target || "";
		var out = [];
		for(var i = 0; i < employees.length; i ++) {
			if(employees[i].sup === target) {
				out.push(employees[i]);
			}
		}
		return out;
	}
});

app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/home');
	$stateProvider.
		state('home', {
			url:'/home',
			templateUrl: 'list.html',
			controller: 'listCtrl'
		}).
		state('new', {
			url: '/new',
			templateUrl: 'new.html',
			controller: 'newCtrl'
		}).
		state('img', {
			url: '/img',
			templateUrl: 'img.html',
			controller: 'imgCtrl'
		}).
		state('edit', {
			url: '/edit',
			templateUrl: 'edit.html',
			controller: 'editCtrl'
		}).
		state('viewInfo', {
			url: '/employee_info',
			templateUrl: 'viewInfo.html',
			controller: 'viCtrl'
		});
});

app.controller('listCtrl', ['$scope', 'hrFilter', 'showSubFilter', 'hrService', '$state', function($scope, hrFilter, showSubFilter, hrService, $state) {
	hrService.getAll().then(function(data) {
		var filtered = hrFilter(data, $scope.target);
		var wrk = [];
		if(filtered.length === 0) {
			wrk = data;
		} else {
			wrk = filtered;
		}
		var tmp = [];
		for(var i = 0; i < 10; i ++) {
			if(i === wrk.length) {
				break;
			}
			tmp.push(wrk[i]);
		}
		$scope.employees = tmp;
		$scope.search = function() {
			filtered = hrFilter(data, $scope.target);
			tmp = [];
			for(var i = 0; i < 10; i ++) {
				if(i === filtered.length) {
					break;
				}
				tmp.push(filtered[i]);
			}
			$scope.employees = tmp;
		}
		$scope.showSub = function(id) {
			filtered = showSubFilter(data, id);
			tmp = [];
			for(var i = 0; i < 10; i ++) {
				if(i === filtered.length) {
					break;
				}
				tmp.push(filtered[i]);
			}
			$scope.employees = tmp;
		}
		
		$scope.refresh = function() {
			$state.reload();
		}
		
		$scope.edit = function(id) {
//			console.log(id)
			hrService.cache(id);
//			hrService.getAll();
		}
//		$scope.delete = function(id) {
//			hrService.cache(id);
//			hrService.getAll()//.then(function(data) {
//		}
		$scope.vi = function(id) {
			hrService.cache(id);
		}
		$scope.loadMore = function() {
//			console.log(i);
			for(var j = 0; j < 10; j ++) {
				if(i + j === data.length) {
					break;
				}
				$scope.employees.push(data[i + j]);
			}
			i += j;
		}
		$scope.delete = function(id) {
			hrService.delete(id).then(function() {
				$state.reload();
			});
		}
	});
}]);

app.controller('newCtrl', ['$scope', 'hrService', function($scope, hrService) {
	hrService.getAll().then(function(recs) {
		$scope.rec = recs;
		var date = new Date();
		$scope.joinYear = date.getFullYear();
		$scope.joinMonth = date.getMonth();
		$scope.joinDate = date.getDate();
		$scope.test = function() {
		};
		$scope.save = function() {
			var emp = {};
			emp.fName = $scope.fName;
			emp.lName = $scope.lName;
			emp.postition = $scope.position;
			emp.gender = $scope.gender;
			emp.jTime = new Date($scope.joinYear.toString() + "," + $scope.joinMonth.toString() + "," + $scope.joinDate.toString());
			emp.salary = $scope.salary;
			if($scope.idx == -1) {
				emp.sup = "";
				emp.supfName = "";
				emp.suplName = "";
			} else {
				emp.sup = $scope.rec[$scope.idx]._id;
				emp.supfName = $scope.rec[$scope.idx].fName;
				emp.suplName = $scope.rec[$scope.idx].lName;
			}
			emp.phone = $scope.phone;
			emp.email = $scope.email;
			hrService.create(emp).then(function(msg) {
				hrService.cache(msg.data);
			});
		}
	});
}]);

app.controller('imgCtrl', ['$scope', 'hrService', 'Upload', '$location', function($scope, hrService, Upload, $location) {
	$scope.upload = function(file) {
		if(typeof file === 'undefined') {
			$location.path('home');
		} else {
			file.upload = Upload.upload({
				url: 'http://localhost:8888/image/' + hrService.getCache(),
				data: {file: file},
			});
			file.upload.then(function() {
				$location.path('home');
			});
		}
	}
}]);

app.controller('editCtrl', ['$scope', 'hrService', function($scope, hrService) {
	hrService.get(hrService.getCache()).then(function(res) {
		console.log(res);
		var emp = res.emp;
		$scope.fName = emp.fName;
		$scope.lName = emp.lName;
		$scope.position = emp.position;
		$scope.gender = emp.gender;
		var time = new Date(emp.jTime);
		$scope.joinYear = time.getFullYear();
		$scope.joinMonth = time.getMonth();
		$scope.joinDate = time.getDate();
		$scope.salary = emp.salary;
		$scope.avlbSups = res.avlbSups
		$scope.subs = res.subs;
		$scope.pic = emp.pic;
		$scope.phone = emp.phone;
		$scope.email = emp.email;
		$scope.save = function() {
			emp.fName = $scope.fName;
			emp.lName = $scope.lName;
			console.log("wkr");
			emp.postition = $scope.position;
			emp.gender = $scope.gender;
			emp.jTime = new Date($scope.joinYear.toString() + "," + $scope.joinMonth.toString() + "," + $scope.joinDate.toString());
			emp.salary = $scope.salary;
			if($scope.idx == -1) {
				emp.sup = res.cSup.id;
				emp.supfName = res.cSup.fName;
				emp.suplName = res.cSup.lName;
			} else {
				emp.sup = $scope.avlbSups[$scope.idx]._id;
				emp.supfName = $scope.avlbSups[$scope.idx].fName;
				emp.suplName = $scope.avlbSups[$scope.idx].lName;
			}
			console.log(emp.fName);
			emp.sub = 0;
			emp.phone = $scope.phone;
			console.log($scope.phone);
			emp.email = $scope.email;
			hrService.edit(emp);
		}
	});
}]);

app.controller('viCtrl', ['$scope', 'hrService', function($scope, hrService) {
	hrService.get(hrService.getCache()).then(function(res) {
		var emp = res.emp;
		$scope.fName = emp.fName;
		$scope.lName = emp.lName;
		$scope.position = emp.position;
		$scope.gender = emp.gender;
		var time = new Date(emp.jTime);
		$scope.joinYear = time.getFullYear();
		$scope.joinMonth = time.getMonth();
		$scope.joinDate = time.getDate();
		$scope.salary = emp.salary;
		$scope.supfName = res.cSup.fName;
		$scope.suplName = res.cSup.lName;
		$scope.subs = res.subs;
		$scope.pic = emp.pic;
		$scope.phone = emp.phone;
		$scope.email = emp.email;
	});
}]);

angular.module('services',[])
.factory('hrService', ['$http', function($http) {
	var cachedId;
	return {
		cache: function(id) {
			cachedId = id;
		},
		getCache: function() {
			return cachedId;
		},
		getAll: function() {
			return $http.get('/employees').then(function(res) {
				return res.data;
			});
		},
		create: function(emp) {
			return $http.put('/employees', emp);
		},
		get: function(id) {
			return $http.get('/employee/' + id).then(function(res) {
				return res.data;
			});
		},
		edit: function(emp) {
			return $http.post('/employee/' + emp._id, emp);
		},
		delete: function(id) {
			return $http.delete('/employee/' + id);
		}
	}
}]);


















