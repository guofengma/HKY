import h from '../../utils/url.js'
var util = require('../../utils/util.js')
var MD5 = require('../../utils/md5.js')
var requestPromisified = util.wxPromisify(wx.request)
//获取应用实例
const app = getApp()

Page({
  data: {

  },
  onLoad(){
    wx.showLoading({
      title: '加载中',
    })
    wx.getStorage({
      key: 'UserInfo',
      success: (res) => {
        app.globalData.User_Phone = res.data.User_Phone
        app.globalData.User_name = res.data.User_name
        console.log(app.globalData.User_Phone)
        //获取home list
        requestPromisified({
          url: h.main + '/selectallhome?ftelphone=' + res.data.User_Phone,
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
              app.globalData.HomeList = res.data.homelist
              app.globalData.CurHomeName = res.data.homelist1[0].fname
              app.globalData.CurHomeId = res.data.homelist1[0].id
              break
            case 0:
              wx.showToast({
                image: '../../images/icon/attention.png',
                title: '获取家失败！'
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
        
        wx.switchTab({
          url: '../index/index'
        })
      },
      fail: (res) => {
        wx.navigateTo({
          url: '../login/index'
        })
      },
      complete: (res) => {
        wx.hideLoading()
      },
    })
  },
})