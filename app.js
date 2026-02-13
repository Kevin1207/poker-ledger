// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'your-env-id',
        traceUser: true,
      })
      
      console.log('云开发环境初始化成功')
      
      // 获取用户 openid
      this.getUserOpenid()
    }
  },
  
  // 获取用户 openid
  getUserOpenid() {
    // 先尝试从缓存读取
    const cachedOpenid = wx.getStorageSync('userOpenid')
    if (cachedOpenid) {
      this.globalData.openid = cachedOpenid
      console.log('从缓存读取 openid:', cachedOpenid)
      return
    }
    
    // 调用云函数获取 openid
    wx.cloud.callFunction({
      name: 'getUserInfo',
      success: res => {
        console.log('获取用户信息成功', res)
        if (res.result && res.result.openid) {
          this.globalData.openid = res.result.openid
          // 缓存 openid
          wx.setStorageSync('userOpenid', res.result.openid)
          console.log('用户 openid:', res.result.openid)
        }
      },
      fail: err => {
        console.error('获取用户信息失败', err)
      }
    })
  },
  
  globalData: {
    userInfo: null,
    openid: null
  }
})
