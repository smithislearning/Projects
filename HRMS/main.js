var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var multer = require('multer');

var mongoose = require('mongoose');
//var formidable = require('formidable');
var fs = require('fs-extra');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/hr-db');
var hrSchema = mongoose.Schema({
	fName: String,
	lName: String,
	position: String,
	gender: String,
	jTime: Date,
	salary: Number,
	sup: String,
	supfName: String,
	suplName: String,
	sub: Number,
	pic: String,
	phone: String,
	email: String
});

var employees = mongoose.model('employees', hrSchema);
var app = express();

var router = express.Router();

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");//"http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/www')));
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(index.html);
});

router.route('/employees').
get(function(req, res) {
	employees.find().then(function(employees) {
		res.send(employees);
	});
}).
put(function(req, res) {
	var emp = new employees(req.body);
	emp.pic = "default";
	emp.sub = 0;
	emp.sup = req.body.sup || "";
	emp.supfName = req.body.supfName || "";
	emp.suplName = req.body.suplName || "";
	emp.save().then(function(rec) {
		if(emp.sup != "") {
			employees.findOne({'_id':emp.sup}).select('-_id -__v').then(function(respond) {
				var tmp = respond;
				tmp.sub += 1;
				employees.findOneAndUpdate({'_id':emp.sup}, tmp).then(function() {
					res.send(rec._id);
				});
			});
		}
		res.send(rec._id);
	});
});

router.route('/employee/:id').
get(function(req, res) {
	employees.findOne({'_id':req.params.id}).then(function(employee) {
		employees.find({'sup':req.params.id}).then(function(subs) {
			employees.find({}, '_id pic fName lName').where("_id").nin(employee._id).then(function(emps) {
				res.send({'emp': employee, 'cSup': {'id': employee.sup, 'fName':employee.supfName, 'lName':employee.suplName}, 'avlbSups': emps, 'subs': subs});
			});
		});
	});
}).
post(function(req, res) {
	employees.findOne({'_id':req.params.id}).then(function(emp) {
		if(emp.sup !== req.body.sup) {
			employees.update({'sup':emp._id, 'supfName':emp.fName, 'suplName':emp.lName}, {'sup':emp.sup, 'supfName':emp.supfName, 'suplName':emp.suplName}, {multi:true}).then(function() {
				if(typeof emp.sup !== 'undefined' && emp.sup !== "" && emp.sup !== null) {
					employees.findOne({'_id':emp.sup}).select('-_id -__v').then(function(supEmpl) {
						supEmpl.sub -= 1;
						if(supEmpl.sub < 0) {
							supEmpl.sub = 0;
						}
						supEmpl.sub += emp.sub;
						employees.findOneAndUpdate({'_id':emp.sup}, supEmpl).then(function() {
							employees.findOneAndUpdate({'_id':req.params.id}, req.body).then(function() {
								if(req.body.sup !== "") {
									employees.findOne({'_id':req.body.sup}).select('-_id -__v').then(function(supEmp) {
										supEmp.sub += 1;
										employees.findOneAndUpdate({'_id':req.body.sup}, supEmp).then(function() {
											res.end();
										});
									});
								} else {
									res.end();
								}
							});
						});
					});
				} else {
					employees.findOneAndUpdate({'_id':req.params.id}, req.body).then(function() {
						if(req.body.sup !== "") {
							employees.findOne({'_id':req.body.sup}).select('-_id -__v').then(function(supEmp) {
								supEmp.sub += 1;
								employees.findOneAndUpdate({'_id':req.body.sup}, supEmp).then(function() {
									res.end();
								});
							});
						}
					});
				}
			});
		} else {
			employees.findOneAndUpdate({'_id':req.params.id}, req.body).then(function() {
				res.end();
			});
		}
	});
}).
delete(function(req, res) {
	employees.findOne({'_id':req.params.id}).then(function(emp) {
		employees.update({'sup':req.params.id, 'supfName':emp.fName, 'suplName':emp.lName}, {'sup':emp.sup, 'supfName':emp.supfName, 'suplName':emp.suplName}, {multi:true}).then(function() {
			if(typeof emp.sup !== 'undefined' && emp.sup !== "" && emp.sup !== null) {
				employees.findOne({'_id':emp.sup}).select('-_id -__v').then(function(supEmp) {
					supEmp.sub -= 1;
					supEmp.sub += emp.sub;
					employees.findOneAndUpdate({'_id':emp.sup}, supEmp).then(function() {
						if(emp.pic !== '') {
							fs.remove(__dirname + "/public/assets/img/" + emp.pic);
						}

						employees.findOneAndRemove({'_id':req.params.id}).then(function() {
							res.end();
						});
					});
				});
			} else {

				if(emp.pic !== '' && emp.pic !== 'default') {
					fs.remove(__dirname + "/public/assets/img/" + emp.pic);
				}
				employees.findOneAndRemove({'_id':req.params.id}).then(function() {
					res.end();
				});
			}
		});
	});
});

router.route('/image/:id').
post(function(req, res) {
	var pname = req.params.id;
	var path2pic = __dirname + '/public/assets/img/' + req.params.id;
	fs.remove(path2pic);
	var storage = multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, __dirname + '/public/assets/img/');
		},
		filename: function(req, file, cb) {
			cb(null, pname);
		}
	});
	var upload = multer({storage: storage}).single('file');
	upload(req, res, function(){
		employees.findOne({'_id': pname}).select('-_id -__v').then(function(emp) {
			if(emp.pic === 'default') {
				emp.pic = pname;
				employees.findOneAndUpdate({'_id': pname}, emp).then(function() {
//					console.log("???");
//					res.send("<a ui-sref='home'>Go to list</a>");
//					res.sendFile(__dirname + '/public/index.html');
					res.end();
				});
			} else {
//				console.log("???");
//				res.send("<a ui-sref='home'>Go to list</a>");
//				res.sendFile(__dirname + '/public/index.html');
				res.end();
			};
		});
	});
});

app.use(router);
app.listen(8888, function(req, res) {
	console.log('Server listening at port 8888 for blog service');
});
