import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    chargeInfo: [], // 负责人信息
    currentQuarter: null,
    showDepart: false,
    showProject: false,
    scoreType: 0, // 0 - 部门负责人, 1 - 项目负责人
    currentIndex: null,
    roleId: null,
    userId: null,
    totalScore: 0,
    tid: null
  },
  onLoad (options) {
    that = this;
    that.setData({
      quarterNum: wx.getStorageSync('quarterNum'),
      roleId: wx.getStorageSync('RoleId'),
      userId: wx.getStorageSync('userId')
    });
    const APPDATA = that.data;
    if ( options ) {
      that.setData({
        scoreType: Number(options.scoreType),
        itemName: options.itemName,
        tid: options.tid,
        showDepart: options.scoreType == 0,
        showProject: options.scoreType == 1
      });
    }

    that.getCurrentScoreType();
  },
  getCurrentScoreType () { // 获取部门/项目负责人评分分类
    const APPDATA = that.data;
    const requestUrl = APPDATA.scoreType === 0 ? 
                                              'Departments/GetDepartmentScoredDetails' : 
                                              'Projects/GetProjectorScoredDetails'
    module.request(requestUrl, {
      data: {
        tid: APPDATA.tid,
        qt: APPDATA.quarterNum,
        userid: APPDATA.userId
      },
      callback (res) {
        const data = res.Data;
        if ( !data.length ) return;
        that.setData({
          chargeInfo: data.map((item) => {
            return {
              userName: item.UserName,
              id: item.UserID,
              name: item.DepartmentName,
              score: item.TScore || 0
            };
          })
        });
      }
    });
  }
})