import WxParse from '../../wxParse/wxParse.js';
import news from '../../news.js';

Page({
  data: {
    newsTitle: '',
    article: ''
  },
  onLoad (options) {
    wx.showLoading({
      title: '加载中...'
    });
    let id = +options.id;
    let that = this;
    let filterData = news.filter(item => {
      return item.id === id;
    })[0];

    let text = filterData.content.replace(/data-src/g, 'src');
    let temp = WxParse.wxParse('article', 'html', text, that, 5);
    that.setData({
      article: temp,
      newsTitle: filterData.title
    });
    wx.hideLoading();
  }
});