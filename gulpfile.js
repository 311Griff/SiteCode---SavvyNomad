var gulp = require('gulp'),
 uglify = require('gulp-uglify'),
 reload = require('gulp-livereload'),
 concat = require('gulp-concat'),
 minifycss = require('gulp-minify-css'),
 autoprefixer = require('gulp-autoprefixer'),
 sourcemaps = require('gulp-sourcemaps'),//adds debugging tools 
 sass = require('gulp-sass'),
 babel = require('gulp-babel'),
 plumber = require('gulp-plumber'),//error checking
 del = require('del'),
 zip = require('gulp-zip');

//handlebars plugins
var handlebars = require('gulp-handlebars'),
    handlebarsLib = require('handlebars'),
    declare = require('gulp-declare'),
    wrap = require('gulp-wrap');

//image compression
var imagemin=require('gulp-imagemin');
var imageminPngQuant = require('imagemin-pngquant');
var imageminJpgRecompress = require('imagemin-jpeg-recompress');

//filepaths variables
var DIST_PATH = 'public/dist',
SCRIPTS_PATH = 'public/scripts/**/*.js',
CSS_PATH = 'public/css/**/*.css', //all css files in the css folder, or folders in the css folder
TEMPLATES_PATH = 'templates/**/*.hbs',
IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';

//Styles gulp task - see notes below
/*gulp.task('styles', function() { //names the task styles and sets it to a function in the file
    console.log('starting styles task');
    return gulp.src(['public/css/reset.css',CSS_PATH])
        .pipe (plumber( function(err){//handles errors, throws them to the console, keeps gulp alive
            console.log('styles task error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())//initialize the maps, these show the file and line the code belongs to in dev tools
        .pipe(autoprefixer({ //auto prefixes the styles
            browsers: ['last 2 versions']
        }))
        .pipe(concat('styles.css')) //concatenates the scss files into one css file called styles.css
        .pipe(minifycss()) //minifies the css file after concatenation
        .pipe(sourcemaps.write())//write the maps before writing to the file
        .pipe(gulp.dest(DIST_PATH)) //puts the file styles.css into the dist folder
        .pipe(reload()); //reloads the local page with refreshed changes
});*/

//sass files
gulp.task('styles', function() { //names the task styles and sets it to a function in the file
    console.log('starting styles task');
    return gulp.src('public/scss/styles.scss')
        .pipe (plumber( function(err){//handles errors, throws them to the console, keeps gulp alive
            console.log('styles task error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())//initialize the maps, these show the file and line the code belongs to in dev tools
        .pipe(autoprefixer({ //auto prefixes the styles
            browsers: ['last 2 versions']
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write())//write the maps before writing to the file
        .pipe(gulp.dest(DIST_PATH)) //puts the file styles.css into the dist folder
        .pipe(reload()); //reloads the local page with refreshed changes
});


//Scripts gulp task
gulp.task('scripts', function() {
    console.log('starting scripts task');

    return gulp.src(SCRIPTS_PATH)
        .pipe (plumber( function(err){//handles errors, throws them to the console, keeps gulp alive
            console.log('scripts task error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']//this is compiling es 6 code into older versions of javascript for the browser
        }))
        .pipe(uglify()) //minifies the js and makes it easier on processing memory
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH)) //puts the new js file into the dist foler
        .pipe(reload());//reloads the local browser with new changes
});

//Images gulp task
gulp.task('images', function() {
    return gulp.src(IMAGES_PATH)
        .pipe(imagemin(
            [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngQuant(),
                imageminJpgRecompress()
            ]

        ))
        .pipe(gulp.dest(DIST_PATH + '/images'));
});


//handlebars template task
gulp.task('templates', function(){
    return gulp.src(TEMPLATES_PATH)
        .pipe(handlebars({
            handlebars: handlebarsLib //compile as handlebars templates
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)')) //wrap code into templates
        .pipe(declare({
            namespace: 'templates',  //create a templates variable
            noRedeclare: true
        }))
        .pipe(concat('templates.js')) //concatenate the templates
        .pipe(gulp.dest(DIST_PATH)) //save the compiled code into the dist folder
        .pipe(reload());
});

//clean files and folders (uses del)
gulp.task('clean',function(){
   return del.sync([
      DIST_PATH,
       './website.zip'
   ]);
});

//default gulp task
gulp.task('default', ['clean','images', 'templates', 'styles', 'scripts'], function() {
    console.log('starting default task');

});

gulp.task('export',function(){
   return gulp.src('public/**/*')
       .pipe(zip('website.zip'))
       .pipe(gulp.dest('./'));
});

//watches for changes in the files referenced in the tasks and acts on them when changes occur and are saved

gulp.task('watch', ['default'], function() { //run default before running watch
    console.log('watch is started');
    require('./server.js'); //starts a local server
    reload.listen(); //listens for a reload to send to the page on the local server
    gulp.watch(SCRIPTS_PATH, ['scripts']); //watches the scripts file(s) for changes
    //gulp.watch(CSS_PATH, ['styles']); //watches the css file(s) for changes
    gulp.watch('public/scss/**/*.scss', ['styles']);
    gulp.watch(TEMPLATES_PATH, ['templates']);
});
