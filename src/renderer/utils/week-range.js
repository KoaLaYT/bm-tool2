import * as dayjs from "dayjs";
import * as isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import * as isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

function getWeekRange(startWeek, endWeek) {
    // 计算范围内的周数
    let yearStart = Number(startWeek.slice(0, 4));
    const yearEnd = Number(endWeek.slice(0, 4));
    const yearWeeks = new Map();
    while (yearStart <= yearEnd) {
        yearWeeks.set(yearStart, dayjs(yearStart + "-01-01").isoWeeksInYear());
        yearStart += 1;
    }
    return yearWeeks;
}

export function totalWeeks(startWeek, endWeek) {
    const yearWeeks = getWeekRange(startWeek, endWeek);

    let currentWeek = startWeek;
    const result = [];
    while (currentWeek <= endWeek) {
        let week = Number(currentWeek.slice(7));
        let year = Number(currentWeek.slice(0, 4));
        const totalWeeks = yearWeeks.get(year);
        result.push(week);

        if (week === totalWeeks) year += 1;
        week = (week % totalWeeks) + 1;
        week = week < 10 ? "0" + week : week;
        currentWeek = year + "-KW" + week;
    }
    return result;
}

export function totalFullWeeks(startWeek, endWeek) {
    // 计算范围内的周数
    const yearWeeks = getWeekRange(startWeek, endWeek);

    let currentWeek = startWeek;
    const result = [];
    while (currentWeek <= endWeek) {
        result.push(currentWeek);
        let week = Number(currentWeek.slice(7));
        let year = Number(currentWeek.slice(0, 4));
        const totalWeeks = yearWeeks.get(year);

        if (week === totalWeeks) year += 1;
        week = (week % totalWeeks) + 1;
        week = week < 10 ? "0" + week : week;
        currentWeek = year + "-KW" + week;
    }
    return result;
}
