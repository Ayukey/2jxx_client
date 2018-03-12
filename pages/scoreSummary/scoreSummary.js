import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    Lists: [],
    tid: null
  },
  onLoad (options) {
    that = this;
    const APPDATA = that.data;
    if ( options ) {
      APPDATA.tid = options.tid;
    }
    
    // 获取打分类型
    that.getScoreType();
  },
  getScoreType () { // 获取打分类型
    const APPDATA = that.data;
    module.request('Projects/GetScoreType1', {
      callback (res) {
        const data = res.Data;
        if( !data.length ) return;
        const dataArr = [];
        data.forEach((item) => {
          dataArr.push({
            name: item.Name,
            link: `/pages/scoreOpts/scoreOpts?tid=${APPDATA.tid}&proid=${item.ID}`,
            isShowScore: false
          });
        });
        that.setData({
          Lists: dataArr
        });
      }
    });
  }
})