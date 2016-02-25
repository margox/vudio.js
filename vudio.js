/**
 * Web音频数据可视化模块
 * @author Margox
 * @version 0.0.1
 */

 (function(factory){

    /*
     * 添加UMD支持
     */
    var root = root || window;

    if (typeof exports === 'object') {
         module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
         define(factory);
    } else if (root) {
         root.Vudio = factory();
    }

 })(function() {

    'use strict';

    // 默认参数
    var __default_option = {
        effect : 'waveform', // 当前只有'waveform'这一个效果，哈哈哈
        bandwidth : 256, // 频谱数组的长度
        waveform : {
            maxHeight : 100,
            minHeight : 1,
            color : '#f00',
            width : 2,
            shadowBlur : true,
            shadowColor : '#f00',
            fadeSide : true,
            symmetry : true
        }
    }

    /**
     * 构造函数
     * @param {object} audioElement HTMLAudioElement
     * @param {object} canvasElement HTMLCanvasElement
     * @param {object} option 可选配置参数
     */
    function Vudio(audioElement, canvasElement, option) {

        if (Object.prototype.toString.call(audioElement) !== '[object HTMLAudioElement]') {
            throw new TypeError('Invaild Audio Element');
        }

        if (Object.prototype.toString.call(canvasElement) !== '[object HTMLCanvasElement]') {
            throw new TypeError('Invaild Canvas Element');
        }

        this.audioEle = audioElement;
        this.canvasEle = canvasElement;
        this.option = __mergeOption(__default_option, option);

        this.stat = 0;
        this.freqByteData = null;

        this.__init();

    }

    // private functions
    function __mergeOption() {

        var __result = {}

        Array.prototype.forEach.call(arguments, function(argument) {

            var __prop;
            var __value;

            for (__prop in argument) {
                if (Object.prototype.hasOwnProperty.call(argument, __prop)) {
                    if (Object.prototype.toString.call(argument[__prop]) === '[object Object]') {
                        __result[__prop] = __mergeOption(__result[__prop], argument[__prop]);
                    } else {
                        __result[__prop] = argument[__prop];
                    }
                }
            }

        });

        return __result;

    }

    Vudio.prototype = {

        __init : function() {

            var audioContext = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext),
                source = audioContext.createMediaElementSource(this.audioEle),
                dpr = window.devicePixelRatio || 1;

            this.analyser = audioContext.createAnalyser(),

            source.connect(this.analyser);
            this.analyser.fftSize = this.option.bandwidth * 2;
            this.analyser.connect(audioContext.destination);

            this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
            this.context2d = this.canvasEle.getContext('2d');
            this.width = this.canvasEle.width;
            this.height = this.canvasEle.height;

            // ready for HD screen
            this.context2d.canvas.width = this.width * dpr;
            this.context2d.canvas.height = this.height * dpr;
            this.context2d.scale(dpr, dpr);

        },

        __animate : function() {

            if (this.stat === 1) {
                this.analyser.getByteFrequencyData(this.freqByteData);
                (typeof this.__effects()[this.option.effect] === 'function') && this.__effects()[this.option.effect](this.freqByteData);
                requestAnimationFrame(this.__animate.bind(this));
            }

        },

        __testFrame : function() {
            this.analyser.getByteFrequencyData(this.freqByteData);
            (typeof this.__effects()[this.option.effect] === 'function') && this.__effects()[this.option.effect](this.freqByteData);
        },

        // 开始
        dance : function() {
            this.stat = 1;
            this.__animate();
        },

        // 暂停
        pause : function() {
            this.stat = 0;
        },

        // effect functions
        __effects : function() {

            var __that = this;

            return {

                waveform : function (freqByteData) {

                    var __top,
                        __freqByteData;

                    // rebuild freqByteData
                    if (__that.option.waveform.symmetry) {
                        __freqByteData = [].concat(
                            Array.from(freqByteData).reverse().splice(__that.option.bandwidth / 2, __that.option.bandwidth / 2),
                            Array.from(freqByteData).splice(0, __that.option.bandwidth / 2)
                        );
                    } else {
                        __freqByteData = freqByteData;
                        __that.option.waveform.fadeSide = false;
                    }
                    

                    // clear canvas
                    __that.context2d.clearRect(0, 0, __that.width, __that.height);

                    // draw waveform
                    __freqByteData.forEach(function(height, index){

                        var __option = __that.option.waveform,
                            __height,
                            __color,
                            __linearGradient,
                            __pos;

                        if (index % (__that.option.waveform.width + 1) !== 0) {
                            return;
                        }

                        __height = height / 256 * __option.maxHeight;
                        __height = __height < __option.minHeight ? __option.minHeight : __height;
                        __top = (__that.height - __height) / 2;
                        __color = __option.color;

                        if (__color instanceof Array) {

                            __linearGradient = __that.context2d.createLinearGradient(
                                index,
                                __top,
                                index,
                                __top + __height
                            );

                            __color.forEach(function(color, index) {
                                if (color instanceof Array) {
                                    __pos = color[0];
                                    color = color[1];
                                } else if (index === 0 || index === __color.length - 1) {
                                    __pos = index / (__color.length - 1);
                                } else {
                                    __pos =  index / __color.length + 0.5 / __color.length;
                                }
                                __linearGradient.addColorStop(__pos, color);
                            });

                            __that.context2d.fillStyle = __linearGradient;

                        } else {
                            __that.context2d.fillStyle = __color;
                        }

                        if (__option.shadowBlur > 0) {
                            __that.context2d.shadowBlur = __option.shadowBlur;
                            __that.context2d.shadowColor = __option.shadowColor;
                        }

                        if (__option.fadeSide) {
                            __that.context2d.globalAlpha = 1 - Math.abs((index - __that.option.bandwidth / 2)) / (__that.option.bandwidth / 2);
                        }

                        __that.context2d.fillRect(index, __top, __option.width, __height);

                    });

                }

            }

        }

    };

    return Vudio;

 });