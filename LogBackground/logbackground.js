/**
 * 
 * @authors huruji (594613537@qq.com)
 * @date    2016-08-20 23:22:07
 * @version $Id$
 */
 var HopeLog={};
(function(){
function LogBackground(opt){
        this.init(opt);
    }
    LogBackground.prototype.init=function(opt){
        var self=this;
        self._initDom(opt);
        self.canvas.width=this.options.canvasWidth;
        self.canvas.height=this.options.canvasHeight;
        self._initCir(self.context);
        self.render();
    }
    LogBackground.prototype._initDom=function(opt){
        this.options={
            canvasContainerID:"canvas-container",
            canvasOpacity:0.8,
            canvasEleCss:"",
            circleNum:40,
            circleColor:"rgba(180,180,180,1)",
            lineColor:"rgba(180,180,180,1)",
            circleMovemaxX:4,
            circleMoveminX:-2,
            circleMovemaxY:4,
            circleMoveminY:-2,
            canvasWidth:document.documentElement.clientWidth||document.body.clientWidth,
            canvasHeight:document.documentElement.clientHeight||document.body.clientHeight
        }
        if(opt){
            for(var key in opt){
                this.options[key]=opt[key];
            }
        }
        var canvasEle=document.createElement("canvas");
        var canvasContainer=document.getElementById(this.options.canvasContainerID);
        canvasContainer.appendChild(canvasEle);
        canvasEle.style.cssText="z-index:-20;position:absolute;left:0;top:0;bottom:0;right:0;";
        canvasEle.style.opacity=this.options.canvasOpacity;
        for (var key in this.options.canvasEleCss){
            canvasEle.style[key]=this.options.canvasEleCss[key];
        }
        this.canvas=canvasEle;
        this.drawMaxWidth=this.options.canvasWidth+100;
        this.drawMinWidth=-100;
        this.drawMaxHeight=this.options.canvasHeight+100;
        this.drawMinHeight=-100;
        this.context=this.canvas.getContext("2d");
        this.circleArr=[];
        this.moveArr=[];
    }
    LogBackground.prototype.random=function(max,_min){
        var minNum=arguments[1]||0;
        return Math.floor(Math.random()*(max-minNum+1)+minNum);
    }
    LogBackground.prototype._initCir=function(context){
        var self=this;
        for(var i=0;i<self.options.circleNum;i++){
            x=self.random(self.drawMaxWidth,self.drawMinWidth);
            y=self.random(self.drawMaxHeight,self.drawMinHeight);
            r=self.random(10);
            var newCircle=self.drawCircle(context,x,y,r);
            self.circleArr.push(newCircle);
            var move={
                x:Math.random()*self.options.circleMovemaxX+self.options.circleMoveminX,
                y:Math.random()*self.options.circleMovemaxY+self.options.circleMoveminY
            }
            self.moveArr.push(move);
        }
    }
    LogBackground.prototype._initLine=function(ctx,bx,by,cx,cy,opacity){
        var self=this;
        function Line(bx,by,cx,cy){
            this.beginX=bx;
            this.beginY=by;
            this.closeX=cx;
            this.closeY=cy;
        }
        var line=new Line(bx,by,cx,cy);
            ctx.beginPath();
            ctx.moveTo(line.beginX,line.beginY);
            ctx.lineTo(line.closeX,line.closeY);
            ctx.stroke();
            var colorArr=self.options.lineColor.split(",");
            ctx.strokeStyle=colorArr[0]+","+colorArr[1]+","+colorArr[2]+","+opacity+")";
            ctx.closePath();

    }
    LogBackground.prototype.render=function(){
        var self=this;
        self.context.clearRect(0,0,self.options.canvasWidth,self.options.canvasHeight);
            for(var i=0;i<self.options.circleNum;i++){
                var changeCircle=self.circleArr[i];
                changeCircle.centerX+=self.moveArr[i].x;
                changeCircle.centerY+=self.moveArr[i].y;
                self.drawCircle(self.context,changeCircle.centerX,changeCircle.centerY,changeCircle.radius);
                if(changeCircle.centerX<self.drawMinWidth){
                    changeCircle.centerX=self.drawMaxWidth;
                    changeCircle.centerY=self.random(self.drawMaxHeight,self.drawMinHeight);
                }else if(changeCircle.centerX>self.drawMaxWidth){
                    changeCircle.centerX=self.drawMinWidth;
                    changeCircle.centerY=self.random(self.drawMaxHeight,self.drawMinHeight);
                }else if(changeCircle.centerY<self.drawMinHeight){
                    changeCircle.centerY=self.random(self.drawMaxWidth,self.drawMinWidth);
                    changeCircle.centerY=self.drawMaxHeight;
                }else if(changeCircle.centerY>self.drawMaxHeight){
                    changeCircle.centerY=self.random(self.drawMaxWidth,self.drawMinWidth);
                    changeCircle.centerY=self.drawMinWidth;
                }
                
            }
            for(var j=0;j<self.options.circleNum;j++){
                for(var k=0;k<self.options.circleNum;k++){
                    var bx=self.circleArr[j].centerX;
                    var by=self.circleArr[j].centerY;
                    var cx=self.circleArr[k].centerX;
                    var cy=self.circleArr[k].centerY;
                    var dis=Math.sqrt(Math.abs(cx-bx)*Math.abs(cx-bx)+Math.abs(by-cy)*Math.abs(by-cy));
                    if(dis<0.2*this.options.canvasWidth||dis>this.options.canvasWidth*1.3){
                    var lineOpacity=1;
                    lineOpacity=lineOpacity>0.3?0.3:lineOpacity;
                    self._initLine(self.context,bx,by,cx,cy,lineOpacity);
                    }
                }
            }
        var timer=setTimeout(function(){
            self.render();
        },30);
    }
    LogBackground.prototype.drawCircle=function(ctx,x,y,r){
        var self=this;
        function Circle(x,y,r){
            this.centerX=x;
            this.centerY=y;
            this.radius=r;
        }
        var circle=new Circle(x,y,r);
        ctx.beginPath();
        ctx.arc(circle.centerX,circle.centerY,circle.radius,0,Math.PI*2,true);
        ctx.fillStyle=self.options.circleColor;
        ctx.fill();
        ctx.closePath();
        return circle;
    }
    HopeLog.background=LogBackground;
 })()