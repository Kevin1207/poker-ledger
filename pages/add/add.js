// pages/add/add.js
const util = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    isWin: true,
    amount: '',
    note: '',
    date: '',
    isEdit: false,
    recordId: null
  },

  onLoad(options) {
    // 默认日期为今天
    const today = new Date()
    this.setData({
      date: util.formatDate(today)
    })

    // 如果有 id 参数，说明是编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        recordId: options.id
      })
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '编辑记录'
      })
      // 加载记录数据
      this.loadRecord(options.id)
    }
  },

  // 加载记录数据（编辑模式）
  loadRecord(id) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    db.collection('poker_records')
      .doc(id)
      .get()
      .then(res => {
        wx.hideLoading()
        const record = res.data
        
        // 根据金额判断是赢还是输
        const isWin = record.amount >= 0
        const amount = Math.abs(record.amount).toString()
        
        this.setData({
          isWin: isWin,
          amount: amount,
          note: record.note || '',
          date: record.date
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('加载记录失败', err)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      })
  },

  // 选择赢
  selectWin() {
    this.setData({ isWin: true })
  },

  // 选择输
  selectLose() {
    this.setData({ isWin: false })
  },

  // 金额输入
  onAmountInput(e) {
    this.setData({
      amount: e.detail.value
    })
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 日期变化
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 提交
  onSubmit() {
    const { isWin, amount, note, date, isEdit, recordId } = this.data

    // 验证金额
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      })
      return
    }

    // 计算实际金额（输的情况为负数）
    const finalAmount = isWin ? parseFloat(amount) : -parseFloat(amount)

    // 创建/更新记录对象
    const record = {
      amount: finalAmount,
      note: note.trim(),
      date: date
    }

    // 显示加载提示
    wx.showLoading({
      title: isEdit ? '保存中...' : '保存中...',
      mask: true
    })

    if (isEdit) {
      // 编辑模式：更新记录
      db.collection('poker_records')
        .doc(recordId)
        .update({
          data: record
        })
        .then(() => {
          wx.hideLoading()
          wx.showToast({
            title: '更新成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        })
        .catch(err => {
          wx.hideLoading()
          console.error('更新失败', err)
          wx.showToast({
            title: '更新失败，请重试',
            icon: 'none'
          })
        })
    } else {
      // 新增模式：添加 createTime
      record.createTime = new Date().getTime()
      
      // 保存到云数据库
      db.collection('poker_records')
        .add({
          data: record
        })
        .then(() => {
          wx.hideLoading()
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        })
        .catch(err => {
          wx.hideLoading()
          console.error('保存失败', err)
          wx.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          })
        })
    }
  }
})
