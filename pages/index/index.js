// pages/index/index.js
const util = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    records: [],
    currentMonthTotal: 0,
    currentMonthCount: 0,
    currentMonthWin: 0,
    currentMonthLose: 0,
    loading: true,
    userInfo: null,
    tempAvatarUrl: '',
    tempNickName: '',
    showNicknameInput: false
  },

  onLoad() {
    this.loadRecords()
    this.loadUserInfo()
  },

  onShow() {
    // 从添加页面返回后刷新数据
    this.loadRecords()
  },

  // 加载用户信息
  loadUserInfo() {
    // 从本地缓存读取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.nickName) {
      this.setData({
        userInfo: userInfo
      })
      console.log('从缓存加载用户信息', userInfo)
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)
    
    this.setData({
      tempAvatarUrl: avatarUrl,
      showNicknameInput: true  // 选择头像后，弹出昵称输入框
    })
  },

  // 输入昵称
  onNicknameInput(e) {
    const nickName = e.detail.value
    console.log('输入昵称:', nickName)
    
    this.setData({
      tempNickName: nickName
    })
  },

  // 关闭昵称输入框
  closeNicknameInput() {
    this.setData({
      showNicknameInput: false
    })
  },

  // 保存用户信息
  onSaveUserInfo() {
    const { tempAvatarUrl, tempNickName } = this.data
    
    if (!tempAvatarUrl) {
      wx.showToast({
        title: '请先选择头像',
        icon: 'none'
      })
      return
    }

    if (!tempNickName || tempNickName.trim().length === 0) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    const userInfo = {
      avatarUrl: tempAvatarUrl,
      nickName: tempNickName.trim()
    }

    // 保存到本地缓存
    wx.setStorageSync('userInfo', userInfo)
    
    // 更新页面显示
    this.setData({
      userInfo: userInfo,
      tempAvatarUrl: '',
      tempNickName: '',
      showNicknameInput: false
    })
    
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
    
    console.log('保存用户信息成功:', userInfo)
  },

  // 加载记录
  loadRecords() {
    this.setData({ loading: true })
    
    // 从云数据库获取当前用户的记录
    // 云开发会自动根据 _openid 过滤当前用户的数据
    db.collection('poker_records')
      .where({
        _openid: '{openid}' // 使用占位符，云开发会自动替换为当前用户的 openid
      })
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()
      .then(res => {
        console.log('查询到记录数：', res.data.length)
        const records = res.data
        
        // 计算本月统计
        const now = new Date()
        const currentYearMonth = util.getYearMonth(now)
        const stats = util.getMonthStatistics(records, currentYearMonth)
        
        this.setData({
          records: records,
          currentMonthTotal: stats.total,
          currentMonthCount: stats.count,
          currentMonthWin: stats.winCount,
          currentMonthLose: stats.loseCount,
          loading: false
        })
      })
      .catch(err => {
        console.error('查询记录失败', err)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      })
  },

  // 跳转到添加记录页面
  goToAdd() {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  },

  // 跳转到编辑记录页面
  goToEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/add/add?id=${id}`
    })
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确认
          wx.showLoading({
            title: '删除中...',
            mask: true
          })

          db.collection('poker_records')
            .doc(id)
            .remove()
            .then(() => {
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              // 重新加载数据
              this.loadRecords()
            })
            .catch(err => {
              wx.hideLoading()
              console.error('删除失败', err)
              wx.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              })
            })
        }
      }
    })
  }
})
