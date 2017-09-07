var gulp = require('gulp'),

/*rev = require('gulp-rev-append'),
uglify = require('gulp-uglify'),
htmlmin = require('gulp-minify-html'),
cssmin = require('gulp-minify-css'),*/

clean = require('gulp-clean'),
fs = require('fs'),
map = require('map-stream'),
gulpJshint = require('gulp-jshint'),
cssLint = require('gulp-csslint'),
markdown = require('gulp-markdown'),
jshint = require('jshint'),
iconv = require('iconv-lite'),
//xlsx = require('node-xlsx'),
packageJson = require('./package'),
jsConfig = packageJson.jsConfig,
cssConfig = packageJson.cssConfig,
htmlConfig = packageJson.htmlConfig;

const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');

// 任务名：clean
gulp.task('clean', function() {
	return gulp.src('./gulp-QA/results/*.json', {
		read : false
	}).pipe(clean({
		force : true
	}));
});

//gulp.task('default', ['clean'], function() {
//	gulp.run('minifycss');
//	gulp.run('minHtml');
//});

//gulp.task('minifycss', ['copy-css'], function() {
//	return gulp.src(['.dist/css/**/*.css', '!./dist/css/main.css']).pipe(cssmin()).pipe(gulp.test('./dist/css'));
//});
//
//gulp.task('copy-css', ['copy-image'], function() {
//	return gulp.src('./css/**/*').pipe(gulp.dest('./dist/css/'));
//});
//
//gulp.task('copy-image', ['miniJS'], function() {
//	return gulp.src('./images/*').pipe(gulp.dest('./dist/images/'));
//});
//
//gulp.task('miniJS', ['copy-js'], function() {
//	return gulp.src('./dist/js/**/*.js').pipe(uglify()).pipe(gulp.dest('./dist/js/'));
//});
//
//gulp.task('copy-js', ['minHtml'], function() {
//	return gulp.src('./js/**/*').pipe(gulp.dest('./dist/js'));
//});

//gulp.task('minHtml', [], function() {
//	return gulp.src('./core/html/**/*.html').pipe(htmlmin()).pipe(gulp.dest('./dist/html'));
//});

//gulp.task('copy-templates', ['copy-main'], function() {
//	return gulp.src('./templates/**/*').pipe(gulp.dest('./dist/templates/'));
//});
//
//gulp.task('copy-main', ['rev-main'], function() {
//	return gulp.src(['./main.js', './UrlMapping.js']).pipe(gulp.dest('./dist/'));
//});
//
//gulp.task('rev-main', function() {
//	return gulp.src('./index.html').pipe(rev()).pipe(gulp.dest('./dist/'));
//});

// 检测报错编号
function contains(code) {
	/**
	 * W004		'xxx' is already defined
	 * W033		Missing semicolon
	 * W041		'xxx' '===' to compare with ???
	 * W098		'xxx' is defined but never used
	 * W116		Expected '{' and instead saw 'return'
	 * W117		'xxx' is not defined
	 * 
	 */
	var codes = [''];
	return codes.indexOf(code) != -1;
}

function writeFile(filePath, errors) {
	var jsonStr = JSON.stringify(errors);
	fs.writeFile(filePath, jsonStr, function(error) {
		msg = iconv.encode(jsonStr, 'utf-8');
		if(error) {
		} else {
		}
	});
}

// 自定义输出，每次读取一个文件
var errors = [];
var customerReporter = map(function(file, callback) {
	if (!file.jshint.success) {
		var arr = [],
		path = '';
		
		file.jshint.results.forEach(function(item) {
			if (item) {
				var error = item.error;
				
				path = item.file;
				
				arr.push({
					line : error.line,
					col : error.character,
					// 编号
					code : error.code,
					// 警告错误代码
					evidence : (error.evidence || '').replace('"', '\''),
					reason : (error.reason || '').replace('"', '\'')
				});
			}
		});
		
		// 单个文件
		errors.push({
			path : path,
			errors : arr
		});
		
		writeFile(jsConfig.dest, errors);
	}
});

// 校验js
gulp.task('checkjs',  function(callback) {
	errors = [];
	gulp.src(jsConfig.src)
	// 进行检查,jsConfig是自定义校验
	.pipe(gulpJshint(jsConfig))
	// 对代码进行报错提示
//	.pipe(gulpJshint.reporter('default'));
	// 对代码进行突出提示
//	.pipe(gulpJshint.reporter('jshint-stylish'));
	.pipe(customerReporter);
});

// 校验css
gulp.task('checkcss', function() {
	var output = '';
	gulp.src(cssConfig.src)
	.pipe(cssLint())
	.pipe(cssLint.formatter('json', {logger : function(str) {
		output += str;
	}}))
	.on('end', function(err) {
		if (err) {
		} else {
			var filePath = cssConfig.dest;
			fs.writeFile(filePath, output, function(error) {
				output = iconv.encode(output, 'utf-8');
				if(error) {
				} else {
				}
			});
		}
	});
});

// html生成器
gulp.task('mdHtml', ['clean'], function() {
	gulp.src(htmlConfig.src)
	.pipe(markdown())
	.pipe(gulp.dest(htmlConfig.dest));
});

//gulp.task('default', ['checkjs', 'checkcss', 'mdHtml']);
gulp.task('default', ['clean', 'checkjs', 'checkcss']);

//启动一个服务，以查看QA检测输出
gulp.task('serve', () => {
    browserSync.init({
      notify: false,
      port: 9090,
      server: {
        baseDir: ['.']
        //,index: 'gulp-QA/index.html'
      },
      //startPath: "gulp-QA/index.html"
      startPath: "index.html"
    });
});