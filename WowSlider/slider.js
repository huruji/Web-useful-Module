(function(global,$){


    //解析媒体查询
    var slideMediaReg = /@media\s*(?:screen|all)(?:\s*and\s*(?:\(min-width:([0-9]*)px\)))?(?:\s*and\s*(?:\(max-width:([0-9]*)px\)))?\s*\{\s*\[(.*?)]\s*}/g;
    var slideNoMediaReg = /\[(.*)]/g;
    var breakPoints = [];
    var mediaStr;

    //一些属性兼容设置
    var Compat = {
        opacity:(function(){
           if('opacity' in document.body.style){
               return function(val){
                   return 'opacity:' + val;
               }
           }else{
               return function(val){
                   return 'filter:alpha(opacity=' + val*100 + ')';
               }
           }
        })()
    }

    var Util = {
        parseMedia:function(slideMediaId){
            var media = $('#' + slideMediaId),
                match,
                breakPoint;

            //保存媒体查询语句
            mediaStr = media.html();

            while(match = slideMediaReg.exec(mediaStr)){
                var min = match[1];
                var max = match[2];

                //构建断点对象
                breakPoint = new BreakPoint(min,max,match[3]);

                //将断点对象放入数组
                breakPoints.push(breakPoint);
            }

            //match可能为空，说明不需要根据屏幕尺寸响应不同图片
            if(breakPoints.length === 0){
                match = slideNoMediaReg.exec(mediaStr);
                return match[1].split(',');
            }

            return this.getImagesUrl(mediaStr);

        },

        splitArgs:function(args){
            return Array.prototype.slice.call(args);
        },

        getImagesUrl:function(mediaStr){
            var windowWidth = $(window).width();
            var currentMin,currentMax,isFirst = true,imagesUrl;

            //先把min-width解析一遍
            for(var i= 0,len = breakPoints.length;i<len;i++){
                var breakPoint = breakPoints[i];
                if(!currentMin){
                    if(breakPoint.min && breakPoint.compareMin(windowWidth)){
                        currentMin = breakPoint.min;
                        imagesUrl = breakPoint.imagesUrl;
                    }
                }else if(breakPoint.min && breakPoint.min >= currentMin && currentMin){
                    currentMin = breakPoint.min;
                    imagesUrl = breakPoint.imagesUrl;
                }
            }

            //有可能通过解析min-width没能得到imagesUrl
            if(!imagesUrl){
                for(var i = 0,len = breakPoints.length;i<len;i++){
                    breakPoint = breakPoints[i];
                    if(!currentMax){
                        if(breakPoint.max && breakPoint.compareMax(windowWidth)){
                            currentMax = breakPoint.max;
                            imagesUrl = breakPoint.imagesUrl;
                        }
                    }else if(breakPoint.max && breakPoint.max <= currentMax && breakPoint.compareMax(windowWidth)){
                        currentMax = breakPoint.max;
                        imagesUrl = breakPoint.imagesUrl;
                    }
                }
            }

            if(!imagesUrl){
                //清除全局匹配
                slideNoMediaReg.lastIndex = 0;
                var match = slideNoMediaReg.exec(mediaStr);
                return match[1].split(',');
            }

            return imagesUrl.split(',');
        },

        getWindowWidth:function(){
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        }
    }

    //常量
    var Const = {

    }

    //断点类
    var BreakPoint = function(min,max,imagesUrl){
        this.min = min ? parseInt(min):min;
        this.max = max ? parseInt(max):max;
        this.imagesUrl = imagesUrl;
    }

    //检查指定宽度是否在此断点的范围之内
    BreakPoint.prototype.compareMin = function(winWidth){
        return winWidth >= this.min ? true :false;
    }

    BreakPoint.prototype.compareMax = function(winWidth){
        return winWidth <= this.max ? true :false;
    }

    /*-HopeSlide类-*/
    var HopeSlide = global.HopeSlide = function(options){

        var opts = options || {};
        this.options = opts;

        //合并可选项
        for(var prop in defaultOptions){
            if(!opts[prop]){
                opts[prop] = defaultOptions[prop];
            }
        }

        //解析媒体查询
        var imagesUrl = Util.parseMedia(options.slideMedia);
        for(var i = 0,len = imagesUrl.length;i<len;i++){
            imagesUrl[i] = options.basePath + imagesUrl[i];
        }
        this.imagesUrl = imagesUrl;

        //删除HopeMedia节点
        $('#' + opts.slideMedia).remove();

        //获取所有子对象
        this.slides = $('#' + options.sliderId + ' ul').children();
        this.slidesObj = [];

        //自动添加slide类
        this.slides.addClass('slide');

        this.init();

    }

    HopeSlide.prototype.init = function(){
        this.createSlide();
        var opts = this.options;
        var self = this;

        //设置当前slide
        this.currentSlide = this.slides.eq(0);
        this.currentSlideIndex = 0;

        this.currentSlide.addClass('is-curr');

        bindEvent();

        //自动播放slide
        this.autoPlay();

        function bindEvent(){

            if(opts.enableDots){
                self.dots = $('.' + opts.dotsName);
                self.dots.eq(0).addClass('active');
               self.dots.each(function(index){
                    $(this).attr('tab-index',index);
                }).bind('click', function () {
                    //获取目标slide的index
                    var nextSlideIndex = parseInt($(this).attr('tab-index'));
                    self.fadeTo(nextSlideIndex);
                });
            }

            //为左右按钮绑定事件
            $('#' + self.options.prevBtn).click(function(){
                var nextSlideIndex = self.currentSlideIndex - 1;
                self.fadeTo(nextSlideIndex);
            })

            $('#' + self.options.nextBtn).click(function(){
                var nextSlideIndex = self.currentSlideIndex + 1;
                self.fadeTo(nextSlideIndex);
            })

            //为触摸事件绑定
            $('#' + self.options.sliderId).bind('touchstart',function(e){
                var touch = e.originalEvent.touches[0];

                self.startX = touch.clientX;

            })

            $(document).bind('touchend',function(e){
                var touch = e.originalEvent.changedTouches[0];

                var deltaX = touch.clientX - self.startX;

                if(deltaX > 0 && Math.abs(deltaX) > 20){
                    var nextSlideIndex = self.currentSlideIndex + 1;
                    self.fadeTo(nextSlideIndex);
                }else if(deltaX < 0 && Math.abs(deltaX) > 20){
                    var nextSlideIndex = self.currentSlideIndex - 1;
                    self.fadeTo(nextSlideIndex);
                }
            });

            $(global).bind('resize',function(){
                self.resetSlide();
            })
        }
    }

    HopeSlide.prototype.createSlide = function(){
        var slide;

        for(var i = 0,len = this.imagesUrl.length;i < len; i++){
            if(this.slides.eq(i)){
                slide = new Slide(this.imagesUrl[i]);
                slide.ele = this.slides.eq(i);
                slide.ele.attr('data-index',i);
                this.slidesObj.push(slide);

                slide.createSlide();
            }
        }
    }

    HopeSlide.prototype.resetSlide = function () {
        var slideObj = this.slidesObj;
        var imagesUrl = Util.getImagesUrl(mediaStr);

        for(var i = 0,len = this.slidesObj.length;i<len;i++){
            slideObj[i].resetSlide(this.options.basePath + imagesUrl[i]);
        }
    }

    HopeSlide.prototype.autoPlay = function () {
        var self = this;
        this.resetTweenArgs();

        //设置下一张slide的位置
        var nextSlideIndex = this.getNextSlideIndex(this.currentSlideIndex + 1);

        this.bigTimer = setTimeout(function(){
            self.setNextSlide(nextSlideIndex);
            self.onBeginAnimation(nextSlideIndex);
            self.play.call(self);
        },this.options.interval)
    }

    HopeSlide.prototype.resetTweenArgs = function(){
        this.time = 0;
        this.begin = 1;
        this.change = -1;
        this.duration = 60;
    }

    HopeSlide.prototype.moveTo = function (index) {

    }

    HopeSlide.prototype.fadeTo = function (index) {
        //清除timer
        if(this.animating){
            return;
        }

        clearTimeout(this.bigTimer);
        this.resetTweenArgs();
        var nextSlideIndex = this.getNextSlideIndex(index);
        this.onBeginAnimation(nextSlideIndex);
        this.setNextSlide(nextSlideIndex);
        this.play();
    }

    HopeSlide.prototype.getNextSlideIndex = function(nextSlideIndex){
        var l = this.slides.length - 1;

        if(nextSlideIndex > l){
            return nextSlideIndex = 0;
        }

        if(nextSlideIndex < 0){
            return l;
        }

        return nextSlideIndex;
    }

    HopeSlide.prototype.play = function(){
        var self = this;
        var ieSlide;

        if(this.time>this.duration){
            clearTimeout(self.timer);
            return this.onEndAnimation();
        }

        var opacityVal = this.options.tweenFunc(this.time,this.begin,this.change,this.duration);

        this.time++;
        this.onAnimating();
        this.changeOpacity(opacityVal,this.currentSlide);

        //低于ie10的浏览器中的文字内容动画
        if(ieSlide = $('#ie' + ' .slide:eq(' + this.currentSlideIndex + ') .animate')){
            this.changeAnimOpacity(opacityVal,ieSlide);
        }

        self.timer = setTimeout(function(){
            self.play.call(self);
        },1000/60);

    }

    HopeSlide.prototype.changeOpacity = function(val,ele){
        ele.find('img').attr('style',Compat.opacity(val));
    }

    HopeSlide.prototype.changeAnimOpacity = function(val,ele){
        ele.attr('style',Compat.opacity(val));
    }

    HopeSlide.prototype.setNextSlide = function(index){
        this.slides.eq(index).addClass('is-next');
    }

    HopeSlide.prototype.onBeginAnimation = function(nextSlideIndex){
        //slide开始播放时出发的事件函数
        this.animating = true;
        //移除原来dot的active类

        if(this.options.onBeginAnimation){
            this.options.onBeginAnimation(this.currentSlide,this.slides.eq(nextSlideIndex),this.currentSlideIndex,nextSlideIndex);
        }

        if(this.options.enableDots){
            this.dots.filter('.active').removeClass('active');
            this.dots.eq(nextSlideIndex).addClass('active');
        }

    }

    HopeSlide.prototype.onAnimating = function(){
        //slide每一帧触发的事件函数
        if(this.options.onAnimating){
            this.options.onAnimating();
        }
    }

    HopeSlide.prototype.onEndAnimation = function(){
        //slide播放结束时触发的事件函数
        var ieSlide;

        //移除原slide的is-curr类，给新slide增加is-curr类
        var originSlide = this.currentSlide;
        originSlide.removeClass('is-curr');
        var newCurrSlide = $('.is-next');
        newCurrSlide.removeClass('is-next').addClass('is-curr');
        //调用用户定义的事件函数
        if(this.options.onEndAnimation){
            this.options.onEndAnimation(originSlide,newCurrSlide,this.currentSlideIndex,parseInt(newCurrSlide.attr('data-index')));
        }
        //恢复原slide的透明度值
        this.changeOpacity(1,originSlide);

        //恢复文字的透明度
        if(ieSlide = $('#ie' + ' .slide:eq(' + this.currentSlideIndex + ') .animate')){
            this.changeAnimOpacity(1,ieSlide);
        }

        //更新当前slide及其index
        this.currentSlide = newCurrSlide;
        this.currentSlideIndex = parseInt(this.currentSlide.attr('data-index'));

        //设置animating
        this.animating = false;

        //重新开始自动播放
        this.autoPlay();
    }

    var Slide = function(imgUrl){
        this.imgUrl = imgUrl;

        this.ele;
    }

    Slide.prototype.slideHtmlStr = '<img src="{url}" />';

    Slide.prototype.createSlide = function(){

        var htmlStr = this.slideHtmlStr.replace('{url}',this.imgUrl);
        //将生成的html字符串插入Dom内
        $(htmlStr).appendTo(this.ele);
    }

    Slide.prototype.setImageUrl = function(url){
        this.imgUrl = url;

        this.ele.filter('img').attr('src',url);
    }

    Slide.prototype.resetSlide = function(url){
        this.imgUrl = url;
        this.ele.find('img').attr('src',url);
    }

    var defaultOptions = {
        basePath:'',

        sliderId:'HopeSlider',

        slideMedia:'HopeMedia',

        tweenFunc:function(t,b,c,d){ return c*t/d + b; },

        interval:3000,

        prevBtn:'prev',

        nextBtn:'next',

        enableDots:false,

        dotsName:'dot'
    }

})(window,jQuery)