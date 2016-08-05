var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/hr-db');
var hrSchema = mongoose.Schema({
	id: String,
	fName: String,
	lName: String,
	position: String,
	gender: String,
	jTime: Date,
	salary: Number,
	sup: String,
	sub: Array,
	pic: String
});

var employees = mongoose.model('employees', blogSchema);

blogs.count({}, function(err, count) {
	var emp = {id: "T01", fName: "Jone", lName: "Adams", position: "CTO", gender: "M", jTime: new Data(2015, 5, 15), salary: 3000000, sup: "", sub: [], pic: ""};
	var up = new employees(emp);
	up.save(function(err) {
		if(err) {
			console.log(err);
		}
	}).then(function() {
		process.exit();
	});
});



