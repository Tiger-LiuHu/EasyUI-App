电网营销规范总结

一、布局
    1、页面上只有一个datagrid时：查询区域（north）与内容区域（center）不设置间隔，且无边框，datagrid不要加title
    eg:
        <div data-options="region:'north',hideCollapsedContent:false,height:'auto'" title="查询" collapsed=false border='false' class='datagrid-toolbar'></div>
        <div data-options="region:'center',border:false"></div>
    2、页面上有多个datagrid时，datagrid 之间添加分隔，datagrid要添加title
    eg:
      <div data-options="region:'north',border:false"></div>
      <div data-options="region:'center',border:false,split:true">
        <table id="dg" class="easyui-datagrid"></div>
      </div>
      <div data-options="region:'south',border:false,split:true">
        <table id="dg" class="easyui-datagrid"></div>
      </div>
    3、搜索区域高度为auto，可改变高度（个别搜索信息较少，如只有一行的可给固定高度）
    4、查询区域（north）他title统一为‘查询’
    5、左右布局不适用分隔，如左边树结构右边内容区域

二、弹窗
    1、弹窗title的图标样式统一使用easyui默认图标（具体使用哪一个待确定）
    2、弹框中的按钮统一添加class='datagrid-toolbar'
二、datagrid
    1、第一个选项默认加载‘-请选择-’初始化节点
    2、当前行数据有点击跳转或其他 操作 的，使用formatter将样式修改为图标+文字的格式
    3、当前行有超过2个操纵的，将操作移至toolbar居右对齐（例如电价参数维护中的表格数据操作）
    4、行数据中field的为状态的，修改格式为文字+图标
    5、显示斑马线效果（添加属性striped为true）
    6、datagrid为单选时不要checkbox
三、树结构
    1、下拉树和树结构都添加对其线（添加属性lines：true）
四、表单
    1、表单分组：使用easyui或html5的fieldset
    2、
五、其他
    1、表单页的 '按钮' 和 datagrid的 按钮 外层div统一添加class 'datagrid-toolbar'
    2、下拉框和下拉树一般情况下设置固定高度，特殊情况特殊处理
六、事件
    1、表单提交时添加遮罩（使用easyui.wait()和easyui.waitOff()），避免重复提交
    2、重要信息弹窗关闭前添加确认提示
    3、