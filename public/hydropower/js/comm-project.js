/**
 * Created by 黄华桥 on 2017/5/25.
 * 新版UI调整相关公共操作
 */
var commmObj = {
		refreshButton: '',
		globalTooltip: $('<div class="comm_search_tooltip"><span class="frendlyWarn">在datagrid表格表头位置单机鼠标右键可自定义显示或隐藏列</span><span class="otherWarn"></span><span class="closeTooltip">×</span></div>')
	},
	contrastId = '',/*设置开始时间校验标识和结束时间校验检查标识*/
	lengthId = '';
$(function(){
	var westPanel,
		$datagrid;
	/*为页面动态追加刷新按钮*/
	if ($('.breadCrumb>div').length > 0) {
		commmObj.refreshButton = '<span class="fa fa-undorefresh"></span>';
	} else {
		commmObj.refreshButton = '<div><span class="fa fa-undo refresh"></span></div>';
	}
	$('.breadCrumb').append(commmObj.refreshButton);

	/*为带*号的表单元素添加必填属性*/
	addRequired($('.easyui-form'));

	/*解析easyui组件*/
	$.parser.parse();
	westPanel = $('.easyui-layout').layout('panel','west');
	$datagrid = $('.datagrid');

	/*若提示框不存在，则动态添加提示框 (由于datagrid已经取消列头右键功能，所以暂时取消该tip)*/
/*	if ($('.comm_search_tooltip').length <1) {
		commmObj.globalTooltip.insertAfter('.breadCrumb');
	}*/

	/*关闭搜索框tooltip*/
	$('.closeTooltip').on('click',function(){
		/*移除提示框*/
		$(this).parent().hide();
		$('div.easyui-layout').layout('resize');
	});

	/*高级搜索展开按钮点击事件-----------start*/
	$('.expand-advance,.collapse-advance').on('click',function(){
		$('.easyui-form').toggleClass('advanceSearchItem');
		$(this).hide();
		/*高级搜索按钮点击*/
		if ( $(this).hasClass('expand-advance') ) {
			$('.collapse-advance').show();
		} else {
			$('.expand-advance').show();
		}
		$('div.easyui-layout').layout('resize');
	});
	/*高级搜索收缩按钮点击事件------------end*/

	/*刷新按钮点击事件------------start*/
	$('.refresh').on('click',function(){
		window.location.reload();
	});
	/*刷新按钮点击事件------------end*/

	/*窗口改变大小时重新布局-------------start*/
	$(window).on('resize',function(){
		$('.easyui-layout').layout('resize');
	});
	westPanel.panel({
		onCollapse: function($datagrid){
			$('iframe')[0].contentWindow.$('table.datagrid-f').datagrid('resize');
		},
		onExpand: function(){
			/*if ($('.easyui-layout').find('.datagrid').length > 0) {//页面不存在iframe的情况
				$('.datagrid').find('.datagrid-view>table').datagrid('resize');
			} else {//center区域存在iframe的情况
				var $grids = $('.easyui-layout').find('iframe').contents().find(".datagrid");
				if ($grids.length > 0) {//每一个datagrid都重新计算大小
					$.parser.parse();
					$.each($grids,function(i,grid){

						//$(grid).find('.datagrid-view>table').datagrid().datagrid('resize');
					});
				}
			}*/
			setTimeout(function() {
				$('iframe')[0].contentWindow.$('table.datagrid-f').datagrid('resize');
			}, 600);
		}
	});
	/*窗口改变大小时重新布局-------------end*/

	/*west区域收缩时layout重新布局*/
	$('.easyui-layout').layout({
		onCollapse: function(region){
			/*layout大小重置*/
			$('.easyui-layout').layout('resize');
		}
	});

	bindEscToParentWindow();
});

/**
 * 在每个页面加载时, 判断是否存在父窗口id (pwinId), 是则绑定Esc按键事件
 * author: chenlilang
 */
function bindEscToParentWindow() {
	if ( !window.parent ) return;
	var args = comm.parseURL().params;
	// 如果查询到有父窗口id
	if ( args.pwinId ) {
		var pwin = window.parent.window.$('#' + args.pwinId); 
		$(document).bind('keydown', function( e ) {
			if ( e.which == 27 ) {
				pwin.window('close');
			}
		})
	}
}

/**
 * 搜索、高级搜索按钮点击操作函数
 * @param opt -> obj  {dgSelector:'datagrid选择器',formSelector:'form选择器',url:'datagrid初始化url不存在时传入'}
 *
 */
function searchDatagrid(opt){
	var $dg = $(opt.dgSelector),
		$form = $(opt.formSelector),
		queryParams,
		dgOptions = $dg.datagrid('options');
	if ($form.form('validate')) {
		queryParams = $dg.datagrid('options').queryParams = {};
		$form.serializeObject(queryParams);
		if (!dgOptions.url) {
			if (!opt.url) {
				showToastMsg(3000,{text:'datagrid表格的url不存在!',priority:'danger'});
				return;
			} else {
				dgOptions.url = _cfg.api + opt.url;
				/*表格数据刷新*/
				$dg.datagrid('load');
			}
		} else {
			/*表格数据刷新*/
			$dg.datagrid('load');
		}
	}
}

/**
 *  显示toast提示消息
 * 第一个参数毫秒，可不填，默认3000毫秒
 * 第二个参数Object		{
 * 						priority : priority || 'success',
 * 						text : priority == 'success' ? sText || '数据添加成功' : sText || '服务器异常'
 * 					}
 * 第三个参数function	回调  eg:showToastMsg(4000, {text : opt.errorMsg,priority : 'danger'},function(){});
 * 说明	当第一个参数没填的时候，可以直接写showToastMsg(Object, [function])，因为是用arguments取参数，所以不用担心参数获取失败
 */
function showToastMsg() {
	var DEFAULT_TIME = 3000,
		nExistTime = DEFAULT_TIME,
		opt = {
			priority : 'success'
		},
		callback = $.noop;

	for(var i = 0, length = arguments.length; i < length; i++) {
		var argument = arguments[i],
			type = typeof argument;
		if(type === 'number') {
			nExistTime = argument;
			if (nExistTime < DEFAULT_TIME) {
				// 最少DEFAULT_TIME
				nExistTime = DEFAULT_TIME;
			}
		} else if (type === 'object') {
			opt = $.extend(opt, argument);
		} else if (type === 'function') {
			callback = argument;
		}
	}
	var sText = opt.text,
		priority = opt.priority,
		sClassName = 'comm_toast_' + priority,
		//这里取消遮罩，体验不好，恢复增加class=comm_toast_body
		html = '<div class="" style="position: fixed; top: 40%; left: 50%; width: 350px; margin-left: -175px; text-align: left; z-index: 9999;">'+
			'<div class="' + sClassName + '">' + (priority == 'success' ? sText || '数据添加成功' : sText || '服务器异常') + '</div>'+
			'</div>',
		$msgBlock = $(html);

	$(document.body).append($msgBlock);

	setTimeout(function() {
		$msgBlock.fadeOut(nExistTime - DEFAULT_TIME, function() {
			callback && callback();
			$msgBlock.remove();
		});
	}, DEFAULT_TIME);
}

/**
 * 禁用easyui所有form表单元素
 * @param formId 表单id
 * @param isDisabled 是否为只读
 * 用法：disableForm('formUser',true);
 */
function disableForm(formId,isDisabled) {
	$("#" + formId + " .easyui-textbox").textbox({disabled:isDisabled});
	$("#" + formId + " .easyui-combobox").combobox({disabled:isDisabled});
	$("#" + formId + " .easyui-combotree").combotree({disabled:isDisabled});
	$("#" + formId + " .easyui-datebox").datebox({disabled:isDisabled});
	$("#" + formId + " .easyui-datetimebox").datetimebox({disabled:isDisabled});
}

/*
 * 为带*号的label的下一个表单元素加上required为true属性
 * @param $forms 表单jq对象
 * 用法：addRequired($('#formUser'));  位置放在$.parser.parse()之前
 */
function addRequired($forms) {
	$forms.each(function(i, form) {
		var $labels = $(form).find('label');
		$labels.each(function(index, label) {
			var $label = $labels.eq(index);
			// 找i标签下面是否有*
			if ($.trim($label.find('i').html()).indexOf('*') > 0) {
				$label.nextAll('input').attr('required', true);
			}
		});
	});
}

/**
 #下拉树事件重写事件重写
 --------------------------------------------------------------------
 ##  combotree.onShowPanel() 下拉第一项文本不存在时取消图标背景
 */
$.fn.combotree.defaults.onShowPanel = function(){
	/*去掉下拉树没有文本节点的图标*/
	var treeNode = $('.tree-title');
	if (treeNode.length > 0) {
		$.each(treeNode,function(index,value) {
			if (!$(value).text()) {
				$(value).prev().css('background','none');
			}
		});
	}
};

/**
 * 验证日期框不能大于当前日期
 * @selecter 日期框选择器
 * @isTime 该变量存在时则为日期时间框
 * 使用示例：validCurrentDate('#startTime');(日期框)/validCurrentDate('#startTime'，'xxx')（日期时间框）;
 */
function validCurrentDate(selecter,isTime) {
	var currentDate = new Date(),
		selecterValue;
	/*如果isTime存在，则为日期时间框*/
	if (isTime) {
		selecterValue = $(selecter).datetimebox('getValue');
		/*日期时间不能大于当前日期时间*/
		$(selecter).datetimebox({
			onSelect: function(d){
				var date = new Date(d).getTime(),
					value = currentDate.toJSON().replace('T',' ').substr(0,19),
					hours = currentDate.getHours() < 10 ? ('0'+currentDate.getHours()) : currentDate.getHours(),
					minutes = currentDate.getMinutes() < 10 ? ('0'+currentDate.getMinutes()) : currentDate.getMinutes(),
					seconds = currentDate.getSeconds() < 10 ? ('0'+currentDate.getSeconds()) : currentDate.getSeconds();
				if (date > currentDate.getTime()) {
					showToastMsg(3000, {text: '所选时间不能晚于当前时间！', priority: 'danger'});
					$(this).datetimebox('showPanel').datetimebox('setValue',value.substr(0,10)+' '+hours+':'+minutes+':'+seconds);
					/*$(this).datetimebox().datetimebox('calendar').calendar({
					 validator: function(date){
					 var now = new Date(formatterDate(new Date(), 'date')),
					 d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					 return d1 >= d;
					 }
					 });*/
				}
			}
		}).datetimebox('setValue',selecterValue);
	} else {
		/*日期不能大于当前日期*/
		selecterValue = $(selecter).datebox('getValue');
		$(selecter).datebox({
			onSelect: function(d){
				var date = new Date(d).getTime();
				if (date > currentDate.getTime()) {
					showToastMsg(3000, {text: '所选日期不能晚于今天！', priority: 'danger'});
					$(this).datebox('showPanel').datebox('setValue',currentDate.toJSON().substr(0,10));
					/*$(this).datebox().datebox('calendar').calendar({
					 validator: function(date){
					 var now = new Date(formatterDate(new Date())),
					 d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					 return d1 >= date;
					 }
					 });*/
				}
			}
		}).datebox('setValue',selecterValue);
	}
}

/**
 * 验证时间或日期是否大于当前时间
 * @param selecter
 * @param isTime
 */
function isAfterDate(obj) {
	var selector = obj.selector,
	isTime = obj.isTime,
	selecterValue,
	$selector = $(selector);
	
	/*如果isTime存在，则为日期时间框*/
	if (isTime) {
		selecterValue = $(selecter).datetimebox('getValue');
		/*日期时间不能小于当前日期时间*/
		$selector.datetimebox({
			onSelect: function(d){
				var date = new Date(d).getTime(),
				currentDate = new Date(),
				value = currentDate.toJSON().replace('T',' ').substr(0,19),
				hours = currentDate.getHours() < 10 ? ('0'+currentDate.getHours()) : currentDate.getHours(),
				minutes = currentDate.getMinutes() < 10 ? ('0'+currentDate.getMinutes()) : currentDate.getMinutes(),
				seconds = currentDate.getSeconds() < 10 ? ('0'+currentDate.getSeconds()) : currentDate.getSeconds();
				if (date <= currentDate.getTime()) {
					showToastMsg(3000, {text: '所选时间必须大于当前时间！', priority: 'danger'});
					$selector.datetimebox('clear');
				}
			}
		}).datetimebox('setValue',selecterValue);
	} else {
		/*日期不能小于当前日期*/
		selecterValue = $(selector).datebox('getValue');
		$selector.datebox({
			onSelect: function(d){
				var date = new Date(d).getTime(),
				currentDate = new Date();
				if (date <= currentDate.getTime()) {
					showToastMsg(3000, {text: '所选日期必须大于今天！', priority: 'danger'});
					$selector.datebox('clear');
				}
			}
		}).datebox('setValue',selecterValue);
	}
}

/**
 * 默认时间格式处理函数
 * @date 默认时间格式
 * @d 是否显示时分秒，为true显示格式为年月日，否则为年月日+时分秒
 */
function formatterDate(date, d) {
	var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate(),
		month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1),
		year = date.getFullYear(),
		hor = date.getHours(),
		min = date.getMinutes(),
		sec = date.getSeconds();
		hor = (hor <=9 ? ('0'+hor) : hor);
		min = (min <=9 ? ('0'+min) : min);
		sec = (sec <=9 ? ('0'+sec) : sec);
	return [year, month, day].join('-') + (!d && ' ' + [hor, min, sec].join(':') || '');
}

/*
 *修改easyui日期框，只显示年月
 * 用法：给元素添加class为 dataMonth和easyui-datebox
 * */
if (document.getElementsByClassName("dataMonth")) {
	var dataMonths=$(".dataMonth");
	$.each(dataMonths,function(index,value){
		$(value).datebox({
			onChange: function(n,o){
				var currentDate = new Date(),
					year = currentDate.getFullYear(),
					month = currentDate.getMonth() + 1;
				if(n){
					if (Number(n.substr(0,4)) > year){
						showToastMsg(3000, {text: '所选月份不能超过当前月份！', priority: 'danger'});
						$(value).datebox('setValue',o);
					} else if (Number(n.substr(0,4)) === year) {
						if (Number(n.substr(5,2)) > month){
							showToastMsg(3000, {text: '所选月份不能超过当前月份！', priority: 'danger'});
							$(value).datebox('setValue',o);
						}
					}
				}
			},
			onShowPanel: function() { //显示日趋选择对象后再触发弹出月份层的事件，初始化时没有生成月份层
				span.trigger('click'); //触发click事件弹出月份层
				if (!tds) setTimeout(function() { //延时触发获取月份对象，因为上面的事件触发和对象生成有时间间隔
					tds = p.find('div.calendar-menu-month-inner td');
					tds.click(function(e) {
						e.stopPropagation(); //禁止冒泡执行easyui给月份绑定的事件
						var year = /\d{4}/.exec(span.html())[0],
							month = parseInt($(this).attr('abbr'), 10); //月份，这里不需要+1
						month = (month <9) ? ('0'+month) : month;
						$(value).datebox('hidePanel') //隐藏日期对象
							.datebox('setValue', year + '-' + month); //设置日期的值
					});
				}, 0);
				yearIpt.unbind(); //解绑年份输入框中任何事件
			},
			parser: function(s) {
				if (!s) return new Date();
				var arr = s.split('-');
				return new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, 1);
			},
			formatter: function(d) {
				var month = (d.getMonth() <9) ? ('0'+ (d.getMonth()+1)) : (d.getMonth() + 1);
				return d.getFullYear() + '-' + month; /*getMonth返回的是0开始的，忘记了。。已修正*/
			}
		});
		var p = $(value).datebox('panel'), //日期选择对象
			tds = false, //日期选择对象中月份
			aToday = p.find('a.datebox-current'),
			yearIpt = p.find('input.calendar-menu-year'), //年份输入框
		//显示月份层的触发控件
			span = aToday.length ? p.find('div.calendar-title span') : //1.3.x版本
				p.find('span.calendar-text'); //1.4.x版本
		if (aToday.length) { //1.3.x版本，取消Today按钮的click事件，重新绑定新事件设置日期框为今天，防止弹出日期选择面板
			aToday.unbind('click').click(function() {
				var now = new Date(),
					month = (now.getMonth() <9) ? ('0'+ (now.getMonth()+1)) : (now.getMonth() + 1);
				$(value).datebox('hidePanel').datebox('setValue', now.getFullYear() + '-' + month);
			});
		}
	});
}
//递归处理树形结构
function $recursionTreeData(item,cb,ctx){
    if(!ctx){
        ctx=this;
    }
    if(!cb){
        cb=function(){}
    }
    if(item instanceof Array){
        for(var i= 0,len=item.length;i<len;i++){
            var it = item[i];
            cb.call(ctx,it);
            if(it.children && it.children.length>0){
                $recursionTreeData(it.children,cb,ctx);
            }
        }
    }else{
        cb.call(ctx,item);
        if(item.children && item.children.length>0){
            $recursionTreeData(item.children,cb,ctx);
        }
    }
}
//过滤树形结构
function $filterTreeData(items,cb){
    var _items=[];
    var that = this;
    if(items instanceof Array){
        for(var i= 0,_len=items.length;i <_len;i++){
            var item = items[i];
            cb.call(that,item) && _items.push(item);

            if(item.children && item.children.length>0){
                item.children = $filterTreeData(item.children, cb);
            }

            //item.children=$.utils.filter(item,cb);
        }
    }else{
        if(cb.call(that,items)){
            _items.push(items);
            if(items.children && items.children.length > 0){
                items.children=$filterTreeData(items.children,cb);
            }
        }
    }
    return _items;
}



