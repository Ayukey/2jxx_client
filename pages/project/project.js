import * as module from '../../utils/util';
let that = null;
let initYear = module.config.initYear; // 2018年为起始年
let quarterArr = ['第一季度', '第二季度', '第三季度', '第四季度'];

Page({
  data: {
    Lists: [],
    multiArray: [],
    multiIndex: [],
    quarterNum: null,
    year: null,
    showQuarter: false,
    currentQuarter: null,
    noneMargin: false
  },
  onLoad(options) {
    that = this;
    const APPDATA = that.data;
    const QuarterInfo = wx.getStorageSync('quarterNum');
    let [y, q] = QuarterInfo.split('-');

    let yearArr = [];
    if (y === initYear) { // 当前年为起始年2018, 则年份选择只有一个
      yearArr[0] = initYear;
    } else {
      for (let i = +initYear; i < y; i++) {
        yearArr.unshift(i);
      }
    }

    that.setData({
      multiArray: [yearArr, quarterArr],
      index: QuarterInfo.split('-')[1] - 1,
      year: QuarterInfo.split('-')[0],
      showQuarter: options.showQuarter || false,
      quarterNum: QuarterInfo,
      multiIndex: [0, q - 1],
      tid: options.tid || '',
      isView: options.isView || null,
      isQuery: options.isQuery | null,
      itemName: options.itemName || '',
      showSaveBtn: options.showSaveBtn,
      currentQuarter: wx.getStorageSync('currentQuarter'),
      allowViewLevel3: options.allowViewLevel3 || null,
      isSummary: options.isSummary || null,
      noneMargin: options.noneMargin || null,
      departId: JSON.parse(wx.getStorageSync('departId')),
      projectId: JSON.parse(wx.getStorageSync('projectId'))
    });

    // 获取正常可评分的项目列表
    if (APPDATA.showQuarter) { // 查看操作
      that.viewProjectScoreLists();
    } else { // 评分操作
      that.getProjectLists();
    }

    // 设置navBar title
    wx.setNavigationBarTitle({
      title: APPDATA.showQuarter ? APPDATA.itemName : '项目'
    });
  },
  getProjectLists() {
    const APPDATA = that.data;
    module.request('Projects/GetCanScoreProjects', {
      data: {
        year: APPDATA.quarterNum.split('-')[0],
        quarter: APPDATA.quarterNum.split('-')[1],
      },
      callback(res) {
        const data = res.Data;
        if (!data.length) return;
        let listsArr = data.map((item) => {
          return {
            name: item.Name,
            link: `/pages/scoreLists/scoreLists?tid=${item.ID}&proName=${item.Name}&isView=${APPDATA.isView}&isQuery=${APPDATA.isQuery}&showSaveBtn=${APPDATA.showSaveBtn}`,
            isShowScore: false
          }
        });

        that.setData({
          Lists: listsArr
        });
      }
    });
  },
  viewProjectScoreLists() {
    const APPDATA = that.data;
    module.request('ProjectSumData/GetProjectScoreType1', {
      data: {
        year: APPDATA.quarterNum.split('-')[0],
        quarter: APPDATA.quarterNum.split('-')[1],
        t1id: parseInt(APPDATA.tid)
      },
      callback(res) {
        const data = res.Data;
        if (!data.length) {
          that.setData({
            Lists: []
          });
          return;
        };
        let listsArr = data.map((item) => {
          let allowViewLevel3;
          if (APPDATA.departId) {
            allowViewLevel3 = APPDATA.allowViewLevel3;
          } else if (APPDATA.projectId) {
            allowViewLevel3 = item.ID === APPDATA.projectId ? true : false;
          }

          console.log(item)
          return {
            name: item.Name,
            link: `/pages/scoreOpts/scoreOpts?proName=${item.Name}&proid=${item.ID}&tid=${APPDATA.tid}&totalScore=${item.TotalScore}&isView=${APPDATA.isView}&isSummary=${APPDATA.isSummary}&itemName=${APPDATA.itemName}&allowViewLevel3=${allowViewLevel3}&quarter=${APPDATA.quarterNum}`,
            total: item.TotalScore ? (module.isFloat(item.TotalScore) ? module.getNum(item.TotalScore) : item.TotalScore) : '',
            isShowScore: true,
            showRank: true
          }
        });

        that.setData({
          Lists: listsArr
        });
      }
    });
  },
  bindMultiPickerChange(e) {
    const APPDATA = that.data;
    const EV_DETAIL_VAL = e.detail.value;
    const MULTI_ARRAY = APPDATA.multiArray;
    that.setData({
      multiIndex: EV_DETAIL_VAL,
      quarterNum: `${MULTI_ARRAY[0][EV_DETAIL_VAL[0]]}-${EV_DETAIL_VAL[1] + 1}`
    });

    that.viewProjectScoreLists();
  },
  bindMultiPickerColumnChange(e) {
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
});