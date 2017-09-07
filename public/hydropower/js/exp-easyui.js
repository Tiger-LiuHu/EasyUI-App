/**
 * Created by 黄华桥 on 2017/6/28.
 */

/*
 * ========修改easyui日期控件的格式
 * 目前将easyui源码日期控件格式由斜杠替换成横线 (注: chenlilang)
 * */
if ($.fn.datebox){
	$.fn.datebox.defaults.currentText = '今天';
	$.fn.datebox.defaults.closeText = '关闭';
	$.fn.datebox.defaults.okText = '确定';
	$.fn.datebox.defaults.formatter = function(date){
		var y = date.getFullYear();
		var m = date.getMonth()+1;
		var d = date.getDate();
		return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
	};
	$.fn.datebox.defaults.parser = function(s){
		if (!s) return new Date();
		var ss = s.split('-');
		var y = parseInt(ss[0],10);
		var m = parseInt(ss[1],10);
		var d = parseInt(ss[2],10);
		if (!isNaN(y) && !isNaN(m) && !isNaN(d)){
			return new Date(y,m-1,d);
		} else {
			return new Date();
		}
	};
}
if ($.fn.datetimebox && $.fn.datebox){
	$.extend($.fn.datetimebox.defaults,{
		currentText: $.fn.datebox.defaults.currentText,
		closeText: $.fn.datebox.defaults.closeText,
		okText: $.fn.datebox.defaults.okText
	});
}
/*
 * tooltip问题
 */ 
/*$.map(['validatebox','textbox','passwordbox','filebox','searchbox',
		'combo','combobox','combogrid','combotree',
		'datebox','datetimebox','numberbox',
		'spinner','numberspinner','timespinner','datetimespinner'], function(plugin){
	if ($.fn[plugin]){
		$.fn[plugin].defaults.missingMessage = undefined;
	}
});
*/
/*
 * ========修改easyui组件默认值
 * */
$.fn.textbox.defaults.width = 150; //宽度
$.fn.textbox.defaults.height = 30; //高度
$.fn.combo.defaults.width = 150; //宽度
$.fn.combo.defaults.height = 30; //高度
$.fn.combobox.defaults.width = 150; //宽度
$.fn.combobox.defaults.height = 30; //高度
$.fn.combobox.defaults.panelHeight = 'auto';//下拉框 下拉框板最小高度
$.fn.combobox.defaults.panelMaxHeight = 150;//下拉框 下拉框板最大高度
$.fn.combobox.defaults.prompt = '-请选择-';//默认提示文字
$.fn.combotree.defaults.width = 150; //宽度
$.fn.combotree.defaults.height = 30; //高度
$.fn.combotree.defaults.panelHeight = 'auto';//下拉树 下拉树板最小高度
$.fn.combotree.defaults.panelMaxHeight = 150;//下拉树 下拉树板最大高度
$.fn.combotree.defaults.prompt = '-请选择-';//默认提示文字
$.fn.numberbox.defaults.width = 150; //宽度
$.fn.numberbox.defaults.height = 30; //高度
$.fn.datebox.defaults.width = 150; //宽度
$.fn.datebox.defaults.height = 30; //高度
$.fn.datebox.defaults.editable = false; //日期框不可编辑
$.fn.datetimebox.defaults.width = 150; //宽度
$.fn.datetimebox.defaults.height = 30; //高度
$.fn.datetimebox.defaults.editable = false; //日期框不可编辑
$.fn.numberbox.defaults.width = 150; //宽度
$.fn.numberspinner.defaults.width = 150; //宽度
$.fn.numberspinner.defaults.height = 30; //高度
$.fn.datagrid.defaults.method = 'GET'; //方法
$.fn.datagrid.defaults.pagination = true; //分页
$.fn.datagrid.defaults.fit = true; //是否撑满父元素
$.fn.datagrid.defaults.fitColumns = true; //自适应列
$.fn.datagrid.defaults.rownumbers = true; //行编号
$.fn.datagrid.defaults.idField = 'id'; //行编号
$.fn.datagrid.defaults.sortable = true; //可排序
$.fn.datagrid.defaults.headerCls = 'dg-header'; //表头class
$.fn.datagrid.defaults.height = 350; //表头class
$.fn.datagrid.defaults.onLoadSuccess = onLoadSuccess;//datagrid默认onLoadSuccess事件
$.fn.datagrid.defaults.pageList = $.fn.pagination.defaults.pageList = [20,30,50,100,300];//分页条数
$.fn.datagrid.defaults.links = $.fn.pagination.defaults.links = 5;//分页链接数
$.fn.pagination.defaults.layout = ['info','list','sep','first','prev','links','next','last','refresh','manual'];
$.fn.tree.defaults.lines = true; //树节点虚线
$.fn.tree.defaults.animate = true; //树节点展开动画
$.fn.layout.defaults.fit = true; //layout 的fit为true
$.fn.layout.defaults.expandMode = 'dock'; //layout 折叠效果
$.fn.panel.defaults.border = false; //panel去掉边框

/**
 #datagrid加载成功事件重写
 --------------------------------------------------------------------
 ##  datagrid.onLoadSuccess() 注册datagrid行提示效果
 (鼠标移动未显示完字段时会显示全部内容)
 */
function onLoadSuccess(result){
	var $datagrid = $(this),
		dgOPtions = $datagrid.datagrid('options'),
		checkAll = $('<div class="dg-checkAllDiv comm_float_left comm_pa_l"></div>'),
		selectedRow = $datagrid.datagrid('getSelected');

	// 清空缓存 (clearselections会触发一次onUnselectAll事件 注:chenlilang)
	//$datagrid.datagrid('clearSelections');

	/*datagrid重置大小*/
	$('.datagrid').find('.datagrid-view>table').datagrid('resize');

	if ($('.datagrid').length > 1) {//页面中只有一个表格的时候

	} else {
		if ($('.datagrid-btable').height() > $('.datagrid-body').height()) {
			/*datagrid滚动事件*/
			$datagrid.closest('.datagrid ').ScrollDocument();
		}
	}

	/*显示序号表头*/
	$('.datagrid-header-row div.datagrid-header-rownumber').text('序号');
	$datagrid.parent().next('.datagrid-pager.pagination').find('.dg-checkAllDiv').remove();
	$datagrid.parent().next('.datagrid-pager.pagination').prepend(checkAll);

	/*若datagrid的buttons(全局操作)属性存在，则动态添加全局按钮到title区域*/
	if (dgOPtions.buttons && dgOPtions.buttons.length > 0) {
		/*移除原有的按钮*/
		$datagrid.parent().parent().prev().find('.panel-title>a').remove();
		$datagrid.parent().next().find('.dg-checkAllDiv a').remove();
		$('.breadCrumb>div a').remove();

		/*调button渲染函数*/
		gridButtonsRender($datagrid,dgOPtions.buttons);
	}
	
	if (result && result.rows && result.rows.length > 0) {
		/*显示提示框*/
		$(this).datagrid('tooltip');
		
		/*默认选中第一条数据 (由于某些需要多选的业务模块会受影响)*/  
		//!selectedRow && $datagrid.datagrid('clearSelections').datagrid('clearChecked').datagrid('selectRow',0);
		//!selectedRow && $datagrid.datagrid('clearChecked').datagrid('selectRow',0);

	} else {
		/*提示加载失败信息*/
		result.errorMsg && showToastMsg(4000, {text: result.errorMsg, priority: 'danger'});
	}

	/*调用页面自定义的datagrid加载成功函数*/
	dgOPtions.onCustomLoadSuccess && dgOPtions.onCustomLoadSuccess(result);
}

/**
 * datagrid加载成功处理函数（片段）
 */
function gridButtonsRender( grid , buttons ) {
	var gridTitle = grid.datagrid('options').title,
		handleCell = grid.datagrid('getPanel').find('div.datagrid-body td[field = "handle"]'),
		inlineButtonNum = 0,
		dgRows = grid.datagrid('getRows');
	/*遍历传入的全局操作按钮追加到相应dom位置*/
	$.each( buttons,function( index , item ) {
		var golHandleContainer,
			gloElement,
			flagElement = '<div class="moreHandle">更多<i class="fa fa-angle-down comm_ma_l5"></i><ul class="menubutton"></ul></div>',
			className = 'easyui-linkbutton';
		item.isActive && (className += ' active');

		/*若当前对象的isGlobal存在，则在页面标题区域新增按钮，否则在datagrid标题处追加按钮*/
		if (item.isGlobal === 'top') {//页面右上角
			/*页面右上角按钮区域*/
			if ($('.breadCrumb>div').length > 0) {
				golHandleContainer = $('.breadCrumb>div');
				gloElement = $('<a href="javascript:void(0)" id="'+ item.id +'" class="easyui-linkbutton active">'+ item.text+'</a>');
			}
		} else if (item.isGlobal === '' || item.isGlobal === undefined) {//显示在datagrid标题右边
			/*datagrid标题右方按钮,如果title存在，则动态添加设置按钮到表头位置，否则添加到搜索区域*/
			if (gridTitle) {
				golHandleContainer = grid.closest('.datagrid-wrap').prev().find('.panel-title');
				gloElement = $('<a href="javascript:void(0)" id="'+ item.id +'" class="easyui-linkbutton active">'+ item.text+'</a>');
			} else {
				if (grid.closest('.panel-body').prev('.panel-header').length > 0) {//center区域存在title
					golHandleContainer = grid.closest('.panel-body').prev('.panel-header').find('.panel-title');
				} else {//center区域title和datagrid标题都不存在时
					golHandleContainer = $('.breadCrumb>div');

				}
			}
			gloElement = $('<a href="javascript:void(0)" id="'+ item.id +'" class="easyui-linkbutton active">'+ item.text+'</a>');
		} else if (item.isGlobal === 'inline') {//行内操作按钮（超过三个显示为下拉按钮）
			if (handleCell && handleCell.length > 0) {
				inlineButtonNum++;
				if (inlineButtonNum > 2) {
					/*行内操作按钮超过2个的自动处理成下拉按钮的显示方式*/
					$.each(handleCell,function(h,handle) {
						if (inlineButtonNum > 2) {
							var $liItem = $('<li class="' + item.id + '">' + item.text + '</li>');
							/*防止出现循环添加更多操作按钮*/
							if ($(handle).find('.datagrid-cell .moreHandle').length < 1) {
								/*为每一行操作td添加按钮元素*/
								$(handle).find('.datagrid-cell').append($(flagElement));
							}
							$(handle).find('.datagrid-cell ul').append($liItem);
							/*为每一个下拉按钮绑定点击事件*/
							$liItem.unbind('click').on('click', function(e){
								var index = $(this).closest('.datagrid-row').attr('datagrid-row-index');
								item.handle && item.handle(dgRows[index]);
							});
							/*点击更多按钮显示/因此下拉按钮*/
							$(handle).find('.moreHandle').unbind('click').on('click',function(e){
								var nodeName = e.target.nodeName;
								if ( nodeName === 'DIV' || nodeName === 'I' ) {
									/*menubutton隐藏显示切换*/
									if ($(this).find('.menubutton').is(":hidden")) {
										$('.datagrid-view td[field="handle"] .menubutton').hide();
										$(this).find('.menubutton').show();
									} else {
										$(this).find('.menubutton').hide();
									}
								}
							});
						}
					});
				} else {
					/*为每一个td操作项添加行内操作按钮*/
					handleCell.find('.datagrid-cell').append($('<a href="javascript:void(0)" class="'+ item.id +'">'+ item.text+'</a>'));
					$('.' + item.id).unbind('click').on('click',function(){
						var index = $(this).closest('.datagrid-row').attr('datagrid-row-index');
						item.handle && item.handle((grid.datagrid('getRows') || [])[index]);
					});
				}
			}
		} else if (item.isGlobal === 'bottom') {//显示在分页左侧
			/*批量操作按钮，分页左侧*/
			golHandleContainer = grid.parent().next().find('.dg-checkAllDiv');
			gloElement = $('<a href="javascript:void(0)" class="easyui-linkbutton" id="'+ item.id +'">'+ item.text+'</a>');
			/**
			 * 左正角按钮设置为菜单按钮
			 * author: chenlilang	
			 */
			if ( item.menubutton 
				 && item.menubutton instanceof Array 
				 && item.menubutton.length
			) {
				var mBtn = [
					'<a href="javascript:void(0)" id="mb_'+item.id+'" class="easyui-menubutton icon iconfont icon-gengduo"'
					+' data-options="menu:\'#mm_'+item.id+'\'">'+ item.text || item.menubutton[0].text +'</a>',
					'<div id="mm_'+item.id+'" style="width:80px;">'
				];
				$.each(item.menubutton, function( j, jItem ) {
					mBtn.push('<div id="'+ jItem.id +'">'+ jItem.text +'</div>');
				});
				mBtn.push('</div>');
				gloElement = $(mBtn.join(''));
			}
		}
		golHandleContainer && golHandleContainer.append(gloElement);
		if (item.tooltip) {
			$('#' + item.id).tooltip(item.tooltip);
		}
		if (item.handle) {
			$('#' + item.id).unbind('click').on('click',function(){
				var selections = grid.datagrid('getSelections');
				item.isGlobal === 'bottom' ? item.handle(selections) : item.handle($(this));
			});
		}
		if ( item.menubutton 
			 && item.menubutton instanceof Array 
			 && item.menubutton.length
		) {
			setTimeout(function() {		
				$.each(item.menubutton, function( j, jItem ) {
					$('#' + jItem.id).unbind('click').on('click',function(){
						var selections = grid.datagrid('getSelections');
						jItem.handle && jItem.handle(selections);
					});
				});
			}, 0);
		}
		$.parser.parse('.datagrid');
		$.parser.parse('.breadCrumb');
	});
	/*document点击隐藏menumubutton*/
	$(document).on('click',function(e){
		if (!$(e.target).hasClass('moreHandle') && !$(e.target).hasClass('menubutton') && e.target.nodeName !== 'LI') {
			$(this).find('.datagrid-view td[field="handle"] .menubutton').is(":visible") && $(this).find('.datagrid-view td[field="handle"] .menubutton').hide();
		}
		if ($(e.target).hasClass('fa-angle-down')) {
			if ($(e.target).next('.menubutton').is(":hidden")) {
				$('.datagrid-view td[field="handle"] .menubutton').hide();
				$(e.target).next('.menubutton').show();
			} else {
				$(e.target).next('.menubutton').hide();
			}
		}
	});
}

/**
 * 扩展easyui tree的搜索方法
 */
$.extend($.fn.tree.methods, {
	/**
	 * @param tree easyui tree的根DOM节点(UL节点)的jQuery对象
	 * @param searchText 检索的文本
	 * @param this-context easyui tree的tree对象
	 */
	search: function(jqTree, searchText) {
		/*easyui tree的tree对象。可以通过tree.methodName(jqTree)方式调用easyui tree的方法*/
		var tree = this,
		/*所有的树节点*/
			nodeList = getAllNodes(jqTree, tree),
		/*搜索匹配的节点并高亮显示*/
			matchedNodeList = [];

		/*获取所有的树节点*/
		if (!jqTree.data("allNodeList")) {
			var roots = tree.getRoots(jqTree),
				allNodeList = getChildNodeList(jqTree, tree, roots);
			jqTree.data("allNodeList", allNodeList);
			nodeList = allNodeList;
		}

		/*如果没有搜索条件，则展示所有树节点*/
		searchText = $.trim(searchText);

		if (searchText == "") {
			for (var i = 0; i < nodeList.length; i++) {
				$(".tree-node-targeted", nodeList[i].target).removeClass("tree-node-targeted");
				$(nodeList[i].target).show();
			}
			//展开已选择的节点（如果之前选择了）
			var selectedNode = tree.getSelected(jqTree);
			if (selectedNode) {
				tree.expandTo(jqTree, selectedNode.target);
			}
			return;
		}

		if (nodeList && nodeList.length > 0) {
			$.each(nodeList,function(index,value) {
				/*判断searchText是否与targetText匹配*/
				var flag = $.trim(value.text) != "" && value.text.indexOf(searchText) !== -1;
				if (flag) {
					matchedNodeList.push(value);
				}
				/*隐藏所有节点*/
				$(".tree-node-targeted", value.target).removeClass("tree-node-targeted");
				$(value.target).hide();
			});

			/*折叠所有节点*/
			tree.collapseAll(jqTree);
			/*展示所有匹配的节点以及父节点*/
			$.each(matchedNodeList,function(i,val) {
				/*展示所有父节点*/
				$(val.target).show();
				$(".tree-title", val.target).addClass("tree-node-targeted");
				while ((val == tree.getParent(jqTree, val.target))) {
					$(val.target).show();
				}
				/*展开到该节点*/
				tree.expandTo(jqTree, val.target);
				tree.showChildren(jqTree, val);
				//如果是非叶子节点，需折叠该节点的所有子节点
				if (!tree.isLeaf(jqTree, val.target)) {
					tree.collapse(jqTree, val.target);
				}
			});
		}
	},

	/*
	 * 展示节点的子节点（子节点有可能在搜索的过程中被隐藏了）
	 * @param node easyui tree节点
	 */
	showChildren: function(jqTree, node) {
		//easyui tree的tree对象。可以通过tree.methodName(jqTree)方式调用easyui tree的方法
		var tree = this;

		//展示子节点
		if (!tree.isLeaf(jqTree, node.target)) {
			var children = tree.getChildren(jqTree, node.target);
			if (children && children.length > 0) {
				for (var i = 0; i < children.length; i++) {
					if ($(children[i].target).is(":hidden")) {
						$(children[i].target).show();
					}
				}
			}
		}
	}
});

/**
 * validatebox扩展方法
 */
$.extend($.fn.validatebox.defaults.rules, {
	// 验证整数
	int: {
		validator: function(value) {
			return /^[0-9]*$/i.test(value);
		},
		message: '请输入整数'
	},
	intLength: {
		validator: function(value, param) {
			var reg = new RegExp("^\\d{" + param[0] + "}$");
			return reg.test(value);
		},
		message: '请输入{0}位正整数'
	},
	maxLength: {
		validator: function(value, param) {
			if (value.length > param) {
				return false;
			} else {
				return true;
			}
		},
		message: '长度不能超过{0}位'
	},
	minLength: {
		validator: function(value, param) {
			if (value.length < param) {
				return false;
			} else {
				return true;
			}
		},
		message: '长度不能低于{0}位'
	},
	//正数或者正小数的判断
	number: {
		validator: function(value,param) {
			var int = param[0] < 1 ? 1 : (param[0] -1),
				reg = new RegExp("^([1-9]{1}\\d{0," + int + "}|0)(\\.\\d{0," + param[1] + "})?$");
			return reg.test(value);
		},
		message: '格式不正确,整数位数不大于{0}位,小数位数不大于{1}位'
	},
	// 正数，param[0]是小数保留的位数
	positiveNumberVariable : {
		validator : function(value, param) {
			var reg = new RegExp('^(([1-9]\\d*)|0)(\\.\\d{1,' + param[0] + '})?$');
			return reg.test(value);
		},
		message : '格式不正确，最多保留{0}位小数'
	},
	money:{
		validator: function(value,param) {
			var reg = new RegExp("^[0-9]+(.[0-9]{1,2})?$");
			return reg.test(value);
		},
		message: '请输入大于等于0的数'
	},
	telNum: {
		validator: function(value) {
			return /(^(\d{3}-)?\d{8}$)|(^(\d{4}-)?\d{7}$)|(^1(3|4|5|7|8)\d{9}$)/.test(value);
		},
		message: '请输入正确的手机号码或座机号码'
	},
	identifyNum:{
		/*身份证号码验证*/
		validator: function(value) {
			return /(^\d{18}$)|(^\d{17}[xX]$)/.test(value);
		},
		message: '请输入18位身份证号码'
	},
	string: {
		validator: function(value) {
			return /^([\u4e00-\u9fa5]|[a-zA-Z])*$/.test(value);
		},
		message: '请输入汉字或英文'
	},
	positiveNumber: {//正数
		validator: function(value) {
			if(value < 0) {
				return false;
			}else{
				return true;
			}
		},
		message: '请输入大于0的数'
	},
	numBertow: {
		validator: function(value) {
			var reg = /^\d{1,8}(\.\d{1,2})?$/;
			return reg.test(value);
		},
		message: '请输入整数小于8位,小数点最大为2位的数'
	},
	positiveInteger : {//正整数
		validator : function(value) {
			var reg = /^[1-9]\d*$/;
			return reg.test(value);
		},
		message : '请输入大于0的整数'
	},
	greaterthanOne: {//大于1的树
		validator: function(value) {
			if(value < 1) {
				return false;
			}else{
				return true;
			}
		},
		message: '请输入大于1的数'
	},
	integerss: {
		validator: function(value) {
			var parnt = /^[0-9]\d*(\.\d+)?$/;
			if (parnt.exec(value)) {
				if(value > 0) {
					return true;
				}
			}
		},
		message: '请输入大于0的整数'
	},
	integers: {//0-1之间的小数
		validator: function(value) {
			if (value > 0 && value < 1) {
				return true;
			}
		},
		message: '请输入大于0并且小于1的数字'
	},
	startLength:{/*长度相等验证，开始验证输入框*/
		validator: function(value,param) {
			var $node = $("#"+param[1]),
				val = $node.textbox('getText');
			if (value){
				if (val) {
					// 设置开始标识和结束检查标识
					lengthId = (lengthId === "" && lengthId !== 'E') ? param[0] : "";
					// 是否需要检查结束时间
					if(lengthId === 'S') {
						$node.textbox('setValue', '').textbox('setValue', val);
					}
					return val.length === value.length;
				} else {
					return true;
				}
			}
		},
		message:'起始编号长度必须和结束编号长度相等'
	},
	endLength:{/*长度相等，结束验证输入框*/
		validator: function(value,param) {
			var $node = $("#"+param[1]),
				val = $node.textbox('getText');
			if (value){
				if (val) {
					// 设置开始标识和结束检查标识
					lengthId = (lengthId === "" && lengthId !== 'S') ? param[0] : "";
					// 是否需要检查结束时间
					if(lengthId === 'E') {
						$node.textbox('setValue', '').textbox('setValue', val);
					}
					return val.length === value.length;
				} else {
					return true;
				}
			}
		},
		message:'结束编号长度必须和起始编号长度相等'
	},
	startTime: {// 验证开始时间小于结束时间【用法：validType="startTime['S/E','cancelTime','提示信息','time']"，S/E：开始时间/结束时间标识(开始/结束),cancelTime:结束时间input的id,‘提示信息’：选填，默认为开始日期应小于结束日期，可传入自定义提示信息,'time':选填，是否为日期时间框，若不是则不传参】
		validator: function(value,param) {
			var $node = $("#"+param[1]),
				val = param[3] ? $node.datetimebox('getText') : $node.datebox('getText');
			if (value){
				if (param) {
					$.fn.validatebox.defaults.rules.startTime.message = (param[2] ? param[2] : "开始日期应小于结束日期");
				}
				if (val) {
					// 设置开始标识和结束检查标识
					contrastId = (contrastId === "" && contrastId !== 'E') ? param[0] : "";
					// 是否需要检查结束时间
					if(contrastId === 'S') {
						param[3] ? $node.datetimebox('setValue', '').datetimebox('setValue', val) : $node.datebox('setValue', '').datebox('setValue', val);
					}
					return (new Date(value).toJSON()) <= (new Date(val).toJSON());
				} else {
					return true;
				}
			}
		},
		message: ''
	},
	endTime: {// 验证结束时间小大于结束时间
		validator: function(value,param) {
			var $node = $("#"+param[1]),
				val = param[3] ? $node.datetimebox('getText') : $node.datebox('getText');
			if (value){
				if (param) {
					$.fn.validatebox.defaults.rules.endTime.message = (param[2] ? param[2] : "结束日期应大于开始日期");
				}
				if (val !== '') {
					// 设置开始标识和结束检查标识
					contrastId = (contrastId === "" && contrastId !== 'S' ? param[0] : "");
					// 是否需要检查开始时间
					if(contrastId === 'E') {
						param[3] ? $node.datetimebox('setValue', '').datetimebox('setValue', val) : $node.datebox('setValue', '').datebox('setValue', val);
					}
					return (new Date(value).toJSON()) >= (new Date(val).toJSON());
				} else {
					return true;
				}
			}
		},
		message: ''
	},
	startMonth: {// 验证开始月份小于结束月份
		validator: function(value,param) {
			var $node = $("#"+param[1]),
				val = $node.datebox('getText');
			if (value){
				if (param) {
					$.fn.validatebox.defaults.rules.startMonth.message = (param[2] ? param[2] : "开始月份应小于结束月份");
				}
				if (val !== '') {
					// 设置开始标识和结束检查标识
					contrastId = (contrastId === "" && contrastId !== 'E') ? param[0] : "";
					// 是否需要检查结束时间
					if(contrastId === 'S') {
						$node.datebox('setValue', '').datebox('setValue', val);
					}
					if (Number(value.substr(0,4)) === Number(val.substr(0,4))) {
						if (Number(value.substr(5,2)) >= Number(val.substr(5,2))) {
							return false;
						} else {
							return true;
						}
					} else if (Number(value.substr(0,4)) < Number(val.substr(0,4))) {
						return true;
					} else {
						return false;
					}
				} else {
					return true;
				}
			}
		},
		message: ''
	},
	endMonth: {// 验证开始月份小于结束月份
		validator: function(value,param) {
			var $node = $("#"+param[1]),
				val = $node.datebox('getText');
			if (value){
				if (param) {
					$.fn.validatebox.defaults.rules.endMonth.message = (param[2] ? param[2] : "结束月份应大于开始月份");
				}
				if (val !== '') {
					// 设置开始标识和结束检查标识
					contrastId = (contrastId === "" && contrastId !== 'S' ? param[0] : "");
					// 是否需要检查开始时间
					if(contrastId === 'E') {
						$node.datebox('setValue', '').datebox('setValue', val);
					}
					if (Number(value.substr(0,4)) === Number(val.substr(0,4))) {
						if (Number(value.substr(5,2)) <= Number(val.substr(5,2))) {
							return false;
						} else {
							return true;
						}
					} else if (Number(value.substr(0,4)) > Number(val.substr(0,4))) {
						return true;
					} else {
						return false;
					}
				} else {
					return true;
				}
			}
		},
		message: ''
	},
	positiveRangeNum : {//param[0,1]参数范围内的取值
		validator : function(value, param) {
			if (isNaN(value)) {
				return false;
			}
			var min = param[0],
				max = param[1];
			value = parseFloat(value);
			return value > min && value <= max;
		},
		message : '只能填写大于{0}并且小于等于{1}的数字'
	}
});

/**
 * form扩展方法
 */
$.extend($.fn.form.methods, {
	/**
	 * 重置表单数据：若表单默认有初始化数据，调用方法时传入form的id或class,
	 * 调用示例：$('.easyui-form').form('resetFormData',{beginYM: "2017-02", endYM: "2017-05"});
	 */
	resetFormData: function(jq, params){
		return jq.each(function(){
			var $form = $(this);
			$form.form('clear');
			// 主动调用，传递默认值
			if (params) {
				/*重新加载查询表单默认值*/
				$form.form('load',params);
				return;
			}

			// 通过form的data设置默认值
			var data = $form.data('data');
			if (data) {
				$form.form('load', data);
			}
		});
	}
});
