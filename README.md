# Web-useful-Module
网页中常用到的组件

##1、LogBackground##
一个仿知乎登录界面的canvas背景，我已将其封装，分为原生js版和jQuery版，为了减少变量冲突，采用了类似于jQuery的方式，以下是提供的参数：
```
options={
	canvasContainerID:运用背景的盒子的ID名，默认为“canvas-container”,

    canvasOpacity:canvas背景的透明度，默认为0.8,

    canvasEleCss:canvas元素的css属性设置,默认已设置的属性有“z-index:-20;position:absolute;left:0;top:0;bottom:0;right:0;”,采用对象的方式设置,如：{position:"fixed",left:"20px"},在这里设置的属性如果有默认设置的属性，将对该属性进行覆盖，这个的设置主要是为了解决一些页面布局冲突的情况

    circleNum:页面中随机产生的圆点的数量，默认为40,

    circleColor:页面的颜色，可接受rgb、rgba、十六进制、关键字形式，默认为rgba(180,180,180,1),

    lineColor:线条的颜色，只接受rgba形式，默认为rgba(180,180,180,1),

    circleMovemaxX:圆点每次X轴移动最大的距离，整数为向右移动，负数为向左移动，默认为2,

    circleMoveminX:圆点每次X轴移动最小的距离，整数为向右移动，负数为向左移动，默认为-2,

    circleMovemaxY:圆点每次Y轴移动最大的距离，整数为向下移动，负数为向上移动，默认为2,

    circleMoveminY:圆点每次Y轴移动最小的距离，整数为向下移动，负数为向上移动，默认为-2,

    canvasWidth:canvas背景的宽度，默认为整个窗口可视区宽度,

    canvasHeight:canvas背景的高度，默认为整个窗口可视区高度,
}
```
使用方法，原生js与jQuery版一致，引入js文件，直接实例化即可，有参数即传入参数，无参数时，记得设置canvas外围盒子的id为canvas-container，如：
```
var bg=new HopeLog.background();
```
有参数版本：
```
(function(HopeLog){
    var bg=new HopeLog.background({
	circleColor:"rgba(225,226,226,0.8)",
    	lineColor:"rgba(225,226,226,1)",
        circleNum:45,
    	canvasOpacity:0.8,
	});
})(HopeLog)

```
组件使用实例：
[http://ce.sysu.edu.cn/user/login.aspx](http://ce.sysu.edu.cn/user/login.aspx)

[http://ce.sysu.edu.cn/admin/login.aspx](http://ce.sysu.edu.cn/admin/login.aspx)

[http://ce.sysu.edu.cn/hope/user/login.aspx](http://ce.sysu.edu.cn/hope/user/login.aspx)

[http://ce.sysu.edu.cn/hope/admin/login.aspx](http://ce.sysu.edu.cn/hope/admin/login.aspx)