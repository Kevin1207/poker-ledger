#\!/bin/bash

# 创建目录结构
mkdir -p pages/index
mkdir -p pages/add
mkdir -p pages/statistics
mkdir -p utils
mkdir -p images

# 创建 app.json
cat > app.json << 'EOF'
{
  "pages": [
    "pages/index/index",
    "pages/add/add",
    "pages/statistics/statistics"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#1AAD19",
    "navigationBarTitleText": "德州记账本",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#1AAD19",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "记录"
      },
      {
        "pagePath": "pages/statistics/statistics",
        "text": "统计"
      }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
EOF

# 创建 app.js
cat > app.js << 'EOF'
App({
  onLaunch() {
    const records = wx.getStorageSync('poker_records') || []
    console.log('小程序启动，已有记录数：', records.length)
  },
  
  globalData: {
    userInfo: null
  }
})
EOF

# 创建 app.wxss
cat > app.wxss << 'EOF'
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
}

.container {
  padding: 20rpx;
}
EOF

# 创建 sitemap.json
cat > sitemap.json << 'EOF'
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
EOF

# 创建 utils/util.js
cat > utils/util.js << 'EOF'
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
    if (\!monthMap[yearMonth]) {
      monthMap[yearMonth] = {
        yearMonth,
        total: 0,
        count: 0,
        winCount: 0,
        loseCount: 0
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
  
  return Object.values(monthMap).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
}

// 按年分组统计
function getYearlyStatistics(records) {
  const yearMap = {}
  
  records.forEach(record => {
    const year = record.date.substring(0, 4) // 取 YYYY
    if (\!yearMap[year]) {
      yearMap[year] = {
        year,
        total: 0,
        count: 0,
        winCount: 0,
        loseCount: 0
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
  
  return Object.values(yearMap).sort((a, b) => b.year.localeCompare(a.year))
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
EOF

echo "基础结构创建完成！"
