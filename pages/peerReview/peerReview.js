import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    Lists: [],
    roleId: null,
    scoreType: 0, // 0 - 部门负责人, 1 - 项目负责人
  },
  onLoad (options) {
    console.log(options)
    that = this;
    that.setData({
      roleId: Number(wx.getStorageSync('RoleId')), // 当前查看角色
      quarterNum: wx.getStorageSync('quarterNum'),
      userId: wx.getStorageSync('userId'),
      USERID: options.USERID,
      OID: options.OID,
      scoreType: Number(options.scoreType)
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
    console.log(rid);
    let navTitle = '';
    if (APPDATA.scoreType === 1 ) {
      navTitle = '项目评分项得分';
    } else if ( APPDATA.scoreType === 0 ) {
      navTitle = '部门评分项得分';
    }

    wx.setNavigationBarTitle({
      title: navTitle
    });
    const requestUrl = APPDATA.scoreType === 1 ? 
                      'ProjectSumData/GetProjectorScoreTypeAndScorePersonal': 
                      'DepartmentSumData/GetDepartmentScoredTypeAndScore';

    module.request(`${requestUrl}`, {
      data: {
        uid: APPDATA.USERID,
        suid: APPDATA.userId,
        pid: APPDATA.OID,
        did: APPDATA.OID,
        year: APPDATA.quarterNum.split('-')[0],
        quarter: APPDATA.quarterNum.split('-')[1],
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