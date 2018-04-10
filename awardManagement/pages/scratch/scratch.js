import Scratch from "../../../utils/scratch.js"
var app = getApp()
Page({
  data:{
    isShowBtn:false,//点我刮奖显示与隐藏
    scratchInfo:{},//获取活动信息
    scratchTimes:'',//剩余次数
    scratchId:'',//活动号
    winnerList:[],//获奖名单信息
    isPrizeSick:false,//中奖纪录弹窗显示与隐藏
    isIntel:false,//兑奖次数弹窗显示
    myPrize:[],//中奖记录
    intelMes:{},//兑换信息
    inputValue:'',//兑换次数
    isFail:true,//显示未中奖
    isPrize:true,//显示中奖
    isComfort:true,//显示安慰奖
    hideCanvas:false,
    isDegree:false,
    isDurMax:false,
    scratchPrizeTitle:'',//中奖名称
    animationData : {},
    animationData2: {},
    isScroll : true,//刮刮乐当在 canvas 中移动时且有绑定手势事件时禁止屏幕滚动以及下拉刷新
    isPlay:false,
    isLimit:false,
    time_limit:'',
    isRoll:true,
    scratchStatus:''
  },

  onLoad:function(options){
    let that=this;
    let systemInfo = app.globalData.systemInfo;
    let width = 558 * systemInfo.windowWidth / 750;
    let height = 258 * systemInfo.windowWidth / 750;

    that.scratch = new Scratch(that,{
      canvasWidth: width,
      canvasHeight: height,
      imageResource: app.getSiteBaseUrl()+'/index.php?r=Download/DownloadResourceFromUrl&url='+app.getCdnUrl()+'/static/webapp/images/scratchMovie.png',
      maskColor: "red",
      r: 18,
      callback: () => {
        that.setData({
          hideCanvas:true
        })
      },
      imgLoadCallback: () =>{
        setTimeout(function() {
          that.setData({
            isShowBtn: true
          });
        }, 10);
      }
    })

    if (app.isLogin()) {
      that.getScratchData();
    } else {
      app.goLogin({
        success: function () {
          that.getScratchData();
        }
      });
    }

    this.animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'step-start'
    });
    this.animation2 = wx.createAnimation({
      duration: 0,
      timingFunction: 'step-start'
    });
  },
  startScratch:function(){
  //开始刮奖
  let that=this;
  if (!that.data.scratchId) {
      return;
  }
  
  if (that.data.time_limit==0){
    that.setData({
      isLimit: true,
      hideCanvas: true,
      isShowBtn: false
    })
  }else{
    if (that.data.scratchTimes<=0){
      if (that.data.scratchInfo.time_share == 0){
        that.setData({
          isDegree: true,
          hideCanvas: true,
          isShowBtn: false
        })
      }else{
        that.setData({
          isDurMax: true,
          hideCanvas: true,
          isShowBtn: false
        })
      }
      
    }else{
      if (that.scratchLoading) {
        return false;
      }
      that.setData({
        isShowBtn: false
      })
      that.scratchLoading = true;
      that.getLottery();
      
    }
  }
  
  },
  getScratchData:function(){
    //获取活动信息
    let that=this;
    app.sendRequest({
      url:"/index.php?r=appLotteryActivity/getActivity",
      method:"post",
      data: { category:3},
      success:function(res){
        let mes = res.data;
        mes.description = mes.description.replace(/\\n/g, '\n');
        that.setData({
          scratchInfo: mes,
          scratchTimes: mes.times,
          scratchId:mes.id,
          time_limit: mes.time_limit
        })
        //改变页面标题
        wx.setNavigationBarTitle({
          title: mes.title
        });
        that.audioCtx = wx.createAudioContext('scratchAudio');
        if (mes.bgm != 0) {
          that.audioCtx.play();
        } else {
          that.audioCtx.pause();
        }
        that.getWinnerList(mes.id);
      }
    })
  },
  scratchLoading:false,
  getLottery:function(){
    //获取奖品参数
    let that=this;
    
    app.sendRequest({
      url:"/index.php?r=appLotteryActivity/lottery",
      method:"post",
      hideLoading:true,
      data:{
        activity_id: that.data.scratchId,
        app_id: app.globalData.appId
      },
      success:function(res){
        let data=res.data,
        newData={};
        that.scratch.start();
        if(data.title=="谢谢参与"){
          newData={};
          newData['isFail']=false;
          newData['scratchTimes'] = data.time;
          newData['time_limit'] = data.time_limit;
          that.setData(newData);
          
        }else{
          newData={};
          if (data.is_comfort==1){
            newData['isComfort']=false;
          }else{
            newData['isPrize'] = false;
            newData['scratchPrizeTitle'] = data.title;
          }
          newData['scratchTimes'] = data.time;
          newData['time_limit'] = data.time_limit;
          that.setData(newData);
          that.getWinnerList(that.data.scratchId)
        }
        that.scratchLoading = false;
      },
      successStatusAbnormal:function(res){
        that.scratchLoading = false;
       if(res.status==1){
         that.setData({
           isShowBtn:true
         })
       }
      }
    })
  },
  getWinnerList: function (id) {
    let that = this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getWinnerList",
      method: "post",
      hideLoading: true,
      data: {
        activity_id: id
      },
      success: function (res) {
        let winHeight=(res.count)*44;

        that.setData({
          winnerList: res.data
        });

        that.animationTop(winHeight , true);
      }
    })
  },
  animation : '',
  animation2: '',
  animationTop : function( h , isreset){
    var that = this;

    clearTimeout(that.timeer);
    clearTimeout(that.timeer2);

    if(isreset){
      that.animation.top('190rpx').step({ duration: 0, timingFunction: 'step-start'});
      that.animation2.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
      that.setData({
        animationData: that.animation.export(),
        animationData2: that.animation2.export()
      });
      setTimeout(function(){
        that.animation.top('-' + h + 'rpx').step({ duration: 15000, timingFunction: 'linear' });
        that.setData({
          animationData: that.animation.export()
        });
        that.animationTopCopy(h, isreset);
      }, 50)
    }else{
      that.timeer = setTimeout(function(){
        that.animation.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
        that.setData({
          animationData: that.animation.export()
        });
      }, 200 / (h + 200) * 15000);
      that.timeer2 = setTimeout(function(){
        that.animation.top('-' + h + 'rpx').step({ duration: 15000, timingFunction: 'linear' });
        that.setData({
          animationData: that.animation.export()
        })
        that.animationTopCopy(h);
      }, h / (h + 200) * 15000 );
    }
  },
  animationTopCopy: function (h, isreset) {
    var that = this;

    clearTimeout(that.timeer3);
    clearTimeout(that.timeer4);

    if (!isreset){
      that.timeer3 = setTimeout(function () {
        that.animation2.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
        that.setData({
          animationData2: that.animation2.export()
        });
      }, 200 / (h + 200) * 15000);
    }

    that.timeer4  = setTimeout(function () {
      that.animation2.top('-' + h + 'rpx').step({ duration: 15000, timingFunction: 'linear' });
      that.setData({
        animationData2: that.animation2.export()
      });
      that.animationTop(h);
    }, h / (h + 200) * 15000);
  },
  playMusics: function () {
    //播放和暂停切换
    if (this.data.isPlay) {
      this.audioCtx.pause();
    } else {
      this.audioCtx.play();
    }
  },
  audioPlay: function () {
    //监听播放
    this.setData({
      isPlay: true
    });
  },
  audioPause: function () {
    //监听暂停
    this.setData({
      isPlay: false
    });
  },
  lookPrize:function(){
    //点击查看奖品
    let that=this;
    if (that.data.scratchId){
      that.setData({
        isPrizeSick: true,
        hideCanvas: true,
        isShowBtn: false,
        isRoll: false
      })
      that.getMyPrize();
    }
    
  },
  wrapPrize:function(){
    //关闭中奖记录弹窗
    var that = this;
    this.scratch.reset();
    this.setData({
      isPrizeSick: false,
      hideCanvas:false,
      isRoll:true
    });
    setTimeout(function(){
      that.setData({
        isShowBtn: true
      });
    }, 100);
  },
  //阻止事件冒泡
  stopPropagation() {

  },
  intelClick:function(){
    //点击积分兑换
    if (this.data.scratchId){
      this.setData({
         isIntel: true,
        hideCanvas: true,
        isShowBtn: false
      })
      this.getMyIntegral();
    }
    
  },
  intelClose:function(){
    //关闭积分兑换次数弹窗
    var that = this;
    this.scratch.reset();
    this.setData({
      isIntel: false,
      hideCanvas: false,
      isFail: true,//显示未中奖
      isPrize: true,//显示中奖
      isComfort: true,//显示安慰奖
    });
    setTimeout(function () {
      that.setData({
        isShowBtn: true
      });
    }, 50);
  },
  failBtnClick:function(){
    //未中奖再来一次
    let that=this;
    that.scratch.reset();
    that.setData({
      hideCanvas:false,
      isFail:true
    });
    setTimeout(function () {
      that.setData({
        isShowBtn: true
      });
    }, 100);
  },
  winningBtnClick:function(){
    //中奖之后再来一次
    let that=this;
    that.scratch.reset();
    that.setData({
      hideCanvas: false,
      isPrize: true
    });
    setTimeout(function () {
      that.setData({
        isShowBtn: true
      });
    }, 100);
  },
  comfortBtnClick:function(){
    //安慰奖点击知道了
    let that=this;
    that.scratch.reset();
    that.setData({
      hideCanvas: false,
      isComfort: true
    });
    setTimeout(function () {
      that.setData({
        isShowBtn: true
      });
    }, 100);
  },
  bindReplaceInput: function (e) {
    //获取input框的值
    this.setData({
      inputValue: e.detail.value
    })
  },
  intelConfirm:function(){
    //确认兑换
    let that=this;
    if (that.data.scratchId){
      that.getIntegralTime();
      
      
    }
  },
  scratchInteAll:function(){
    let that=this;
    that.setData({
      inputValue: that.data.intelMes.exchange_times
    })
  },
  getMyPrize: function () {
    //获取奖品记录
    let that = this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getMyPrize",
      method: "post",
      hideLoading:true,
      data: {
        activity_id: that.data.scratchId
      },
      success: function (res) {
        that.setData({
          myPrize: res.data
        })
      }
    })
  },
  //兑换次数信息
  getMyIntegral: function () {
    let that = this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getMyIntegralExchangeTimes",
      method: "post",
      data: {
        activity_id: that.data.scratchId,
      },
      success: function (res) {
        that.setData({
          intelMes: res.data
        })
      }
    })
  },
  getIntegralTime: function () {
    //确认兑换
    let that = this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getTime",
      method: "post",
      data: {
        app_id: app.globalData.appId,
        activity_id: that.data.scratchId,
        type: "integral",
        times: that.data.inputValue
      },
      success: function (res) {
        that.scratch.reset();
        that.setData({
          scratchTimes: res.data,
          isIntel: false,
          inputValue: '',
          hideCanvas: false,
          isDurMax: false,
          isDegree: false,
        })
        setTimeout(function () {
          that.setData({
            isShowBtn: true
          });
        }, 200);
      }
    })
  },
  shareClick: function () {
    let that = this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getTime",
      method: "post",
      data: {
        app_id: app.globalData.appId,
        activity_id: that.data.scratchId,
        type: 'share'
      },
      success: function (res) {
        that.scratch.reset();
        that.setData({
          scratchTimes: res.data, //抽奖机会次数 
          hideCanvas:false,
          isDurMax:false,
          isPrize:true,
          isFail:true,
          isComfort:true
        })
        setTimeout(function(){
          that.setData({
            isShowBtn:true
          })
        },150)
      }
    })
  },
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: that.data.scratchInfo.title,
      path: '/awardManagement/pages/scratch/scratch?id=' + that.data.scratchId,
      success: function (res) {
        // 转发成功
        
        that.shareClick();
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})