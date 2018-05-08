import h from '../../../../utils/url.js'
var util = require('../../../../utils/util.js')
var MD5 = require('../../../../utils/md5.js')
var requestPromisified = util.wxPromisify(wx.request)
//获取应用实例
const app = getApp()

Page({
  data: {
    Home_name:''
  },
  onLoad: function () {
   
  },
  onShow() {
    
  },
  ChangeHomeName(e){
    this.setData({
      Home_name: e.detail.value
    })
  },
  //是否填写过身高体重
  CreateHome() {
    requestPromisified({
      url: h.main + '/insertregisterappuser?register_appid=' + app.globalData.User_Phone + '&fname=' + this.data.Home_name,
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
          app.globalData.CurHomeName = this.data.Home_name
          app.globalData.CurHomeId = res.data.id
          break
        case 0:
          wx.showToast({
            image: '../../../images/icon/attention.png',
            title: '创建新家失败!'
          });
          break
        default:
          wx.showToast({
            image: '../../../images/icon/attention.png',
            title: '服务器繁忙！'
          });
      }
    }).catch((res) => {
      wx.showToast({
        image: '../../../../images/icon/attention.png',
        title: '服务器繁忙！'
      });
    })
  }
})