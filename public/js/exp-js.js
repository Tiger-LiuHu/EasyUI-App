/**
 #js扩展,不依赖任何第三方js插件
 --------------------------------------------------------------------
 */
(function(window,undefined){
	/**
	 #对象声明
	 --------------------------------------------------------------------
	 ##comm. 对外统一对象名
	 */
	var comm= {};
	window.comm=comm;
	
	/**
	 #新增方法
	 --------------------------------------------------------------------
	 ##comm.getCookie(c_name) 获取cookie值
	 */
	comm.getCookie = function(c_name){
		if (document.cookie.length>0){
			c_start=document.cookie.indexOf(c_name + "=");
			if (c_start!=-1){
				c_start=c_start + c_name.length+1;
				c_end=document.cookie.indexOf(";",c_start);
				if (c_end==-1) c_end=document.cookie.length;
				return unescape(document.cookie.substring(c_start,c_end));
			}
		}
		return "";
	},
	
	/**
	 ##comm.setCookie(c_name, value, expiredays) 设置cookie值,超时单位为天
	 */
		comm.setCookie = function(c_name, value, expiredays){
			var exdate=new Date();
			exdate.setDate(exdate.getDate() + expiredays);
			document.cookie=c_name+ "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+";path=/";
		}

	/**
	 ##comm.parseURL(u) url解析
	 *示例 parseURL('www.baidu.com?a=1&b=2')  parseURL().params
	 */
	comm.parseURL = function(u) {
		var url = u ? u : location.href;
		var a =  document.createElement('a');
		a.href = url;
		return {
			source: url,
			protocol: a.protocol.replace(':',''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function(){		
				var url = u ? u.split('?')[1] : location.search.substr(1, location.search.length);
				var parameters = {};
				var splitParameters = url.split("&");
				for (var i = 0, length = splitParameters.length; i <  length; i++) {
					var keyValue = splitParameters[i].split("=");
					parameters[keyValue[0]] = keyValue[1];
				}
				return parameters;
			})(),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
			hash: a.hash.replace('#',''),
			path: a.pathname.replace(/^([^\/])/,'/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
			segments: a.pathname.replace(/^\//,'').split('/')
		};
	}
	
	//禁用复制和右键
	//document.oncontextmenu=function(){return false;}; 
	document.onselectstart=function(){return false;};

})(window,undefined);


/**
 #认证拦截
 --------------------------------------------------------------------
 ##统一拦截X-Token和access_token
 ##(拦截url中X-Token和access_token,如存在值就写入cookie()中)
 */
//var xtoken = comm.parseURL().params['X-Token'];
//var accesstoken = comm.parseURL().params.access_token;
//xtoken && comm.setCookie('X-Token', xtoken);
//accesstoken && comm.setCookie('access_token', accesstoken);