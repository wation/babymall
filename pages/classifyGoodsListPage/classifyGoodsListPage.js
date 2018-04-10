var app = getApp();

Page({
  data: {
    classifyGroupForm: '',
    categoryId: '',
    classifyGoodsList: { 
      "type": "goods-list", 
      "style": "background-color:rgb(243, 243, 243);opacity:1;color:rgb(102, 102, 102);font-size:32.8125rpx;height:100vh;margin-left:auto;", "content": "", 
      "customFeature": { "lineBackgroundColor": "rgb(255, 255, 255)", "lineBackgroundImage": "", "margin": 0, "lineHeight": 75, "imgWidth": 60, "imgHeight": 60, "vesselAutoheight": 0, "height": "300px", "form": "goods", "mode": 0, "name": "\u5546\u54c1\u5217\u8868", "ifUseContact": true, "isIntegral": false, "isHideSales": false, "isHideStock": false, "isShoppingCart": false, "isBuyNow": false, "id": "list-323814140496" },
      "animations": [],
      "page_form": "",
      "compId": "goods_list1",
      "parentCompid": "goods_list1",
      "list_style": "background-color:rgb(255, 255, 255);height:75px;margin-left:auto;",
      "img_style": "width:140.625rpx;height:140.625rpx;margin-left:auto;",
      "title_width": { "width": "585.9375rpx" }
    }
  },
  goods_compids_params: [{ 
    "compid": "classifyGoodsList",
    "param": {
      "id": "list-323814140496",
      "form": "goods",
      "goods_type": 0,
      "page": 1,
      "is_count": 0,
      "is_integral": 0
    }
  }],
  requestNum: 2,
  onLoad: function (options) {
    this.setData({
      'classifyGroupForm': options.form,
      'categoryId': options.category_id
    });
    this.dataInitial();
  },
  dataInitial: function () {
    this.getClassifyGoodsListData(this.data.extensionId);
  },
  getClassifyGoodsListData: function () {
    let _this = this;
    let pageInstance = _this;
    let pageRequestNum = pageInstance.requestNum;
    let compid = 'classifyGoodsList';
    let param = {
      form: _this.data.classifyGroupForm,
      idx_arr: {
        idx: 'category',
        idx_value: _this.data.categoryId
      },
      page: 1
    };
    let newWaimaiData = {};
    newWaimaiData[compid + '.goodsDetailShow'] = false;
    newWaimaiData[compid + '.goodsModelShow'] = false;
    pageInstance.setData(newWaimaiData);
    if (param.form === 'takeout') {
      app.getLocation({
        success: function (res) {
          param.longitude = res.longitude;
          param.latitude = res.latitude;
          param.page = -1;
          pageInstance.requestNum = pageRequestNum + 1;
          app.sendRequest({
            hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
            url: '/index.php?r=AppShop/getTakeOutInfo',
            data: {},
            success: function (data) {
              let _data = pageInstance.data;
              let newdata = {};
              newdata[compid + '.takeoutInfo'] = data.data;
              newdata[compid + '.assessScore'] = (data.data.commont_stat.average_score).toFixed(2);
              newdata[compid + '.goodsScore'] = Math.round(data.data.commont_stat.score);
              newdata[compid + '.serviceScore'] = Math.round(data.data.commont_stat.logistic_score);
              if (!_data[compid].customFeature.showShopInfo) {
                newdata[compid + '.heightPx'] = app.getSystemInfoData().windowHeight - 86;
              } else {
                newdata[compid + '.heightPx'] = app.getSystemInfoData().windowHeight - 181;
              }
              pageInstance.setData(newdata)
            }
          });
          pageInstance.requestNum = pageRequestNum + 1;
          app.sendRequest({
            hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
            url: '/index.php?r=AppShop/GetGoodsList',
            data: param,
            method: 'post',
            success: function (res) {
              if (res.status == 0) {
                var data = pageInstance.data,
                  newdata = {},
                  categoryList = {},
                  takeoutGoodsListData = {},
                  takeoutGoodsModelData = {};
                for (let i in res.data) {
                  categoryList[i] = {};
                  for (let j in res.data[i]) {
                    let form_data = res.data[i][j].form_data
                    delete form_data.category;
                    delete form_data.category_id;
                    delete form_data.max_can_use_integral;
                    delete form_data.mass;
                    categoryList[i][form_data.id] = form_data;
                    takeoutGoodsModelData['goods' + form_data.id] = {};
                    takeoutGoodsListData['goods' + form_data.id] = {
                      totalNum: 0,
                      stock: form_data.stock,
                      goods_model: {},
                      name: form_data.title,
                      price: form_data.price
                    }
                    if (form_data.goods_model) {
                      let new_goods_model = {}
                      for (let i in form_data.goods_model) {
                        new_goods_model[form_data.goods_model[i].id] = {
                          model: form_data.goods_model[i].model,
                          stock: form_data.goods_model[i].stock,
                          price: form_data.goods_model[i].price,
                          goods_id: form_data.goods_model[i].goods_id,
                          totalNum: 0
                        }
                      }
                      takeoutGoodsModelData['goods' + form_data.id] = {
                        modelData: [],
                        name: form_data.title,
                        goods_model: new_goods_model
                      }
                      for (let k in form_data.model) {
                        takeoutGoodsModelData['goods' + form_data.id]['modelData'].push({
                          name: form_data.model[k].name,
                          subModelName: form_data.model[k].subModelName,
                          subModelId: form_data.model[k].subModelId
                        })
                      }
                    } else {
                      takeoutGoodsModelData['goods' + form_data.id][0] = {
                        price: form_data.price,
                        num: 0,
                        stock: form_data.stock,
                        price: form_data.price
                      }
                    }
                    if (pageInstance.data[compid].content[0].source == i) {
                      newdata[compid + '.show_goods_data'] = categoryList;
                      newdata[compid + '.goods_data_list'] = takeoutGoodsListData;
                      newdata[compid + '.goods_model_list'] = takeoutGoodsModelData;
                      pageInstance.setData(newdata);
                    }
                  }
                }

                newdata[compid + '.show_goods_data'] = categoryList;
                newdata[compid + '.goods_data_list'] = takeoutGoodsListData;
                newdata[compid + '.goods_model_list'] = takeoutGoodsModelData;
                pageInstance.setData(newdata);
                newdata[compid + '.in_distance'] = res.in_distance;
                newdata[compid + '.in_business_time'] = res.in_business_time;
                console.log(takeoutGoodsModelData);
                newdata[compid + '.waimaiTotalNum'] = 0;
                newdata[compid + '.waimaiTotalPrice'] = 0.00;
                newdata[compid + '.selected'] = 1;
                newdata[compid + '.is_more'] = res.is_more;
                newdata[compid + '.curpage'] = 1;
                newdata[compid + '.modelChoose'] = [];
                pageInstance.setData(newdata);
                app.sendRequest({
                  hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
                  url: '/index.php?r=AppShop/cartList',
                  data: { page: -1, sub_shop_app_id: '', parent_shop_app_id: '' },
                  success: function (cartlist) {
                    // 遍历购物车列表
                    var totalNum = 0, totalPrice = 0.00, newdata = {};
                    newdata[compid + '.cartList'] = {};
                    for (var i = 0; i < cartlist.data.length; i++) {
                      let item = cartlist.data[i];
                      // 遍历商品
                      if (item.goods_type == 2 && data[compid].goods_data_list['goods' + item.goods_id]) {
                        newdata[compid + '.goods_data_list.goods' + item.goods_id] = data[compid].goods_data_list['goods' + item.goods_id]
                        newdata[compid + '.goods_data_list.goods' + item.goods_id].totalNum = +newdata[compid + '.goods_data_list.goods' + item.goods_id].totalNum + +item.num;
                        newdata[compid + '.cartList.goods' + item.goods_id] = {};
                        newdata[compid + '.cartList.goods' + item.goods_id][item.model_id] = {
                          modelName: item.model_value ? item.model_value.join(' | ') : '',
                          modelId: item.model_id,
                          num: +item.num,
                          price: +item.price,
                          gooodsName: item.title,
                          totalPrice: Number(item.num * item.price).toFixed(2),
                          stock: item.stock,
                          cart_id: item.id
                        }
                        newdata[compid + '.goods_model_list.goods' + item.goods_id] = data[compid].goods_model_list['goods' + item.goods_id];
                        if (newdata[compid + '.goods_model_list.goods' + item.goods_id].goods_model) {
                          newdata[compid + '.goods_model_list.goods' + item.goods_id].goods_model[item.model_id].totalNum = +item.num
                        } else {
                          newdata[compid + '.goods_model_list.goods' + item.goods_id][0].num = +item.num
                        }
                        totalNum += Number(item.num);
                        totalPrice += Number(item.price) * item.num;
                      }
                    }
                    newdata[compid + '.waimaiTotalNum'] = totalNum;
                    newdata[compid + '.waimaiTotalPrice'] = totalPrice.toFixed(2);
                    newdata[compid + '.goods_data'] = res.data;
                    pageInstance.setData(newdata);
                  }
                })
              }
            }
          });
          pageInstance.requestNum = pageRequestNum + 1;
          app.sendRequest({
            hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
            url: '/index.php?r=AppShop/getAssessList&idx_arr[idx]=goods_type&idx_arr[idx_value]=2',
            data: { page: 1, page_size: 10, obj_name: 'app_id' },
            success: function (res) {
              let newdata = pageInstance.data,
                showAssess = [],
                hasImgAssessList = 0,
                goodAssess = 0,
                normalAssess = 0,
                badAssess = 0;
              for (var i = 0; i < res.data.length; i++) {
                res.data[i].assess_info.has_img == 1 ? (hasImgAssessList++ , showAssess.push(res.data[i])) : null;
                res.data[i].assess_info.level == 3 ? goodAssess++ : (res.data[i].assess_info.level == 1 ? badAssess++ : normalAssess++)
              }
              for (let j = 0; j < res.num.length; j++) {
                res.num[j] = parseInt(res.num[j])
              }
              newdata[compid].assessActive = 0;
              newdata[compid].assessList = res.data;
              newdata[compid].showAssess = showAssess;
              newdata[compid].assessNum = res.num;
              newdata[compid].moreAssess = res.is_more;
              newdata[compid].assessCurrentPage = res.current_page;
              pageInstance.setData(newdata);
            }
          })
        }
      });
    } else if (param.form === 'tostore') {
      app.getTostoreCartList();
      pageInstance.requestNum = pageRequestNum + 1;
      app.sendRequest({
        hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
        url: '/index.php?r=AppShop/GetGoodsList',
        data: param,
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            let newdata = {};
            var arr = [];
            for (var i = 0; i < res.data.length; i++) {
              var data = res.data[i],
                maxMinArr = [],
                pri = '';
              if (data.form_data.goods_model && (data.form_data.goods_model.length >= 2)) {
                for (var j = 0; j < data.form_data.goods_model.length; j++) {
                  maxMinArr.push(data.form_data.goods_model[j].price);
                }
                if (Math.min.apply(null, maxMinArr) != Math.max.apply(null, maxMinArr)) {
                  pri = Math.min.apply(null, maxMinArr).toFixed(2) + '-' + Math.max.apply(null, maxMinArr).toFixed(2);
                  data.form_data.price = pri;
                }
              }
              arr.push(data);
            }
            if (app.getHomepageRouter() == pageInstance.page_router) {
              var second = new Date().getMinutes().toString();
              if (second.length <= 1) {
                second = '0' + second;
              }
              var currentTime = new Date().getHours().toString() + second,
                showFlag = true,
                showTime = '';

              pageInstance.requestNum = pageRequestNum + 1;
              app.sendRequest({
                hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
                url: '/index.php?r=AppShop/getBusinessTime',
                method: 'post',
                data: {
                  app_id: app.getAppId()
                },
                success: function (res) {
                  var businessTime = res.data.business_time;
                  if (businessTime) {
                    for (var i = 0; i < businessTime.length; i++) {
                      showTime += businessTime[i].start_time.substring(0, 2) + ':' + businessTime[i].start_time.substring(2, 4) + '-' + businessTime[i].end_time.substring(0, 2) + ':' + businessTime[i].end_time.substring(2, 4) + ' / ';
                      if (+currentTime > +businessTime[i].start_time && +currentTime < +businessTime[i].end_time) {
                        showFlag = false;
                      }
                    }
                    if (showFlag) {
                      showTime = showTime.substring(0, showTime.length - 2);
                      app.showModal({
                        content: '店铺休息中,暂时无法接单。营业时间为：' + showTime
                      })
                    }
                  }
                }
              });
            }
            newdata[compid + '.goods_data'] = arr;
            newdata[compid + '.is_more'] = res.is_more;
            newdata[compid + '.curpage'] = 1;
            pageInstance.setData(newdata);
          }
        }
      });
    } else {
      pageInstance.requestNum = pageRequestNum + 1;
      app.sendRequest({
        hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
        url: '/index.php?r=AppData/getFormDataList',
        data: param,
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            let newdata = {};
            newdata[compid + '.goods_data'] = res.data;
            newdata[compid + '.is_more'] = res.is_more;
            newdata[compid + '.curpage'] = 1;
            pageInstance.setData(newdata);
          }
        }
      });
    }
  },
  goodsScrollFunc: function (event) {
    let _this = this;
    let pageInstance = _this;
    let compid = event.currentTarget.dataset.compid;
    let curpage = parseInt(event.currentTarget.dataset.curpage) + 1;
    let newdata = {};
    let param = {};

    if (pageInstance.requesting || !pageInstance.data[compid].is_more) {
      return;
    }
    pageInstance.requesting = true;

    param = {
      form: _this.data.classifyGroupForm,
      idx_arr: {
        idx: 'category',
        idx_value: _this.data.categoryId
      }
    }
    param.page = curpage;
    app.sendRequest({
      url: '/index.php?r=AppData/getFormDataList',
      data: param,
      method: 'post',
      success: function (res) {
        newdata = {};
        newdata[compid + '.goods_data'] = pageInstance.data[compid].goods_data.concat(res.data);
        newdata[compid + '.is_more'] = res.is_more;
        newdata[compid + '.curpage'] = res.current_page;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  turnToGoodsDetail: function (e) {
    app.turnToGoodsDetail(e);
  },
  showAddShoppingcart: function (e) {
    app.showAddShoppingcart(e);
  }
})