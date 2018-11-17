const {
  Api,
  wxRequest
} = require('../../utils/httpclient.js');

const regeneratorRuntime = require('regenerator-runtime');
import Toast from '../../dist/toast/toast';

Page({
  data: {
    Lists: [],

    DRMList: [],

    projectId: null, // 项目ID
    projectName: '', // 项目名称

    isView: false, // 当前操作是否为查询操作
    isQuery: false,
    isSummary: false,
    showSaveBtn: false
  },

  onLoad(options) {
    let {
      projectId,
      projectName,
      isView,
      isQuery,
      isSummary,
      showSaveBtn
    } = this.data

    projectId = options.projectId || null
    projectName = options.projectName || ''
    isView = options.isView || false
    isQuery = options.isQuery || false
    isSummary = options.isSummary || false
    showSaveBtn = options.showSaveBtn || false

    this.setData({
      projectId,
      projectName,
      isView,
      isQuery,
      isSummary,
      showSaveBtn
    })

    // 设置navBar title
    wx.setNavigationBarTitle({
      title: isSummary ? '项目汇总' : projectName
    });
  },

  onShow() {
    // 获取用户项目评分一级分类权限
    this.initData()
  },

  initData: async function() { 
    let {
      isSummary,
      projectId,
      isView,
      isQuery,
      projectName,
      showSaveBtn
    } = this.data

    const activeQuarter = wx.getStorageSync("activeQuarter")
    const user = wx.getStorageSync("user")

    Toast.loading({
      mask: true,
      message: '加载中...'
    })

    try {
      // 获取一级评分模版的权限
      const resp1 = await wxRequest(Api.GetSTMapping1, "GET", {
        UserID: user.uid
      })
      console.log(resp1)

      let DRMList = resp1.map((item) => {
        return item.TID;
      }).sort()

      let requestUrl = isSummary ? Api.GetScoreType1 : Api.GetProjectScoreType1AndScore

      const resp2 = await wxRequest(requestUrl, "GET", {
        pid: projectId,
        year: activeQuarter.year,
        quarter: activeQuarter.quarter
      })

      console.log(resp2)

      const Lists = [];
      resp2.forEach((item, index) => {
        const allowViewLevel3 = user.departmentIds.includes(item.ID) ? true : false; // 部门相关成员是否允许查看三级
        let link = '';
        if (isView) {
          if (isQuery) { // 查询相关操作
            link = `/pages/scoreOpts/scoreOpts?tid=${item.ID}&proid=${APPDATA.tid}&proName=${projectName}&itemName=${item.Name}&isView=${isView}`;
          } else {
            link = `/pages/project/project?showQuarter=true&tid=${item.ID}&itemName=${item.Name}&isView=${isView}&isSummary=${isSummary}&allowViewLevel3=${allowViewLevel3}`;
          }
        } else {
          let hideNoneAction = this.hasNoneScoreAction(item.ID);
          link = `/pages/scoreOpts/scoreOpts?tid=${item.ID}&proid=${projectId}&proName=${projectName}&itemName=${item.Name}&showSaveBtn=${showSaveBtn}&hideNoneAction=${hideNoneAction}`;
        }
        Lists.push({
          name: item.Name,
          link: link,
          isShowScore: false,
          enable: DRMList.includes(item.ID) ? true : false,
          class: DRMList.includes(item.ID) ? 'allow' : 'forbid',
          total: item.TotalScore ? (module.isFloat(item.TotalScore) ? item.TotalScore.toFixed(2) : item.TotalScore) : '',
          isView: isView,
          isShowScore: true,
          notScoreAction: this.hasNoneScoreAction(item.ID)
        });
      });

      Toast.clear();

      this.setData({
        Lists,
        DRMList
      });

    } catch (error) {
      Toast.fail(error);
    }

  },

  hasNoneScoreAction(id) { // 判断是否有 `无该评分项`
    // 经济(id = 4) | 财务(id = 5) | 人力(id = 6) | 行政(id = 7) | 依法合规(id = 8)  - 隐藏 `无该评分项`
    if (id === 4 || id === 5 || id === 6 || id === 7 || id === 8) {
      return false;
    }

    return true;
  }
})