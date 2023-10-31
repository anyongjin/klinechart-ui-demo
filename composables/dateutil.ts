import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import duration from "dayjs/plugin/duration"
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
import {type Period} from "~/composables/types";
import kc from "klinecharts";
const FormatDateType = kc.FormatDateType
export const formatDate = kc.utils.formatDate
let tz_applied = false;
let cur_tz: string = 'UTC'

const timezone_map: Record<string, string> = {
  'Africa/Abidjan': 'utc',
  'Pacific/Honolulu': 'honolulu',
  'America/Juneau': 'juneau',
  'America/Los_Angeles': 'los_angeles',
  'America/Chicago': 'chicago',
  'America/Toronto': 'toronto',
  'America/Sao_Paulo': 'sao_paulo',
  'Europe/London': 'london',
  'Europe/Berlin': 'berlin',
  'Asia/Bahrain': 'bahrain',
  'Asia/Dubai': 'dubai',
  'Asia/Ashkhabad': 'ashkhabad',
  'Asia/Almaty': 'almaty',
  'Asia/Bangkok': 'bangkok',
  'Asia/Shanghai': 'shanghai',
  'Asia/Tokyo': 'tokyo',
  'Australia/Sydney': 'sydney',
  'Pacific/Guadalcanal': 'guadalcanal',
  'Pacific/Auckland': 'auckland',
}

export function getUTCStamp(): number{
  let result = dayjs()
  return result.valueOf()
}

/**
 * 将字符串的时间转为13位时间戳，要求输入的是UTC时区字符串
 * @param date_str 10位/13位时间戳、YYYYMMDD YYYYMMDDHHmm YYYYMMDDHHmmss
 */
export function toUTCStamp(date_str: string): number{
  if(!date_str)return 0
  date_str = date_str.trim();
  const isNumOnly = /^\d+$/.test(date_str);
  let result: dayjs.Dayjs | null = null
  if(isNumOnly){
    // 是纯数字
    const numLen = date_str.length;
    if(numLen == 4){
      result = dayjs(date_str, 'MMDD')
    }
    else if(numLen == 6){
      result = dayjs(date_str, 'YYMMDD')
    }
    else if(numLen == 8){
      result = dayjs(date_str, 'YYYYMMDD')
    }
    else if(numLen == 10){
      // 秒时间戳
      result = dayjs.unix(parseInt(date_str))
    }
    else if(numLen == 12){
      result = dayjs(date_str, 'YYYYMMDDHHmm')
    }
    else if(numLen == 13){
      // 毫秒时间戳
      result = dayjs(parseInt(date_str))
    }
    else if(numLen == 14){
      result = dayjs(date_str, 'YYYYMMDDHHmmss')
    }
    else{
      console.error('invalid date format:', date_str)
      return 0;
    }
  }
  else{
    result = dayjs(date_str, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm', 'YYYY/MM/DD HH:mm:ss',
      'YYYY-MM-DD', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], true)
  }
  if(!result)return 0
  if(!tz_applied){
    console.error('local timezone not applied')
  }
  result = result.tz(cur_tz, true)
  return result.valueOf()
}

export function getDateStr(date_ts: number, template: string = 'YYYY-MM-DD HH:mm:ss',
                           tz: string | undefined = undefined): string {
  if (!date_ts) return '--'
  let result: dayjs.Dayjs | null = null
  if (date_ts > 1000000000000) {
    result = dayjs(date_ts)
  } else {
    result = dayjs.unix(date_ts)
  }
  result = result.tz(tz || cur_tz, true)
  if (!tz_applied) {
    console.error('local timezone not applied')
  }
  return result.format(template)
}

export function fmtDuration(cost_secs: number){
  if(!cost_secs)return '00:00'
  return dayjs.utc(cost_secs * 1000).format('HH:mm:ss')
}

export function adjustFromTo(period: Period, toTimestamp: number, count: number) {
  let to = toTimestamp
  let from = to
  switch (period.timespan) {
    case 'minute': {
      to = to - (to % (60 * 1000))
      from = to - count * period.multiplier * 60 * 1000
      break
    }
    case 'hour': {
      to = to - (to % (60 * 60 * 1000))
      from = to - count * period.multiplier * 60 * 60 * 1000
      break
    }
    case 'day': {
      to = to - (to % (60 * 60 * 1000))
      from = to - count * period.multiplier * 24 * 60 * 60 * 1000
      break
    }
    case 'week': {
      const date = new Date(to)
      const week = date.getDay()
      const dif = week === 0 ? 6 : week - 1
      to = to - dif * 60 * 60 * 24
      const newDate = new Date(to)
      to = new Date(`${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`).getTime()
      from = count * period.multiplier * 7 * 24 * 60 * 60 * 1000
      break
    }
    case 'month': {
      const date = new Date(to)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      to = new Date(`${year}-${month}-01`).getTime()
      from = count * period.multiplier * 30 * 24 * 60 * 60 * 1000
      const fromDate = new Date(from)
      from = new Date(`${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-01`).getTime()
      break
    }
    case 'year': {
      const date = new Date(to)
      const year = date.getFullYear()
      to = new Date(`${year}-01-01`).getTime()
      from = count * period.multiplier * 365 * 24 * 60 * 60 * 1000
      const fromDate = new Date(from)
      from = new Date(`${fromDate.getFullYear()}-01-01`).getTime()
      break
    }
  }
  return [from, to]
}

export function tf_to_secs(timeframe?: string): number{
  if(!timeframe)return 0
  const unit = timeframe.substring(timeframe.length - 1);
  const amount = parseInt(timeframe.substring(0, timeframe.length - 1))
  let scale = 0
  if(unit == 'y'){
    scale = 31536000 // 60 * 60 * 24 * 365
  }
  else if(unit == 'M'){
    scale = 2592000  // 60 * 60 * 24 * 30
  }
  else if(unit == 'w'){
    scale = 604800 // 60 * 60 * 24 * 7
  }
  else if(unit == 'd'){
    scale = 86400 // 60 * 60 * 24
  }
  else if(unit == 'h'){
    scale = 3600
  }
  else if(unit == 'm'){
    scale = 60
  }
  else if(unit == 's'){
    scale = 1
  }
  else{
    throw Error(`unsupport timeframe: ${timeframe}`)
  }
  return scale * amount
}

export function makeFormatDate(timespan: string) {
  function doFormatDate(dateTimeFormat: Intl.DateTimeFormat, timestamp: number,
                      format: string, type: kc.FormatDateType) {
    switch (timespan) {
      case 'minute': {
        if (type === FormatDateType.XAxis) {
          return formatDate(dateTimeFormat, timestamp, 'HH:mm')
        }
        return formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD HH:mm')
      }
      case 'hour': {
        if (type === FormatDateType.XAxis) {
          return formatDate(dateTimeFormat, timestamp, 'MM-DD HH:mm')
        }
        return formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD HH:mm')
      }
      case 'day':
      case 'week':
        return formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD')
      case 'month': {
        if (type === FormatDateType.XAxis) {
          return formatDate(dateTimeFormat, timestamp, 'YYYY-MM')
        }
        return formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD')
      }
      case 'year': {
        if (type === FormatDateType.XAxis) {
          return formatDate(dateTimeFormat, timestamp, 'YYYY')
        }
        return formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD')
      }
    }
    return formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD HH:mm')
  }
  return doFormatDate;
}


export async function setTimezone(timezone: string|undefined = undefined, save: boolean = true) {
  if (timezone) {
    if (timezone == 'Africa/Abidjan' || timezone.toLowerCase().indexOf('utc') >= 0) {
      timezone = 'UTC'
    }
  }
  if (!timezone || save) {
    const {useKlineLocal} = await import("~/stores/klineLocal")
    const store = useKlineLocal()
    timezone = store.timezone
    if (save) {
      store.timezone = timezone
    }
  }
  if (!timezone) return
  dayjs.tz.setDefault(timezone)
  cur_tz = timezone
  tz_applied = true
}

/**
 * 此函数只返回用户本地时区，并不是返回当前设置的时区。
 * 故使用setTimezone设置默认时区后，调用此方法依然返回的是本地时区
 */
export function get_tz(){
  return dayjs.tz.guess()
}

export function translateTimezone (timezone: string): string {
  return timezone_map[timezone] ?? timezone
}

export function getTimezoneSelectOptions () {
  return Object.entries(timezone_map).map(([key, text]) => ({ key, text }));
}