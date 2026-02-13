// pages/year-detail/year-detail.js
const util = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    year: '',
    monthlyStats: [],
    yearTotal: 0,
    totalCount: 0,
    loading: true
  },

  onLoad(options) {
    const { year } = options
    if (year) {
      this.setData({
        year: year
      })
      this.loadYearStatistics(year)
    }
  },

  // 加载指定年份的各月统计
  loadYearStatistics(year) {
    this.setData({ loading: true })
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 从云数据库获取当前用户指定年份的记录
    db.collection('poker_records')
      .where({
        _openid: '{openid}' // 云开发会自动替换为当前用户的 openid
      })
      .get()
      .then(res => {
        console.log('查询到记录数：', res.data.length)
        const allRecords = res.data
        
        // 过滤出指定年份的记录
        const yearRecords = allRecords.filter(record => {
          const recordDate = new Date(record.createTime)
          const recordYear = recordDate.getFullYear()
          return recordYear === parseInt(year)
        })
        
        // 按月分组统计
        const monthlyData = {}
        let yearTotal = 0
        let totalCount = 0
        
        yearRecords.forEach(record => {
          const recordDate = new Date(record.createTime)
          const month = recordDate.getMonth() + 1 // 1-12
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month: month < 10 ? `0${month}` : `${month}`,
              records: [],
              total: 0,
              count: 0,
              winCount: 0,
              loseCount: 0
            }
          }
          
          monthlyData[month].records.push(record)
          monthlyData[month].total += record.amount
          monthlyData[month].count += 1
          
          if (record.amount >= 0) {
            monthlyData[month].winCount += 1
          } else {
            monthlyData[month].loseCount += 1
          }
          
          yearTotal += record.amount
          totalCount += 1
        })
        
        // 转换为数组并计算胜率
        const monthlyStats = []
        for (let month = 1; month <= 12; month++) {
          if (monthlyData[month]) {
            const stats = monthlyData[month]
            stats.winRate = stats.count > 0 
              ? Math.round((stats.winCount / stats.count) * 100) 
              : 0
            monthlyStats.push(stats)
          }
        }
        
        this.setData({
          monthlyStats: monthlyStats,
          yearTotal: yearTotal,
          totalCount: totalCount,
          loading: false
        })
        
        wx.hideLoading()
      })
      .catch(err => {
        console.error('查询记录失败', err)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      })
  },

  // 跳转到月度详情页面
  goToMonthDetail(e) {
    const { yearmonth } = e.currentTarget.dataset
    console.log('点击月份:', yearmonth)
    wx.navigateTo({
      url: `/pages/month-detail/month-detail?yearMonth=${yearmonth}`
    })
  }
})
