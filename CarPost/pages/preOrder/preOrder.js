// pages/preOrder/preOrder.js
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

function startTimer(e) {
  var wtime = e.waittime * 60 * 1000; //单位毫秒
  var timer = setTimeout(function() {
    var d = new Date();
    console.log("-------begin------", d);
    var query = new AV.Query('Order');
    query.get(e.id).then(function(res) {
      var status = res.get('orderStatus');
      console.log('status=' + status);
      if (status == '0') {
        var osta = AV.Object.createWithoutData('Order', e.id);
        osta.set('orderStatus', '3');
        osta.save();
        var tempuser = AV.Object.createWithoutData('_User', e.userid);
        tempuser.set('status', '0');
        tempuser.save();
        app.setStatus('0');
        var query = new AV.Query('ParkingLot');
        query.get(e.parkid).then(function(todo) {
          var ls = todo.get('leftSpace');
          var templs = AV.Object.createWithoutData('ParkingLot', e.parkid);
          templs.set('leftSpace', ls + 1);
          templs.save();
          console.log("------end-------");
        }).then(function(res) {
          // 更新成功
        }, function(error) {
          // 异常处理
          console.error(error);
        });
      }
    }).then(function(res) {
      // 更新成功
    }, function(error) {
      // 异常处理
      console.error(error);
    });
  }, wtime);
};
Page({
  data: {
    waittime: [10, 20, 30, 40],
    index: 1,
    parkinglot: null,
    name: '',
    carNum: '',
    status: '',
    ordertime: 0,
    orderCreate: '',
    orderId: '',
    parkingId: '',
    userweight: ''
  },
  getCarNumber: function(id) {
    var that = this;
    var query = new AV.Query('_User');
    var CarNum;
    query.get(id).then(function(todo) { // 成功获得实例
      CarNum = todo.get('carNumber');
      that.setData({
        carNum: CarNum
      });
    }, function(error) { // 异常处理
      console.error(error);
    });
  },
  onLoad: function(options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '车位预约',
      success: function(res) {
        // success
      }
    });
    var tempuser = new AV.Query('_User');
    tempuser.get(app.globalData.userid).then(function(todo) {
      var weight = todo.get('weight');
      var lastorder = todo.get('lastOrder');
      lastorder.setHours(lastorder.getHours() + 3);
      console.log(weight, lastorder);
      var now = new Date();
      if (lastorder <= now) {
        that.setData({
          userweight: '0'
        })
      } else {
        that.setData({
          userweight: weight
        })
      }
    }).catch(function(error) {
      // 异常处理
      console.error(error);
    });
    if (options.parking) {
      var temppark = JSON.parse(options.parking);
      that.getCarNumber(app.globalData.userid);
      that.setData({
        parkinglot: temppark,
        name: temppark.name,
        status: app.globalData.status,
      })
    } else {
      var query = new AV.Query('Order');
      var order;
      query.find().then(function(results) {
        var temp = new Date(0);
        for (var i = 0; i < results.length; i++) {
          if (results[i].attributes.userID == app.globalData.userid && results[i].createdAt > temp) {
            order = results[i];
            temp = results[i].createdAt;
          }
        }
        var temp = order.createdAt.toLocaleString();
        console.log(order);
        that.setData({
          orderId: order.id,
          parkingId: order.attributes.parkingId,
          name: order.attributes.parking,
          ordertime: order.attributes.orderTime,
          orderCreate: temp,
          carNum: order.attributes.userCar
        })
      }).then(function(results) {
        // 更新成功
      }, function(error) {
        // 异常处理
        console.error(error);
      });
    }
  },
  bindPickerChange: function(e) {
    console.log(e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  start: function(e) {
    startTimer(e);
  },
  preOrder: function(e) {
    var that = this;
    if (that.data.userweight <= 15) {
      var temppark = new AV.Query('ParkingLot');
      temppark.get(that.data.parkinglot.id).then(function(todo) {
        var templeft = todo.get('leftSpace');
        if (templeft <= 0) {
          wx.showModal({
            title: '提示',
            content: '该停车场已停满，请更换停车场',
          });
        } else {
          var order = AV.Object.extend('Order');
          var newOrder = new order();
          newOrder.set('userID', app.globalData.userid);
          newOrder.set('userCar', that.data.carNum);
          newOrder.set('parking', that.data.name);
          newOrder.set('orderTime', that.data.waittime[that.data.index]);
          newOrder.set('orderStatus', '0');
          newOrder.set('parkingId', that.data.parkinglot.id);
          newOrder.save().then(function(todo) {
            that.setData({
              orderId: todo.id,
            });
            var obj = {
              id: todo.id,
              createtime: todo.createdAt,
              waittime: todo.attributes.orderTime,
            };
            obj.id = todo.id;
            obj.createtime = todo.createdAt;
            obj.waittime = todo.attributes.orderTime;
            obj.userid = app.globalData.userid;
            obj.parkid = that.data.parkinglot.id;
            that.start(obj);
          }, function(error) {
            console.error(error);
          });
          var pl = AV.Object.createWithoutData('ParkingLot', that.data.parkinglot.id);
          // 修改属性
          pl.set('leftSpace', that.data.parkinglot.leftSpace - 1);
          // 保存到云端
          pl.save();

          var us = AV.Object.createWithoutData('_User', app.globalData.userid);
          us.set('status', '1');
          us.save();
          var us = AV.Object.createWithoutData('_User', app.globalData.userid);
          var w = that.data.userweight + 4 - that.data.index
          us.set('weight', w.toString());
          us.save();
          that.setData({
            weight: w
          })
          var d = new Date();
          var us = AV.Object.createWithoutData('_User', app.globalData.userid);
          us.set('lastOrder', d);
          us.save();
          app.setStatus('1');
          wx.showModal({
            title: '提示',
            content: '预约成功',
            success: function(res) {
              var temppark = new AV.Query('ParkingLot');
              temppark.get(that.data.parkinglot.id).then(function(todo) {
                var tempstr = JSON.stringify(todo.toJSON());
                wx.navigateTo({
                  url: "../detail/detail?parking=" + tempstr
                })
              }).catch(function(error) {
                // 异常处理
                console.error(error);
              });
            },
          });
        }
      }).catch(function(error) {
        // 异常处理
        console.log(error);
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '系统检测到您频繁的预约订单，为减少车位浪费请不要频繁预约，可稍后再试',
      });
    }
  },
  cancelOrder: function() {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '确认取消预约吗，将不在为你预留车位',
      cancelText: '取消',
      confirmText: '确认',
      success(res) {
        if (res.cancel) {
          // 用户点击了取消属性的按钮
        } else if (res.confirm) {
          // 用户点击了确定属性的按钮
          console.log('取消订单' + that.data.orderId);
          var pl = AV.Object.createWithoutData('Order', that.data.orderId);
          pl.set('orderStatus', '3');
          pl.save(); //保存订单状态
          var us = AV.Object.createWithoutData('_User', app.globalData.userid);
          us.set('status', '0');
          us.save();
          app.setStatus('0'); //保存车辆状态
          var query = new AV.Query('ParkingLot');
          query.get(that.data.parkingId).then(function(todo) {
            var priority = todo.get('leftSpace');
            var pl = AV.Object.createWithoutData('ParkingLot', that.data.parkingId);
            pl.set('leftSpace', priority + 1);
            pl.save();
          }, function(error) {
            console.error(error);
          }); //重置停车场剩余车位
          wx.switchTab({
            url: "../index/index"
          })
        }
      },
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
  }
})