var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('default', function() {
	return gulp.src("public/js/ideanote/references.ts")
		.pipe(ts({
			lib:["es6","dom"],
			noImplicitAny:false,
			noEmitOnError:true,
			removeComments: true,
			sourceMap:false,
			out:"ideanote.js",
			target:"es6"
		}))
		.pipe(gulp.dest("public/js"));
});