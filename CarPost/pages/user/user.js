// pages/user/user.js
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid: '',
    isShowConfirm: false,
    isShowChangePhone: false,
    carNumber: "",
    newCarNum: "",
    oldPhoneNum: "",
    newPhoneNum: "",
    isClear: false,
  },
  getCarNumber: function(id) {
    var that = this;
    var query = new AV.Query('_User');
    var CarNum;
    var phone;
    query.get(id).then(function(todo) { // 成功获得实例
      CarNum = todo.get('carNumber');
      phone = todo.get('PhoneNumber');
      that.setData({
        carNumber: CarNum,
        oldPhoneNum: phone
      });
    }, function(error) { // 异常处理
      console.error(error);
    });
  },
  changeCar: function() {
    this.setData({
      isShowConfirm: true,
    })
  },
  setValue: function(e) {
    this.setData({
      newCarNum: e.detail.value
    })
  },
  onCancel: function() {
    this.setData({
      isShowConfirm: false
    });
  },
  onConfirm: function() {
    var that = this;
    if (that.data.newCarNum.length != 7) {
      wx.showModal({
        title: '错误',
        content: '请输入合法的车牌号',
      })
    } else {
      that.orderCheck();
      setTimeout(function() {
        //要延时执行的代码
        if (that.data.isClear == true) {
          that.setData({
            isShowConfirm: false
          });
          console.log('车牌号' + that.data.newCarNum);
          var book = AV.Object.createWithoutData('_Users', that.data.userid);
          // 修改属性
          book.set('carNumber', that.data.newCarNum);
          // 保存到云端
          book.save();
          that.setData({
            carNumber: that.data.newCarNum
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '您有未完成的订单，请先完成所有订单在修改信息',
          })
        }
      }, 1000) //延迟时间 1秒
    }
  },
  changePhone: function() {
    this.setData({
      isShowChangePhone: true,
    })
  },
  setNewPhone: function(e) {
    this.setData({
      newPhoneNum: e.detail.value
    })
  },
  onCancelChange: function() {
    this.setData({
      isShowChangePhone: false
    });
  },
  onConfirmChange: function() {
    var that=this;
    if (that.data.newPhoneNum.length != 11) {
      wx.showModal({
        title: '错误',
        content: '请输入合法的手机号',
      })
    } else {
      that.orderCheck();
      setTimeout(function () {
        //要延时执行的代码
        if (that.data.isClear == true) {
          that.setData({
          isShowChangePhone: false
        });
          console.log('手机号' + that.data.newPhoneNum);
          var u = AV.Object.createWithoutData('_Users', that.data.userid);
        // 修改属性
          u.set('PhoneNumber', that.data.newPhoneNum);
        // 保存到云端
        u.save();
          that.setData({
          oldPhoneNum: that.data.newPhoneNum
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '您有未完成的订单，请先完成所有订单在修改信息',
        })
      }
      }, 1000) //延迟时间 1秒
    }
  },
  orderCheck: function() {
    var that = this;
    var query = new AV.Query('Order');
    query.find().then(function(results) {
      var flag;
      flag = 0;
      for (var i = 0; i < results.length; i++) {
        if (results[i].attributes.userID == that.data.userid) {
          if (results[i].attributes.orderStatus == '0' || results[i].attributes.orderStatus == '1' || results[i].attributes.orderStatus == '2') {
            flag=1;
          }
        }
      }
      if (flag != 1) {
        console.log('all clear');
        that.setData({
          isClear: true
        });
        return true; //没有未完成的订单
      } else {
        console.log('did not clear');
        that.setData({
          isClear: false
        });
        return false; //有未完成的订单
      }
    }).then(function(results) {
      // 更新成功
    }, function(error) {
      // 异常处理
      console.log(error);
    });
  },
  viewlist: function() {
    var that = this;
    wx.navigateTo({
      url: "../records/records?userid=" + that.data.userid
    })
  },

  logOut: function() {
    var that = this;
    wx.navigateTo({
      url: "../login/login?userid=" + that.data.userid
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '个人中心'
    })
    this.setData({
      userid: app.globalData.userid
    });
    this.getCarNumber(this.data.userid);
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