import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    Lists: [],
    roleId: null
  },
  onLoad (options) {
    that = this;
    that.setData({
      roleId: Number(wx.getStorageSync('RoleId')), // 当前查看角色
      quarterNum: wx.getStorageSync('quarterNum'),
      userId: wx.getStorageSync('userId'),
      USERID: options.USERID
    });

    // 获取项目/部门负责人评分分类以及对应评分
    that.getPeerReviewItem();
  },
  getPeerReviewItem () {
    const APPDATA = that.data;
    /**
     * 3, 4 - 部门相关
     * 5, 6 - 项目相关
     */
    const rid = APPDATA.roleId;
    let navTitle = '';
    if ( rid === 5 || rid === 6 ) {
      navTitle = '项目评分项得分';
    } else if ( rid === 3 || rid === 4 ) {
      navTitle = '部门评分项得分';
    }

    wx.setNavigationBarTitle({
      title: navTitle
    });
    const requestUrl = rid === 5 || rid === 6 ? 
                      'Projects/GetProjectorScoreTypeAndScorePersonal': 
                      'Departments/GetDepartmentScoredTypeAndScore';

    module.request(`${requestUrl}`, {
      data: {
        userid: APPDATA.USERID,
        suserid: APPDATA.userId,
        qt: APPDATA.quarterNum
      },
      callback (res) {
        const data = res.Data;
        if ( !data.length ) return;
        let dataArr = data.map(item => {
          return {
            name: item.Name,
            total: item.Score
          }
        });

        that.setData({
          Lists: dataArr
        });
      }
    });
  }
});