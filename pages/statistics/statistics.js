// pages/statistics/statistics.js
const util = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    activeTab: 'month',
    monthlyStats: [],
    yearlyStats: [],
    loading: true
  },

  onLoad() {
    this.loadStatistics()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadStatistics()
  },

  // 加载统计数据
  loadStatistics() {
    this.setData({ loading: true })
    
    // 从云数据库获取当前用户的所有记录（用于统计）
    // 云开发会自动根据 _openid 过滤当前用户的数据
    db.collection('poker_records')
      .where({
        _openid: '{openid}' // 使用占位符，云开发会自动替换为当前用户的 openid
      })
      .get()
      .then(res => {
        console.log('查询到记录数：', res.data.length)
        const records = res.data
        
        // 获取按月统计
        const monthlyStats = util.getMonthlyStatistics(records)
        
        // 获取按年统计
        const yearlyStats = util.getYearlyStatistics(records)
        
        this.setData({
          monthlyStats,
          yearlyStats,
          loading: false
        })
      })
      .catch(err => {
        console.error('查询统计失败', err)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      })
  },

  // 切换到按月统计
  switchToMonth() {
    this.setData({
      activeTab: 'month'
    })
  },

  // 切换到按年统计
  switchToYear() {
    this.setData({
      activeTab: 'year'
    })
  }
})
