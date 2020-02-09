const store = window.localStorage;

const PROJECTS_KEY = "__total__projects__";
const PORJECT_PREFIX = "__saved__project__";

/**
 * 数据结构如下
 * PROJECTS_KEY + name: 项目名
 *    pvs         string      PVS时间
 *    startWeek   string      开始周
 *    curWeek     string      当前周
 *    endWeek     string      结束周
 *    isNoVFF     string      是否缺VFF
 *    zp5Term     termInfo    ZP5项目计划
 *    zp7Term     termInfo    ZP7项目计划
 *
 *  TermInfo:
 *    VFF TBT     string
 *    VFF         string
 *    PVS TBT     string
 *    PVS         string
 *    OS TBT      string
 *    OS          string
 *    SOP TBT     string
 *    SOP         string
 */

export class LocalStorageUtil {
  /** 加载以前储存的项目名 */
  static getProjects() {
    const projects = JSON.parse(store.getItem(PROJECTS_KEY) || "[]");
    return projects.map(removePrefix);

    function removePrefix(name) {
      return { value: name.replace(PORJECT_PREFIX, "") };
    }
  }
  /** 获取项目信息 */
  static getProjectInfo(name, fields) {
    const projectInfo = store.getItem(PORJECT_PREFIX + name);
    if (!projectInfo) return {};
    const info = JSON.parse(projectInfo);

    return fields.reduce(
      (res, field) => ({ ...res, [field]: info[field] }),
      {}
    );
  }
  /** 储存项目信息 */
  static setProjectInfo({ name, info }) {
    const preInfo = store.getItem(PORJECT_PREFIX + name);
    let newInfo = { ...info };
    if (preInfo) {
      newInfo = { ...JSON.parse(preInfo), ...newInfo };
    }
    store.setItem(PORJECT_PREFIX + name, JSON.stringify(newInfo));
    addToAllProjects(name);

    function addToAllProjects(name) {
      const pros = JSON.parse(store.getItem(PROJECTS_KEY) || "[]");
      if (!pros.includes(PORJECT_PREFIX + name)) {
        pros.push(PORJECT_PREFIX + name);
        store.setItem(PROJECTS_KEY, JSON.stringify(pros));
      }
    }
  }
  /** 删除这个项目的记录 */
  static deleteProject(name) {
    store.removeItem(PORJECT_PREFIX + name);
    const projects = JSON.parse(store.getItem(PROJECTS_KEY) || "[]");
    store.setItem(
      PROJECTS_KEY,
      JSON.stringify(projects.filter(p => p !== PORJECT_PREFIX + name))
    );
  }
}
