// pages/month-detail/month-detail.js
const util = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    yearMonth: '',
    records: [],
    monthTotal: 0,
    loading: true
  },

  onLoad(options) {
    const { yearMonth } = options
    if (yearMonth) {
      this.setData({
        yearMonth: yearMonth
      })
      this.loadMonthRecords(yearMonth)
    }
  },

  // 加载指定月份的记录
  loadMonthRecords(yearMonth) {
    this.setData({ loading: true })
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 从云数据库获取当前用户指定月份的记录
    db.collection('poker_records')
      .where({
        _openid: '{openid}' // 云开发会自动替换为当前用户的 openid
      })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        console.log('查询到记录数：', res.data.length)
        const allRecords = res.data
        
        // 过滤出指定月份的记录
        const monthRecords = allRecords.filter(record => {
          const recordYearMonth = util.getYearMonth(new Date(record.createTime))
          return recordYearMonth === yearMonth
        })
        
        // 计算本月总额
        let monthTotal = 0
        monthRecords.forEach(record => {
          monthTotal += record.amount
        })
        
        this.setData({
          records: monthRecords,
          monthTotal: monthTotal,
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
              this.loadMonthRecords(this.data.yearMonth)
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
