import * as module from '../../utils/util';
let that = null;
let quarterArr = ['第一季度', '第二季度', '第三季度', '第四季度'];

Page({
  data: {
    Lists: [],
    tid: null,    // 一级分类id
    proId: null,  // 项目id
    proName: '',  // 项目名
    currentQuarter: wx.getStorageSync('currentQuarter'), // 当前季度(展示)
    quarter: wx.getStorageSync('quarterNum'), // 当前季度(传参)
    isView: false, // 是否为查看操作
    totalScore: 0,
    showSaveBtn: false,
    DRMList: [],
    roleId: null
  },
  onShow() {
    that.getRoleDRM();
  },
  onLoad(options) {
    console.log(options)
    that = this;
    const APPDATA = that.data;
    that.setData({
      roleId: wx.getStorageSync('RoleId'),
      departId: JSON.parse(wx.getStorageSync('departId')),
      projectId: JSON.parse(wx.getStorageSync('projectId'))
    });

    const quarter = options.quarter || wx.getStorageSync('quarterNum')  // 获取当前季度    
    const currentQuarter = `${quarter.split('-')[0]}年 ${quarterArr[quarter.split('-')[1] - 1]}`

    if (options) {
      that.setData({
        tid: options.tid || '',
        proId: options.proid || '',
        totalScore: module.getNum(options.totalScore) || '',
        proName: options.proName || '',
        itemName: options.itemName || '',
        isView: options.isView === 'true' ? true : false,
        isSummary: options.isSummary === 'true' ? true : false,
        showSaveBtn: options.showSaveBtn === 'true' ? true : false,
        allowViewLevel3: options.allowViewLevel3 === 'true' ? true : false,
        hideNoneAction: options.hideNoneAction || '',
        quarter,
        currentQuarter
      });
    }

    // 设置navBar title
    wx.setNavigationBarTitle({
      title: APPDATA.isView ? APPDATA.proName : APPDATA.itemName
    });
  },
  getScoreOpts() { // 项目评分 - 获取可评分列表
    const APPDATA = that.data;
    module.request('Projects/GetProjectScoreType2', {
      data: {
        t1id: APPDATA.tid,
        pid: APPDATA.proId,
        year: APPDATA.quarter.split('-')[0],
        quarter: APPDATA.quarter.split('-')[1],
      },
      callback(res) {
        const data = res.Data;
        if (!data.Scores.length) return;
        const scoreArr = [];

        data.Scores.forEach((item, index) => {
          let ts = item.TotalScore;
          scoreArr.push({
            name: item.Name,
            link: `/pages/table/table?tid=${APPDATA.tid}&proid=${APPDATA.proId}&type2Id=${item.ID}&showSaveBtn=${APPDATA.showSaveBtn}&showNone=${APPDATA.hideNoneAction}`,
            total: ts == 0 ? ts : (module.isFloat(ts) ? module.getNum(ts) : ts),
            enable: APPDATA.DRMList.indexOf(item.ID) == -1 ? false : true,
            class: APPDATA.DRMList.indexOf(item.ID) == -1 ? 'forbid' : 'allow',
            isShowScore: true
          });
        });

        that.setData({
          Lists: scoreArr
        });
      }
    });
  },
  viewScoreOpts() { // 查看评分
    const APPDATA = that.data;
    module.request('ProjectSumData/GetProjectScoreType2', {
      data: {
        year: APPDATA.quarter.split('-')[0],
        quarter: APPDATA.quarter.split('-')[1],
        t1id: APPDATA.tid,
        pid: APPDATA.proId
      },
      callback(res) {
        const data = res.Data;
        if (!data.Scores.length) return;
        const scoreArr = [];
        data.Scores.forEach((item, index) => {
          let ts = item.TotalScore;
          scoreArr.push({
            name: item.Name,
            link: `/pages/table/table?tid=${APPDATA.tid}&proid=${APPDATA.proId}&type2Id=${item.ID}&scoreType=2&quarter=${APPDATA.quarter}`,
            total: ts == 0 ? ts : (module.isFloat(ts) ? module.getNum(ts) : ts),
            enable: APPDATA.DRMList.indexOf(item.ID) == -1 ? false : true,
            class: APPDATA.DRMList.indexOf(item.ID) == -1 ? 'forbid' : 'allow',
            showRank: true,
            isShowScore: APPDATA.isView,
            isSummary: APPDATA.isSummary,
            isDRM: (() => {
              /**
               * 项目负责人和项目相关人员 -> GetProjectScoreType2 -> ID一致即可进入三级评分
               * 部门负责人和部门相关人员 -> GetProjectScoreType1 -> 8大条线id一致才可进入三级评分
               */
              // 部门
              if (APPDATA.roleId == 3 || APPDATA.roleId == 4) {
                if (APPDATA.tid === 10 || APPDATA.tid === 11) {
                  return false;
                }

                if (APPDATA.allowViewLevel3) {
                  return true;
                }
                return false;
              }

              // 项目
              if (APPDATA.roleId == 5 || APPDATA.roleId == 6) {
                if (APPDATA.allowViewLevel3) {
                  return true;
                }
                return false;
              }

              return true;
            })(),
            viewSummaryClass: (() => {
              // 部门
              if (APPDATA.roleId == 3 || APPDATA.roleId == 4) {
                if (APPDATA.allowViewLevel3) {
                  return 'allow';
                }
                return 'forbid';
              }

              // 项目
              if (APPDATA.roleId == 5 || APPDATA.roleId == 6) {
                if (APPDATA.allowViewLevel3) {
                  return 'allow';
                }
                return 'forbid';
              }

              if (APPDATA.tid === 10 || APPDATA.tid === 11) {
                return 'forbid';
              }
              return 'allow';
            })()
          });
        });

        that.setData({
          Lists: scoreArr
        });
      }
    });
  },
  getRoleDRM() {
    const APPDATA = that.data;
    module.request('Projects/GetSTMapping2', {
      data: {
        UserID: wx.getStorageSync('userId')
      },
      callback(res) {
        const data = res.Data;
        that.setData({
          DRMList: data.map((item) => {
            return item.TID;
          }).sort()
        });
        // 获取二级分类的项目评分
        if (APPDATA.isView) {
          that.viewScoreOpts();
        } else {
          that.getScoreOpts();
        }
      }
    });
  }
});