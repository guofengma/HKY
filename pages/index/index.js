import h from '../../utils/url.js'
var util = require('../../utils/util.js')
var MD5 = require('../../utils/md5.js')
var requestPromisified = util.wxPromisify(wx.request)
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    CurHomeName:'',
    AccountName:'',
    MessageCount:0,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    DateInfo:'',
    Toggle_show: 0,  //0初始 1展开 -1关闭
    airQuality:'',
    imgUrls: [
      '../../images/picture/carousel_1.png',
      '../../images/picture/carousel_2.png'
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 2000,
    duration: 1000,
    HomeList:[],
    CurHomeName:null,
    CurHomeId:null,
    EQList:[]

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        // city: app.globalData.city,
        userInfo: app.globalData.userInfo,
        AccountName: app.globalData.User_name,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          AccountName: app.globalData.User_name,
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
  onShow: function () {
    this.GetAirQuality()
    this.StartClock()
    this.GetMessage()
    this.GetDietInfo(util.formatTime(new Date()))
    this.IfHasInfo()
    this.setData({
      HomeList: app.globalData.HomeList,
      CurHomeName: app.globalData.CurHomeName,
      CurHomeId: app.globalData.CurHomeId,
    })
    if (app.globalData.CurHomeId){
      this.GetCurEQList()
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //Toggle temperature
  Toggle(){
    this.setData({
      Toggle_show: this.data.Toggle_show == 0 ? 1 : (this.data.Toggle_show == 1?-1:1)
    })
  },
  ToAdd() {
    wx.switchTab({
      url: '../equipment/index/index'
    })
  },
  //第一次从家开始添加
  FirstAdd(){
    wx.navigateTo({
      url: '../my/home/add/index'
    })
  },
  //添加设备
  AddEquipment(){
    wx.navigateTo({
      url: '../equipment/add/index'
    })
  },
  //获取饮食信息
  GetDietInfo(CurDate){
    requestPromisified({
      url: h.main + '/selectweighttype1?ftelphone=' + app.globalData.User_Phone + '&faddtime=' + CurDate,
      data: {
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then((res) => {
      switch (res.data.result) {
        case 1:
          let temp = res.data.dietInfo[0]
          this.setData({
            DietInfo: temp,
            ifOver: temp.diet_standard < temp.diet_sum ? true : false,
            Surplus: Math.abs(temp.diet_standard - temp.diet_sum).toFixed(2)
          })
          break
        case 3:
          this.setData({
            DietInfo: '',
            ifOver: false,
            Surplus: '--'
          })
          break
        case 0:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '获取失败'
          });
          break
        default:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '服务器繁忙！'
          });
      }
      }).catch((res)=>{
      wx.showToast({
        image: '../../images/icon/attention.png',
        title: '服务器繁忙！'
      });
      console.log(res)
    })
  },
  ToTemperature() {
    wx.navigateTo({
      url: '../temperature/index?weaid=' + this.data.airQuality.weaid
    })
  },
  ToWeight() {
    wx.navigateTo({
      url: '../weight/index'
    })
  },
  ToDiet() {
    wx.navigateTo({
      url: '../diet/index'
    })
  },
  //进入我的饮食
  MyDiet() {
    if (app.globalData.ifHasInfo) {
      wx.navigateTo({
        url: '../diet/index/index?type=1' //1身高
      })
    } else {
      wx.navigateTo({
        url: '../add/index'
      })
    }
  },
  //是否填写过身高体重
  IfHasInfo() {
    requestPromisified({
      url: h.main + '/selectweighttype?ftelphone=' + app.globalData.User_Phone,
      data: {
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded',
      //   'Accept': 'application/json'
      // }, // 设置请求的 header
    }).then((res) => {
      switch (res.data.result) {
        case 1:
          app.globalData.ifHasInfo = true
          break
        case 3:
          app.globalData.ifHasInfo = false
          break
        case 0:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '消息获取失败!'
          });
          break
        default:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '服务器繁忙！'
          });
      }
    }).catch((res) => {
      wx.showToast({
        image: '../../images/icon/attention.png',
        title: '服务器繁忙！'
      });
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
      Hour: CurDate.getHours() < 10 ? '0' + CurDate.getHours() : CurDate.getHours(),
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
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude
        // latitude: 31.23603, //app.globalData.latitude,
        // longitude: 121.38541, //app.globalData.longitude
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
            airQuality: res.data.temperaturelist
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
  },
  //获取消息
  GetMessage() {
    requestPromisified({
      url: h.main + '/selectnewinfo?ftelphone=' + app.globalData.User_Phone,
      data: {
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded',
      //   'Accept': 'application/json'
      // }, // 设置请求的 header
    }).then((res) => {
      console.log(res.data)
      switch (res.data.result) {
        case 1:
          this.setData({
            MessageCount: res.data.count
          })
          app.globalData.MessageCount = res.data.count
          break
        case 0:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '消息获取失败!'
          });
          break
        default:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '服务器繁忙！'
          });
      }
    }).catch((res) => {
      wx.showToast({
        image: '../../images/icon/attention.png',
        title: '服务器繁忙！'
      });
    })
  },
  //获取当前家下设备列表
  GetCurEQList() {
    requestPromisified({
      url: h.main + '/selectregisteruser?homeid=' + app.globalData.CurHomeId,
      data: {
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded',
      //   'Accept': 'application/json'
      // }, // 设置请求的 header
    }).then((res) => {
      console.log(res.data)
      switch (res.data.result) {
        case 1:
          this.setData({
            EQList: res.data.registermachine
          })
          break
        case 0:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '设备获取失败!'
          });
          break
        default:
          wx.showToast({
            image: '../../images/icon/attention.png',
            title: '服务器繁忙！'
          });
      }
    }).catch((res) => {
      wx.showToast({
        image: '../../images/icon/attention.png',
        title: '服务器繁忙！'
      });
    })
  },
  //跳转到我的消息页面
  ToMyMessage(){
    wx.navigateTo({
      url: '../Interaction/message/index',
    })
  }
})
