// pages/getCar/paidSuccess/paidSuccess.js
const app = getApp();
const AV = require('../../../utils/av-live-query-weapp-min');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '支付结果'
    })
    console.log(options);
    var orderQuery = new AV.Query('Order');
    var userid;
    var parkid;
    orderQuery.get(options.orderId).then(function(todo) {
      console.log(todo);
      userid = todo.get('userID');
      parkid = todo.get('parkingId');
      var u = AV.Object.createWithoutData('_User', userid);
      u.set('status', '0');
      u.save();
      app.setStatus('0');
      var o = AV.Object.createWithoutData('Order', options.orderId);
      o.set('orderStatus', '4');
      o.set('cost', options.cost);
      o.set('totaltime', options.totaltime);
      o.save();
      var u = AV.Object.createWithoutData('_User', userid);
      u.set('weight', '0');
      u.save();
      /* 已经在取车时修改剩余车位
      var pl = new AV.Query('ParkingLot');
      pl.get(parkid).then(function(t) {
        console.log(t);
        var n = t.get('leftSpace');
        var ls = AV.Object.createWithoutData('ParkingLot', parkid);
        ls.set('leftSpace', n + 1);
        ls.save();
      }, function(error) { // 异常处理
        console.error(error);
      });*/
    }, function(error) { // 异常处理
      console.error(error);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  backto: function() {
    wx.switchTab({
      url: "../../index/index"
    })
  }
})