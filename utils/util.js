// 格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${padZero(month)}-${padZero(day)}`
}

// 格式化时间
function formatDateTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hour)}:${padZero(minute)}`
}

// 补零
function padZero(num) {
  return num < 10 ? '0' + num : num
}

// 获取年月字符串 (格式: 2024-01)
function getYearMonth(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}-${padZero(month)}`
}

// 获取年份字符串 (格式: 2024)
function getYear(date) {
  return date.getFullYear().toString()
}

// 计算某月的统计数据
function getMonthStatistics(records, yearMonth) {
  const monthRecords = records.filter(r => r.date.startsWith(yearMonth))
  const total = monthRecords.reduce((sum, r) => sum + r.amount, 0)
  const winCount = monthRecords.filter(r => r.amount > 0).length
  const loseCount = monthRecords.filter(r => r.amount < 0).length
  
  return {
    total,
    winCount,
    loseCount,
    count: monthRecords.length
  }
}

// 计算某年的统计数据
function getYearStatistics(records, year) {
  const yearRecords = records.filter(r => r.date.startsWith(year))
  const total = yearRecords.reduce((sum, r) => sum + r.amount, 0)
  const winCount = yearRecords.filter(r => r.amount > 0).length
  const loseCount = yearRecords.filter(r => r.amount < 0).length
  
  return {
    total,
    winCount,
    loseCount,
    count: yearRecords.length
  }
}

// 按月分组统计
function getMonthlyStatistics(records) {
  const monthMap = {}
  
  records.forEach(record => {
    const yearMonth = record.date.substring(0, 7) // 取 YYYY-MM
    if (!monthMap[yearMonth]) {
      monthMap[yearMonth] = {
        yearMonth,
        total: 0,
        count: 0,
        winCount: 0,
        loseCount: 0,
        winRate: 0
      }
    }
    monthMap[yearMonth].total += record.amount
    monthMap[yearMonth].count += 1
    if (record.amount > 0) {
      monthMap[yearMonth].winCount += 1
    } else if (record.amount < 0) {
      monthMap[yearMonth].loseCount += 1
    }
  })
  
  // 计算胜率
  const result = Object.values(monthMap).map(item => {
    item.winRate = item.count > 0 ? Math.round(item.winCount / item.count * 100) : 0
    return item
  })
  
  return result.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
}

// 按年分组统计
function getYearlyStatistics(records) {
  const yearMap = {}
  
  records.forEach(record => {
    const year = record.date.substring(0, 4) // 取 YYYY
    if (!yearMap[year]) {
      yearMap[year] = {
        year,
        total: 0,
        count: 0,
        winCount: 0,
        loseCount: 0,
        winRate: 0
      }
    }
    yearMap[year].total += record.amount
    yearMap[year].count += 1
    if (record.amount > 0) {
      yearMap[year].winCount += 1
    } else if (record.amount < 0) {
      yearMap[year].loseCount += 1
    }
  })
  
  // 计算胜率
  const result = Object.values(yearMap).map(item => {
    item.winRate = item.count > 0 ? Math.round(item.winCount / item.count * 100) : 0
    return item
  })
  
  return result.sort((a, b) => b.year.localeCompare(a.year))
}

module.exports = {
  formatDate,
  formatDateTime,
  getYearMonth,
  getYear,
  getMonthStatistics,
  getYearStatistics,
  getMonthlyStatistics,
  getYearlyStatistics
}
