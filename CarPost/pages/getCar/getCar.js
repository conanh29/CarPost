// pages/getCar/getCar.js
const app = getApp();
const AV = require('../../utils/av-live-query-weapp-min');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plateAreaCharset: ['京', '津', '沪', '渝', '冀', '豫', '云', '辽', '黑', '湘', '皖', '鲁', '新', '苏', '浙', '赣', '鄂', '桂', '甘', '晋', '蒙', '陕', '吉', '闽', '贵', '粤', '青', '藏', '川', '宁', '琼'],
    plateDigitCharset: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    inputBoxData: [{
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }],
    currentPos: null,
    showAreaKeyBoard: false,
    showKeyBoard: false,
    hasUnpaidOrders: false,
    orders: null,
    animationData: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.setNavigationBarTitle({
      title: '取车'
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
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    });
    animation.top('20rpx').step();
    this.setData({
      animationData: animation.export(),
      hasUnpaidOrders: false
    });
    this.putPlateInputBox();
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

  bindDigitTap: function(res) {
    let inputBoxData = this.data.inputBoxData
    let id = res.currentTarget.id
    let currentPos = id
    console.log('res', res)
    if (id > 6) {
      id = 6
      currentPos = null;
    } else {
      inputBoxData[id].hover = 'plate-input-digit-hover'
    }
    if (this.data.currentPos != null) inputBoxData[this.data.currentPos].hover = ''

    this.setData({
      inputBoxData: inputBoxData,
      currentPos: currentPos
    })

  },
  bindKeyTap: function(res) {
    console.log(res)
    let char = res.currentTarget.dataset.char
    let inputBoxData = this.data.inputBoxData
    inputBoxData[this.data.currentPos].char = char
    let passOnData = {
      currentTarget: {
        id: parseInt(this.data.currentPos) + 1
      }
    }
    this.bindDigitTap(passOnData)
  },

  getparkTime: function(begin, end) {
    var b = Date.UTC(begin.getUTCFullYear(), begin.getUTCMonth(), begin.getUTCDate(), begin.getUTCHours(), begin.getUTCMinutes(), begin.getUTCSeconds(), begin.getUTCMilliseconds());
    var e = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes(), end.getUTCSeconds(), end.getUTCMilliseconds());
    var total = (e - b) / 1000;
    var result = parseInt(total)
    var h = Math.floor(result / 3600) < 10 ? '' + Math.floor(result / 3600) : Math.floor(result / 3600);
    var m = Math.floor((result / 60 % 60)) < 10 ? '' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    var s = Math.floor((result % 60)) < 10 ? '' + Math.floor((result % 60)) : Math.floor((result % 60));
    var res = {
      hour: h,
      min: m,
      sec: s,
      totalsec: result
    };
    return res;
  },

  query: function() {
    var that = this;
    var plateNumber = this.getPlateNumberString();
    var temporder;
    var query = new AV.Query('Order');
    var createtemp;
    var flag;
    query.find().then(function(results) {
      console.log(results);
      if (results.length != 0) {
        createtemp = results[0].createdAt;
        temporder = results[0].attributes;
        temporder.orderid = results[0].id;
        flag = 0;
        for (var i = 0; i < results.length; i++) {
          if (results[i].attributes.userCar == plateNumber && (results[i].attributes.orderStatus == '1' || results[i].attributes.orderStatus == '2')) {
            flag = 1;
            if (results[i].createdAt > createtemp) {
              temporder = results[i].attributes;
              temporder.orderid = results[i].id;
              createtemp = results[i].createdAt;
            }
          }
        }
      } else {
        flag = 0;
      }
      if (flag == 1) {
        var querypark = new AV.Query('ParkingLot');
        querypark.get(temporder.parkingId).then(function(todo) {
          let pri = todo.get('price');
          var parkprice = JSON.parse(pri);
          temporder.beginTime = temporder.parkTime.toLocaleString();
          if (temporder.leaveTime != null) {
            temporder.endTime = temporder.leaveTime.toLocaleString();
            temporder.totalTime = that.getparkTime(temporder.parkTime, temporder.leaveTime);
            temporder.totalTimestr = temporder.totalTime.hour + '时' + temporder.totalTime.min + '分' + temporder.totalTime.sec + '秒';
            if (temporder.totalTime.totalsec <= 3600) {
              temporder.total = parkprice.startPrice;
            } else {
              let t = temporder.totalTime.totalsec - 3600;
              temporder.total = parkprice.startPrice + parkprice.price * (Math.ceil(t / 3600));
            }
          } else {
            temporder.endTime = `还未将车开出停车场`;
            temporder.totalTimestr = `还未将车开出停车场`;
            temporder.total = '待计算';
          }
          that.setData({
            orders: temporder,
            hasUnpaidOrders: true
          });
          console.log(that.data.orders);
        }, function(error) { // 异常处理
          console.error(error);
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '未找到车牌为 ' + plateNumber + ' 的车辆数据，请重试。',
        })
      }
    }).then(function(results) {
      // 更新成功
    }, function(error) {
      // 异常处理
      console.error(error);
    });
  },
  getPlateNumberString: function() {
    return this.data.inputBoxData[0].char +
      this.data.inputBoxData[1].char +
      this.data.inputBoxData[2].char +
      this.data.inputBoxData[3].char +
      this.data.inputBoxData[4].char +
      this.data.inputBoxData[5].char +
      this.data.inputBoxData[6].char
  },
  putPlateInputBox: function() {
    var that = this;
    var plateNumber = [{
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }, {
      char: '',
      hover: ''
    }];
    var userid = app.globalData.userid;
    var query = new AV.Query('_User');
    query.get(userid).then(function(todo) {
      var carnum = todo.get('carNumber');
      for (var i = 0; i < 7; i++) {
        plateNumber[i].char = carnum[i];
      }
      that.setData({
        inputBoxData: plateNumber
      });
      console.log(that.data.inputBoxData);
      that.query();
    }, function(error) {
      // 异常处理
      console.error(error);
    });
  },
  bindPaymentBtnTap: function() {
    var that = this;
    if (that.data.orders.total == '待计算') {
      wx.showModal({
        title: '提示',
        content: '请先将车开出停车场',
        confirmText: "确认",
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确认支付？',
        cancelText: '取消',
        confirmText: "确认支付",
        success: function(res) {
          if (res.cancel) {
            // 用户点击了取消属性的按钮
          } else if (res.confirm) {
            // 用户点击了确定属性的按钮
            wx.navigateTo({
              url: './paidSuccess/paidSuccess?orderId=' + that.data.orders.orderid + '&&cost=' + that.data.orders.total + '&&totaltime=' + JSON.stringify(that.data.orders.totalTime),
            })
          }
        },
      })
    }
  },
  queryOtherPlate: function() {
    this.setData({
      hasUnpaidOrders: false
    })
  }
})