        水电项目ui改版须知
一、引入文档
1、更新public文件夹
2、项目中引入hydropower文件夹中的文件
注：框架扩展文件放到项目文件中去


二、页面调整
1、html布局修改部分
    1).布局demo文件夹中的文件
    2).layout组件由原来的   <body class="easyui-layout bodySpace" data-options="fit:true">
                    改为   <body class="comm_pa10"><div class="easyui-layout" data-options="fit:true">
                       注：元素自行检查闭合
        页面上只有一个datagrid：
            ①布局修改介绍
                         a.布局分为主要为north、center区域组成，根据不同页面自行修改布局

        页面上有多个datagrid:
            ①布局修改介绍
                         a.给center区域的div给一个内边距的class
                            eg:<div data-options="region:'center',collapsible:false,border:false" class="comm_pa10"></div>
                         b.布局只有center区域，多个表格放在div中，方便实现边距
                            eg:<div class="comm_ma_b">
                                 <table id="param-payno"></table>
                               </div>
                               <div class="comm_ma_b">
                                  <table id="param-udetail"></table>
                               </div>
    3)若页面不需要提示信息，则页面中不要下面这一段代码，显示默认提示信息
        <div class="comm_search_tooltip">
            <span class="frendlyWarn">若需要数据状态为首次打印或补打的数据，点击取消打印可继续补打</span>
            <span class="otherWarn"></span>
            <span class="closeTooltip">×</span>
        </div>
    3）form表单内的元素
       ①给form表单元素添加class  advanceSearchItem
       ②普通搜索部分按照原来的写法不做修改
       ③高级搜索部分：给input的父级div添加class  ‘hideItem’,按钮组中的收起按钮默认添加class ‘hideItem’
        eg:
            <div class='comm_inlineb hideItem'>
                <label>发票代码：</label>
                <input class="easyui-textbox billCode" name="billCode">
            </div>
        搜索按钮点击事件（若只是普通的获得表单序列化后的对象然后刷新datagrid,则只需给按钮一个点击事件），如下所示：
        eg:
            <div class="comm_inlineb comm_float_right">
                <a href="javascript:void(0)" class="easyui-linkbutton c8 active comm_ma_r5" onclick="searchDatagrid({dgSelector:'#bill-grid',formSelector:$(this).parent().parent()})">搜索</a>
                <a href="javascript:void(0)" class="easyui-linkbutton c8 comm_ma_r5" id="reset-btn">重置</a>
                <a href="javascript:void(0)" class="easyui-linkbutton c8 comm_ma_r5 hideItem collapse-advance">收起</a>
                <a href="javascript:void(0)" class="easyui-linkbutton c8 expand-advance">高级搜索</a>
            </div>
            注：searchDatagrid({dgSelector:'#bill-grid',formSelector:$(this).parent().parent()})
                函数调用参数对象属性解释：
                    dgSelector：datagrid选择器
                    formSelector：form选择器
                    url:'xxxxx'//datagrid初始化没有url时传入该参数
2、js修改部分
1)datagrid修改
        eg:
            $("#param-udetail").datagrid({
                title: '用户列表',
                fit: false,//如果页面上有多个表格，设置fit为false
		height: 350,//如果页面上有多个表格，设置高度
                columns: [[
                    {field: 'distributorName', title: '分配人',width:10},
                    {field: 'handle', title: '操作',width:10//原toolbar中按钮位置修改，此处的按钮为对单行数据进行操作的按钮,若有行内操作按钮，给columns添加handle列若按钮个数超多3个，则使用下拉菜单显示更多按钮
                ]],
                buttons: [//原来的toolbar按钮位置修改，如果是针对表格操作的按钮（不需要选择一条行数据），则在datagrid中传入该属性，格式为数组，一个子对象为一个按钮添加属性
                    {
                        id:'btn_useradd',//按钮id
                        text: '新增',//按钮显示文本
                        tooltip: {position: 'left',content:'新增成功后需要保存才能生效！'},//若按钮需要显示tooltip提示信息，传入tooltip参数，否则不传
                        isGlobal:'top',//取值有：‘top’、''、'bottom'  如果值为top，按钮在页面右上角显示；如果值为空或不传值，在列表标题右边显示（如需在标题右边显示，则为datagrid添加title属性，列表标题不存在时默认在页面右上角位置）；
					如果值为'bottom'，显示在分页的左边位置（批量操作按钮）;如果取值为inline，则在行内显示按钮
                        handle: function(){
                            //按钮的处理操作
                        }
                    },
		    {
                        id:'btn_useradd',//按钮id
                        text: '保存',//按钮显示文本
                        tooltip: {position: 'left',content:'新增成功后需要保存才能生效！'},//若按钮需要显示tooltip提示信息，传入tooltip参数，否则不传
                        isGlobal:'',
                        handle: function(){
                            //按钮的处理操作
                        }
                    },
                    {
                        id: 'deleteTask',
                        text: '修改',
                        isGlobal: 'inline',//行内操作按钮
                        handle: deleteTask
                    },
                    {
                        id:'btn_useradd',
                        text: '批量删除',
                        tooltip: {position: 'left',content:'新增成功后需要保存才能生效！'},
                        isGlobal:'bottom',
                        handle: function(){
                            //按钮的处理操作
                        }
                    }
                ],
                onCustomLoadSuccess: function(data){//自己页面中需要对datagrid加载成功后做操作的使用这个属性，data是加载成功后的数据
                    //自己的操作
                }
            });
2)datagrid对齐问题
    文字/显示内容较长的左对齐，数字右对齐，按钮操作居中对齐