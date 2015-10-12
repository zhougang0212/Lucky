//加分号规避 上一个引入的js结尾没有结尾分号；
;(function($){
	var Carousel=function(poster){
	//保存单个旋转木马对象
	this.poster=poster;
	this.posterItemMain=poster.find("ul.poster-list");
	this.nextBtn=poster.find("div.poster-btn-next");
	this.prevBtn=poster.find("div.poster-btn-prev");
	this.posterFirstItem=poster.find("li").eq(0);
	//默认配置参数		
		this.setting={
			"width":1000,	//幻灯片高度
			"height":336,	//幻灯片宽度
			"posterWidth":600,	//幻灯片第一帧宽度
			"posterHeight":336,	//幻灯片第一帧宽度
			"scale":0.9,
			"speed":500,
			"verticalAlign":"middle"
		};
		$.extend(this.setting,this.getSetting());  //用人工setting覆盖默认setting
		this.setSettingValue();
	};
	
	Carousel.prototype={
	//设置配置参数值控制基本宽度高度
	setSettingValue:function(){
		this.poster.css({
			width:this.setting.width,
			height:this.setting.height
		});
		this.posterItemMain.css({
			width:this.setting.width,
			height:this.setting.height
		});
		//计算上下切换按钮的宽度
		var w=(this.setting.width-this.setting.posterWidth)/2;
		/*this.nextBtn.css({
			width:w
		});
		this.prevBtn.css({
			width:w
		});*/
		this.posterFirstItem.css({
			left:w
		});
	},
	
	//获取人工配置参数
		getSetting:function(){
			var setting=this.poster.attr("data-setting");
			if(setting&&setting!=""){
				return $.parseJSON(setting); //返回一个JSON对象
			}else{
				return null;
			};
		}
	};
	
	Carousel.init=function(posters){
		var _this_=this;
		posters.each(function(){
			new _this_($(this));
		});
	};
	//用window["Carousel"] = Carousel注册全局变量，全局访问
	window["Carousel"]=Carousel;						
})(jQuery);
