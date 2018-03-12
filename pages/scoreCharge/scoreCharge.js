import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    chargeInfo: [], // 负责人信息
    currentQuarter: null,
    quarterNum: null,
    showDepart: false,
    showProject: false,
    scoreType: 0, // 0 - 部门负责人, 1 - 项目负责人
    currentIndex: null,
    roleId: null,
    multiArray: [['2017', '2016'], ['第一季度', '第二季度', '第三季度', '第四季度']],
    multiIndex: [0, 3],
    showQuarter: true,
    showNone: true
  },
  onLoad (options) {
    that = this;
    that.setData({
      currentQuarter: wx.getStorageSync('currentQuarter'),
      quarterNum: wx.getStorageSync('quarterNum'),
      roleId: wx.getStorageSync('RoleId'),
      showSaveBtn: options.showSaveBtn === 'true' ? true : false
    });
    const APPDATA = that.data;
    if ( options ) {
      that.setData({
        scoreType: Number(options.scoreType),
        showSaveBtn: options.showSaveBtn,
        viewScore: options.viewScore,
        isView: options.isView,
        showNone: options.showNone
      });
    }

    that.getCurrentScoreType();

    // 设置navBar title
    let navTitle;
    if ( APPDATA.viewScore ) { // 查看互评得分
      if ( APPDATA.scoreType === 0 ) {
        navTitle = '部门评分排名';
      } else if ( APPDATA.scoreType === 1 ) {
        navTitle = '项目评分排名';
      }
    } else {
      if ( APPDATA.scoreType === 0 ) { // 部门/项目互评
        navTitle = '对各部门评分';
      } else if ( APPDATA.scoreType === 1 ) {
        navTitle = '对各项目评分';
      }
    }
    wx.setNavigationBarTitle({
      title: navTitle
    });
  },
  onShow () {
    let isScored = wx.getStorageSync('alreadyScore');
    if ( isScored ) {
      that.getCurrentScoreType();
      wx.removeStorageSync('alreadyScore');
    }
  },
  getCurrentScoreType () { // 获取部门/项目负责人评分分类
    const APPDATA = that.data;
    switch ( APPDATA.scoreType ) {
      case 0: that.getDepartmentScoreType();
            break;
      case 1: that.getProjectScoreType();
            break;
    }
  },
  skipToTable (ev) {
    const APPDATA = that.data;
    const id = ev.currentTarget.dataset.id;
    APPDATA.currentIndex = APPDATA.chargeInfo.findIndex((item) => {
      return item.id === id;
    });

    const navigatorUrl = APPDATA.isView ? 
    `/pages/peerReview/peerReview?scoreType=${APPDATA.scoreType}&USERID=${id}` : 
    `/pages/table/table?scoreType=${APPDATA.scoreType}&USERID=${id}&showSaveBtn=${APPDATA.showSaveBtn}&showNone=${APPDATA.showNone}`;
    wx.navigateTo({
      url: navigatorUrl
    });

    // 设置项目id
    that.setData({
      proid: id
    });
  },
  getDepartmentScoreType () { // 获取部门负责人列表
    const APPDATA = that.data;
    const requestUrl = APPDATA.isView ? 'DepartmentSumData/' : 'Departments/';
    module.request(`${requestUrl}GetDepartmentors`, {
      data: {
        qt: APPDATA.quarterNum
      },
      callback (res) {
        const data = res.Data;
        if ( !data.length ) return;
        that.setData({
          chargeInfo: data.map((item) => {
            let st = item.TScore;
            return {
              userName: item.UserName,
              id: item.UserID,
              name: item.DepartmentName,
              score: st ? (module.isFloat(st) ? st.toFixed(2) : st) : 0
            };
          }),
          showDepart: true
        });
      }
    });
  },
  getProjectScoreType () { // 获取项目负责人列表
    const APPDATA = that.data;
    const requestUrl = APPDATA.isView ? 'ProjectSumData/' : 'Projects/';
    module.request(`${requestUrl}GetProjectors`, {
      data: {
        qt: APPDATA.quarterNum
      },
      callback (res) {
        const data = res.Data;
        if ( !data.length ) return;
        that.setData({
          chargeInfo: data.map((item) => {
            let st = item.TScore;
            return {
              userName: item.UserName,
              id: item.UserID,
              name: item.ProjectName,
              score: st ? (module.isFloat(st) ? st.toFixed(2) : st) : 0
            };
          }),
          showProject: true
        });
      }
    });
  },
  bindMultiPickerChange (e) {
    const APPDATA = that.data;
    const EV_DETAIL_VAL = e.detail.value;
    const MULTI_ARRAY = APPDATA.multiArray;
    that.setData({
      multiIndex: EV_DETAIL_VAL,
      quarterNum: `${MULTI_ARRAY[0][EV_DETAIL_VAL[0]]}-${EV_DETAIL_VAL[1] + 1}`
    });

    that.getCurrentScoreType();
  },
  bindMultiPickerColumnChange (e) {
    const APPDATA = that.data;
    let data = {
      multiArray: APPDATA.multiArray,
      multiIndex: APPDATA.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = APPDATA.multiArray[1];
            break;
        }
        break;
    }
    this.setData(data);
  }
})