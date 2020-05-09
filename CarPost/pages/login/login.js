// pages/login/login.js
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newPhoneNum: '',
    oldphone: '',
    verifycode: '',
  },

  inputPhone: function(e) {
    this.setData({
      newPhoneNum: e.detail.value
    })
  },

  bindIdnoBlur: function(e) {
    this.setData({
      verifycode: e.detail.value
    });

  },

  onLogin: function() {
    console.log(this.data.newPhoneNum, this.data.verifycode);
    if (this.data.verifycode == '123456' && this.data.newPhoneNum.length == 11) {
      console.log('passssssssssss');
      wx.switchTab({
        url: "../index/index"
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '验证码错误，请重新输入',
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '登录停车小程序'
    })
    var query = new AV.Query('_User');
    query.get(options.userid).then(function(todo) { // 成功获得实例
      var phone = todo.get('PhoneNumber');
      that.setData({
        newPhoneNum: phone,
        oldphone: phone
      });
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

  }
})