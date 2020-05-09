//app.js

const AV = require('./utils/av-live-query-weapp-min');

AV.init({
  appId: 'zTGhuU1Nxw3ktVy3yIJxVADz-gzGzoHsz',
  appKey: 'cYhiuLueyUHUuP9QqBLeJ6rV',
  serverURLs: 'https://ztghuu1n.lc-cn-n1-shared.com',
});

App({
  globalData: {
    userid: '',
    userInfo: null,
    status: '',
    windowWidth: 0,
    windowHeight: 50,
  },
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    AV.User.loginWithWeapp().then(user => {
      this.globalData.user = user.toJSON();
      this.globalData.userid = this.globalData.user.objectId;
      this.userinfoCheck(this.globalData.userid);
    }).catch(console.error);
    console.log(this.globalData.userid);
  },
  userinfoCheck: function(id) {
    var that = this;
    var query = new AV.Query('_User');
    var carNum;
    var phone;
    var status;
    query.get(id).then(function(todo) { // 成功获得实例
      carNum = todo.get('carNumber');
      phone = todo.get('PhoneNumber');
      status = todo.get('status');
      that.globalData.status = status;
      if (carNum.length == 0 || phone.length == 0) {
        wx.showModal({
          title: '提示',
          content: '请先完善用户信息',
        });
        wx.navigateTo({
          url: "../user/user"
        })
      }
      console.log('用户信息已完善，车辆状态' + that.globalData.status);
    }, function(error) { // 异常处理
      console.error(error);
    });
  },
  setStatus: function(a) {
    this.globalData.status = a;
  }
})