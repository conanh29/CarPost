// pages/detail/detail.js
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
Page({
  data: {
    parking: null,
    imgUrl: '',
    name: '',
    startPrice: 0,
    price: 0,
    location: '',
    total: 0,
    leftSpace: 0,
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    console.log(options);
    var temppark = JSON.parse(options.parking);
    var query = new AV.Query('ParkingLot');
    query.get(temppark.objectId).then(function(todo) {
      var t = todo.attributes;
      t.dis = temppark.dis;
      t.id = temppark.objectId;
      var temploca = JSON.parse(t.location);
      var tempprice = JSON.parse(t.price);
      that.setData({
        parking: t,
        imgUrl: temploca.imgUrl,
        name: t.name,
        startPrice: tempprice.startPrice,
        price: tempprice.price,
        location: temploca.location,
        total: t.total,
        leftSpace: t.leftSpace,
      });
    }, function(error) {
      // 异常处理
      console.log(error);
    });

  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  openLocation: function() {
    var that=this;
    console.log(that.data.parking);
    var locationstr = that.data.parking.location;
    var loca = JSON.parse(locationstr);
    wx.openLocation({
      latitude: loca.latitude, // 纬度，范围为-90~90，负数表示南纬
      longitude: loca.longitude, // 经度，范围为-180~180，负数表示西经
      scale: 28, // 缩放比例
      name: that.data.parking.name, // 位置名
      address: loca.location // 地址的详细说明
    })
  },
  preOrder: function() {
    var status = app.globalData.status;
    console.log('车辆状态:' + status);
    if (status == '2') {
      wx.showModal({
        title: '提示',
        content: '车辆已在停车场，即将跳转到取车页面',
        success: function(res) {
          wx.switchTab({
            url: "../getCar/getCar"
          })
        },
      });
    } else if (status == '1') {
      wx.showModal({
        title: '提示',
        content: '已经预约成功，即将跳转到预约界面',
        cancelText: '取消',
        confirmText: '确认',
        success: function(res) {
          if (res.confirm) {
            // 用户点击了确认属性的按钮
            wx.navigateTo({
              url: "../preOrder/preOrder"
            })
          }
        },
      });
    } else {
      var tempstr = JSON.stringify(this.data.parking);
      wx.navigateTo({
        url: "../preOrder/preOrder?parking=" + tempstr
      })
    }
  }
})