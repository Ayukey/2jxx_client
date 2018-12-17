import * as module from '../../utils/util';
let that = null;
let saveLists = [];

Page({
  data: {
    showPopup: false,
    showModal: false,
    showOverlay: false,
    tableLists: [],
    maxScore: 0,
    inputVal: '',
    focus: false,
    scoreType: 0, // 0 - 部门, 1 - 项目, 2 - 查看操作
    targetId: null,
    quarter: null,
    tid: null, // 二级分类id
    proid: null, // 项目id
    type2Id: null,
    userid: null,
    roleId: null,
    isShowNone: true,
    USER_Id: null,
    showSaveBtn: false,
    baseSummary: 0,
    totalSummary: 0,
    showNone: true, // 是否显示 `无该评分项`
    conclusion: '',
    isChangeConclusion: false,
    hiddenTextArea: true,
    remarks: '',
    alreadyScoreArr: []
  },
  onLoad(options) {
    console.log(options)
    that = this;
    that.setData({
      quarter: wx.getStorageSync('quarterNum'),
      userid: wx.getStorageSync('userId'),
      roleId: wx.getStorageSync('RoleId')
    });
    const APPDATA = that.data;

    if (options) {
      that.setData({
        tid: Number(options.tid),
        proid: Number(options.proid),
        departmentid: Number(options.departmentid),
        type2Id: Number(options.type2Id), // 二级分类id
        scoreType: Number(options.scoreType),
        USER_Id: Number(options.USERID),
        OID: Number(options.OID),
        showSaveBtn: options.showSaveBtn === 'true' ? true : false,
        showNone: options.showNone === 'false' ? false : true,
        quarter: options.quarter || wx.getStorageSync('quarterNum'),
        remarks: options.remark || '',
      });
    }

    // 获取三级分类的项目评分
    switch (APPDATA.scoreType) {
      case 0:
        that.getDepartmentScoreType(); // 部门负责人评分分类
        break;
      case 1:
        that.getProjectScoreType(); // 项目负责人评分分类
        break;
      case 2:
        that.viewScoreSummary(); // 项目评分汇总
        break;
      default:
        that.getScoreTable(); // 项目评分分类
        break;
    }
  },
  getScoreTable(res) { // 项目打分类型
    const APPDATA = that.data;
    module.request('Projects/GetProjectScoreType3', {
      data: {
        t1id: APPDATA.tid,
        t2id: APPDATA.type2Id,
        pid: APPDATA.proid,
        year: parseInt(APPDATA.quarter.split('-')[0]),
        quarter: parseInt(APPDATA.quarter.split('-')[1]),
      },
      callback(res) {
        const data = res.Data;
        that.setData({
          remarks: APPDATA.remarks,
          conclusion: APPDATA.remarks
        });
        if (!data.Scores.length) return;

        that.fillScoreType(data.Scores);
      }
    });
  },
  getProjectScoreType() { // 项目负责人评分分类
    const APPDATA = that.data;
    module.request('Projects/GetProjectorScoreTypeAndScorePersonal', {
      data: {
        uid: APPDATA.USER_Id,
        suid: APPDATA.userid,
        pid: APPDATA.OID,
        year: parseInt(APPDATA.quarter.split('-')[0]),
        quarter: parseInt(APPDATA.quarter.split('-')[1]),
      },
      callback(res) {
        const data = res.Data;
        if (!data.length) return;
        // 填充评分类型列表
        that.fillScoreType(data);
      }
    });
  },
  viewScoreSummary() { // 项目评分汇总
    const APPDATA = that.data;
    module.request('ProjectSumData/GetProjectScoreType3', {
      data: {
        t1id: APPDATA.tid,
        t2id: APPDATA.type2Id,
        pid: APPDATA.proid,
        year: parseInt(APPDATA.quarter.split('-')[0]),
        quarter: parseInt(APPDATA.quarter.split('-')[1]),
      },
      callback(res) {
        const data = res.Data;
        if (!data.Scores.length) return;

        that.fillScoreType(data.Scores);
      }
    });
  },
  getDepartmentScoreType() { // 部门负责人评分分类
    const APPDATA = that.data;
    module.request('Departments/GetDepartmentScoredTypeAndScore', {
      data: {
        uid: APPDATA.USER_Id,
        suid: APPDATA.userid,
        did: APPDATA.OID,
        year: parseInt(APPDATA.quarter.split('-')[0]),
        quarter: parseInt(APPDATA.quarter.split('-')[1]),
      },
      callback(res) {
        const data = res.Data;
        if (!data.length) return;

        that.fillScoreType(data);
      }
    });
  },
  fillScoreType(data) { // 填充打分列表data
    const APPDATA = that.data;
    let baseSummary = 0,
      totalSummary = 0;
    let tableArr = data.map((item) => {
      baseSummary += item.MaxScore;
      totalSummary += item.TotalScore < 0 ? 0 : item.TotalScore;

      that.setData({
        baseSummary,
        totalSummary
      });
      let scoreVal = APPDATA.scoreType == 0 || APPDATA.scoreType == 1 ? item.Score : item.TotalScore;
      return {
        id: item.ID,
        name: item.Name,
        MaxScore: item.MaxScore ? item.MaxScore : item.ScoreLimit,
        TotalScore: scoreVal === -1 ? '/' : scoreVal
        // TotalScore: item.TotalScore || (APPDATA.showSaveBtn ? '/' : '')
      }
    });
    that.setData({
      tableLists: tableArr
    });

    // 存储作为是否进行评分判断
    saveLists = tableArr;
  },
  showPopup(ev) { // 显示打分输入框
    const APPDATA = that.data;
    if (!APPDATA.showSaveBtn) { // 查看及汇总表格不可操作
      return;
    }
    const TARGET = ev.currentTarget.dataset,
      TARGET_ID = TARGET.id,
      TARGET_MAX = TARGET.max;
    that.setData({
      showPopup: true,
      targetId: TARGET_ID,
      maxScore: TARGET_MAX,
      focus: true,
      showOverlay: true,
      hiddenTextArea: false
    });
  },
  getInputValue(ev) { // 获取输入打分值
    const APPDATA = that.data;
    const VAL = ev.detail.value;
    that.setData({
      inputVal: VAL.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // 最多允许小数点后两位
    });
    // 当输入分值大于最大允许分值时给予提示
    if (VAL > APPDATA.maxScore) {
      wx.showModal({
        content: `评分不能大于${APPDATA.maxScore}分`,
        showCancel: false
      });
    }
  },
  confirmScore() { // 确定打分
    const APPDATA = that.data;

    if (!APPDATA.inputVal.length) { // 未输入
      wx.showModal({
        content: '请输入打分值',
        showCancel: false
      });
      return;
    }

    if (APPDATA.inputVal > APPDATA.maxScore) { // 打分值大于最大允许值
      wx.showModal({
        content: `评分不能大于${APPDATA.maxScore}分`,
        showCancel: false
      });

      that.setData({
        focus: true
      });
      return;
    }

    // 将打分值更新到表格
    let id = APPDATA.targetId;
    let newLists = APPDATA.tableLists;
    let currentIndex = newLists.findIndex((item) => {
      return item.id === id;
    });
    newLists[currentIndex].TotalScore = APPDATA.inputVal;

    that.setData({
      tableLists: newLists
    });
    that.hidden();
  },
  noneScore() { // 无该打分项
    const APPDATA = that.data;
    // 将打分值更新到表格
    let id = APPDATA.targetId;
    let newLists = APPDATA.tableLists;
    let currentIndex = newLists.findIndex((item) => {
      return item.id === id;
    });
    newLists[currentIndex].TotalScore = '/';

    that.setData({
      tableLists: newLists
    });
    that.hidden();
  },
  getSCStr() { // 获取评分项各评分值
    const APPDATA = that.data;
    let scstr = '';
    let scoreDataArr = [];
    let scArr = APPDATA.tableLists.map((item) => {
      item.TotalScore = item.TotalScore.toString();
      scoreDataArr.push(item.TotalScore ? item.TotalScore.replace('/', -1) : 0);
      return `${item.id}|${item.TotalScore ? item.TotalScore.replace('/', -1) : 0}`;
    });
    scstr = scArr.join(',');
    // 检测是否进行了评分
    that.setData({
      alreadyScoreArr: scoreDataArr
    });

    return {
      scstr,
      qt: APPDATA.quarter,
      suserid: APPDATA.userid,
      userid: APPDATA.USER_Id
    };
  },
  saveProjectScore() { // 保存项目打分
    const APPDATA = that.data;
    const scstr = that.getSCStr().scstr;
    // 是否进行了评分操作
    const isChange = APPDATA.alreadyScoreArr.every((item, index) => {
      return item == saveLists[index].TotalScore;
    });

    if (isChange && APPDATA.conclusion == APPDATA.remarks) {
      that.successFn();
      return;
    }

    module.request('Projects/ProjectScore', {
      method: "POST",
      data: {
        t1id: APPDATA.tid,
        t2id: APPDATA.type2Id,
        year: parseInt(APPDATA.quarter.split('-')[0]),
        quarter: parseInt(APPDATA.quarter.split('-')[1]),
        pid: APPDATA.proid,
        userid: APPDATA.userid,
        scstr: scstr,
        remark: APPDATA.conclusion || ' '
      },
      callback(res) {
        that.successFn();
      }
    });
  },
  saveProjectScoreType() { // 提交项目负责人评分
    const APPDATA = that.data;
    const submitOpts = Object.assign({}, that.getSCStr());
    submitOpts.year = parseInt(APPDATA.quarter.split('-')[0])
    submitOpts.quarter = parseInt(APPDATA.quarter.split('-')[1])
    submitOpts.suid = submitOpts.suserid 
    submitOpts.uid = submitOpts.userid 
    submitOpts.pid = APPDATA.OID

    console.log(submitOpts)

    // 是否进行了评分操作
    const isChange = APPDATA.alreadyScoreArr.every((item, index) => {
      return item == saveLists[index].TotalScore;
    });

    if (isChange) {
      that.successFn();
      return;
    }

    module.request('Projects/ProjectChargerScore', {
      method: "POST",
      data: submitOpts,
      callback(res) {
        that.successFn();
      }
    });
  },
  saveDepartmentScoreType() { // 提交部门负责人评分
    const APPDATA = that.data;
    const submitOpts = Object.assign({}, that.getSCStr());
    submitOpts.year = parseInt(APPDATA.quarter.split('-')[0])
    submitOpts.quarter = parseInt(APPDATA.quarter.split('-')[1])
    submitOpts.suid = submitOpts.suserid
    submitOpts.uid = submitOpts.userid
    submitOpts.did = APPDATA.OID

    // 是否进行了评分操作
    const isChange = APPDATA.alreadyScoreArr.every((item, index) => {
      return item == saveLists[index].TotalScore;
    });

    if (isChange) {
      that.successFn();
      return;
    }
    module.request('Departments/DepartmentChargerScore', {
      method: "POST",
      data: submitOpts,
      callback(res) {
        that.successFn();
      }
    });
  },
  saveScore() { // 保存打分
    const APPDATA = that.data;
    switch (APPDATA.scoreType) {
      case 0:
        that.saveDepartmentScoreType(); // 给部门负责人打分
        break;
      case 1:
        that.saveProjectScoreType(); // 给项目负责人打分
        break;
      default:
        that.saveProjectScore(); // 给项目打分
        // that.submitConclusion();
    }
  },
  getConclusion(ev) { // 获取总结内容
    const APPDATA = that.data;
    const CONCLUSION = ev.detail.value
    const ISCHANGECONCLUSION = true
    that.setData({
      isChangeConclusion: ISCHANGECONCLUSION,
      conclusion: CONCLUSION
    });
  },
  submitConclusion() {
    const APPDATA = that.data;
    const REMARKS = APPDATA.conclusion;

    module.request('Projects/ProjectRemark2', {
      method: "POST",
      data: {
        pid: APPDATA.proid,
        t1id: APPDATA.tid,
        t2id: APPDATA.type2Id,
        year: parseInt(APPDATA.quarter.split('-')[0]),
        quarter: parseInt(APPDATA.quarter.split('-')[1]),
        remark: REMARKS || ' '
      },
      callback(res) {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  successFn(successText) {
    wx.showToast({
      title: successText || '评分成功',
      icon: 'success',
      duration: 2000,
      success() {
        // 返回上一页
        wx.navigateBack();
      }
    });

    wx.setStorageSync('alreadyScore', true);
  },
  hidden() {
    const APPDATA = that.data;
    console.log(APPDATA.conclusion)
    that.setData({
      showPopup: false,
      showModal: false,
      showOverlay: false,
      hiddenTextArea: true,
      inputVal: ''
    });

    if (APPDATA.isChangeConclusion) {
      that.setData({
        remarks: APPDATA.conclusion
      });
    }
  },
  showScore() {
    that.setData({
      showPopup: false,
      showModal: true
    });
  }
})