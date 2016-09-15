var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');

var bootstrapDir = './node_modules/bootstrap-sass/assets';

gulp.task('sass', function() {
  return gulp.src('css/style.scss')
            .pipe(sass({
              includePaths: [
                './node_modules/mobi.css/src'
              ]
            }).on('error', sass.logError))
            .pipe(gulp.dest('./css/'))
            .pipe(livereload());
});

gulp.task('templates', function() {
  livereload.reload();
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('css/**/*.scss', ['sass']);
  gulp.watch('templates/**/*', ['templates']);
});

gulp.task('default', ['watch']);
