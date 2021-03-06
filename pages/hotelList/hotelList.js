const util = require('../../utils/util.js')

Page({
  data: {
    // 酒店首页 data ------------------------
    date: {
      today: util.getDay(util.tomorrow(new Date())),
      night: 1,
      start: util.getDay(util.tomorrow(new Date())),
      end: util.getDay(util.tomorrow(new Date(util.tomorrow(new Date))))
    },
    // 显示选中的城市
    city: {
      CityName_CN: '',
      CityCode: ''
    },
    // 城市提示列表
    promptList: '',
    // 输入框 城市
    searchCity: '',
    // 请求到的酒店列表
    hotelList: '',
    // 底下提示 现实与否,刚进来不显示,所以开始为false
    flag: false
  },
  onLoad() {
    var city = wx.getStorageSync('city') || ''
    console.log(city)
    this.setData({
      city: city
    })
  },
  onShow(){
    var city = wx.getStorageSync('city') || this.data.city || ''
    console.log(city)
    this.setData({
      city: city
    })
  },
  // 首页 函数区
  // 入住/离店 日期
  startDate(start) {
    console.log('入住日期')
    console.log(start.detail.value)
    this.setData({
      'date.start': start.detail.value
    })
    var days = util.getDate(this.data.date.end).getTime() - util.getDate(this.data.date.start).getTime()
    var night = parseInt(days / (1000 * 60 * 60 * 24));
    this.setData({
      'date.night': night
    })
  },
  endDate(end) {
    console.log('离店日期')
    console.log(end.detail.value)
    this.setData({
      'date.end': end.detail.value
    })
    var days = util.getDate(this.data.date.end).getTime() - util.getDate(this.data.date.start).getTime()
    var night = parseInt(days / (1000 * 60 * 60 * 24));
    this.setData({
      'date.night': night
    })
  },
  // 点击 选择目的地 进入 cityList 页面
  toCityList() {
    wx.navigateTo({
      url: '../cityList/cityList',
    })
  },

  // 输入框改变事件---------------------
  inputChange(val) {
    console.log('input 改变事件')
    if ( !val || !val.detail || !val.detail.value) return 
    var url = 'api/Daolv/city_prompt/' + val.detail.value
    getApp().post(url,{}, res => {
      console.log(res)
      this.setData({
        promptList: res
      })
    })
  },
  // input 下拉框 选中事件--------------
  selectInputCity(e) {
    console.log('input 下拉框 选中 城市 事件')
    console.log(e)
    var city = {
      CityName_CN: e.currentTarget.dataset.citynamecn,
      CityCode: e.currentTarget.dataset.citycode
    }
    wx.setStorageSync('city', city)
    this.setData({
      city: city,
      promptList: '',
      searchCity: ''
    })

  },
  // 点击搜索按钮 请求酒店列表
  clickSearchHotel() {
    console.log('点击搜索按钮')
    var that = this
    // 如果 没选城市 不行
    if (!this.data.city.CityName_CN){
      wx.showToast({
        title: '请选择或搜索入住城市',
        icon: 'none',
        duration: 2000
      })
      return
    }
    // 如果 时间 一样 不行
    if (this.data.date.start === this.data.date.end) {
      wx.showToast({
        title: '入住/离店日期不能相同',
        icon: 'none',
        duration: 2000
      })
      return
    }
    console.log(this.data.city.CityCode)
    var url = 'api/Daolv/hotel_list'
    getApp().post(url, {
      CityCode: that.data.city.CityCode,
      CheckInDate: that.data.date.start,
      CheckOutDate: that.data.date.end
    }, res => {
      console.log(res)
      // 所搜过后,要把flagbianwei true
      that.setData({
        hotelList: res,
        flag: true
      })
    })
  },
  // 点击酒店列表----------
  clickHotel(e) {
    console.log('点击酒店列表')
    console.log(e)
    var hotelId = e.currentTarget.dataset.hotelid
    var inDate = this.data.date.start
    var outDate = this.data.date.end
    var night = this.data.date.night
    wx.navigateTo({
      url: `/pages/hotelDetails/hotelDetails?hotelId=${hotelId}&inDate=${inDate}&outDate=${outDate}&night=${night}`,
    })
  },
  //  --------------------
  onUnload() {
    console.log('关闭页面')
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})