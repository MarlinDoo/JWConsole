'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var argv = require('yargs').argv;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('build/images'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (src)
gulp.task('copy', function () {
  return gulp.src(['src/*','!src/*.html'])
    .pipe(gulp.dest('build'))
    .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['src/fonts/**'])
    .pipe(gulp.dest('build/fonts'))
    .pipe($.size({title: 'fonts'}));
});


// Automatically Prefix CSS
gulp.task('styles:css', function () {
  return gulp.src('src/styles/**/*.css')
    .pipe($.changed('src/styles'))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('src/styles'))
    .pipe($.size({title: 'styles:css'}));
});

// Compile Sass For Style Guide Components (src/styles/components)
gulp.task('styles:components', function () {
  return gulp.src('src/styles/components/components.scss')
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10,
      loadPath: ['src/styles/components']
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('src/styles/components'))
    .pipe($.size({title: 'styles:components'}));
});

// Compile Any Other Sass Files You Added (src/styles)
gulp.task('styles:scss', function () {
  return gulp.src(['src/styles/**/*.scss', '!src/styles/components/components.scss'])
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10,
      loadPath: ['src/styles']
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size({title: 'styles:scss'}));
});

// Output Final CSS Styles
gulp.task('styles', ['styles:components', 'styles:scss', 'styles:css']);

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  return gulp.src('src/index.html')
    .pipe($.useref.assets({searchPath: '{.tmp,src,test}'}))
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    /*
    .pipe($.if('*.css', $.uncss({
      html: [
        'src/index.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: [
        '.navdrawer-container.open',
        /.src-bar.open/
      ]
    })))
*/
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe($.useref.restore())
    .pipe($.useref())
    // Update Production Style Guide Paths
    .pipe($.replace('components/components.css', 'components/main.min.css'))
    // Minify Any HTML
    .pipe($.if('index.html', $.minifyHtml()))
    // Output Files
    .pipe(gulp.dest('build'))
    .pipe($.size({title: 'html'}));
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;
    gulp.src(['src/*.html'])
        .pipe(wiredep({includeSelf:false}))
        .pipe(gulp.dest('src'));
    gulp.src('test/*.html')
        .pipe(wiredep({
          devDependencies:true,
          includeSelf:true
        }))
        .pipe(gulp.dest('test'));
});

//test with mocha+chai+sinon+phantomjs
gulp.task('test', function () {
  var mochaPhantomJS = require('gulp-mocha-phantomjs');
  return gulp
  .src('test/index.html')
  .pipe(mochaPhantomJS());
});

//test with mocha+chai+sinon+phantomjs
gulp.task('test:api', function () {
  // console.log( argv.m );return;
  var mocha = require('gulp-mocha')
    , module_path = argv && argv.m ? '/'+argv.m:'/**'
    , action_path = argv && argv.a ? '/'+argv.a:'/*';
  console.log(module_path);
  return gulp.src('test/api/'+module_path+action_path+'.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});


// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'build']));

// Watch Files For Changes & Reload
gulp.task('serve', function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'src', 'test'],
      routes:{
        "/bower_components":"bower_components",
        "/test":"test"
      }
    }
  });

  gulp.watch(['src/**/*.html'], reload);
  gulp.watch(['src/styles/**/*.scss'], ['styles:components', 'styles:scss']);
  gulp.watch(['{.tmp,src}/styles/**/*.css'], ['styles:css', reload]);
  gulp.watch(['src/scripts/**/*.js'], reload);
  gulp.watch(['src/images/**/*'], reload);
  gulp.watch(['test/**/*.js'], ['test']);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: 'build'
    }
  });
});

// Watch Files For Changes & Reload
gulp.task('serve:test', ['test'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['test', '.tmp', 'src' ],
      routes:{
        "/bower_components":"bower_components",
        "/src":"src"
      }
    }
  });

  gulp.watch(['test/**/*.js', 'test/**/*.html'], ['test', reload]);
});


// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', [ 'html',  'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'https://example.com',
  strategy: 'mobile'
}));

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
