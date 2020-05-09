const AV = require('../utils/av-live-query-weapp-min');
const app = getApp()

Page({
  data: {
    pCar: '',
    gCar: '',
  },
  onLoad: function() {
    
  },
  putCarNum: function(e) {
    this.setData({
      pCar: e.detail.value
    });
  },
  getCarNum: function(e) {
    this.setData({
      gCar: e.detail.value
    });
  },
  putCar: function() {
    var that=this;
    console.log('驶入车辆'+this.data.pCar);
    var query = new AV.Query('Order');
    query.find().then(function (results) { // 成功获得实例
      for(var i=0;i<results.length;i++){
        if(results[i].attributes.orderStatus=='0'&&results[i].attributes.userCar==that.data.pCar){
          console.log('找到车辆',results[i]);
          var now=new Date();
          var status='1';
          var order = AV.Object.createWithoutData('Order', results[i].id);
          order.set('parkTime', now);
          order.set('orderStatus', status);
          order.save();
          var usera = AV.Object.createWithoutData('_User', results[i].attributes.userID);
          console.log(usera);
          usera.set('status','2');
          usera.save();
          wx.showModal({
            title: '提示',
            content: '停车成功',})
        }
      }
    }, function (error) { // 异常处理
      console.error(error);
    });
  },
  getCar: function() {
    var that = this;
    console.log('取出车辆' + this.data.gCar);
    var query = new AV.Query('Order');
    query.find().then(function (results) { // 成功获得实例
      for (var i = 0; i < results.length; i++) {
        if (results[i].attributes.orderStatus == '1' && results[i].attributes.userCar == that.data.gCar) {
          console.log('找到车辆', results[i]);
          var now = new Date();
          var order = AV.Object.createWithoutData('Order', results[i].id);
          order.set('leaveTime', now);
          order.set('orderStatus', '2');
          order.save();
          var pl = new AV.Query('ParkingLot');
          var parkid = results[i].attributes.parkingId;
          var userid = results[i].attributes.userID;
          pl.get(parkid).then(function (t) {
            var n = t.get('leftSpace');
            var ls = AV.Object.createWithoutData('ParkingLot', parkid);
            ls.set('leftSpace', n + 1);
            ls.save();
            var usera = AV.Object.createWithoutData('_User', userid);
            console.log(usera);
            usera.set('status', '0');
            usera.save();
            wx.showModal({
              title: '提示',
              content: '取车成功',
            })
          }, function (error) { // 异常处理
            console.error(error);
          });
          
        }
      }
    }, function (error) { // 异常处理
      console.error(error);
    });
  },
})