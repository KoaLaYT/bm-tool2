const store = window.localStorage;

const PROJECTS_KEY = "__total__projects__";
const PORJECT_PREFIX = "__saved__project__";

export class LocalStorageUtil {
  /** 加载以前储存的项目名 */
  static getProjects() {
    const projects = JSON.parse(store.getItem(PROJECTS_KEY) || "[]");
    return projects.map(removePrefix);

    function removePrefix(name) {
      return { value: name.replace(PORJECT_PREFIX, "") };
    }
  }
  /** 获取项目的PVS时间 */
  static getProjectPvs(name) {
    const projectInfo = store.getItem(PORJECT_PREFIX + name);
    if (!projectInfo) return "";
    else return JSON.parse(projectInfo).pvs;
  }
  /** 储存项目的PVS时间 */
  static setProjectPvs({ name, pvs }) {
    const projectInfo = store.getItem(PORJECT_PREFIX + name);

    let info = { pvs };
    if (projectInfo) {
      info = { ...JSON.parse(projectInfo), pvs };
    }

    store.setItem(PORJECT_PREFIX + name, JSON.stringify(info));
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
