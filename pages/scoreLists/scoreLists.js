import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    Lists: [],
    isView: false, // 当前操作是否为查询操作
    tid: null,
    proName: '',
    DRMList: [],
    quarter: null
  },
  onLoad (options) {
    that = this;
    const APPDATA = that.data;
    that.setData({
      quarter: wx.getStorageSync('quarterNum'),
      departId: wx.getStorageSync('departId'),
      projectId: wx.getStorageSync('projectId')
    });
    
    if ( options ) {
      that.setData({
        tid: options.tid,
        proName: options.proName,
        isView: options.isView === 'true' ? true : false,
        isQuery: options.isQuery === 'true' ? true : false,
        isSummary: options.isSummary,
        showSaveBtn: options.showSaveBtn
      });
    }

    // 设置navBar title
    wx.setNavigationBarTitle({
      title: APPDATA.isSummary ? '项目汇总' : APPDATA.proName
    });
  },
  onShow () {
    // 获取用户项目评分一级分类权限
    that.getRoleDRM();
  },
  getScoreType () { // 获取打分类型
    const APPDATA = that.data;
    const requestUrl = APPDATA.isSummary ? 'Projects/GetScoreType1' : 'Projects/GetProjectScoreType1AndScore';
    module.request(requestUrl, { // GetScoreType1 废弃
      data: {
        proid: APPDATA.tid,
        qt: APPDATA.quarter
      },
      callback (res) {
        const data = res.Data;
        if( !data.length ) return;
        const dataArr = [];
        data.forEach((item, index) => {
          const allowViewLevel3 = item.ID == APPDATA.departId ? true : false; // 部门相关成员是否允许查看三级
          let link = '';
          if ( APPDATA.isView ) {
            if ( APPDATA.isQuery ) { // 查询相关操作
              link = `/pages/scoreOpts/scoreOpts?tid=${item.ID}&proid=${APPDATA.tid}&proName=${APPDATA.proName}&itemName=${item.Name}&isView=${APPDATA.isView}`;
            } else {
              link = `/pages/project/project?showQuarter=true&tid=${item.ID}&itemName=${item.Name}&isView=${APPDATA.isView}&isSummary=${APPDATA.isSummary}&allowViewLevel3=${allowViewLevel3}`;
            }
          } else {
            let hideNoneAction = that.hasNoneScoreAction(item.ID);
            link = `/pages/scoreOpts/scoreOpts?tid=${item.ID}&proid=${APPDATA.tid}&proName=${APPDATA.proName}&itemName=${item.Name}&showSaveBtn=${APPDATA.showSaveBtn}&hideNoneAction=${hideNoneAction}`;
          }
          dataArr.push({
            name: item.Name,
            link: link,
            isShowScore: false,
            enable: APPDATA.DRMList.indexOf(item.ID) == -1 ? false : true,
            class: APPDATA.DRMList.indexOf(item.ID) == -1 ? 'forbid' : 'allow',
            total: item.TotalScore ? (module.isFloat(item.TotalScore) ? item.TotalScore.toFixed(2) : item.TotalScore) : '',
            isView: APPDATA.isView,
            isShowScore: true,
            notScoreAction: that.hasNoneScoreAction(item.ID)
          });
        });
        that.setData({
          Lists: dataArr
        });
      }
    });
  },
  hasNoneScoreAction (id) { // 判断是否有 `无该评分项`
    // 经济(id = 4) | 财务(id = 5) | 人力(id = 6) | 行政(id = 7) | 依法合规(id = 8)  - 隐藏 `无该评分项`
    if ( id === 4 || id === 5 || id === 6 || id === 7 || id === 8 ) {
      return false;
    }

    return true;
  },
  getRoleDRM () {
    const APPDATA = that.data;
    module.request('Projects/GetSTMapping1', {
      data: {
        UserID: wx.getStorageSync('userId')
      },
      callback (res) {
        const data = res.Data;
        that.setData({
          DRMList: data.map((item) => {
            return item.TID;
          }).sort()
        });
        // 获取打分类型
        that.getScoreType();
      }
    });
  }
})