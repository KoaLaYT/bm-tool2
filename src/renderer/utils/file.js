const { remote } = require("electron");
const fs = remote.require("fs");

export class FileUtil {
  static async getFiles(path) {
    return new Promise(resolve => {
      fs.readdir(path, (err, files) => {
        if (err) {
          resolve([]);
        } else {
          if (files.length === 0) return [];

          const tags = ["TIPS", "MQPL", "QPNI"];
          files = files.filter(relatedFiles).map(addTag);

          resolve(files);

          function relatedFiles(filename) {
            return (
              /.*.xlsx$/.test(filename) && // 是xlsx文件
              tags.some(tag => new RegExp(tag, "i").test(filename)) // 文件名中包含这些字段
            );
          }

          function addTag(filename) {
            return tags.reduce((res, tag) => {
              if (new RegExp(tag, "i").test(filename)) {
                return { tag, name: filename };
              } else {
                return res;
              }
            }, {});
          }
        }
      });
    });
  }

  static checkMergeValidation(files) {
    // [1] 至少有TIPS
    if (!files.find(file => /tips/i.test(file))) {
      return "至少要有TIPS";
    }
    // [2] 没有重复的文件
    if (files.length > 3) {
      return "不能有重复的文件";
    }
    const tags = ["TIPS", "MQPL", "QPNI"];
    const counts = countFiles(tags, files);
    if (counts.some(c => c >= 2)) {
      return "不能有重复的文件";
    }
  }

  static checkOutputValidation(files) {
    // 只能是一张TIPS，一张MQPL
    const tags = ["TIPS", "MQPL"];
    const counts = countFiles(tags, files);
    if (counts[0] !== 1 || counts[1] !== 1) {
      return "请选择一张TIPS，一张MQPL";
    }
  }
}

function countFiles(tags, files) {
  const counts = [0, 0, 0];
  files.forEach(file => {
    tags.forEach((tag, index) => {
      if (new RegExp(tag, "i").test(file)) {
        counts[index] += 1;
      }
    });
  });
  return counts;
}
