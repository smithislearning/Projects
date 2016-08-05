var app = angular.module('myApp', ['ui.router', 'services']);

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

app.filter('blog', function() {
	return function(blogs, target) {
		blogs = blogs || [];
		target = target ||'';
		var out = [];
		for(var i = 0; i < blogs.length; i ++) {
			if(blogs[i].title.includes(target)) {
				out.push(blogs[i]);
			} else if(blogs[i].cat === target) {
				out.push(blogs[i]);
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
			templateUrl: 'home.html'
		}).
		
		state('about', {
			url: '/about',
			templateUrl: 'about.html'
		}).
		state('about.lanzhou', {
			url: '/about/lanzhou',
			templateUrl: 'lanzhou.html'
		}).
		state('about.shanghai', {
			url: '/about/shanghai',
			templateUrl: 'shanghai.html'
		}).
		state('about.newyork', {
			url: '/about/newYork',
			templateUrl: 'newYork.html'
		}).
		state('about.sanjose', {
			url: '/about/sanJose',
			templateUrl: 'sanJose.html'
		}).
		
		state('contact', {
			url: '/contact',
			templateUrl: 'contact.html'
		}).
		
		state('projects', {
			url: '/projects',
			templateUrl: 'projects.html'
		}).
		state('projects.project_0', {
			url: '/project_0',
			templateUrl: 'project_0.html',
			controller: 'userCtrl'
		}).
		state('projects.project_0.New_User', {
			url: '/New_User',
			templateUrl: 'New_User.html',
			controller: 'newCtrl'
		}).
		state('projects.project_0.editUser', {
			url: '/Edit_User',
			templateUrl: 'Edit_User.html',
			controller: 'editCtrl'
		}).
		
		state('blog', {
			url: '/blog',
			templateUrl: 'blog.html',
			controller: 'blogCtrl'
		}).
		
		state('friend', {
			url: '/friend',
			templateUrl: 'friend.html'
		}).
		state('hr', {
			url: '/hr',
			templateUrl: 'hr.html'
		}).
		state('stranger', {
			url: '/stranger',
			templateUrl: 'stranger.html'
		}).
		state('education', {
			url: '/education',
			templateUrl: 'education.html'
		}).
		state('education.grad', {
			url: '/education/grad',
			templateUrl: 'grad.html'
		}).
		state('education.undergrad', {
			url: '/education/undergrad', 
			templateUrl: 'undergrad.html'
		}).
		state('education.highschool', {
			url: '/education/highschool',
			templateUrl: 'highschool.html'
		})
});

app.controller('HeaderController', ['$scope', '$location', function($scope, $location) {
	$scope.isActive = function(viewLocation) {
		return viewLocation === $location.path();
	}
}]);

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
		console.log($scope.chg);
		$scope.users = hrService.getAll();
		var npp = Number($scope.numPerPage);
		var begin = (($scope.currentPage - 1) * npp), end = begin + npp;
		$scope.filteredRst = $scope.users.slice(begin, end);
	});
	
	$scope.editUser = function(val) {
		hrService.cacheId(val - 1);
		//$scope.users = hrService.getAll();
		$scope.chg *= -1;
	}
	
	$scope.newUser = function() {
		//$scope.users = hrService.getAll();
		$scope.chg *= -1;
	}
	
	$scope.deleteUser = function(id) {
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

app.controller('blogCtrl', ['$scope', 'blogFilter', 'blogService', function($scope, blogFilter, blogService) {
	$scope.currentPage = 1;
	blogService.blogs().then(function(res) {
		$scope.blogs = res;
		
		$scope.pages = [];
		for(i = 0; i < Math.ceil($scope.blogs.length / 5); i ++) {
			$scope.pages[i] = i + 1;
		}
		var begin = ((Number($scope.currentPage) - 1) * 5), end = begin + 5;
		$scope.filteredBlogs = $scope.blogs.slice(begin, end);
	});
	$scope.search = function(val) {
		$scope.filteredBlogs = blogFilter($scope.blogs, val);
	}
	$scope.$watch('blogs', function() {
		for(var i = 0; i < $scope.blogs.length; i ++) {
			if(!$scope.cats.hasOwnProperty($scope.blogs[i].cat)) {
				$scope.cats[$scope.blogs[i].cat] = 1;
			} else {
				$scope.cats[$scope.blogs[i].cat] += 1;
			}
		}
	});	
	$scope.changePage = function(val) {
		$scope.currentPage = val;
	}
	$scope.$watch('currentPage + blogs', function() {

		var begin = ((Number($scope.currentPage) - 1) * 5), end = begin + 5;

		$scope.filteredBlogs = $scope.blogs.slice(begin, end);
	});
	
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
}).
factory('blogService', ['$http', function($http) {
	return {
		blogs: function() {
			return $http.get('/blogs').then(function(res) {

				return res.data;
			});
		}
	}
}]);


/**
app.controller('mainCtrl', function() {});
app.controller('infoCtrl', function() {});
app.controller('contactCtrl', function() {});
app.controller('projectsCtrl', function() {});
app.controller('blogCtrl', function() {});
app.controller('otherCtrl', function() {});
app.controller('friendCtrl', function() {});
app.controller('hrCtrl', function() {});
app.controller('strangerCtrl', function() {});
app.controller('eduCtrl', function() {});
**/
