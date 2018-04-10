
var app = getApp()
Page({
  data:{
    activityId:'',
    activityData:{},   //
    winnerList:[],    //中奖名单
    recordSick:0 ,   //我的奖品弹窗是否显示
    animationData:{},    //圆盘动画
    awardsList: {}, //奖项列表
    opportunities:'', //抽奖机会次数
    text: "Page animation",
    congratulation:0,//中奖弹窗是否显示
    prizeTitle:'',//奖品名称
    prizeFail:0,  //未中奖弹窗是否显示
    colorAwardDefault: '#FE7F3A',//奖品默认颜色  
    colorAwardSelect: 'rgba(255,113,0,.5)',//奖品选中颜色  
    indexSelect: '',//被选中的奖品index  
    isRunning: false,//是否正在抽奖  
    runDegs : 0 ,
    duraMax:0,//抽奖次数弹窗是否显示
    comfort:0,//安慰奖弹窗
    // src:"http://testfe.zhichiwangluo.com/static/webapp/audio/gameStart.mp3",
    isPlay : false,
    isExchange:0,//兑换次数弹窗
    exchangeMessage:{},  //兑换次数数据
    chanageMes:'',
    inputValue:'',
    isdegree:0 , //次数用尽不可分享好有弹窗
    RecordSickArr:[],
    winListData:{},
    winListData2:{}
  },
  onLoad:function(options){
    let that=this;
    let id = that.data.activityData.id
    if (app.isLogin()){
      that.dataInitial()
      
      
    }else{
      app.goLogin({
        success: function () {
          that.dataInitial()
          
        }
      });
    }
    this.animation = wx.createAnimation({
      duration:0,
      timingFunction:'step-start'
    });
    this.animation2 = wx.createAnimation({
      duration:0,
      timingFunction:'step-start'
    });
    
  },
  getWinnerList:function(id){
    var that=this;
    //获取中奖名单
   app.sendRequest({
     url:"/index.php?r=appLotteryActivity/getWinnerList",
     method:"post",
     data:{
       activity_id:id
     },
     success:function(res){
       let winHeight = (res.count) * 44;
      that.setData({
        winnerList:res.data
      })
      that.animationTop(winHeight,true);
     }
   })
  },
  animation:'',
  animation2:'',
  animationTop: function (h, isreset) {
    var that = this;

    clearTimeout(that.timeer);
    clearTimeout(that.timeer2);

    if (isreset) {
      that.animation.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
      that.animation2.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
      that.setData({
        winListData: that.animation.export(),
        winListData2: that.animation2.export()
      });
      setTimeout(function () {
        that.animation.top('-' + h + 'rpx').step({ duration: 15000, timingFunction: 'linear' });
        that.setData({
          winListData: that.animation.export()
        });
        that.animationTopCopy(h, isreset);
      }, 50)
    } else {
      that.timeer = setTimeout(function () {
        that.animation.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
        that.setData({
          winListData: that.animation.export()
        });
      }, 200 / (h + 200) * 15000);
      that.timeer2 = setTimeout(function () {
        that.animation.top('-' + h + 'rpx').step({ duration: 15000, timingFunction: 'linear' });
        that.setData({
          winListData: that.animation.export()
        })
        that.animationTopCopy(h);
      }, h / (h + 200) * 15000);
    }
  },
  animationTopCopy: function (h, isreset) {
    var that = this;

    clearTimeout(that.timeer3);
    clearTimeout(that.timeer4);

    if (!isreset) {
      that.timeer3 = setTimeout(function () {
        that.animation2.top('190rpx').step({ duration: 0, timingFunction: 'step-start' });
        that.setData({
          winListData2: that.animation2.export()
        });
      }, 200 / (h + 200) * 15000);
    }

    that.timeer4 = setTimeout(function () {
      that.animation2.top('-' + h + 'rpx').step({ duration: 15000, timingFunction: 'linear' });
      that.setData({
        winListData2: that.animation2.export()
      });
      that.animationTop(h);
    }, h / (h + 200) * 15000);
  },
  clickpagePrize:function(){
    //点击我的奖品
    let that=this;
    that.setData({recordSick:1 })
    that.getMyPrize();
  },
  clickRecordSick:function(e){
     this.setData({recordSick: 0 })
  },
  stopPropagation(){

  },
  confirmClick:function(){
    //关闭中奖弹窗
    this.setData({ congratulation: 0})
  },
  dataInitial:function(){
    // 初始化大转盘信息
    var that=this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getActivity",
      method: "post",
      data: { category:0 },
      success: function (res) {
        var mes = res.data
        that.audioCtx = wx.createAudioContext('luckyAudio');
        if(mes.bgm!=0){
          that.audioCtx.play();
        }else{
          that.audioCtx.pause();
        }
        mes.description = mes.description.replace(/\\n/g , '\n');
        that.setData({
          'activityData': mes,
          opportunities: mes.times
        })
        //改变页面标题
        wx.setNavigationBarTitle({
          title: res.data.title
        });
        that.getWinnerList(that.data.activityData.id);
      }
    })
  },
  //圆盘抽奖
  getLottery: function (winId) {
    let  that = this;
    // 获取奖品配置
    let awardsConfig = that.data.activityData.turntable;
    let runNum = 8;
    let awardIndex = that.drawClick(winId.turntable_id);

    // 旋转抽奖
    let runDegs = that.data.runDegs ;
    console.log('deg', runDegs)
    runDegs = (runDegs - runDegs % 360) + (360 * runNum - awardIndex * (360 / 8) - 22.5);
    console.log('deg', runDegs)

    var animationRun = wx.createAnimation({
      duration: 4000,
      timingFunction: 'ease'
    })
    that.animationRun = animationRun
    animationRun.rotate(runDegs).step()
    that.setData({
      animationData: animationRun.export(),
      opportunities: that.data.opportunities - 1 ,
      runDegs: runDegs
    })
    // 中奖提示
    setTimeout(function () {
      
      let title = awardsConfig[awardIndex].prize_title;
      if (winId.is_comfort==1){
        that.setData({
          comfort: 1,
          isRunning: false
        })
        that.getWinnerList(that.data.activityData.id);
      }else{
        if (title == "谢谢参与") {
          that.setData({
            prizeFail: 1,
            isRunning: false
          })
        } else {
          that.setData({
            congratulation: 1,
            prize_title: title,
            isRunning: false
          })
          that.getWinnerList(that.data.activityData.id);
        }
      }
      
    }, 5000);
    
  },
  notwinningClick:function(){
    //关闭未中奖弹窗
    this.setData({
      prizeFail:0
    })
  },
  tipClick:function(){
    //抽奖之后请求后台接口
    let that = this;
    if (!that.data.activityData.id){
      return;
    }
    if (that.data.opportunities <=0) {
      if (that.data.activityData.time_share==0){
        that.setData({
          isdegree:1
        })
      }else{
        that.setData({
          duraMax: 1
        })
      }
      
      return;
    }
    if (that.data.isRunning){
      return ;
    }
    
    that.setData({
      isRunning : true
    });

    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/lottery",
      method: "post",
      data: {
        app_id: app.globalData.appId,
        activity_id: that.data.activityData.id
      },
      success: function (res) {
        
        
        if (that.data.activityData.category == 0){
          that.getLottery(res.data);
        }else{
          that.startGame(res.data);
        }
      },
      successStatusAbnormal : function(){
        that.setData({
          isRunning: false
        });
      }
    })
  },
  //方盘抽奖
  startGame: function (winId) {
    var _this = this;
    var indexSelect = _this.data.indexSelect;
    var i = 0;
    var num = _this.drawClick(winId.turntable_id) + 24 - indexSelect;
    _this.setData({
      opportunities: _this.data.opportunities - 1,
    })
    var timer = setInterval(function () {
      indexSelect++;
      
      i += 1;
      if (i > num) {
        //去除循环  
        clearInterval(timer)
        //获奖提示  
        if (winId.is_comfort==1){
          _this.setData({
            comfort: 1,
            isRunning: false
          })
          _this.getWinnerList(_this.data.activityData.id);
        }else{
          if (_this.data.activityData.turntable[_this.data.indexSelect].prize_title == '谢谢参与') {
            _this.setData({
              prizeFail: 1,
              isRunning: false
            })
          } else {
            _this.setData({
              congratulation: 1,
              prize_title: _this.data.activityData.turntable[_this.data.indexSelect].prize_title,
              isRunning: false
            })
            _this.getWinnerList(_this.data.activityData.id);
          }
        }
        
        return ;
      }
      indexSelect = indexSelect % 8;
      _this.setData({
        indexSelect: indexSelect
      })
    }, 100)
    
  },
  drawClick : function(winId){
    let that = this,
        list = that.data.activityData.turntable,
        idx = 0;

    for(let i = 0 ; i < list.length ; i++){
      if (list[i].id == winId){
        idx = i;
      }
    }

    return idx;
  },
  shareClick:function(){
    let that=this;
    app.sendRequest({
      url:"/index.php?r=appLotteryActivity/getTime",
      method:"post",
      data:{
        app_id: app.globalData.appId,
        activity_id: that.data.activityData.id,
        type: 'share'
      },
      success:function(res){
        console.log(res)
        that.setData({
          opportunities: res.data, //抽奖机会次数          
        })
      }
    })
    
  },
  playMusics:function(){
    //播放和暂停切换
    if (this.data.isPlay){
      this.audioCtx.pause();
    }else{
      this.audioCtx.play();
    }
  },
  audioPlay : function(){
    //监听播放
    this.setData({
      isPlay : true
    });
  },
  audioPause: function () {
    //监听暂停
    this.setData({
      isPlay: false
    });
  },
  onShareAppMessage: function (res) {
    var that=this;
    return {
      title: that.data.activityData.title,
      path: '/awardManagement/pages/luckyWheelDetail/luckyWheelDetail?id=' + this.data.activityId,
      success: function (res) {
        // 转发成功
        that.setData({
          prizeFail:0,
          duraMax:0,
          congratulation:0
        })
        that.shareClick();
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //
  sureClick:function(){
    this.setData({
      duraMax:0
    })
  },
  //关闭安慰奖弹窗
  comfortClick:function(){
    this.setData({
      comfort:0
    })
  },
  //关闭兑换次数弹窗
  exchangeCancel:function(){
   this.setData({
     isExchange:0
   })
  },
  //点击积分兑换按钮
  exchangePrize:function(){
    let that=this;
   that.setData({
     isExchange: 1
   })
   that.getMyIntegral()
  },
  //兑换次数信息
  getMyIntegral:function(){
    let that=this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getMyIntegralExchangeTimes",
      method: "post",
      data: {
        activity_id: that.data.activityData.id,
      },
      success:function(res){
       that.setData({
         exchangeMessage:res.data
       })
      }
    })
  },
  degreeClick:function(){
   //关闭次数用尽不可分享好友
   this.setData({
     isdegree:0
   })
  },
  //全部替换
  exchangeAll:function(){
    let that=this;
   that.setData({
     inputValue: that.data.exchangeMessage.exchange_times
   })
  },
  //获取input框的value值
  bindReplaceInput:function(e){
   this.setData({
     inputValue:e.detail.value
   })
  },
  //点击确定兑换次数
  exchangeConfirm:function(){
   let that=this;
   that.getTime()
  },
 //点击积分兑换获取次数
  getTime:function(){
    let that=this;
    app.sendRequest({
      url:"/index.php?r=appLotteryActivity/getTime",
      method:"post",
      data:{
        app_id: app.globalData.appId,
        activity_id: that.data.activityData.id,
        type:"integral",
        times: that.data.inputValue
      },
      success:function(res){
       that.setData({
         opportunities: res.data, //抽奖机会次数 
         isExchange:0 ,
         inputValue:''                 
       })
      }
    })
  },
  //查看奖品
  getMyPrize:function(){
    let that=this;
    app.sendRequest({
      url:"/index.php?r=appLotteryActivity/getMyPrize",
      method:"post",
      data:{
        activity_id: that.data.activityData.id
      },
      success:function(res){
        that.setData({
          RecordSickArr:res.data
        })
      }
    })
  }
})