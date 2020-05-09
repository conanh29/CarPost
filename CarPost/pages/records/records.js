// pages/records/records.js
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: null,
    haverecord:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '消费记录'
    })
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
    var that = this;
    var userid = app.globalData.userid;
    var query = new AV.Query('Order');
    var temp = new Array();
    query.find().then(function(results) {
      if(results.length!=0){
        that.setData({ haverecord:true})
      }
      for (var i = 0; i < results.length; i++) {
        temp[i] = {
          create: '',
          start: '',
          total_cost: '',
          local: '',
          time: ''
        }
      }
      for (var i = 0, j = 0; i < results.length; i++) {
        if (results[i].attributes.userID == userid) {
          temp[j].create = results[i].createdAt.toLocaleString();
          temp[j].local = results[i].attributes.parking;
          if (results[i].attributes.orderStatus == '0') {
            temp[j].start = "停车还未开始";
          } else if (results[i].attributes.orderStatus == '1') {
            temp[j].start = results[i].attributes.parkTime.toLocaleString();
            temp[j].end = "停车还未结束";
          } else if (results[i].attributes.orderStatus == '2') {
            temp[j].start = results[i].attributes.parkTime.toLocaleString();
            temp[j].end = results[i].attributes.leaveTime.toLocaleString();
            temp[j].time='请在取车页面查看';
            temp[j].total_cost = '尚未付款';
          } else if (results[i].attributes.orderStatus == '3') {
            temp[j].start = "订单已取消";
          } else if (results[i].attributes.orderStatus == '4') {
            temp[j].start = results[i].attributes.parkTime.toLocaleString();
            temp[j].end = results[i].attributes.leaveTime.toLocaleString();
            var totime = JSON.parse(results[i].attributes.totaltime);
            temp[j].time = totime.hour + '时' + totime.min + '分' + totime.sec + '秒';
            temp[j].total_cost = '￥' + results[i].attributes.cost;
          }
          j++;
        }
      }
      that.setData({
        records: temp
      });
      console.log(that.data.records);
    }).then(function(results) {
      // 更新成功
    }, function(error) {
      // 异常处理
      console.error(error);
    });
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

  }
})