/*
 * 模块化定义
 **/

// 第三方库基础路径
var libsBaseUrl = '../../../../../app/assets/js/libs/';
// 公共库基础路径
var pubBaseUrl = '../../../../../../public/';
// 取消加载模块对应的css， 统一由header.js加载全局样式
easyloader.css = false;

$.extend(easyloader.modules, {
	"eChart": {
		js: libsBaseUrl + 'echarts.min.js'
	},
	"expEasyUI": {
		js: pubBaseUrl + 'js/exp-easyui.js'
	},
	"expJQuery": {
		js: pubBaseUrl + 'js/exp-jquery.js'
	},
	"expJs": {
		js: pubBaseUrl + 'js/exp-js.js'
	}

});