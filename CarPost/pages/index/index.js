// pages/index/index.js
//获取应用实例
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();

Page({
  data: {
    userid: '',
    latitude: 0,
    longitude: 0,
    markers: [{
      iconPath: "/images/location.png",
      id: 0,
      latitude: 34.23929,
      longitude: 116.12969,
      width: 35,
      height: 45
    }],
    parkinglotlist: [],
    parkingNum: 0
  },
  setValue: function() {
    var that = this;
    this.GPSsubmit();
    this.setData({
      userid: app.globalData.userid
    });
    //--------------------------------------------------------
    var query = new AV.Query('ParkingLot');
    var results;
    var temp = new Array();
    var templocat;
    query.find().then(function(results) {
      for (var i = 0, j = 0; i < results.length; i++) {
        if (results[i].attributes.leftSpace == 0) {
          continue;
        }
        temp[j] = results[i].attributes;
        templocat = JSON.parse(temp[j].location);
        temp[j].dis = 1000 * that.distance(templocat["latitude"], templocat["longitude"], that.data.latitude, that.data.longitude);
        temp[j].objectId = results[i].id;
        j++;
      }
      that.setData({
        parkinglotlist: temp,
        parkingNum: j
      });
      console.log("设置页面数据");
    }).then(function(results) {
      // 更新成功
    }, function(error) {
      // 异常处理
      console.log(error);
      console.error(error);
    });
  },
  onLoad: function(e) {
    //this.setValue();
  },
  onShow: function() {
    console.log('显示index页面');
    this.setValue();
  },
  /**
   * @param la1 第一个坐标点的纬度
   * @param lo1 第一个坐标点的经度
   * @param la2 第二个坐标点的纬度
   * @param lo2 第二个坐标点的经度
   * @return (int)s   返回距离(单位千米或公里)
   */
  distance: function(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
  },
  regionchange(e) { //地图视野变化
    //console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  GPSsubmit: function(e) {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        console.log(latitude,longitude);
        that.setData({
          latitude: latitude,
          longitude: longitude,
        })
      }
    })
  },

  bindParkingListItemTap: function(e) {
    var temppark = this.data.parkinglotlist[e.currentTarget.dataset.bindex];
    var tempstr = JSON.stringify(temppark);
    wx.navigateTo({
      url: "../detail/detail?parking=" + tempstr
    })
  },
})