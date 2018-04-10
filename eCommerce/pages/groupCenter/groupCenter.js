var appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },
  isMore:1,
  page:1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    appInstance.sendRequest({
      url: '/index.php?r=AppGroupBuy/GetGroupBuyGoodsList',
      data: {
        page:_this.page,
        page_size:5,
        current_status: 0
      },
      success: function(data){
        //console.log(data);
        _this.setData({list:data.data});
        _this.page++;
      }
    })
  },

  turnToGoodsDetail:function(e){
    let id = e.currentTarget.dataset.id;
    appInstance.turnToPage('/pages/groupGoodsDetail/groupGoodsDetail?detail=' + id);
  },

  getMore:function(){
    let _this = this;
    appInstance.sendRequest({
      url: '/index.php?r=AppGroupBuy/GetGroupBuyGoodsList',
      data: {
        page: _this.page,
        page_size: 5,
        current_status: 0
      },
      success: function (data) {
        //console.log(data);
        if(_this.isMore === 0){return;};
        let list = _this.data.list.concat(data.data);
        _this.setData({ list: list });
        _this.page++;
        _this.isMore = data.is_more;
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMore();
  }

})
