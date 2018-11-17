import * as module from '../../utils/util';
const moment = require('moment');

const {
  Api,
  wxRequest
} = require('../../utils/httpclient.js');

const regeneratorRuntime = require('regenerator-runtime');
import Toast from '../../dist/toast/toast';

let initYear = moment().year(); // 2018年为起始年
let quarterArr = ['第一季度', '第二季度', '第三季度', '第四季度'];



Page({
  data: {
    Lists: [],
    multiArray: [],
    multiIndex: [],
    currentQuarter: null,
    year: null,
    showQuarter: false,
    currentQuarter: null,
    noneMargin: false
  },

  onLoad(options) {
    const activeQuarter = wx.getStorageSync("activeQuarter")
    const user = wx.getStorageSync("user")
    const year = activeQuarter.year
    const quarter = activeQuarter.quarter

    let yearArr = [];
    if (year === initYear) { // 当前年为起始年2018, 则年份选择只有一个
      yearArr[0] = initYear;
    } else {
      for (let i = +initYear; i < year; i++) {
        yearArr.unshift(i);
      }
    }

    this.setData({
      multiArray: [yearArr, quarterArr],
      index: quarter - 1,
      year: year,
      showQuarter: options.showQuarter || false,
      currentQuarter: `${year}年 ${quarterArr[quarter - 1]}`,
      multiIndex: [0, quarter - 1],
      tid: options.tid || '',
      isView: options.isView || null,
      isQuery: options.isQuery | null,
      itemName: options.itemName || '',
      showSaveBtn: options.showSaveBtn,
      allowViewLevel3: options.allowViewLevel3 || null,
      isSummary: options.isSummary || null,
      noneMargin: options.noneMargin || null,
    });



    // 获取正常可评分的项目列表
    if (this.data.showQuarter) { // 查看操作
      this.viewProjectScoreLists();
    } else { // 评分操作
      this.getProjectLists();
    }

    // 设置navBar title
    wx.setNavigationBarTitle({
      title: this.data.showQuarter ? this.data.itemName : '项目'
    });
  },

  /**
   * 获取当前可考核项目
   */
  getProjectLists: async function() {
    const {
      isView,
      isQuery,
      showSaveBtn
    } = this.data
    const activeQuarter = wx.getStorageSync("activeQuarter")
    Toast.loading()

    try {
      const resp = await wxRequest(Api.GetCanScoreProjects, 'GET', {
        year: activeQuarter.year,
        quarter: activeQuarter.quarter
      })

      console.log(resp)

      let Lists = resp.map((item) => {
        return {
          name: item.projectName,
          link: `/pages/scoreLists/scoreLists?tid=${item.ID}&projectId=${item.projectId}&projectName=${item.projectName}&isView=${isView}&isQuery=${isQuery}&showSaveBtn=${showSaveBtn}`,
          isShowScore: false
        }
      })

      Toast.clear();

      this.setData({
        Lists
      });
    } catch (error) {
      Toast.fail(error);
    }
  },


  viewProjectScoreLists: async function () {
    const {
      tid
    } = this.data

    const activeQuarter = wx.getStorageSync("activeQuarter")
    Toast.loading()

    try {
      const resp = await wxRequest(Api.GetProjectScoreType1, 'GET', {
        t1id: tid,
        year: activeQuarter.year,
        quarter: activeQuarter.quarter
      })

      console.log(resp)
      

      // let Lists = resp.map((item) => {
      //   return {
      //     name: item.Name,
      //     link: `/pages/scoreLists/scoreLists?tid=${item.ID}&proName=${item.Name}&isView=${isView}&isQuery=${isQuery}&showSaveBtn=${showSaveBtn}`,
      //     isShowScore: false
      //   }
      // })

      // Toast.clear();

      // this.setData({
      //   Lists
      // });
    } catch (error) {
      Toast.fail(error);
    }



    // const APPDATA = that.data;
    // module.request('ProjectSumData/GetProjectScoreType1', {
    //   data: {
    //     qt: APPDATA.quarterNum,
    //     tid: parseInt(APPDATA.tid)
    //   },
    //   callback(res) {
    //     const data = res.Data;
    //     if (!data.length) {
    //       that.setData({
    //         Lists: []
    //       });
    //       return;
    //     };
    //     let listsArr = data.map((item) => {
    //       let allowViewLevel3;
    //       if (APPDATA.departId) {
    //         allowViewLevel3 = APPDATA.allowViewLevel3;
    //       } else if (APPDATA.projectId) {
    //         allowViewLevel3 = item.ID === APPDATA.projectId ? true : false;
    //       }

    //       return {
    //         name: item.Name,
    //         link: `/pages/scoreOpts/scoreOpts?proName=${item.Name}&proid=${item.ID}&tid=${APPDATA.tid}&totalScore=${item.TotalScore}&isView=${APPDATA.isView}&isSummary=${APPDATA.isSummary}&itemName=${APPDATA.itemName}&allowViewLevel3=${allowViewLevel3}&quarter=${APPDATA.quarterNum}`,
    //         total: item.TotalScore ? (module.isFloat(item.TotalScore) ? module.getNum(item.TotalScore) : item.TotalScore) : '',
    //         isShowScore: true,
    //         showRank: true
    //       }
    //     });

    //     that.setData({
    //       Lists: listsArr
    //     });
    //   }
    // });
  },


  bindMultiPickerChange(e) {
    const {
      multiArray
    } = this.data;
    const EV_DETAIL_VAL = e.detail.value;
    const MULTI_ARRAY = multiArray;
    this.setData({
      multiIndex: EV_DETAIL_VAL,
      quarterNum: `${MULTI_ARRAY[0][EV_DETAIL_VAL[0]]}-${EV_DETAIL_VAL[1] + 1}`
    });

    this.viewProjectScoreLists();
  },
  
  bindMultiPickerColumnChange(e) {
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = this.data.multiArray[1];
            break;
        }
        break;
    }
    this.setData(data);
  }
});