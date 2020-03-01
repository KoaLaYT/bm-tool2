import { getFullWeeksArray } from "./drawer";

let canvas = undefined;
let ctx = undefined;

export async function drawLines(path, termin, amends) {
    const imageInfo = await getImageInfo(path);
    // [1] 获取柱子的宽度、第一根柱子的位置、间隙的宽度
    // 找到最长的一段非白色区域（RGB小于250，且浮动不超过2）
    // 去除异常值后的平均值即为宽度
    const guess = guessPillarInfo(imageInfo);
    // [2] 根据Terminplan，和第一个柱子的宽度、位置、间隙绘制进度
    drawTermin(guess, termin, imageInfo, amends);

    const url = canvas.toDataURL("image/png");

    canvas = undefined;
    ctx = undefined;

    return { url, guess };
}

/** 从file获取图片的R,G,B,A信息及图片的尺寸 */
async function getImageInfo(path) {
    return new Promise(resolve => {
        const img = document.createElement("img");

        img.src = path;

        img.addEventListener("load", () => {
            canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height * 1.05;
            ctx = canvas.getContext("2d");

            ctx.drawImage(img, 0, 0);

            resolve(ctx.getImageData(0, 0, img.width, img.height));
        });
    });
}
/** 获取柱子的宽度，位置及间隙 */
function guessPillarInfo({ data, width, height }) {
    // 假设：第一根柱子必然出现在图片左边的20%内（减少需要计算的像素点）
    // 假设：上半部分和底部有一些和图形无关的内容，只从50% - 90%部分取样
    const SAMPLEAMOUNT = 20;
    const sampleRanges = Array.from({ length: SAMPLEAMOUNT }).map((_, i) => {
        const startHeight = Math.floor(
            height * (0.5 + i * Math.floor(0.4 / SAMPLEAMOUNT))
        );
        const totalWidth = Math.floor(width * 0.2);
        return {
            start: startHeight * width * 4,
            end: startHeight * (width + totalWidth) * 4
        };
    });
    const samples = sampleRanges.map(range => {
        const rgbas = toRGBA(data.slice(range.start, range.end));
        return comparePixels(rgbas);
    });

    return filterAbnormal(samples);
}
/** 整合成每个像素的RGBA */
function toRGBA(rawArray) {
    return rawArray.reduce((res, info, i) => {
        if (i % 4 === 0) {
            res.push([]);
        }
        res[res.length - 1].push(info);
        return res;
    }, []);
}
/** 从一组像素点中筛选出柱子 */
function comparePixels(rgbas) {
    let width = 0; // 柱子的宽度
    let index = 0; // 柱子的位置
    let gap = 0; // 间隙的宽度
    let found = false; // 是否找到了第一根柱子
    let beginGap = false; // 是否开始找间隙
    let beginPixel = undefined;
    // 假设：柱子的长度至少是5个像素点（以过滤掉坐标轴数字）
    const MINWIDTH = 5;
    for (let i = 0; i < rgbas.length; ++i) {
        const rgba = rgbas[i];
        const isWhite = isAlmostWhite(rgba);
        // 找间隙
        if (found) {
            if (!beginGap && !isWhite) continue;
            if (!beginGap && isWhite) {
                beginGap = true;
                ++gap;
                continue;
            }
            if (beginGap && isWhite) {
                ++gap;
                continue;
            }
            if (beginGap && !isWhite) {
                break;
            }
        }
        // 没找到第一根柱子前，白色直接无视
        if (isWhite) continue;
        // 计数开始
        if (!beginPixel) {
            ++width;
            index = i;
            beginPixel = rgba;
            continue;
        }
        // 仍然是连续的像素
        if (isClose(rgba, beginPixel)) {
            ++width;
            continue;
        }
        // 一段连续的像素结束
        if (width <= MINWIDTH) {
            // 清零后重新采样
            width = 0;
            beginPixel = undefined;
            continue;
        }
        // 柱子已经找到，开始找间隙
        if (!found) {
            found = true;
            continue;
        }
    }

    return { width, index, gap };
}
/** 像素点是不是白色 */
function isAlmostWhite(rgba) {
    const [r, g, b] = rgba;
    return r >= 250 && g >= 250 && b >= 250;
}
/** 两个像素点的颜色是否足够接近 */
function isClose(rgba1, rgba2) {
    const [r1, g1, b1] = rgba1;
    const [r2, g2, b2] = rgba2;
    const e = 3; // 像素值允许的浮动

    const isInRange = (a, b) => Math.abs(a - b) <= e;

    return isInRange(r1, r2) && isInRange(g1, g2) && isInRange(b1, b2);
}
/** 删除异常大或小的值 */
function filterAbnormal(values) {
    const sorted = [...values].sort((a, b) => a.width - b.width);
    const normal = [];

    for (let i = 0; i < sorted.length - 1; ++i) {
        if (isAbnormal(sorted[i].width, sorted[i + 1].width)) continue;
        normal.push(sorted[i]);
    }

    return {
        width: avgOf("width"),
        index: avgOf("index"),
        gap: avgOf("gap")
    };

    function avgOf(field) {
        return Math.floor(
            normal.reduce((acc, ele) => acc + ele[field], 0) / normal.length
        );
    }
}
/** 两个值是否在一定范围内 */
function isAbnormal(v1, v2) {
    const delta = Math.abs(v1 - v2);
    return delta / v1 >= 0.05;
}
/** 绘制节点 */
function drawTermin({ width, index: startX, gap }, plan, { height }, amends) {
    const totalWeek = getFullWeeksArray(plan.startWeek, plan.endWeek);
    Object.entries(plan[amends.type + "Term"]).forEach(([termin, KW]) => {
        const index = totalWeek.indexOf(KW);

        const point = {
            x:
                startX +
                index * (width + gap + amends.width + amends.gap) +
                (width + amends.width) / 2,
            y: Math.floor(height * 0.98)
        };

        let text1 = termin;
        if (plan.isNoVFF) {
            text1 = text1.replace("PVS", "PVS2");
            text1 = text1.replace("VFF", "PVS1");
        }
        const text2 = KW.slice(5);
        const dashed = /TBT/i.test(termin);

        renderTermin(point, text1, text2, dashed, height - amends.length);
    });
}
/** 画线 */
export function renderTermin(point, text1, text2, dashed, length) {
    const RATIO = 1;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "red";
    // 绘制箭头
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x - 8 * RATIO, point.y + 10 * RATIO);
    ctx.lineTo(point.x - 4 * RATIO, point.y + 10 * RATIO);
    ctx.lineTo(point.x - 4 * RATIO, point.y + 20 * RATIO);
    ctx.lineTo(point.x + 4 * RATIO, point.y + 20 * RATIO);
    ctx.lineTo(point.x + 4 * RATIO, point.y + 10 * RATIO);
    ctx.lineTo(point.x + 8 * RATIO, point.y + 10 * RATIO);
    ctx.lineTo(point.x, point.y);
    ctx.fill();
    // 绘制线条
    if (dashed) {
        ctx.setLineDash([10 * RATIO, 3 * RATIO]);
    }
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x, length);
    ctx.stroke();
    // 添加描述
    ctx.font = "12px Arial";
    if (dashed) {
        ctx.textAlign = "right";
        ctx.fillText(text1, point.x + 4 * RATIO, point.y + 32 * RATIO);
        ctx.fillText(text2, point.x + 4 * RATIO, point.y + 44 * RATIO);
    } else {
        ctx.textAlign = "left";
        ctx.fillText(text1, point.x - 4 * RATIO, point.y + 32 * RATIO);
        ctx.fillText(text2, point.x - 4 * RATIO, point.y + 44 * RATIO);
    }

    ctx.restore();
}
