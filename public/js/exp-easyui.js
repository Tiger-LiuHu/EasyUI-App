/**
 * easyui扩展, 依赖jquery
 * 各个项目前端框架
 */
(function ($, undefined){
	/**
	 #对象声明
	 ##  $.up 有easyui存在的顶层对象
	 ##  (各iframe中弹窗推荐使用顶层对象打开)
	 ##  $.easyui 新增方法扩展在其下面
	 */
	//判断上层构架是否有easyui存在，有则启用
	try{$.up = window.top.$.easyui.forEach(1,2,3); $.up = window.top;}catch(e){console.error('top未找到,使用parent!'+location.href,e);
		try{$.up = window.parent.$.easyui.forEach(1,2,3); $.up = window.parent;}catch(e){console.error('parent未找到,使用window!'+location.href,e); $.up = window;}
	}
	//内部使用
	$.easyui._frm = {};
	//停止使用,保留为兼容老版本
	$.easyui.$ = $.up.$;

	/**
	 * 修改easyui日期控件的格式
	 * 偶发性现象：easy默认格式是斜杠，而自定义formatter并没起到作用
	 * 针对以上问题，目前将easyui源码日期控件格式由斜杠替换成横线 (注: chenlilang)
	 */
	$.fn.datebox.defaults.formatter = function( date ) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		m = m.length == 1 ? '0' + m : m;
		d = d.length == 1 ? '0' + d : d;
		return y + '-' + m + '-' + d;
	}
	
	$.fn.datagrid.defaults.pageSize = $.fn.pagination.defaults.pageSize = 20;//每页行数
	$.fn.datagrid.defaults.emptyMsg = '<div class="datagrid_hint"><i class="fa fa-exclamation-triangle comm_ma_r5"></i>没有找到符合条件的记录，请更改查询条件</div>';
	$.fn.datagrid.defaults.displayMsg = $.fn.pagination.defaults.displayMsg = '显示 {from} 到 {to},共 {total} 条记录';
	$.fn.datagrid.defaults.beforePageText = $.fn.pagination.defaults.beforePageText = '跳转到第';
	$.fn.datagrid.defaults.afterPageText = $.fn.pagination.defaults.afterPageText = '页';
	/*datagrid的表头右键选择显示列表字段 (针对Bug[1747]提出的问题暂时取消)*/
	/*$.fn.datagrid.defaults.onHeaderContextMenu = createGridHeaderContextMenu;
	  $.fn.treegrid.defaults.onHeaderContextMenu = createGridHeaderContextMenu;*/

	/**
	 * 页面加载完成后，统一处理事务	
	 */
	$(document).ready(function() {
		//解决tooltip初始显示后并不自动隐藏 (连同easyui原框架2850行解决)
		setTimeout( function() {
			$('.tooltip').remove();
		}, 2000 );
	});

	$.fn.validatebox.defaults.missingMessage = "该输入项为必输项.";

	/**
	 #方法重写
	 --------------------------------------------------------------------
	 ##  datagrid.loadFilter() 自动处理标准数据格式
	 (easyui对后台返回的数据，分页：{rows:[{},{}], total:2}，不分页{rows:[{},{}]}, 可以自动解析，如果是其他形式，则需要过滤)
	 */
	$.fn.datagrid.defaults.loadFilter = function(result){
		if(result.data === null){
			if (result.meta && result.meta.code === 0 ) {
				return {rows:[], total:0,errorMsg:result.meta.message};
			} else {
				return {rows:[], total:0};
			}
		} else if (result.data) {
			result.data.page && (result.data.total = result.data.page.totalRows);
			(result.data.rows === null) && (result.data.rows = []);
			return result.data;
		} else {
			return result;
		}
	};

	/**
	 * 扩展 datagrid/treegrid 增加表头菜单，用于显示或隐藏列，注意：冻结列不在此菜单中
	 * @param e
	 * @param field
	 */
	function createGridHeaderContextMenu(e, field) {
		e.preventDefault();
		var grid = $(this);/* grid本身 */
		var headerContextMenu = this.headerContextMenu;/* grid上的列头菜单对象 */
		if (!headerContextMenu) {
			var tmenu = $('<div style="width:100px;"></div>').appendTo('body');
			var asc = $('<div iconCls="icon-standard-hmenu-asc" field="_asc">升序</div>').appendTo(tmenu);
			var desc = $('<div iconCls="icon-standard-hmenu-desc" field="_desc">降序</div>').appendTo(tmenu);

			var spdiv = $('<div></div>');
			var fields = grid.datagrid('getColumnFields'),
				showFields = [];//showFields 保存初始化时不是隐藏的字段
			//构建 显示全部列 和 还原默认
			$('<div iconCls="tree-checkbox1" id="_all" field="_all"/>').html('显示全部列').appendTo(spdiv);
			//$('<div iconCls="icon-standard-application-view-columns" id="_reset" field="_reset"/>').html('还原默认').appendTo(spdiv);
			$('<div class="menu-sep"></div>').appendTo(spdiv);

			//构建 显示/隐藏列
			for ( var i = 0; i < fields.length; i++) {
				var fildOption = grid.datagrid('getColumnOption', fields[i]);
				if (!fildOption.hidden && fildOption.field != '_ck' && fildOption.field != 'handle') {
					showFields.push(fields[i]);
					$('<div iconCls="tree-checkbox1" field="' + fields[i] + '"/>').html(fildOption.title).appendTo(spdiv);
				} else {//不渲染隐藏列
					//$('<div iconCls="tree-checkbox0" field="' + fields[i] + '"/>').html(fildOption.title).appendTo(spdiv);
				}
			}
			var filedHTML = $('<div iconCls="icon-standard-application-view-columns"><span>显示/隐藏列</span></div>');
			spdiv.appendTo(filedHTML);
			filedHTML.appendTo(tmenu);

			headerContextMenu = this.headerContextMenu = tmenu.menu({
				onClick : function(item) {
					var f = $(this).attr('field');//当前在表格上右击的字段
					var fieldProperty = $(item.target).attr('field');
					if(fieldProperty == '_asc'){
						var options = grid.datagrid('options');
						options.sortName = f;
						options.sortOrder ='asc';
						grid.datagrid('reload');
					} else if(fieldProperty == '_desc'){
						var options = grid.datagrid('options');
						options.sortName = f;
						options.sortOrder ='desc';
						grid.datagrid('reload');
					} else if(fieldProperty == '_all'){
						$.each(showFields, function (i, t) {
							i < 11 ? grid.datagrid("showColumn", t) : grid.datagrid("hideColumn", t);
						});
						//$(this).nextAll('div.menu').find('div.menu-item:not(:eq(1))').each(function (i, t) {//启用 还原默认 时，用这句
						$(this).nextAll('div.menu').find('div.menu-item').each(function (i, t) {
							i < 12 ? tmenu.menu("setIcon", { target: this, iconCls: "tree-checkbox1" }) : tmenu.menu("setIcon", { target: this, iconCls: "tree-checkbox0" });
							tmenu.menu("enableItem", this);
						});
					} else {
						if (item.iconCls == 'tree-checkbox1') {
							grid.datagrid('hideColumn', fieldProperty);
							$(this).menu('setIcon', {
								target : item.target,
								iconCls : 'tree-checkbox0'
							});
						}
						if (item.iconCls == 'tree-checkbox0') {
							grid.datagrid('showColumn', fieldProperty);
							$(this).menu('setIcon', {
								target : item.target,
								iconCls : 'tree-checkbox1'
							});
						}

						//渲染 显示全部列 前面的图标
						var count = 0;
						$.each(showFields, function(i, t){
							var fildOption = grid.datagrid('getColumnOption', showFields[i]);
							if (!fildOption.hidden && fildOption.field != '_ck') {
								count++;
							}
						});
						$(this).menu("setIcon", {
							target: $(item.target).parent().children("div.menu-item:first"),
							iconCls: count >= showFields.length ? "tree-checkbox1" : (count == 0 ? "tree-checkbox0" : "tree-checkbox2")
						});
					}
				}
			});
		}
		headerContextMenu.attr('field',field);
		headerContextMenu.menu('show', {
			left : e.pageX,
			top : e.pageY
		});
	}

	/**
	 ##  parser.onComplete() 加载后移除id/class:'_loading'遮罩
	 (解决渲染时页面格式乱问题,需页面中有遮罩层)
	 */
	$.parser.onComplete = function(){
		$('._loading').remove();
		$("#_loading").remove();
	};
	/**
	 * 是否禁用页面document的scroll功能
	 * @param disable
	 */
	var parse = $.parser.parse;
	$.parser.parse = function(context, disable) {
		parse(context);
		/*if (disable === false) {
			$.fn.ScrollDocument();
		}*/
	};

	/**
	 ##	panel.onBeforeDestroy() 防止iframe内存溢出
	 */
	$.fn.panel.defaults.onBeforeDestroy = beforeDestroyIframe;

	/**
	 ##	tree类.loadFilter() 扁平化树允许直接解析普通列表数据
	 (需要配置valueField,textField,parentField自动转成树型结构)
	 */
	$.fn.tree.defaults.loadFilter = buildTree;
	$.fn.combotree.defaults.loadFilter = buildTree;
	/**
	 * Description: 重写combotree的onSelect回调函数，解决选中树节点后，该节点内容过长不能显示完全的问题
	 * Usage: 如果需要自定义onSelect回调函数，请使用onCustomSelect属性, 否则将使该功能失效
	 * By: Chen Lilang
	 */
	$.fn.combotree.defaults.onSelect = function ( node ) {
		var curNode = $(this).find('.tree-node-selected');
		var width = 0, initWidth = curNode.width();
		$.each( curNode.find('span'), function(i, item) {
			width += $(item).outerWidth();
		} );
		if ( width && width > initWidth ) {
			curNode.css( {width: width} );
		}

		if(this.onCustomSelect) this.onCustomSelect(node);
	};

	/**
	 #新增方法
	 --------------------------------------------------------------------
	 ##  ＄.easyui.openWindow(obj) 在顶层打开window面板
	 *在顶层打开window面板
	 *属性参见easyui window 属性
	 *新增iframe属性，是否使用框架
	 *以id属性可以标识为打开单个窗口，还是打开多个窗口
	 */
		//注册弹窗打口方法(默认iframe打开)
	$.easyui.openWindow = function( obj ) {
		if ( !obj.href ) {
			console.error('错误提示: ', '未配置窗口页面地址!');
			return;
		}
		obj = $.extend({
			title: '',
			modal: true,
			collapsible: false,
			minimizable: false,
			maximizable: true,
			resizable: true,
			iframe: true,
			onOpen: onOpen
		}, obj);

		function onOpen() {
		   if ( obj.escKey ) {
			   var scope = this; 
	           $(document).bind('keydown', function( e ) {
	           	    if ( e.which == 27 ) {
	                	$('#' + obj.id).window('close');
	           	    }
	           })
		   }	
		}

		/*统一去掉弹出框的icon*/
		obj.iconCls = '';

		//顶层窗口如果存在就直接使用，不存在就初始化一个
		this._frm[obj.id] = this._frm[obj.id] || function(){
				var d = document.createElement('div');
				document.body.appendChild(d);
				d.style.width = document.body.offsetWidth * 0.9 + "px";
				d.style.height = document.body.offsetHeight * 0.9 + "px";
				return d;
			}.call(this);
		//是否使用框架 ( obj.escKey = true 则支持Esc按键退出窗口 )
		if(obj.iframe){
			var idx = obj.href.indexOf('?');
			var ch = idx == -1 ? '?' : '&';
			obj.href = obj.escKey ? ( obj.href + ch + 'pwinId=' + obj.id ) : obj.href;
			this._frm[obj.id].style.overflow = "hidden";
			this._frm[obj.id].innerHTML = '<iframe src="'+obj.href+'"name="'+ obj.id + '"  scrolling="no" frameborder="0" style="width:100%;height:100%;"></iframe>';
			delete(obj.href);
		}
		//初始化窗口
		obj.width = document.body.offsetWidth * 0.9;
		obj.height = document.body.offsetHeight * 0.9;
		return  this._frm[obj.id].relatedeasyui = $(this._frm[obj.id]).window(obj);

	};

	/**
	 ##  ＄.easyui.closeWindow(ids) 关闭顶层窗体
	 *注册弹窗关闭方法(根据ids关闭)
	 */
	$.easyui.closeWindow = function (ids){
		if(ids instanceof Array){
			// 通过顶层窗口打开子窗口
			for(var i = 0;i<ids.length;i++) try{ $.easyui._frm[ids].relatedeasyui.window('close'); }catch(e){console.error('关闭错误',e);}
		}else{
			//try{ parent.$(parent.$.easyui._frm[ids]).window('close'); }catch(e){console.error('关闭错误',e);};
			try{ $.easyui._frm[ids].relatedeasyui.window('close'); }catch(e){console.error('关闭错误',e);}
			//parent.$.easyui._frm[ids]&&$.easyui.$(this._frm[ids]).window('close');
		}
		return this;
	};

	/**
	 ##  ＄.easyui.wait() 等待正在处理效果
	 */
	$.easyui.wait = function (){
		$.up.$.easyui._waitFlag=$.up.$.easyui._waitFlag||(function(){
				var a = $("<div class='window-mask'></div>").css({zIndex:10000,display:"block",width:"100%",height:"100%",textAlign:"center"}).appendTo($.up.document.body);
				$("<div class='datagrid-mask-msg'></div>").html("正在处理，请稍候。。。").appendTo(a).css({fontSize:"12px",display:"block",left:($.up.document.body.offsetWidth - 190) / 2,top:($.up.document.body.offsetHeight - 45) / 2});
				return a;
			})();
		$.up.$.easyui._waitFlag.show();
	};

	/**
	 ##  ＄.easyui.waitOff() 关闭等待正在处理效果
	 */
	$.easyui.waitOff = function(){
		$.up.$.easyui._waitFlag && $.up.$.easyui._waitFlag.remove();
	};


	/**
	 #扩展方法
	 --------------------------------------------------------------------
	 ##tabs扩展事件
	 */
	$.extend($.fn.tabs.methods,{
		/**
		 ###   allTabs() 获取所有tabs
		 */
		allTabs:function(jq){//获取所有tabs
			var tabs = $(jq).tabs('tabs');
			var all = [];
			all = $.map(tabs,function(n,i){
				return $(n).panel('options')
			});
			return all;
		},
		/**
		 ###   closeCurrent() 关闭当前
		 */
		closeCurrent: function(jq){ // 关闭当前
			var currentTab = $(jq).tabs('getSelected'), currentTabIndex = $(jq).tabs('getTabIndex',currentTab);
			(currentTabIndex != 0) && $(jq).tabs('close',currentTabIndex);
		},
		/**
		 ###   closeAll() 关闭全部[首页除外]
		 */
		closeAll:function(jq){ //关闭全部[首页除外]
			var tabs = $(jq).tabs('allTabs');
			$.each(tabs,function(i,n){
				(n.index != 0) && $(jq).tabs('close', n.title);
			})
		},
		/**
		 ###   closeOther() 关闭除当前标签页外的tab页
		 */
		closeOther:function(jq){ //关闭除当前标签页外的tab页
			var tabs =$(jq).tabs('allTabs');
			var currentTab = $(jq).tabs('getSelected'),
				currentTabIndex = $(jq).tabs('getTabIndex',currentTab);
			$.each(tabs,function(i,n){
				if(currentTabIndex != i) {
					(n.index != 0) && $(jq).tabs('close', n.title);
				}
			})
		},
		/**
		 ###   closeLeft() 关闭当前页左侧tab页
		 */
		closeLeft:function(jq){ // 关闭当前页左侧tab页
			var tabs = $(jq).tabs('allTabs');
			var currentTab = $(jq).tabs('getSelected'),
				currentTabIndex = $(jq).tabs('getTabIndex',currentTab);
			var i = currentTabIndex-1;

			while(i > 0){
				$(jq).tabs('close', tabs[i].title);
				i--;
			}
		},
		/**
		 ###   closeRight() 关闭当前页右侧tab页
		 */
		closeRight: function(jq){ //// 关闭当前页右侧tab页
			var tabs = $(jq).tabs('allTabs');
			var currentTab = $(jq).tabs('getSelected'),
				currentTabIndex = $(jq).tabs('getTabIndex',currentTab);
			var i = currentTabIndex+ 1,len = tabs.length;
			while(i < len){
				$(jq).tabs('close', tabs[i].title);
				i++;
			}
		}
	});

	/**
	 ##datagrid扩展事件
	 */
	$.extend($.fn.datagrid.methods, {
		/**
		 ### tooltip() datagrid行提示效果
		 * Datagrid扩展方法tooltip
		 * $("#dg").datagrid({....}).datagrid('tooltip'); 所有列
		 * $("#dg").datagrid({....}).datagrid('tooltip',['productid','listprice'], false); 指定列,所有的都显示提示
		 */
		tooltip : function (jq, fields, onlyShowInterrupt) {
			//是否只有在文字被截断时才显示tip，默认值为true，即截断才显示tip。
			onlyShowInterrupt = onlyShowInterrupt ? onlyShowInterrupt : true;
			return jq.each(function () {//var panel = $(this).datagrid('getPanel');
				if (fields && typeof fields == 'object' && fields.sort) {
					$.each(fields, function () {//var field = this;
						bindEvent($('.datagrid-body td[field=' + this + '] .datagrid-cell'), onlyShowInterrupt);
					});
				} else {
					bindEvent($(".datagrid-body .datagrid-cell"), onlyShowInterrupt);
				}
			});

			function bindEvent(jqs, onlyShowInterrupt) {
				jqs.mouseover(function () {
					if((!!onlyShowInterrupt && ($(this).context.scrollWidth > $(this).context.offsetWidth)) || !onlyShowInterrupt ){
						$(this).tooltip({
							content : '<span style="color:#666">'+ $(this).text()+'</span>',
							trackMouse : true,
							onHide : function () {
								$(this).tooltip('destroy');
							},
							onShow: function(){
								$(this).tooltip('tip').css({ backgroundColor: '#E9F2FF', borderColor: '#99bce8'});
							}
						}).tooltip('show');
					}
				});
			}
		},

		/**
		 * Description: 扩展一个datagrid方法，命名为scrollToLoading
		 *              其作用是支持表格滚动条请求加载数据。
		 * @params:     null
		 * @return: 	null	
		 * Usage:       在列表被渲染后，执行$("#dg").datagrid("scrollToLoading")即可
		 * By:          Chen Lilang
		 */
		scrollToLoading: function ( jq ) {
			return jq.each(function() {
				var options = $(this).datagrid('options');
				var tparams = options.queryParams;
				if ( !tparams || !tparams.page || !tparams.rows) { 
					console.error('error', 'scrollToLoading扩展方法需要指定分页参数 - {page: pageSize, rows: rowNumber}');
					return;
				}
				var target = $(this);
				var tbody = target.datagrid('getPanel').find('div.datagrid-body');
				tbody = $(tbody[1]);

				var opts = {}, page = 1, rows = 50;
				opts.page = tparams.page || page;
				rows = tparams.rows || rows;

				$(tbody).scroll(function() {
					var tchild = $(tbody).find('table.datagrid-btable');
					tchild = $(tchild[0]);
					if ( tbody.scrollTop() > 0
					  && tbody.scrollTop() > tchild.height() - tbody.height() - 30 
					) {
						page += 1;
						//opts.page = page;
						opts.rows = rows * page;
						//target.datagrid('options').queryParams = opts;
						target.datagrid({
							queryParams: opts,
							onLoadSuccess: function() {
								target.datagrid('scrollTo', opts.row - 2);
							}
						});
						target.datagrid('scrollToLoading');
					}
				});

			});
		}

	});


	/**
	 #__内部方法
	 #(用于重写组件/事件方法的内部函数)
	 --------------------------------------------------------------------
	 ##beforeDestroyIframe() panel关闭时回收内存
	 * @requires jQuery,EasyUI
	 * 主要用于layout使用iframe嵌入网页时的内存泄漏问题
	 */
	function beforeDestroyIframe() {
		var frame = $('iframe', this);
		try{
			if (frame.length > 0) {
				for ( var i = 0; i < frame.length; i++) {
					frame[i].contentWindow.document.write('');
					frame[i].contentWindow.close();
				}
				frame.remove();
				if (typeof (CollectGarbage) == 'function' ){
					setTimeout("CollectGarbage()", 1 );
				}
			}
		}catch(e){}
	}

	/**
	 ##buildTree(data) 扁平化加载树
	 * 树形构建 实现扁平化加载树
	 * @param data
	 * @returns
	 */
	function buildTree(data) {
		//解决数据源不是标准的rows格式：$.fn.datagrid.defaults.loadFilter = function(result){return result.data ? result.data : result};
		data = $.fn.datagrid.defaults.loadFilter(data);
		var opt = $(this).data().tree.options;
		if ( !opt.valueField || !opt.textField ) {
			console.warn('警告: ', '树的配置未指定valueField和textField属性的值, 有可能会出现数据渲染问题，比如: 节点值为undefined.');
		}
		//定义id text pid
		var valueField, textField, parentField;
		valueField = opt.valueField || 'id';
		textField = opt.textField || 'text';
		parentField = opt.parentField || 'pid';

		var i, l, treeData = [], tmpMap = [];
		for ( i = 0; i < data.length; i++ ) {
			data[i]['text'] = data[i][textField];
			data[i]['id'] = data[i][valueField];
		}

		return data;

	/*	--------------------------------------------------------- 
	    如果业务上需要将扁平结构数据转成节点树，以下方法需要优化，
	    tmpMap数组这种方法太耗内存，不可取。（注：chenlilang）
	    ---------------------------------------------------------	
	//遍历所有数据，在tmpMap数组中放入以id值为key, 对应对象为val的map数据。
		for (i = 0, l = data.length; i < l; i++) {
			tmpMap[data[i][valueField]] = data[i];
		}

		for (i = 0, l = data.length; i < l; i++) {
			//如果以id为key的map中的val中的pid存在，且 id 不和pid 一样
			if (tmpMap[data[i][parentField]] && data[i][valueField] != data[i][parentField]) {
				//如果map中，有pid,但是该数据没有children，则将其变为[]
				if (!tmpMap[data[i][parentField]]['children'])
					tmpMap[data[i][parentField]]['children'] = [];
				//构建easyui 的text
				data[i]['text'] = data[i][textField];
				data[i]['id'] = data[i][valueField];
				tmpMap[data[i][parentField]]['children'].push(data[i]);
			} else {//没有pid则存入当前值到树json中
				data[i]['text'] = data[i][textField];
				data[i]['id'] = data[i][valueField];
				treeData.push(data[i]);
			}
		}
		return treeData; */
	};

	function setWidth($ul) {
		var maxWidth = 0;
		$ul.find('.tree-node').each(function(index, div) {
			var $div = $(div),
			$spans = $div.find('span'),
			width = 0;
			$spans.each(function(index, span) {
				width += $(span).width();
			});
			if (maxWidth < width) {
				maxWidth = width;
			}
		});
		
		if (maxWidth > $.fn.combotree.defaults.width) {
			$ul.css({
				width : maxWidth + 4
			});
		}
	}
	
	// 设置combotree长度
	$(document.body).on('click', '.textbox-addon-right', function() {
		var $this = $(this),
		$input = $this.closest('.textbox.combo').prev('input'),
		combotree = false;
		try {
			// 如果没抛异常，证明是combotree
			$input.combotree('options');
			combotree = true;
		} catch (e) {}
		
		if (combotree) {
			$('.panel.combo-p.panel-htop').each(function(index, div) {
				var $div = $(div);
				if ($div.css('display') != 'none') {
					var $ul = $div.find('ul:first');
					setWidth($ul);
				}
			});
		}
	});
	
	// -----------------------------------设置tree长度----------------------------------
	/**
	 * 树最开加载时，走onLoadSuccess方法，这时候只能设置最外层那个.tree-node
	 * 等tree展开的时候，需要调用onBeforeExpand方法，因为tree没有展开的时候.tree-title是隐藏的，没有长度
	 */
	var _treeBeforeExpand = $.fn.tree.defaults.onBeforeExpand;
	$.fn.tree.defaults.onBeforeExpand = function(node, data) {
		var $tree = $(this);
		_treeBeforeExpand.call($tree, node, data);
		setTimeout(function() {
			setWidth($tree);
		}, 100);
	};
	
	var _treeLoadSuccess = $.fn.tree.defaults.onLoadSuccess;
	$.fn.tree.defaults.onLoadSuccess = function(node, data) {
		var $tree = $(this);
		_treeLoadSuccess.call($tree, node, data);
		setWidth($tree);
	};
	// -----------------------------------设置tree长度----------------------------------

	/**
	 * combobox blur事件，如果text和label不能对应，清空text
	 */
	$(document.body).on('blur', '.easyui-combobox + .textbox input', function() {
		var $input = $(this),
			text = $.trim($input.val());
		if (text) {
			var $span = $input.closest('span'),
				$combobox = $span.prev('.easyui-combobox'),
				arr = $combobox.data('combobox').data || [],
				options = $combobox.combobox('options'),
				flag = false,
				textField = options.textField,
				valueField = options.valueField;
			for (var i = 0, length = arr.length; i < length; i++) {
				var item = arr[i];
				// 对比text
				if (item[textField] === text) {
					flag = true;
					break;
				}
			}
			if (!flag) {
				setTimeout(function() {
					$combobox.combobox('clear');
				});
			}
		}
	});

	/**
	 * combotree blur事件，如果value和text不能对应，赋值为下拉数据的第一项
	 */
	$(document.body).on('blur', '.easyui-combotree + .textbox input', function() {
		var $input = $(this),
			value = $.trim($input.val());
		if (value) {
			var $span = $input.closest('span'),
				$combotree = $span.prev('.easyui-combotree'),
				datas = $combotree.data('combotree').options.data || [],
				options = $combotree.combotree('options'),
				textField = options.textField || 'orgName',
				valueField = options.valueField || 'id';
			
			/*若输入的内容对应没有找到值，默认赋值为第一项*/
			if (!matchItem(datas)) {
				datas.length > 0 && $combotree.combotree('setValue',datas[0].id);
			}
			/*递归匹配输入内容是否匹配下拉树中的值*/
			function matchItem(arr){
				if (arr && arr.length > 0) {
					for (var l = 0, len = arr.length; l < len; l++) {
						var item = arr[l];
						// 对比text
						if (item[textField] && item[textField] === value) {
							return true;
						}
						if (item.children && item.children.length > 0) {
							(findItem || $.noop)(item.children);
						}
					}
				}
			}
		}
	});
	
})(jQuery, undefined);