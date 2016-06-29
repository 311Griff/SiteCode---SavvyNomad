var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
 //minifycss = require('gulp-minify-css'),
 del = require('del');

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
        .pipe (plugins.plumber( function(err){//handles errors, throws them to the console, keeps gulp alive
            console.log('styles task error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(plugins.sourcemaps.init())//initialize the maps, these show the file and line the code belongs to in dev tools
        .pipe(plugins.autoprefixer({ //auto prefixes the styles
            browsers: ['last 2 versions']
        }))
        .pipe(plugins.sass({
            outputStyle: 'compressed'
        }))
        .pipe(plugins.sourcemaps.write())//write the maps before writing to the file
        .pipe(gulp.dest(DIST_PATH)) //puts the file styles.css into the dist folder
        .pipe(plugins.livereload()); //reloads the local page with refreshed changes
});


//Scripts gulp task
gulp.task('scripts', function() {
    console.log('starting scripts task');

    return gulp.src(SCRIPTS_PATH)
        .pipe (plugins.plumber( function(err){//handles errors, throws them to the console, keeps gulp alive
            console.log('scripts task error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.babel({
            presets: ['es2015']//this is compiling es 6 code into older versions of javascript for the browser
        }))
        .pipe(plugins.uglify()) //minifies the js and makes it easier on processing memory
        .pipe(plugins.concat('scripts.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH)) //puts the new js file into the dist foler
        .pipe(plugins.livereload());//reloads the local browser with new changes
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


//clean files and folders (uses del)
gulp.task('clean',function(){
   return del.sync([
      DIST_PATH,
       './website.zip'
   ]);
});

//default gulp task
gulp.task('default', ['clean','images', 'styles', 'scripts'], function() {
    console.log('starting default task');

});

gulp.task('export',function(){
   return gulp.src('public/**/*')
       .pipe(plugins.zip('website.zip'))
       .pipe(gulp.dest('./'));
});

//watches for changes in the files referenced in the tasks and acts on them when changes occur and are saved

gulp.task('watch', ['default'], function() { //run default before running watch
    require('./server.js'); //starts a local server
    plugins.reload.listen(); //listens for a reload to send to the page on the local server
    gulp.watch(SCRIPTS_PATH, ['scripts']); //watches the scripts file(s) for changes
    //gulp.watch(CSS_PATH, ['styles']); //watches the css file(s) for changes
    gulp.watch('public/scss/**/*.scss', ['styles']);
    gulp.watch(TEMPLATES_PATH, ['templates']);
});
