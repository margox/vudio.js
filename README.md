# vudio.js
### 一个简单的音频可视化模块
------
#### 概述：
- 支持诸多样式调整
- 动画效果基于Canvas和requestAnimationFrame，丝般顺滑
- 仅供娱乐，开心就好

#### 使用方法

```javascript
var vudio = new Vudio(HTMLAudioElement, HTMLCanvasElement, [option]);
vudio.dance();
```
以上，第一个和第二个参数是必填项，第三个用于显示效果的个性化配置,具体情况看下方示例

#### 示例
在你的HTML文件中放入canvas和audio标签
```html
<canvas width="256px" height="100px" id="canvas"></canvas>
<audio src="./path/to/audio.mp3" controls id="audio"></audio>
```
引入Vudio.js
```html
<script src="path/to/vudio.js"></script>
```
> 注意：模块已经过UMD包装哦

开始搅基
```javascript
var audioObj = document.quertSelector('#audio');
var canvasObj = document.quertSelector('#canvas');
var vudio = new Vudio(audioObj, canvasObj, {
    effect : 'waveform', // 当前只有'waveform'这一个效果，哈哈哈
    bandwidth : 256, // 频谱数组的长度
    waveform : {
        maxHeight : 100, // 波形最大高度
        minHeight : 1, // 波形最小高度
        color : '#f00', // 波形颜色
        width : 2, // 单条宽度
        shadowBlur : 0, // 阴影范围
        shadowColor : '#f00', // 阴影颜色
        fadeSide : true, // 渐隐两端
        symmetry : true  // 显示对称波形
    }
});
// 调用dance方法
vudio.dance();
// 另外还有.pause()方法来暂停可视化效果
```

在线示例: https://margox.me/demo/vudiojs