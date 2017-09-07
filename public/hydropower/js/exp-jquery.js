/**
 #jQuery扩展,只依赖jQuery
 --------------------------------------------------------------------
 *设置jQuery Ajax全局的参数 $.ajaxSetup({beforeSend:function(jqXHR, settings){},error:function(jqXHR, textStatus, errorThrown){}
*/
(function ($){
	$.fn.extend({
		/**
		 * demo:
		 * <div id="upload">
		 * 		<div class="z-upload-container"></div>
		 * </div>
		 * <button class="saveUpload">
		 * 		上传
		 * </button>
		 * 
		 * $('#upload').UploadFile({
		 * 		
		 * });
		 * 
		 * xhr.abort()中止请求
		 * 新增特性：
		 * 
		 * 2016-12-8
		 * 1、$container.data('uploading')	将组建上传状态暴露给外部
		 * 
		 * 2017-2-24
		 * 1、文件分片上传
		 * 
		 * 2017年5月2日09:13:11
		 * fixed bug
		 * 1、当上传的文件太小，约等于0KB时，进度条会超过100%，使用progress = Math.min(Math.round(loaded / size * 100), 100)取最小值
		 * 
		 * 2017年5月4日08:35:11
		 * 1、新增注释formData['delete'](fileName);必须执行的原因
		 * 2、切片时，e.loaded相应处理
		 * 
		 * 2017年5月11日11:32:52
		 * 1、新增文件回显功能，$container.trigger('show-list', param)，
		 * param结构: {urls : [String, String...]}
		 */
		UploadFile1 : function(opt) {
			var $container = this,
			V = '0.0.3',
			Accept = {
				video : {
					text : '.rmvb,.rm,.flv,video/x-matroska,video/mp4,video/3gpp,video/avi,video/quicktime,video/x-flv,audio/x-ms-wma,video/x-ms-wmv,video/mpeg',
					suffixs : ['rmvb', 'rm', 'mkv', 'mp4', '3gp', 'avi', 'mov', 'flv', 'wma', 'mpg', 'wmv']
				},
				file : {
					text : '.png,.jpg,.jpeg,.bmp,.pdf,.zip,.rar',
					suffixs : ['png', 'jpg', 'jpeg', 'bmp', 'pdf', 'zip', 'rar']				
				}
			},
			option = {
				// 检查容量
				sizeCheckUrl : '',
				uploadUrl : '',
				saveButtonSelector : '.save-file',
				// 默认上传文件
				type : 'file',
				// normal、modal
				mode : 'normal',
				// 是否不允许分片上传
				splitUpload : false,
				// 分片上传时，每次上传10M
				splitSize : 10,
				// 相应文件类型提示信息
				tip : '使用不大于 100M的png,jpg,jpeg,bmp,pdf,zip,rar文件',
				fileName : 'file',
				// 默认一次只能上传一个文件，为true时，填加多个input[type="input"]
				multiple : false,
				// 默认0.5秒更新一次上传速度
				speedUpdateInterval : 500,
				// 默认最大文件大小100M单位(MB)
				maxSize : 100,
				systemSizeOver : function() {
					showToastMsg({
						text : '已超出系统容量，请联系管理员',
						priority : 'danger'
					});
				},
				sizeOver : function(maxSize, realSize) {
					showToastMsg({
						text : '允许上传的文件最大为[' + maxSize + ']，实际上传大小为[' + realSize + ']',
						priority : 'danger'
					});
				},
				uploadingTip : function() {
					showToastMsg({
						text : '正在上传文件，请稍后再操作',
						priority : 'danger'
					});
				},
				repeatUpload : function() {
					showToastMsg({
						text : '请勿重复上传文件',
						priority : 'danger'
					});
				},
				renderCallback : $.noop,
				emptyFile : function(multiple, type) {
					var typeObj = {
						save : '上传',
						select : '选择'
					},
					msg = typeObj[type];
					if(multiple) {
						showToastMsg({
							text : '请至少' + msg + '一个文件',
							priority : 'danger'
						});
					} else {
						showToastMsg({
							text : '请' + msg + '文件',
							priority : 'danger'
						});
					}
				},
				invalidType : function(msg) {
					showToastMsg({
						text : msg,
						priority : 'danger'
					});
				},
				uploadError : function() {
					showToastMsg({
						text : '上传失败',
						priority : 'danger'
					});
				},
				// 当multiple为true时，每次添加.z-upload-row时回调，.z-upload-rows重置时也会回调
				rowAddCallback : $.noop,
				// change事件并且文件不为空触发回调
				changeCallback : $.noop,
				// 如果返回false，阻止保存
				beforeSave : function() {
					// 检测清晰度是否有勾选，默认checkbox的外部container是#definition-container'
					/*var $checkboxs = $('#definition-container').find('input[type="checkbox"]:checked');
					if(!$checkboxs.length) {
						ZUtil.error('请至少选择一个转码选择');
						return false;
					}*/
				},
				// 保存回调
				saveCallback : $.noop
			};
			
			option = $.extend(true, option, opt);
			var sizeCheckUrl = option.sizeCheckUrl,
			uploadUrl = option.uploadUrl,
			saveButtonSelector = option.saveButtonSelector,
			mode =option.mode,
			splitSize = option.splitSize * 1024 * 1024,
			splitUpload = option.splitUpload,
			type = option.type,
			acceptObj = Accept[type],
			accept = acceptObj.text,
			suffixs = acceptObj.suffixs,
			tip = option.tip,
			fileName = option.fileName,
			multiple = option.multiple,
			speedUpdateInterval = option.speedUpdateInterval,
			maxSize = option.maxSize * 1024 * 1024,
			systemSizeOver = option.systemSizeOver,
			sizeOver = option.sizeOver,
			uploadingTip = option.uploadingTip,
			emptyFile = option.emptyFile,
			repeatUpload = option.repeatUpload,
			uploadError = option.uploadError,
			invalidType = option.invalidType,
			rowAddCallback = option.rowAddCallback,
			renderCallback = option.renderCallback,
			changeCallback = option.changeCallback,
			beforeSave = option.beforeSave,
			saveCallback = option.saveCallback;
			
			if(!$container.attr('data-version')) {
				var row = '<div class="z-upload-row">'
							+ '<div class="z-upload-cell">'
								+ '<form class="comm_dhide">'
									+ '<input type="file" accept="' + accept + '" multiple="false" />'
								+ '</form>'
								+ '<form class="comm_dhide">'
									+ '<input type="file" accept="' + accept + '" multiple="false" />'
								+ '</form>'
								+ '<div class="z-progress-bar" tip="' + tip + '"></div>'
							+ '</div>'
							+ '<div class="z-upload-cell z-buttons" multiple="' + multiple + '">'
								+ '<button type="button" class="btn btn-primary btn-sm z-select-button">'
									+ (type == 'video' ? '选择视频' : '上传文件')
								+ '</button>'
								+ '<button class="btn btn-primary btn-sm z-upload">'
									+ '上传'
								+ '</button>'
								+ '<button class="btn btn-primary btn-sm z-upload-delete">'
									+ '删除'
								+ '</button>'
							+ '</div>'
						+ '</div>',
				html = '<div class="z-upload-rows">' + row + '</div>'
					+ '<div class="z-upload-operations comm_dhide">'
						+ '<button class="btn btn-primary z-upload-add br0 btn-sm">'
							+ '新增'
						+ '</button>'
					+ '</div>';
					
				var $uploadContainer = $container.find('.z-upload-container');
					
				// 开发者自己调整保存按钮位置
				$uploadContainer.html(html);
				renderCallback();
				
				$container.attr('data-version', 'z-upload-' + V);
				
				var $rows = $container.find('.z-upload-rows');
				$operations = $container.find('.z-upload-operations'),
				$add = $operations.find('.z-upload-add');
				
				// 重置插件
				$container.bind('reset', function(e) {
					// 事件源必须是$container,同时这里不能返回false，否则会中断子dom-->form的reset()
					if(e.target == $container[0]) {
						$rows.html(row);
					}
				});
				
				if(mode == 'modal') {
					$container.ToggleModal(function() {
						$container.trigger('reset');
					});
				}
				
				// 多文件上传
				if(multiple) {
					$operations.removeClass('comm_dhide');
					
					$add.bind('click', function() {
						$rows.append(row);
						var $row = $rows.find('.z-upload-row:last-child');
						rowAddCallback($row);
					});
					
					$rows.on('click', '.z-upload-delete', function() {
						var $delete = $(this);
						
						if(isUploading() == false) {
							return false;
						}
						
						// 点击第一个删除	无效
						if($rows.index($delete) == 1) {
							return false;
						}
						$delete.closest('.z-upload-row').remove();
					});
				}
				
				// 文件change事件
				$rows.on('change', 'input[type="file"]', function() {
					var $file = $(this),
					file = this.files[0],
					$row = $file.closest('.z-upload-row'),
					$upload = $row.find('.z-upload');
					
					// .z-upload暂时不可点击
					$upload.removeClass('.btn-primary');
					
					// 取消
					if(!file) {
						return false;
					}
					
					// 校验文件类型
					if(!validateAccept(file)) {
						invalidType('请上传[' + suffixs.join(', ') + ']格式的文件');
						$file.closest('form')[0].reset();
						return false;
					}
					
					// 检测文件大小
					var size = file.size;
					if(size > maxSize) {
						sizeOver(translateByte(maxSize), translateByte(size));
						return false;
					}
					
					// 检测系统容量
					if(sizeCheckUrl) {
						var valid = true,
						$form = $file.closest('form');
						$.ajax({
							url : sizeCheckUrl,
							data : {file_size : size},
							async : false,
							success : function(data) {
								if(!data.success) {
									valid = false;
									$form[0].reset();
									systemSizeOver();
								}
							},
							error : $.fn.error
						});
						
						// 设置.z-progress-bar
						if(!valid) {
							return false;
						}
					}
					
					setProgressBar($row, file);
					
					// 可以点击.z-upload
					$upload.addClass('btn-primary');
					$row.removeData('file');
					
					changeCallback();
				});
				
				// 选中按钮
				$rows.on('click', '.z-select-button', function() {
					if(isUploading() == false) {
						return false;
					}
					
					var $row = $(this).closest('.z-upload-row'),
					/**
					 * 这里有两个input[type="file"]，找到第一个files.length=0的目标进行click()
					 * 这么做的原因是change事件，可能不选择文件，造成文件丢失
					 */
					$files = $row.find('input[type="file"]');
					for(var i = 0, length = $files.length; i < length; i++) {
						var fileInput = $files.get(i);
						if(!fileInput.files.length) {
							$(fileInput).click();
							break;
						}
					}
				});
				
				// 上传
				$rows.on('click', '.z-upload', function(event) {
					var $upload = $(this),
					$row = $upload.closest('.z-upload-row'),
					$files = $row.find('input[type="file"]'),
					file;
					
					// 找有效文件
					$files.each(function(index, item) {
						var files = item.files;
						if(files.length) {
							file = files[0];
						}
					});
					
					if(isUploading() == false) {
						return false;
					}
					
					// 文件不存在
					if(!file) {
						emptyFile(multiple, 'select');
						return false;
					}
					
					// 重复上传
					if($row.data('file')) {
						repeatUpload();
						return false;
					}
					
					// 只有上传视频时需要校验是否选择转码要求
					if(option.type == 'video' && beforeSave() == false) {
						return false;
					}
					
					uploadFile($row, file);
				});
				
				$container.on('click', saveButtonSelector, function() {
					var $rowDivs = $rows.find('.z-upload-row');
					
					if(isUploading() == false) {
						return false;
					}
					
					// 判断multiple是否为true
					if(multiple) {
						save();
					} else {
						// 如果是单文件上传，点击保存按钮时先上传文件，然后执行回调
						$rows.find('.z-upload').click();
					}
				});
				
				// 从服务器那边回显信息
				$container.bind('show-list', function(e, param) {
					param = param || {};
					urls = param.urls || [];
					
					for (var i = 0, length = urls.length; i < length; i++) {
						var url = urls[i],
						arr = url.substring(url.lastIndexOf('_') + 1).split('\.'),
						name = arr[0],
						type = arr[1],
						fileUpload = {
							path : url
						},
						innerHtml;
						
						// 第二个文件开始点击"新增"按钮
						if (i) {
							$add.click();
						}
						var $row = $rows.find('.z-upload-row:last-child');
						// 将"上传"按钮的.btn-primary干掉
						$row.find('.z-upload').removeClass('btn-primary');
						$row.data('file', fileUpload);
						
						innerHtml = '<div class="z-file-name z-upload-cell">'+ name + '.' + type + '</div>'
								+ '<div class="z-upload-progress z-upload-cell">进度：100%</div>'
								+ '<div class="z-upload-speed z-upload-cell">速度：0KB/s</div>'
								+ '<div class="z-upload-progress-linear" style="width: 100%;"></div>';
						
						$row.find('.z-progress-bar').html(innerHtml);
					}
				});
				
				function getFileUploads() {
					var $rowDivs = $rows.find('.z-upload-row'),
					fileUploads = [];
					
					// 检测是否有文件
					$rowDivs.each(function(index, item) {
						var fileUpload = $(item).data('file');
						if(fileUpload) {
							fileUploads.push(fileUpload);
						}
					});
					return fileUploads;
				}
				
				// 保存到数据库
				function save($rowDivs) {
					var fileUploads = getFileUploads();
					
					if(!fileUploads.length) {
						emptyFile(multiple, 'save');
						return false;
					}
					
					// 只有上传视频时需要校验是否选择转码要求
					if(option.type == 'video' && beforeSave(fileUploads) == false) {
						return false;
					}
					
					saveCallback(fileUploads);
				}
				
				function beforeUpload($row, $upload) {
					$upload.removeClass('btn-primary');
					$container.data('uploading', true);
					
					var $progressLinear = $row.find('.z-upload-progress-linear');
					$progressLinear.addClass('z-uploading');
				}
				
				function afterUpload($row, $upload, fileUpload) {
					// 将返回的文件服务器路径相关信息保存在input[type="file"]
					if(fileUpload) {
						$row.data('file', fileUpload);
					} else {
						// 如果上传没有成功，添加.btn-primary
						$upload.addClass('btn-primary');
						
					}
					$container.data('uploading', false);
					
					var $progressLinear = $row.find('.z-upload-progress-linear');
					$progressLinear.removeClass('z-uploading');
				}
				
				// 是否正在上传
				function isUploading() {
					if($container.data('uploading') == true) {
						uploadingTip();
						return false;
					}
				}
				
				// 校验上传的文件是否可接受
				function validateAccept(file) {
					var name = file.name,
					arr = name.split('\.'),
					length = arr.length,
					suffix = arr[length - 1].toLowerCase();
					
					for(var i = 0; i < length; i++) {
						if(suffixs.indexOf(suffix) == -1) {
							return false;
						}
					}
					return true;
				}
				
				// 设置.z-progress-bar
				function setProgressBar($row, file) {
					var $bar = $row.find('.z-progress-bar'),
					innerHtml = '<div class="z-file-name z-upload-cell">'+ file.name + '</div>'
								+ '<div class="z-upload-progress z-upload-cell">进度：0% of ' + translateByte(file.size) + '</div>'
								+ '<div class="z-upload-speed z-upload-cell">速度：0KB/s</div>'
								+ '<div class="z-upload-progress-linear"></div>';
					$bar.html(innerHtml);
				}
				
				// 上传文件
				function uploadFile($row, file) {
					var $upload = $row.find('.z-upload');
					
					beforeUpload($row, $upload);
					
					var xhr = getXHR(),
					formData = new FormData(),
					// 上次的时间戳
					prev = new Date().getTime(),
					// 以上传
					load = 0,
					// 文件大小
					size = file.size,
					translateSize = translateByte(size),
					prevProgress = 0,
					$bar = $row.find('.z-progress-bar'),
					$progress = $row.find('.z-upload-progress'),
					$speed = $row.find('.z-upload-speed'),
					$progressLinear = $row.find('.z-upload-progress-linear');
					
					formData.append('uniqueFlag', Date.now());
					formData.append('fileName', file.name);
					
					xhr.addEventListener('error', uploadError, false);
					xhr.upload.addEventListener('progress', function(e) {
						// e.loaded是本次请求已经上传的文件大小
						var loaded,
						// 当前时间戳
						now = new Date().getTime(),
						distance = now - prev;
						if (splitUpload) {
							/**
							 * 如果是分片上传，e.loaded是每次的file.slice(start, end)，理论上就是每份文件切片大小
							 * 而不会像整体文件上传一样,e.loaded是从0慢慢增长到file.size
							 * 需要加上load才是已经上传的文件大小
							 */
							loaded = e.loaded + load;
						} else {
							loaded = e.loaded;
						}
						
						var progress = Math.min(Math.round(loaded / size * 100), 100);
						/**
						 * 每次更新的时间间隔 >= speedUpdateInterval
						 * 或者上传完毕（如果是分片上传，那么e.loaded >= splitSize也意味着当前分片文件上传完成）
						 */
						if(distance >= speedUpdateInterval || (progress == 100 || (splitUpload && e.loaded >= splitSize))) {
							var speed = translateByte((loaded - load) / distance * 1000);
							$speed.html('速度：' + speed + '/s');
							prev = now;
							load = loaded;
						}
						if(progress != prevProgress) {
							prevProgress = progress;
							$progress.html('进度：' + progress + '% of ' + translateSize);
							$progressLinear.css({
								width : progress + '%'
							});
						}
					}, false);
					
					xhr.onreadystatechange = function(e) {
						var readyState = xhr.readyState,
						status = xhr.status;
						
						if(readyState == 4 && status == 200) {
							var response = e.target.response;
							response = response && JSON.parse(response);
							
							// success可能会变动
							if(response.success) {
								if(splitUpload) {
									if(index < totalIndex) {
										start = end;
										// 继续发送分片文件
										send();
									} else {
										afterUpload($row, $upload, response);
										!multiple && save($row);
									}
								} else {
									afterUpload($row, $upload, response);
									!multiple && save($row);
								}
							}
						}
						
						if(status >= 500) {
							afterUpload($row, $upload);
							uploadError();
						}
					};
					
					// 是否分片上传
					if(splitUpload) {
						// 每次上传splitSize M
						var totalIndex = Math.ceil(size / splitSize),
						start = 0,
						end = 0,
						index = 0;
						formData.append('totalIndex', totalIndex);
						send();
					} else {
						xhr.open('post', uploadUrl, true);
						formData.append(fileName, file);
						xhr.send(formData);
					}
					
					function send() {
						// 必须使用异步（true），才能监控progress
						xhr.open('post', uploadUrl, true);
						if(size - start < splitSize) {
							end = size;
						} else {
							end = splitSize + start;
						}
						
						formData['delete']('index');
						formData.append('index', ++index);
						/**
						 * formData['delete'](fileName);
						 * formData不执行delete删除相同参数时，append进来相同的参数是无效的，也就是说每次提交的都是第一次append进来的值
						 * 为了保证上传最新的Blob，需要先delete掉上一次的Blob，然后加入当前Blob
						 */
						formData['delete'](fileName);
						formData.append(fileName, file.slice(start, end));
						xhr.send(formData);
					}
				}
			}
		},
		UploadFile : function(opt) {
			var option = {
				callback : $.noop
			},
			$container = this,
			now = Date.now(),
			id = 'upload-div-' + now,
			iframeName = 'upload-iframe-' + now,
			accepts = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'application/pdf', 'application/x-zip-compressed'];
			acceptArr = ['png', 'jpg', 'jpeg', 'bmp', 'pdf', 'zip', 'rar'];
			// 文件最大100M
			MAX_SIZE = 100 * 1024 * 1024;
			
			opt = $.extend(option, opt);
			
			var url = opt.url,
			html = '<div class="comm_dhide" id="' + id + '">'
					+ '<iframe class="comm_dhide" name="' + iframeName + '"></iframe>'
					+ '<form method="post" enctype="multipart/form-data" action="' + url + '" accept="' + accepts.join(', ') + '" target="' + iframeName + '">'
						+ '<input class="comm_dhide" name="file" type="file" accept="image/png,image/jpg,image/jpeg,image/bmp,.pdf,.zip,.rar" />'
					+ '</form>'
					+ '<form method="post" enctype="multipart/form-data" action="' + url + '" accept="' + accepts.join(', ') + '" target="' + iframeName + '">'
						+ '<input class="comm_dhide" name="file" type="file" accept="image/png,image/jpg,image/jpeg,image/bmp,.pdf,.zip,.rar" />'
					+ '</form>'
				+ '</div>';
			
			$container.after(html);
			
			var $div = $('#' + id),
			$files = $div.find('input[type="file"]'),
			$iframe = $div.find('iframe'),
			callback = option.callback;
			
			$container.unbind('clear').bind('clear', function() {
				$forms = $files.closest('form');
				$forms.each(function(index, form) {
					form.reset();
				});
			});
			
			// 触发点击
			$container.bind('click', function() {
				for(var i = 0, length = $files.length; i < length; i++) {
					var $file = $files.eq(i);
					// 如果当前file没有文件，触发当前file的click事件
					if(!$file.get(0).files.length) {
						$file.click();
						break;
					}
				}
			});
			
			// 判断当前file是否有文件，如果有，那么另外一个file要清空文件
			$files.bind('change', function() {
				var $file = $(this);
				
				if(this.files.length) {
					var $form = $file.closest('form'),
					file = this.files[0],
					type = file.type;
					
					// 校验文件类型,chrome 58.xx  zip和rar都不行，只能通过后缀校验
					var reg = /(\.rar)|(\.zip)$/i;
					if (!(accepts.indexOf(type) != -1 || reg.test(file.name))) {
						showToastMsg(6000, {
							text : '请上传[' + acceptArr.join(', ') + ']类型的文件',
							priority : 'danger'
						});
						$form.get(0).reset();
						return false;
					}
					// 检测文件大小
					if (file.size > MAX_SIZE) {
						showToastMsg(4000, {
							text : '文件最大100M',
							priority : 'danger'
						});
						$form.get(0).reset();
						return false;
					}
					
					$form.siblings('form').get(0).reset();
					// 上传文件到服务器
					$form.get(0).submit();
					// 轮询iframe，获取服务器返回信息
					(function() {
						var msg = $iframe.contents().find('body pre').html();
						
						if(!msg) {
							// 100毫秒查询一次
							setTimeout(arguments.callee, 100);
						} else {
							var obj = JSON.parse(msg);
							if(obj.meta.code == 1) {
								$iframe.contents().find('body pre').remove();
								callback(file, obj.data);
							} else {
								showToastMsg({
									priority : 'danger'
								});
							}
						}
					})();
				}
			});
			
		},
		// 数据自动补全
		/*AutoComplete : function(opt) {
			// 每次搜索至少间隔时间
			var INTERVAL = 100,
			option = {
				url : '',
				textField : 'name',
				valueField : 'id',
				placeholder : '请输入关键字',
				interval : INTERVAL,
				// 查询参数
				param : {},
				type : 'get'
			},
			$this = this;
			
			option = $.extend(true, option, opt);
			
			var textField = option.textField,
				valueField = option.valueField,
				placeholder = option.placeholder,
				interval = option.interval,
				param = option.param,
				type = option.type,
				url = option.url;
			
			if (!url) {
				showToastMsg({
					text : '请求路径不能为空',
					priority : 'danger'
				});
				return false;
			}
			
			// 初始化combotree
			$this.combobox({
				textField : textField,
				valueField : valueField
			});
			
			var $target = $this.next('span').find('input'),
				prevTime = Date.now(),
				prevValue = '',
			// 搜过键值在data-search-key中获取，如果不存在，直接传递name的值
			key = $this.attr('data-search-key') || $this.attr('name');
			
			$target.attr('placeholder', placeholder);
			// 修改placeholder
			$target.focus();
			setTimeout(function() {
				$target.blur();
			});
			
			// input框可编辑
			$target.removeAttr('readonly');
			
			$target.unbind('keyup blur paste').bind('keyup blur paste', function() {
				var now = Date.now();
				if (now - prevTime >= interval) {
					var value = $.trim($target.val());
					prevValue = value;
					if (value) {
						param[key] = value;
						loadData(param);
					}
				}
			});
			
			function loadData(param) {
				$.ajax({
					url : url,
					type : type,
					data : param,
					success : function(result) {
						if (result.meta.code == 1) {
							$this.combobox('loadData', result.data.rows);
							// 防止因重新loadData把原来的值干掉
							$this.combobox('setValue', prevValue);
							// 重置时间
							prevTime = Date.now();
						} else {
							showToastMsg({priority : 'danger'});
						}
					}
				});
			}
		},*/
		ScrollDocument : function() {
			var $document = $(document),
				$this = $(this),
				direction = 'up';
			$this.unbind('mousewheel DOMMouseScroll').bind('mousewheel DOMMouseScroll', function(e) {
				// 向下滚
				if ((e.originalEvent.wheelDelta || !e.originalEvent.detail) < 0) {
					if (direction == 'up') {
						direction = 'down';
						/*datagrid向下滚动时隐藏第一个父layout中有class：scrollHide的元素*/
						if ($('.scrollToggleEle').length > 0) {
							$('.scrollToggleEle').css('opacity',0);
							setTimeout(function(){
								$('.scrollToggleEle').hide();
								$('.easyui-layout').layout('resize');
							},100);
						}
					}
				} else {
					// 向上滚
					if (direction == 'down') {
						direction = 'up';
						/*datagrid向上滚动时显示第一个父layout中有class：scrollHide的元素*/
						if ($('.scrollToggleEle').length > 0) {
							$('.scrollToggleEle').css('opacity',1);
							setTimeout(function(){
								$('.scrollToggleEle').show();
								$('.easyui-layout').layout('resize');
							},100);
						}
					}
				}
			});
		}
	});
})(jQuery);