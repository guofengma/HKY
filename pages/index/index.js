import h from '../../utils/url.js'
var util = require('../../utils/util.js')
var MD5 = require('../../utils/md5.js')
var requestPromisified = util.wxPromisify(wx.request)
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    DateInfo:'',
    airQuality:'',
    imgUrls: [
      '../../images/picture/carousel_1.png',
      '../../images/picture/carousel_2.png'
    ],
    carousle: [{ 'title': '环境污染，只有你想不到', 'content': '坑比小朋友禁止入内,一起来玩吧', 'img': {} }, { 'title': '你的时间,改如何把握？', 'content': '态度决定一切,SmartHox成就未来', 'img': {} }],
    indicatorDots: true,
    autoplay: false,
    interval: 2000,
    duration: 1000

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.GetAirQuality()
    this.StartClock()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  ToAdd() {
    wx.navigateTo({
      url: '../equipment/index/index'
    })
  },
  //时钟
  StartClock(){
    let _this = this
    let CurDate = new Date()
    let Week
    switch (CurDate.getDay()){
      case 0:
        Week = '日'
        break
      case 1:
        Week = '一'
        break
      case 2:
        Week = '二'
        break
      case 3:
        Week = '三'
        break
      case 4:
        Week = '四'
        break
      case 5:
        Week = '五'
        break
      case 6:
        Week = '六'
        break
    }
    let DateInfo = {
      Month: (CurDate.getMonth() + 1) < 10 ? '0' + (CurDate.getMonth() + 1) : CurDate.getMonth() + 1,
      Day: (CurDate.getDate()) < 10 ? '0' + CurDate.getDate() : CurDate.getDate(),
      Week: Week,
      Hour: CurDate.getHours(),
      Minute: CurDate.getMinutes() < 10 ? '0' + CurDate.getMinutes() : CurDate.getMinutes(),
      Second: CurDate.getSeconds() < 10 ? '0' + CurDate.getSeconds() : CurDate.getSeconds(),
    }
    this.setData({
      DateInfo: DateInfo
    })
    setTimeout(()=>{
      this.StartClock()
    },1000)
  },
  //当前空气质量
  GetAirQuality(){
    requestPromisified({
      url: h.main + '/selecttemperature',
      data: {
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded',
      //   'Accept': 'application/json'
      // }, // 设置请求的 header
    }).then((res) => {
      switch (res.data.result) {
        case 1:
          this.setData({
            airQuality: res.data.temperaturelist[0]
          })
          break
        case 0:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '获取空气信息失败'
          });
          break
        default:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '服务器繁忙！'
          });
      }
      this.setData({
        loadingHidden: true
      })
    }).catch((res) => {
      wx.showToast({
        image: '../../images/icon/attention.png',
        title: '服务器繁忙！'
      });
      this.setData({
        loadingHidden: true
      })
      console.log(res)
    })
  }
})
