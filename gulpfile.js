var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var sourcesDep = [
    'bower_components/angular/angular.js',
    'bower_components/angular-translate/angular-translate.js',
    'bower_components/angularfire/dist/angularfire.js',
    'bower_components/bootstrap/dist/js/bootstrap.js',
    'bower_components/firebase/firebase.js',
    'bower_components/jquery/dist/jquery.js'
];

var sources = [
	'js/app.js',
	'users/users.js',
	'users/auth.js',
	'home/home.js',
	'calendar/api.js',
	'createShifts/createShifts.js',
	'profile/profile.js',
	'workingPreferences/workingPreferences.js',
	'changeShift/changeShift.js',
	'deleteShifts/deleteShift.js'
];

gulp.task('dep', function() {
  return gulp.src(sourcesDep)
    .pipe(concat('dep.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});

gulp.task('app', function() {
  return gulp.src(sources)
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: "/"
    }
  });
});

gulp.task('build', [], function(callback) {
  runSequence('dep', 'app', callback);
});

gulp.task('default', ['build'], function() {});