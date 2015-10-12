;(function($){
	var LightBox=function(settings){
		var self=this;//保存当前类
		//参数配置
		this.settings={
			speed:500
		};
		$.extend(this.settings,settings||{});
		//创建遮罩和弹出框
		this.popupMask=$('<div id="G-light-mask">');
		this.popupWin=$('<div id="G-light-popuup">');
		//保存body
		this.bodyNode=$(document.body);
		//渲染剩余的DOM，并且插入body
		this.renderDOM();
		
		this.picViewArea=this.popupWin.find("div.picBox");//获取图片预览区域
		this.popupPic=this.popupWin.find("img.image");//获取弹出图片
		this.picCaptionArea=this.popupWin.find("div.picIntro");//图片描述区域
		this.nextBtn=this.popupWin.find("span.picNav-next");//下一页按钮
		this.prevBtn=this.popupWin.find("span.picNav-prev");//上一页按钮
		this.captionText=this.popupWin.find("p.picTitle");//获取图片标题
		this.currentIndex=this.popupWin.find("span.picIndex");//获取当前图片的序号
		this.closeBtn=this.popupWin.find("div.closeBtn");//关闭按钮
		
		//准备开发时间委托，获取组数据
		this.groupName=null;
		this.groupDate=[];//存放同一组的数据
		this.bodyNode.delegate(".js-lightbox,[data-role=lightbox]","click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			//拿到组名
			var currentGroupName=$(this).attr("data-group");
			if(currentGroupName!=self.groupName){
				self.groupName=currentGroupName;
				//根据当前组名获取同一组数据
				self.getGroup();
			};
			//初始化弹出
			self.initPopup($(this));
		});
		//关闭弹出
		this.popupMask.click(function(){
			$(this).fadeOut();
			self.popupWin.fadeOut();
			self.clear=false;
		});
		this.closeBtn.click(function(){
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			self.clear=false;
		});
		//绑定上下切换按钮事件
		this.flag=true;
		this.nextBtn.hover(function(){
			if(!$(this).hasClass("disabled")&&self.groupDate.length>1){
				$(this).addClass("picNav-next-show");				
			};
		},function(){
			if(!$(this).hasClass("disabled")&&self.groupDate.length>1){
				$(this).removeClass("picNav-next-show");				
			};
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flag){
				self.flag=false;
				e.stopPropagation();
				self.goto("next");//调用向下翻页方法
			};
		});
		this.prevBtn.hover(function(){
			if(!$(this).hasClass("disabled")&&self.groupDate.length>1){
				$(this).addClass("picNav-prev-show");				
			};
		},function(){
			if(!$(this).hasClass("disabled")&&self.groupDate.length>1){
				$(this).removeClass("picNav-prev-show");				
			};
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flag){
				self.flag=false;
				e.stopPropagation();
				self.goto("prev");//调用向上翻页方法
			};
		});
		//窗口调整图片自适应事件
		var timer=null;
		var clear=false;
		$(window).resize(function(){
			if(clear){
				window.clearTimeout(timer);
				timer=window.setTimeout(function(){
					self.loadPicSize(self.groupDate[self.index].src);
				});
			}
		}).keyup(function(e){
			if(self.clear){
				if(e.which==39||e.which==40){
					self.nextBtn.click();
				}else if(e.which==38||e.which==37){
					self.prevBtn.click();
				};
			}
		});
	};
	LightBox.prototype={
		//实现翻页goto方法
		goto:function(dir){
			if(dir==="next"){
				this.index++;
				if(this.index>=this.groupDate.length-1){
					this.nextBtn.addClass("disabled").removeClass("picNav-next-show");
				};
				if(this.index!=0){
					this.prevBtn.removeClass("disabled");
				};
				
				var src=this.groupDate[this.index].src;
				this.loadPicSize(src);
				
			}else if(dir==="prev"){
				this.index--;
				if(this.index<=0){
					this.prevBtn.addClass("disabled").removeClass("picNav-prev-show");
				};
				
				if(this.index!=this.groupDate.length-1){
					this.nextBtn.removeClass("disabled")
				};
				
				var src=this.groupDate[this.index].src;
				this.loadPicSize(src);
			};
		},
		
		
		//加载图片方法实现
		loadPicSize:function(sourceSrc){
			var self=this;
			self.popupPic.css({width:"auto",height:"auto"}).hide();
			this.picCaptionArea.hide();
			this.preLoadImg(sourceSrc,function(){
				self.popupPic.attr("src",sourceSrc);
				var picWidth=self.popupPic.width(),
					picHeight=self.popupPic.height();
				
				self.changePic(picWidth,picHeight);
				
			});
			
			
		},
		
		changePic:function(width,height){
			var self=this,
				winWidth=$(window).width(),
				winHeight=$(window).height();
				
			//如果图片的宽高大于浏览器的宽高，我们控制器比例
			//计算出视口和弹出框的宽高比，取做小比例作为弹出框乘以的比例
			var scale=Math.min(winWidth/(width+10),winHeight/(height+10),1);
			width=width*scale;
			height=height*scale;
			
			//让图片预览区域的宽高过渡到图片的宽高
			this.picViewArea.animate({
				width:width-10,
				height:height-10
			},self.settings.speed);
			
			//让弹出窗口居中显示
			this.popupWin.animate({
				width:width,
				height:height,
				marginLeft:-(width/2),
				top:(winHeight-height)/2
			},self.settings.speed,function(){
				self.popupPic.css({
					width:width-10,
					height:height-10
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag=true;
				self.clear=true;
			});
			//设置图片描述和当前索引
			this.captionText.text(this.groupDate[this.index].caption);
			this.currentIndex.text((this.index+1)+"of"+this.groupDate.length);
		},
		
		
		//监控图片是否加载完成
		preLoadImg:function(src,callback){
			var img=new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange=function(){
					if(this.readyState=="complete"){
						callback();
					};
				};
			}else{
				img.onload=function(){
					callback();
				};
			};
			img.src=src;
		},
		
		
		//显示遮罩层
		showMaskAndPopup:function(sourceSrc,currentId){
			var self=this;
			
			this.popupPic.hide();
			this.picCaptionArea.hide();
			this.popupMask.fadeIn();
			//获取当前视口的宽度和高度h
			var winWidth=$(window).width(),
				winHeight=$(window).height();
			//将图片预览区域设置成视口一半
			this.picViewArea.css({
				width:winWidth/2,
				height:winHeight/2
			});
			//弹出框淡入
			this.popupWin.fadeIn();
			//保存当前图片预览区域高度值
			var viewHeight=winHeight/2+10;
			//设置弹出框样式
			this.popupWin.css({
				width:winWidth/2+10,
				height:viewHeight,
				marginLeft:-(winWidth/4+5),
				top:-viewHeight
			}).animate({
				top:(winHeight-viewHeight)/2
			},self.settings.speed,function(){
				//回调函数，加载图片
				self.loadPicSize(sourceSrc);
			});
			
			
			
		//根据当前点击的元素ID获取在当前组别里面的索引
			this.index=this.getIndexOf(currentId);
			//获取当前点击对象所在组别的数组长度
			var groupDataLength=this.groupDate.length;
			//判断组中是否只有一张图片
			if(groupDataLength>1){
				//判断是否隐藏按钮
				if(this.index===0){
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");
				}else if(this.index===groupDataLength-1){
					this.nextBtn.addClass("disabled")
					this.prevBtn.removeClass("disabled");
				}else{
					this.nextBtn.removeClass("disabled")
					this.prevBtn.removeClass("disabled");
				};
			}else{
				this.prevBtn.addClass("disabled");
				this.nextBtn.addClass("disabled")
			};
		},
		
		
		//获取当前id在组中的序列
		getIndexOf:function(currentId){
			var index=0;
			$(this.groupDate).each(function(i){
				index=i;
				if(this.id===currentId){
					return false;//跳出循环
				};
			});
			return index;
		},
		
		
		//初始化弹出框
		initPopup:function(currentObj){
			var self=this,
			sourceSrc=currentObj.attr("data-source"),
			currentId=currentObj.attr("data-id");
			this.showMaskAndPopup(sourceSrc,currentId);	
		},
		
		
		//根据当前组名获取该组的数据
		getGroup:function(){
			var self=this;
			//根据当前组别的组名过去页面中所有相同组别的对象
			var groupList=this.bodyNode.find("*[data-group="+this.groupName+"]");
			
			//清空数组数据，保证数组中总是只保存同一组的数据
			self.groupDate.length=0;
			groupList.each(function(){
				self.groupDate.push({
					src:$(this).attr("data-source"),
					id:$(this).attr("data-id"),
					caption:$(this).attr("data-caption")
				});
			});
		},
		
		
		renderDOM:function(){
			//将弹出层中的内容拼接成字符串
			var strDom='<div class="picBox">'+
							'<span class="picNav picNav-prev"></span>'+
							'<img class="image" src="img/pic01.jpg" alt="pic"/>'+
							'<span class="picNav picNav-next"></span>'+
						'</div>'+
						'<div class="picIntro">'+
							'<div class="picInfo">'+
								'<p class="picTitle">图片标题</p>'+
								'<span class="picIndex">0 of 0</span>'+
							'</div>'+
							'<div class="closeBtn"></div>'+
						'</div>';
		//将拼接好的字符串插入弹出层对象popupWin
		this.popupWin.html(strDom);
		//把遮罩和弹出插入body中
		this.bodyNode.append(this.popupMask,this.popupWin);
		}
	};
	window["LightBox"]=LightBox;
})(jQuery);
