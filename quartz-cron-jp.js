/**
 * Quartz Cron 日本語翻訳ライブラリ
 * @version 1.0.0
 * @license MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node.js / CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    root.QuartzCronJP = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ============================================================
  // 定数
  // ============================================================

  var DAY_NAMES = {
    '1': '日', '2': '月', '3': '火', '4': '水', '5': '木', '6': '金', '7': '土',
    'SUN': '日', 'MON': '月', 'TUE': '火', 'WED': '水', 'THU': '木', 'FRI': '金', 'SAT': '土'
  };

  // 日本式曜日ソート順（月=0, 火=1, ... 日=6）
  var DAY_SORT_ORDER = {
    '1': 6, '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5,
    'SUN': 6, 'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5
  };

  var MONTH_NAMES = {
    '1': '1月', '2': '2月', '3': '3月', '4': '4月', '5': '5月', '6': '6月',
    '7': '7月', '8': '8月', '9': '9月', '10': '10月', '11': '11月', '12': '12月',
    'JAN': '1月', 'FEB': '2月', 'MAR': '3月', 'APR': '4月', 'MAY': '5月', 'JUN': '6月',
    'JUL': '7月', 'AUG': '8月', 'SEP': '9月', 'OCT': '10月', 'NOV': '11月', 'DEC': '12月'
  };

  var VALID_DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var VALID_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // ============================================================
  // ヘルパー関数
  // ============================================================

  function translateDay(day) {
    return DAY_NAMES[day.toUpperCase()] || DAY_NAMES[day] || day;
  }

  function getDaySortOrder(day) {
    var key = day.toUpperCase ? day.toUpperCase() : day;
    return DAY_SORT_ORDER[key] !== undefined ? DAY_SORT_ORDER[key] : 99;
  }

  function translateMonth(month) {
    return MONTH_NAMES[month.toUpperCase()] || MONTH_NAMES[month] || (month + '月');
  }

  /**
   * 24時間表記を12時間表記（午前/午後）に変換
   * @param {number|string} hour - 時（0-23）
   * @returns {string} 12時間表記の時刻
   */
  function formatHour12(hour) {
    var h = parseInt(hour, 10);
    if (h === 0) return '午前0時';
    if (h < 12) return '午前' + h + '時';
    if (h === 12) return '午後12時';
    return '午後' + (h - 12) + '時';
  }

  /**
   * 時分を12時間表記でフォーマット
   * @param {number|string} hour - 時（0-23）
   * @param {number|string} minute - 分（0-59）
   * @returns {string} 12時間表記の時刻
   */
  function formatTime12(hour, minute) {
    var h = parseInt(hour, 10);
    var m = parseInt(minute, 10);
    var period = h < 12 ? '午前' : '午後';
    var h12 = h === 0 ? 0 : (h <= 12 ? h : h - 12);
    return period + h12 + '時' + m + '分';
  }

  /**
   * 時分秒を12時間表記でフォーマット
   * @param {number|string} hour - 時（0-23）
   * @param {number|string} minute - 分（0-59）
   * @param {number|string} second - 秒（0-59）
   * @returns {string} 12時間表記の時刻
   */
  function formatTimeWithSec12(hour, minute, second) {
    var h = parseInt(hour, 10);
    var m = parseInt(minute, 10);
    var s = parseInt(second, 10);
    var period = h < 12 ? '午前' : '午後';
    var h12 = h === 0 ? 0 : (h <= 12 ? h : h - 12);
    return period + h12 + '時' + m + '分' + s + '秒';
  }

  function getFieldUnit(fieldType) {
    var units = {
      second: '秒',
      minute: '分',
      hour: '時',
      dayOfMonth: '日',
      month: '月',
      dayOfWeek: '',
      year: '年'
    };
    return units[fieldType] || '';
  }

  function hasSymbol(field, symbol) {
    if (!field) return false;
    
    if (symbol === 'L') {
      return /(?:^L$|^\d+L$|^L-|^L,)/.test(field) || field === 'L';
    }
    if (symbol === 'W') {
      return /\d+W/.test(field);
    }
    if (symbol === '#') {
      return /\d+#\d+/.test(field);
    }
    return field.indexOf(symbol) !== -1;
  }

  /**
   * 範囲が跨ぎ（wrap-around）かどうか判定
   * @param {string} from - 開始値
   * @param {string} to - 終了値
   * @param {string} fieldType - フィールドタイプ
   * @returns {boolean} 跨ぎならtrue
   */
  function isWraparound(from, to, fieldType) {
    // 曜日名のマッピング（Quartz: 1=SUN, 7=SAT）
    var dayMap = { SUN: 1, MON: 2, TUE: 3, WED: 4, THU: 5, FRI: 6, SAT: 7 };
    var monthMap = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
    
    var fromNum, toNum;
    
    if (fieldType === 'dayOfWeek') {
      fromNum = dayMap[from.toUpperCase()] || parseInt(from, 10);
      toNum = dayMap[to.toUpperCase()] || parseInt(to, 10);
    } else if (fieldType === 'month') {
      fromNum = monthMap[from.toUpperCase()] || parseInt(from, 10);
      toNum = monthMap[to.toUpperCase()] || parseInt(to, 10);
    } else {
      fromNum = parseInt(from, 10);
      toNum = parseInt(to, 10);
    }
    
    return !isNaN(fromNum) && !isNaN(toNum) && fromNum > toNum;
  }

  // ============================================================
  // パーサー
  // ============================================================

  /**
   * フィールド値を解析してAST（抽象構文木）を生成
   * @param {string} value - フィールド値
   * @param {string} fieldType - フィールドタイプ
   * @returns {Object} 解析結果
   */
  function parseField(value, fieldType) {
    if (value === '*') return { type: 'all' };
    if (value === '?') return { type: 'any' };
    if (value === 'L') return { type: 'last' };
    
    // LW: 月末に最も近い平日（日フィールド専用）
    if (value === 'LW') {
      return { type: 'lastWeekday' };
    }
    
    // L-n: 月末からn日前（例: L-3 = 月末から3日前）
    if (/^L-\d+$/.test(value)) {
      var offset = value.substring(2);
      return { type: 'lastOffset', offset: offset };
    }
    
    // nL: 最終n曜日（例: 1L = 最終日曜日、6L = 最終金曜日）
    if (/^\d+L$/.test(value)) {
      return { type: 'lastWeekdayOfMonth', day: value.slice(0, -1) };
    }
    
    // 曜日名L: 最終曜日（例: FRIL = 最終金曜日）
    if (/^[A-Z]{3}L$/i.test(value)) {
      return { type: 'lastWeekdayOfMonth', day: value.slice(0, -1) };
    }
    
    if (value.slice(-1) === 'W') {
      return { type: 'nearestWeekday', day: value.slice(0, -1) };
    }
    
    if (value.indexOf('#') !== -1) {
      var hashParts = value.split('#');
      return { type: 'nthWeekday', day: hashParts[0], nth: hashParts[1] };
    }
    
    if (value.indexOf('/') !== -1) {
      var slashParts = value.split('/');
      var startPart = slashParts[0];
      var intervalPart = slashParts[1];
      
      // 範囲＋間隔のパターン（例: 9-17/2, 22-05/2）
      if (startPart.indexOf('-') !== -1) {
        var rangeParts = startPart.split('-');
        var rangeFrom = rangeParts[0];
        var rangeTo = rangeParts[1];
        return { 
          type: 'rangeWithInterval', 
          from: rangeFrom, 
          to: rangeTo, 
          interval: intervalPart,
          isWraparound: isWraparound(rangeFrom, rangeTo, fieldType)
        };
      }
      
      return { type: 'interval', start: startPart, interval: intervalPart };
    }
    
    if (value.indexOf('-') !== -1 && value.indexOf(',') === -1) {
      var rangeParts = value.split('-');
      var rangeFrom = rangeParts[0];
      var rangeTo = rangeParts[1];
      return { 
        type: 'range', 
        from: rangeFrom, 
        to: rangeTo,
        isWraparound: isWraparound(rangeFrom, rangeTo, fieldType)
      };
    }
    
    if (value.indexOf(',') !== -1) {
      var items = value.split(',').map(function(item) {
        if (item.indexOf('-') !== -1) {
          var itemParts = item.split('-');
          var itemFrom = itemParts[0];
          var itemTo = itemParts[1];
          return { 
            type: 'range', 
            from: itemFrom, 
            to: itemTo,
            isWraparound: isWraparound(itemFrom, itemTo, fieldType)
          };
        }
        // nL パターン（最終n曜日）
        if (/^\d+L$/i.test(item)) {
          return { type: 'lastWeekdayOfMonth', day: item.slice(0, -1) };
        }
        // L（末日）
        if (item.toUpperCase() === 'L') {
          return { type: 'last', value: item };
        }
        return { type: 'single', value: item };
      });
      
      // 重複を除去（single型のvalueで判定）
      var seen = {};
      items = items.filter(function(item) {
        if (item.type === 'single') {
          if (seen[item.value]) return false;
          seen[item.value] = true;
        }
        return true;
      });
      
      return { type: 'list', items: items };
    }
    
    return { type: 'single', value: value };
  }

  // ============================================================
  // トランスレーター
  // ============================================================

  /**
   * 解析結果を日本語に変換
   * @param {Object} parsed - parseFieldの結果
   * @param {string} fieldType - フィールドタイプ
   * @returns {Object} 翻訳結果
   */
  function translateField(parsed, fieldType) {
    var startVal, intervalVal, unit, from, to, items, hours;
    
    switch (parsed.type) {
      case 'all':
        return { text: '毎' + getFieldUnit(fieldType), isAll: true };
      
      case 'any':
        return { text: '', isAny: true };
      
      case 'last':
        if (fieldType === 'dayOfMonth') return { text: '末日', isLast: true };
        return { text: '最終' };
      
      case 'lastWeekday':
        // LW: 月末に最も近い平日
        return { text: '末日に最も近い平日' };
      
      case 'lastOffset':
        // L-n: 月末からn日前
        return { text: '末日の' + parsed.offset + '日前' };
      
      case 'lastWeekdayOfMonth':
        // nL または 曜日名L: 最終n曜日
        return { text: '最終' + translateDay(parsed.day) + '曜日' };
      
      case 'nearestWeekday':
        return { text: parsed.day + '日に最も近い平日' };
      
      case 'nthWeekday':
        return { text: '第' + parsed.nth + translateDay(parsed.day) + '曜日' };
      
      case 'interval':
        startVal = parsed.start === '*' ? '0' : parsed.start;
        intervalVal = parsed.interval;
        unit = fieldType === 'hour' ? '時間' : getFieldUnit(fieldType);
        
        // フィールドの最大値を取得
        var maxValues = { second: 59, minute: 59, hour: 23 };
        var fieldMax = maxValues[fieldType];
        
        // インターバル1の特殊処理
        if (intervalVal === '1') {
          // 境界値（最大値）からの1間隔は単一値と同じ（例: 59/1秒 = 59秒のみ）
          if (fieldMax !== undefined && parseInt(startVal, 10) === fieldMax) {
            if (fieldType === 'second') return { text: startVal + '秒', isSingle: true };
            if (fieldType === 'minute') return { text: startVal + '分', isSingle: true };
            if (fieldType === 'hour') return { text: formatHour12(startVal), isSingle: true };
          }
          // 0起点または*起点の1間隔は「毎〜」
          if (parsed.start === '*' || parsed.start === '0') {
            if (fieldType === 'second') return { text: '毎秒', isInterval: true, isEverySecond: true };
            if (fieldType === 'minute') return { text: '毎分', isInterval: true, isEveryMinute: true };
            if (fieldType === 'hour') return { text: '毎時', isInterval: true, isEveryHour: true };
          }
        }
        
        // 月と曜日の単位を正しく設定
        if (fieldType === 'month') {
          return {
            text: startVal + '月起点で' + intervalVal + 'ヶ月間隔',
            isInterval: true,
            startValue: startVal
          };
        }
        if (fieldType === 'dayOfWeek') {
          return {
            text: translateDay(startVal) + '曜日起点で' + intervalVal + '日間隔',
            isInterval: true,
            startValue: startVal
          };
        }
        
        // 「起点で〜間隔」形式で表示
        // 時間の場合は12時間表記を使用
        if (fieldType === 'hour') {
          return {
            text: formatHour12(startVal).replace('時', '') + '時起点で' + intervalVal + unit + '間隔',
            isInterval: true,
            startValue: startVal
          };
        }
        return {
          text: startVal + getFieldUnit(fieldType) + '起点で' + intervalVal + unit + '間隔',
          isInterval: true,
          startValue: startVal
        };
      
      case 'rangeWithInterval':
        from = parsed.from;
        to = parsed.to;
        intervalVal = parsed.interval;
        unit = fieldType === 'hour' ? '時間' : getFieldUnit(fieldType);
        
        if (fieldType === 'dayOfWeek') {
          // 曜日範囲＋間隔
          var quartzToDayName = { '1': '日', '2': '月', '3': '火', '4': '水', '5': '木', '6': '金', '7': '土',
            'SUN': '日', 'MON': '月', 'TUE': '火', 'WED': '水', 'THU': '木', 'FRI': '金', 'SAT': '土' };
          var interval = parseInt(intervalVal, 10);
          
          // interval=1 の場合は範囲表現にする（展開しない）
          if (interval === 1) {
            var fromDay = translateDay(from);
            var toDay = translateDay(to);
            return { text: fromDay + '〜' + toDay + '曜日', isRangeWithInterval: false };
          }
          
          // interval > 1 の場合は展開して表示（Quartz式: 1=日, 2=月, ..., 7=土）
          var dayFromVal = parseInt(from, 10) || 0;
          var dayToVal = parseInt(to, 10) || 0;
          
          // 数字の場合
          if (dayFromVal > 0 && dayToVal > 0) {
            var dayNames = [];
            if (dayFromVal <= dayToVal) {
              // 通常範囲: 2-5/2 → 月, 水
              for (var d = dayFromVal; d <= dayToVal; d += interval) {
                dayNames.push(quartzToDayName[String(d)] || d);
              }
            } else {
              // 跨ぎ範囲: 7-2/2 → 土(7), 月(2) [経由: 日(1)]
              // 7→1→2 を interval で走査
              for (var d = dayFromVal; d <= 7; d += interval) {
                dayNames.push(quartzToDayName[String(d)] || d);
              }
              // 次の週の先頭から続き
              var remainder = (d - 7 - 1); // 7を超えた分 - 1（1から始まるため）
              for (var d2 = 1 + remainder; d2 <= dayToVal; d2 += interval) {
                dayNames.push(quartzToDayName[String(d2)] || d2);
              }
            }
            // 跨ぎ範囲の場合は「範囲で○日間隔」という表現
            if (dayFromVal > dayToVal) {
              var fromDayName = quartzToDayName[String(dayFromVal)] || from;
              var toDayName = quartzToDayName[String(dayToVal)] || to;
              return { text: fromDayName + '〜' + toDayName + '曜日の範囲で' + interval + '日間隔', isRangeWithInterval: true };
            }
            return { text: dayNames.join('・') + '曜日', isRangeWithInterval: true };
          }
          
          // 名前の場合（MON-FRI/2など, SAT-MON/2など）
          var dayOrder = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          var startIdx = dayOrder.indexOf(from.toUpperCase());
          var endIdx = dayOrder.indexOf(to.toUpperCase());
          if (startIdx >= 0 && endIdx >= 0) {
            var dayNamesList = [];
            if (startIdx <= endIdx) {
              // 通常範囲
              for (var di = startIdx; di <= endIdx; di += interval) {
                dayNamesList.push(quartzToDayName[dayOrder[di]]);
              }
            } else {
              // 跨ぎ範囲: FRI-MON/2 → 「金〜月曜日の範囲で2日間隔」
              var fromDayName = quartzToDayName[from.toUpperCase()] || from;
              var toDayName = quartzToDayName[to.toUpperCase()] || to;
              return { text: fromDayName + '〜' + toDayName + '曜日の範囲で' + interval + '日間隔', isRangeWithInterval: true };
            }
            return { text: dayNamesList.join('・') + '曜日', isRangeWithInterval: true };
          }
          
          return { text: from + '〜' + to + '曜日', isRangeWithInterval: true };
        }
        if (fieldType === 'hour') {
          var fromH = formatHour12(from);
          var toH = formatHour12(to);
          // interval=1 の場合は「毎時」と表現
          var intervalText = (parseInt(intervalVal, 10) === 1) ? '毎時' : intervalVal + unit + '間隔';
          return { 
            text: fromH + '〜' + toH + 'の間、' + intervalText,
            isRangeWithInterval: true,
            rangeFrom: from,
            rangeTo: to,
            intervalValue: intervalVal
          };
        }
        if (fieldType === 'month') {
          // interval=1 の場合は範囲表現（「の間、1ヶ月間隔」ではなく単純範囲）
          if (parseInt(intervalVal, 10) === 1) {
            return { 
              text: translateMonth(from) + '〜' + translateMonth(to),
              isRangeWithInterval: false
            };
          }
          return { 
            text: translateMonth(from) + '〜' + translateMonth(to) + 'の間、' + intervalVal + 'ヶ月間隔',
            isRangeWithInterval: true 
          };
        }
        return { 
          text: from + '〜' + to + getFieldUnit(fieldType) + 'の間、' + intervalVal + unit + '間隔',
          isRangeWithInterval: true 
        };
      
      case 'range':
        if (fieldType === 'dayOfWeek') {
          from = translateDay(parsed.from);
          to = translateDay(parsed.to);
          if ((parsed.from === 'MON' || parsed.from === '2') &&
              (parsed.to === 'FRI' || parsed.to === '6')) {
            return { text: '平日（月〜金）' };
          }
          // 全曜日（SUN-SAT / 1-7）の場合は月〜日に変換
          if ((parsed.from === 'SUN' || parsed.from === '1') &&
              (parsed.to === 'SAT' || parsed.to === '7')) {
            return { text: '月〜日曜日' };
          }
          return { text: from + '〜' + to + '曜日' };
        }
        if (fieldType === 'month') {
          return { text: translateMonth(parsed.from) + '〜' + translateMonth(parsed.to) };
        }
        return { text: parsed.from + '〜' + parsed.to + getFieldUnit(fieldType) };
      
      case 'list':
        // 曜日の場合は日本式順序（月曜始まり）でソートし、連続グループをまとめる
        if (fieldType === 'dayOfWeek') {
          // 最終曜日（nL）パターンが含まれているかチェック
          var hasLastWeekday = parsed.items.some(function(item) {
            return item.type === 'lastWeekdayOfMonth';
          });
          
          if (hasLastWeekday) {
            // 最終曜日リスト（1L,6Lなど）の場合は単純に翻訳
            var lastDays = parsed.items.map(function(item) {
              if (item.type === 'lastWeekdayOfMonth') {
                return '最終' + translateDay(item.day);
              }
              return translateDay(item.value);
            });
            return { text: lastDays.join('・') + '曜日' };
          }
          
          // 範囲を展開して単一値のリストに変換
          var expandedDays = [];
          parsed.items.forEach(function(item) {
            if (item.type === 'range') {
              // 範囲を展開
              var startOrder = getDaySortOrder(item.from);
              var endOrder = getDaySortOrder(item.to);
              if (startOrder <= endOrder) {
                // 通常範囲
                for (var i = startOrder; i <= endOrder; i++) {
                  expandedDays.push(i);
                }
              } else {
                // 跨ぎ範囲 (例: FRI-TUE = 4→5→6→0→1)
                for (var i = startOrder; i <= 6; i++) {
                  expandedDays.push(i);
                }
                for (var i = 0; i <= endOrder; i++) {
                  expandedDays.push(i);
                }
              }
            } else {
              expandedDays.push(getDaySortOrder(item.value));
            }
          });
          
          // 重複を除去してソート
          expandedDays = expandedDays.filter(function(v, i, a) {
            return a.indexOf(v) === i;
          }).sort(function(a, b) { return a - b; });
          
          // 連続グループを検出
          var groups = [];
          var groupStart = expandedDays[0];
          var groupEnd = expandedDays[0];
          
          for (var i = 1; i < expandedDays.length; i++) {
            if (expandedDays[i] === groupEnd + 1) {
              // 連続している
              groupEnd = expandedDays[i];
            } else {
              // 連続が途切れた
              groups.push({ start: groupStart, end: groupEnd });
              groupStart = expandedDays[i];
              groupEnd = expandedDays[i];
            }
          }
          groups.push({ start: groupStart, end: groupEnd });
          
          // ソート順から曜日名に変換
          var dayFromOrder = ['月', '火', '水', '木', '金', '土', '日'];
          items = groups.map(function(g) {
            var count = g.end - g.start + 1;
            if (count >= 3) {
              // 3つ以上連続なら「〜」でまとめる
              return dayFromOrder[g.start] + '〜' + dayFromOrder[g.end];
            } else if (count === 2) {
              // 2つなら個別に
              return dayFromOrder[g.start] + '・' + dayFromOrder[g.end];
            } else {
              // 1つ
              return dayFromOrder[g.start];
            }
          });
          return { text: items.join('・') + '曜日' };
        }
        
        items = parsed.items.map(function(item) {
          if (item.type === 'range') {
            if (fieldType === 'month') {
              return translateMonth(item.from) + '〜' + translateMonth(item.to);
            }
            if (fieldType === 'hour') {
              return formatHour12(item.from) + '〜' + formatHour12(item.to);
            }
            return item.from + '〜' + item.to;
          }
          if (item.type === 'last') {
            return '末';
          }
          if (item.type === 'lastWeekdayOfMonth') {
            return '最終' + translateDay(item.day);
          }
          if (fieldType === 'month') return translateMonth(item.value);
          if (fieldType === 'hour') return formatHour12(item.value);
          return item.value;
        });
        
        if (fieldType === 'month') {
          return { text: items.join('・'), isMonthList: true };
        }
        // 曜日リストで最終曜日が含まれる場合
        if (fieldType === 'dayOfWeek') {
          var hasLastWeekday = parsed.items.some(function(item) {
            return item.type === 'lastWeekdayOfMonth';
          });
          if (hasLastWeekday) {
            return { text: items.join('・') + '曜日' };
          }
        }
        return { text: items.join('、') + getFieldUnit(fieldType) };
      
      case 'single':
        if (fieldType === 'dayOfWeek') {
          return { text: translateDay(parsed.value) + '曜日' };
        }
        if (fieldType === 'month') {
          return { text: translateMonth(parsed.value) };
        }
        return { text: parsed.value + getFieldUnit(fieldType) };
      
      default:
        return { text: '' };
    }
  }

  // ============================================================
  // 説明文ビルダー
  // ============================================================

  function buildTimeDescription(translated, parsed) {
    var second = translated.second;
    var minute = translated.minute;
    var hour = translated.hour;
    var h, m, s, hours, minText;
    
    // 秒の値を取得（0かどうかの判定用）
    var secVal = parseInt(parsed.second.value || '0', 10);
    var minVal = parseInt(parsed.minute.value || '0', 10);
    
    // 境界値インターバル（例: 59/1秒 = 59秒のみ）のisSingle処理
    // translateFieldがisSingle: trueを返した場合、実質的に単一値として扱う
    if (second.isSingle) {
      // 秒が境界値で実質単一 → parsed.secondを単一値として扱う
      var secSingleVal = parsed.second.start;
      if (hour.isSingle) {
        // 時も境界値単一（例: 23/1時）
        var hourSingleVal = parsed.hour.start;
        if (minute.isSingle) {
          // 分も境界値単一
          var minSingleVal = parsed.minute.start;
          return formatTimeWithSec12(hourSingleVal, minSingleVal, secSingleVal);
        }
        if (!minute.isAll) {
          return formatTimeWithSec12(hourSingleVal, minVal, secSingleVal);
        }
        return formatHour12(hourSingleVal) + '台に毎分' + secSingleVal + '秒';
      }
      if (minute.isSingle) {
        // 分が境界値単一
        var minSingleVal = parsed.minute.start;
        if (!hour.isAll) {
          h = parsed.hour.value || '0';
          return formatTimeWithSec12(h, minSingleVal, secSingleVal);
        }
        return '毎時' + minSingleVal + '分' + secSingleVal + '秒';
      }
      if (!hour.isAll && !minute.isAll) {
        h = parsed.hour.value || '0';
        return formatTimeWithSec12(h, minVal, secSingleVal);
      }
      if (!hour.isAll && minute.isAll) {
        h = parsed.hour.value || '0';
        return formatHour12(h) + '台に毎分' + secSingleVal + '秒';
      }
      if (hour.isAll && !minute.isAll) {
        return '毎時' + minVal + '分' + secSingleVal + '秒';
      }
      // 時も分も*の場合
      return '毎分' + secSingleVal + '秒';
    }
    
    // 時が境界値単一（秒は通常）の場合
    if (hour.isSingle) {
      var hourSingleVal = parsed.hour.start;
      if (minute.isSingle) {
        var minSingleVal = parsed.minute.start;
        if (secVal !== 0 && parsed.second.type === 'single') {
          return formatTimeWithSec12(hourSingleVal, minSingleVal, secVal);
        }
        return formatTime12(hourSingleVal, minSingleVal);
      }
      if (!minute.isAll) {
        if (secVal !== 0 && parsed.second.type === 'single') {
          return formatTimeWithSec12(hourSingleVal, minVal, secVal);
        }
        return formatTime12(hourSingleVal, minVal);
      }
      // 時が境界値、分が*
      if (second.isAll) {
        return formatHour12(hourSingleVal) + '台に毎分毎秒';
      }
      if (secVal !== 0 && parsed.second.type === 'single') {
        return formatHour12(hourSingleVal) + '台に毎分' + secVal + '秒';
      }
      return formatHour12(hourSingleVal) + '台に毎分';
    }
    
    // 分が境界値単一（時・秒は通常）の場合
    if (minute.isSingle) {
      var minSingleVal = parsed.minute.start;
      if (!hour.isAll) {
        h = parsed.hour.value || '0';
        if (secVal !== 0 && parsed.second.type === 'single') {
          return formatTimeWithSec12(h, minSingleVal, secVal);
        }
        return formatTime12(h, minSingleVal);
      }
      // 時が*、分が境界値
      if (second.isAll) {
        return '毎時' + minSingleVal + '分に毎秒';
      }
      if (secVal !== 0 && parsed.second.type === 'single') {
        return '毎時' + minSingleVal + '分' + secVal + '秒';
      }
      return '毎時' + minSingleVal + '分';
    }
    
    // 分リストのテキスト生成
    function getMinuteListText() {
      if (parsed.minute.type === 'list') {
        return parsed.minute.items.map(function(item) {
          return item.value;
        }).join('・') + '分';
      }
      return minVal + '分';
    }
    
    // 秒の範囲＋間隔パターン（例: 0-30/10）
    if (parsed.second.type === 'rangeWithInterval') {
      var secFrom = parsed.second.from;
      var secTo = parsed.second.to;
      var secInterval = parsed.second.interval;
      if (!hour.isAll && !minute.isAll) {
        h = parsed.hour.value || '0';
        m = parseInt(parsed.minute.value || '0', 10);
        return formatTime12(h, m) + 'の' + secFrom + '〜' + secTo + '秒の間、' + secInterval + '秒間隔';
      }
      return secFrom + '〜' + secTo + '秒の間、' + secInterval + '秒間隔';
    }
    
    // 秒の範囲パターン（インターバルなし、例: 50-10）
    if (parsed.second.type === 'range') {
      var secFrom = parsed.second.from;
      var secTo = parsed.second.to;
      if (!hour.isAll && !minute.isAll) {
        h = parsed.hour.value || '0';
        m = parseInt(parsed.minute.value || '0', 10);
        return formatTime12(h, m) + 'の' + secFrom + '〜' + secTo + '秒';
      }
      return secFrom + '〜' + secTo + '秒';
    }
    
    // 秒の間隔パターン
    if (second.isInterval) {
      // */1 で時・分が * の場合は単に「毎秒」
      if (second.isEverySecond && hour.isAll && minute.isAll) {
        return '毎秒';
      }
      
      // 分も間隔指定の場合（例: 10/3 1/10 2）
      if (minute.isInterval) {
        // 時も間隔指定の場合（例: 0/10 5/15 2/3）
        if (hour.isInterval) {
          // 「各時の」「各分の」を使ってより分かりやすく
          var hourStart = parsed.hour.start === '*' ? '0' : parsed.hour.start;
          var minStart = parsed.minute.start === '*' ? '0' : parsed.minute.start;
          var secStart = parsed.second.start === '*' ? '0' : parsed.second.start;
          return formatHour12(hourStart) + '起点で' + parsed.hour.interval + '時間間隔、各時の' + minStart + '分起点で' + parsed.minute.interval + '分間隔、各分の' + secStart + '秒起点で' + parsed.second.interval + '秒間隔';
        }
        // 時が範囲＋間隔の場合（例: */30 0/20 6-22/4）
        if (hour.isRangeWithInterval) {
          return hour.text + '、各時の' + minute.text + '、各分の' + second.text;
        }
        // 時が範囲の場合（例: */10 */5 8-20）
        if (parsed.hour.type === 'range') {
          var fromH = formatHour12(parsed.hour.from);
          var toH = formatHour12(parsed.hour.to);
          return fromH + '〜' + toH + 'の間、各時の' + minute.text + '、各分の' + second.text;
        }
        if (!hour.isAll) {
          h = parsed.hour.value || '0';
          return formatHour12(h) + '台に' + minute.text + '、各分の' + second.text;
        }
        return minute.text + '、各分の' + second.text;
      }
      // 時だけ間隔指定の場合（例: 0/5 0 2/2）
      if (hour.isInterval) {
        if (!minute.isAll) {
          m = minVal;
          return hour.text + '、各時の' + m + '分、各分の' + second.text;
        }
        return hour.text + '、各分の' + second.text;
      }
      // 時が範囲＋間隔の場合（例: 0/5 0 6-22/4）
      if (hour.isRangeWithInterval) {
        if (!minute.isAll) {
          m = minVal;
          return hour.text + '、各時の' + m + '分、各分の' + second.text;
        }
        return hour.text + '、各分の' + second.text;
      }
      // 時間が範囲の場合（例: */10 0 23-02）
      if (parsed.hour.type === 'range') {
        var fromH = formatHour12(parsed.hour.from);
        var toH = formatHour12(parsed.hour.to);
        if (!minute.isAll) {
          m = minVal;
          return fromH + '〜' + toH + ' 毎時' + m + '分、' + second.text;
        }
        return fromH + '〜' + toH + 'の間、各分の' + second.text;
      }
      if (!hour.isAll && !minute.isAll) {
        h = parsed.hour.value || '0';
        m = minVal;
        return formatTime12(h, m) + 'に' + second.text;
      }
      if (!hour.isAll && minute.isAll) {
        h = parsed.hour.value || '0';
        return formatHour12(h) + '台に毎分' + second.text;
      }
      // 時が*、分が具体値の場合（毎時30分台に毎秒）
      if (hour.isAll && !minute.isAll) {
        m = minVal;
        if (second.isEverySecond) {
          return '毎時' + m + '分台に毎秒';
        }
        return '毎時' + m + '分台に' + second.text;
      }
      // 時も分も*の場合は「毎分」を付ける
      return '毎分' + second.text;
    }
    
    // 分の範囲パターン（インターバルなし、例: 45-15）
    if (parsed.minute.type === 'range') {
      var minFrom = parsed.minute.from;
      var minTo = parsed.minute.to;
      if (!hour.isAll) {
        h = parsed.hour.value || '0';
        return formatHour12(h) + 'の' + minFrom + '〜' + minTo + '分';
      }
      return '毎時' + minFrom + '〜' + minTo + '分';
    }
    
    // 分の範囲＋間隔パターン（例: 50-10/5）
    if (parsed.minute.type === 'rangeWithInterval') {
      var minFrom = parsed.minute.from;
      var minTo = parsed.minute.to;
      var minInterval = parsed.minute.interval;
      if (!hour.isAll) {
        h = parsed.hour.value || '0';
        return formatHour12(h) + 'の' + minFrom + '〜' + minTo + '分の間、' + minInterval + '分間隔';
      }
      return '毎時' + minFrom + '〜' + minTo + '分の間、' + minInterval + '分間隔';
    }
    
    // 分の間隔パターン
    if (minute.isInterval) {
      // */1 や 0/1 の場合は「毎分」として処理（間隔パターンではなく毎分として）
      if (minute.isEveryMinute) {
        if (hour.isAll) {
          // 時も*なら「毎分」
          if (second.isAll) {
            return '毎秒';
          }
          if (secVal !== 0 && parsed.second.type === 'single') {
            return '毎分' + secVal + '秒';
          }
          return '毎分';
        }
        // 時が具体値の場合
        if (!hour.isAll) {
          h = parsed.hour.value || '0';
          if (second.isAll) {
            return formatHour12(h) + '台に毎分毎秒';
          }
          if (secVal !== 0 && parsed.second.type === 'single') {
            return formatHour12(h) + '台に毎分' + secVal + '秒';
          }
          return formatHour12(h) + '台に毎分';
        }
      }
      
      // 分の起点を取得
      var minStart = parsed.minute.start === '*' ? '0' : parsed.minute.start;
      var minInterval = parsed.minute.interval;
      // 秒が0でない場合は秒も起点に含める
      s = secVal;
      
      // 時も間隔パターンの場合（例: 0 2/30 0/2 * * ?）
      if (hour.isInterval) {
        var hourStart = parsed.hour.start === '*' ? '0' : parsed.hour.start;
        var hourInterval = parsed.hour.interval;
        if (s !== 0 && parsed.second.type === 'single') {
          return formatHour12(hourStart) + '起点で' + hourInterval + '時間間隔、各時の' + minStart + '分起点で' + minInterval + '分間隔、各分の' + s + '秒';
        }
        return formatHour12(hourStart) + '起点で' + hourInterval + '時間間隔、各時の' + minStart + '分起点で' + minInterval + '分間隔';
      }
      
      // 時が範囲＋間隔パターンの場合（例: 0 0/30 9-17/2）
      if (hour.isRangeWithInterval) {
        if (s !== 0 && parsed.second.type === 'single') {
          return hour.text + '、毎時' + minStart + '分' + s + '秒起点で' + minInterval + '分間隔';
        }
        return hour.text + '、毎時' + minStart + '分起点で' + minInterval + '分間隔';
      }
      
      if (hour.isAll) {
        // 毎時の場合
        if (s !== 0 && parsed.second.type === 'single') {
          return '毎時' + minStart + '分' + s + '秒起点で' + minInterval + '分間隔';
        }
        return '毎時' + minStart + '分起点で' + minInterval + '分間隔';
      }
      if (parsed.hour.type === 'range') {
        // 時間範囲の場合（例: 9-17時の間）
        var fromH = formatHour12(parsed.hour.from);
        var toH = formatHour12(parsed.hour.to);
        if (s !== 0 && parsed.second.type === 'single') {
          return fromH + '〜' + toH + 'の間、毎時' + minStart + '分' + s + '秒起点で' + minInterval + '分間隔';
        }
        return fromH + '〜' + toH + 'の間、毎時' + minStart + '分起点で' + minInterval + '分間隔';
      }
      // 時が単一値の場合（例: 3時）→ 時分を組み合わせた起点表現
      h = parsed.hour.value || '0';
      if (s !== 0 && parsed.second.type === 'single') {
        return formatTimeWithSec12(h, minStart, s) + '起点で' + minInterval + '分間隔';
      }
      return formatTime12(h, minStart) + '起点で' + minInterval + '分間隔';
    }
    
    // 時間範囲＋間隔パターン（例: 0 0 9-17/2）
    if (hour.isRangeWithInterval) {
      // 分がインターバルの場合（例: 0 0/30 9-17/2）
      if (minute.isInterval) {
        var minStart = parsed.minute.start === '*' ? '0' : parsed.minute.start;
        return hour.text + '、毎時' + minStart + '分起点で' + parsed.minute.interval + '分間隔';
      }
      // 分リストの場合（例: 0 0,15,30,45 9-17/2）
      if (parsed.minute.type === 'list') {
        minText = parsed.minute.items.map(function(item) {
          return item.value;
        }).join('・') + '分';
        return hour.text + 'の' + minText;
      }
      // 分が単一値の場合（例: 0 15 22-5/2） - 「で15分」を追加
      if (parsed.minute.type === 'single') {
        m = parseInt(parsed.minute.value, 10);
        // interval=1かつ分=0なら「の間、毎時」→ 末尾整理して簡潔に
        var htext = hour.text;
        // intervalValue が1 の場合、「毎時」部分を整理
        if (hour.intervalValue === '1' || hour.intervalValue === 1) {
          // 「の間、毎時」で終わる場合は「の間、毎時X分」にする
          if (m === 0) {
            // htext ends with 'の間、毎時' - remove 毎時 for cleaner output
            htext = htext.replace(/の間、毎時$/, '');
            return htext;
          } else {
            htext = htext.replace(/の間、毎時$/, 'の間、毎時' + m + '分');
            return htext;
          }
        }
        if (m === 0) {
          return htext;
        }
        return htext + 'で' + m + '分';
      }
      return hour.text;
    }
    
    // 時の間隔パターン
    if (hour.isInterval) {
      var hourStart = parsed.hour.start === '*' ? '0' : parsed.hour.start;
      
      // */1 や 0/1 の場合は「毎時」として処理
      if (hour.isEveryHour && minute.isAll) {
        if (second.isAll) {
          return '毎秒';
        }
        if (secVal !== 0 && parsed.second.type === 'single') {
          return '毎分' + secVal + '秒';
        }
        return '毎分';
      }
      
      // 分リストの場合（例: 30 15,45 */3）
      if (parsed.minute.type === 'list') {
        minText = parsed.minute.items.map(function(item) {
          return item.value;
        }).join('・') + '分';
        if (secVal !== 0 && parsed.second.type === 'single') {
          return formatTime12(hourStart, 0) + '起点で' + parsed.hour.interval + '時間間隔の' + minText + secVal + '秒';
        }
        return formatTime12(hourStart, 0) + '起点で' + parsed.hour.interval + '時間間隔の' + minText;
      }
      
      if (!minute.isAll) {
        m = minVal;
        if (hour.isEveryHour) {
          // 毎時パターン：秒があれば表示
          if (secVal !== 0 && parsed.second.type === 'single') {
            return '毎時' + m + '分' + secVal + '秒';
          }
          return '毎時' + m + '分';
        }
        // 時の起点と分を組み合わせて表現（例: 午前0時30分起点で2時間間隔）
        // 分が0の場合は省略（例: 午前0時起点で2時間間隔）
        if (secVal !== 0 && parsed.second.type === 'single') {
          return formatTimeWithSec12(hourStart, m, secVal) + '起点で' + parsed.hour.interval + '時間間隔';
        }
        if (parseInt(m, 10) === 0) {
          return formatHour12(hourStart) + '起点で' + parsed.hour.interval + '時間間隔';
        }
        return formatTime12(hourStart, m) + '起点で' + parsed.hour.interval + '時間間隔';
      }
      
      return hour.text;
    }
    
    // 毎分パターン（時・分ともに*）
    if (hour.isAll && minute.isAll) {
      if (second.isAll) {
        return '毎秒';
      }
      if (secVal !== 0 && parsed.second.type === 'single') {
        return '毎分' + secVal + '秒';
      }
      return '毎分';
    }
    
    // 毎時パターン（時が*、分が具体値）
    if (hour.isAll && !minute.isAll) {
      // 分リストの場合
      if (parsed.minute.type === 'list') {
        minText = getMinuteListText();
        if (second.isAll) {
          return '毎時' + minText + 'に毎秒';
        }
        if (secVal !== 0 && parsed.second.type === 'single') {
          return '毎時' + minText + secVal + '秒';
        }
        return '毎時' + minText;
      }
      if (second.isAll) {
        return '毎時' + minVal + '分に毎秒';
      }
      if (secVal !== 0 && parsed.second.type === 'single') {
        return '毎時' + minVal + '分' + secVal + '秒';
      }
      return '毎時' + minVal + '分';
    }
    
    // 時間範囲＋毎分パターン（例: 0 * 9-11）
    if (parsed.hour.type === 'range' && minute.isAll) {
      var rangeFrom = formatHour12(parsed.hour.from);
      var rangeTo = formatHour12(parsed.hour.to);
      if (second.isAll) {
        return rangeFrom + '〜' + rangeTo + 'の間、毎分に毎秒';
      }
      if (secVal !== 0 && parsed.second.type === 'single') {
        return rangeFrom + '〜' + rangeTo + 'の間、毎分' + secVal + '秒';
      }
      return rangeFrom + '〜' + rangeTo + 'の間、毎分';
    }
    
    // 毎分パターン（時が具体値、分が*）
    if (!hour.isAll && minute.isAll) {
      h = parsed.hour.value || '0';
      if (second.isAll) {
        return formatHour12(h) + '台に毎秒';
      }
      if (secVal !== 0 && parsed.second.type === 'single') {
        return formatHour12(h) + '台に毎分' + secVal + '秒';
      }
      return formatHour12(h) + '台に毎分';
    }
    
    // 具体的な時刻
    m = minVal;
    s = secVal;
    
    // 時間がリストの場合
    if (parsed.hour.type === 'list') {
      hours = parsed.hour.items.map(function(item) {
        if (item.type === 'range') {
          // 範囲の場合も「時」を除去（最後に「時」を付けるので）
          return formatHour12(item.from).replace('時', '') + '〜' + formatHour12(item.to).replace('時', '');
        }
        return formatHour12(item.value).replace('時', '');
      }).join('・') + '時';
      
      // 分リストの場合
      if (parsed.minute.type === 'list') {
        minText = parsed.minute.items.map(function(item) {
          return item.value;
        }).join('・') + '分';
        
        // 秒リストの場合
        if (parsed.second.type === 'list') {
          var secText = parsed.second.items.map(function(item) {
            return item.value;
          }).join('・') + '秒';
          return hours + 'の' + minText + secText;
        }
        if (second.isAll) {
          return hours + 'の' + minText + 'に毎秒';
        }
        if (s !== 0 && parsed.second.type === 'single') {
          return hours + 'の' + minText + s + '秒';
        }
        return hours + 'の' + minText;
      }
      
      // 秒があれば表示、0分なら省略
      if (second.isAll) {
        return hours + (m === 0 ? '' : m + '分') + 'に毎秒';
      }
      if (s !== 0 && parsed.second.type === 'single') {
        return hours + m + '分' + s + '秒';
      }
      if (m === 0) {
        return hours;
      }
      return hours + m + '分';
    }
    
    // 時間範囲の場合
    if (parsed.hour.type === 'range') {
      var rangeFrom = formatHour12(parsed.hour.from);
      var rangeTo = formatHour12(parsed.hour.to);
      if (second.isAll) {
        if (m === 0) {
          return rangeFrom + '〜' + rangeTo + 'の間に毎秒';
        }
        return rangeFrom + '〜' + rangeTo + 'の間、毎時' + m + '分に毎秒';
      }
      if (s !== 0 && parsed.second.type === 'single') {
        return rangeFrom + '〜' + rangeTo + 'の間、毎時' + m + '分' + s + '秒';
      }
      // 分が0なら省略
      if (m === 0) {
        return rangeFrom + '〜' + rangeTo;
      }
      return rangeFrom + '〜' + rangeTo + 'の間、毎時' + m + '分';
    }
    
    // 単一時刻
    h = parsed.hour.value || parsed.hour.from || '0';
    
    // 秒が*（毎秒）の場合
    if (second.isAll) {
      if (m === 0) {
        return formatHour12(h) + 'に毎秒';
      }
      return formatTime12(h, m) + 'に毎秒';
    }
    
    // 秒が具体値で0以外
    if (s !== 0 && parsed.second.type === 'single') {
      return formatTimeWithSec12(h, m, s);
    }
    
    // 通常時刻：0分なら省略
    if (m === 0) {
      return formatHour12(h);
    }
    
    return formatTime12(h, m);
  }

  function buildDescription(translated, parsed) {
    var parts = [];
    var yearPrefix = '';
    var hasDayOfMonth, hasDayOfWeek, hasMonth, timeDesc, prefix, yearConnect, result, skipSuffix;
    
    // 年
    if (translated.year && !translated.year.isAll && translated.year.text) {
      if (parsed.year.type === 'single') {
        yearPrefix = parsed.year.value + '年';
      } else if (parsed.year.type === 'range') {
        yearPrefix = parsed.year.from + '年〜' + parsed.year.to + '年';
      } else if (parsed.year.type === 'list') {
        yearPrefix = translated.year.text;
      } else if (parsed.year.type === 'interval') {
        // 2022/2 → 2022年起点で2年間隔
        yearPrefix = parsed.year.start + '年起点で' + parsed.year.interval + '年間隔';
      } else if (parsed.year.type === 'rangeWithInterval') {
        // 2022-2030/2 → 2022年〜2030年の間、2年間隔
        yearPrefix = parsed.year.from + '年〜' + parsed.year.to + '年の間、' + parsed.year.interval + '年間隔';
      }
    }
    
    // 日または曜日
    hasDayOfMonth = !translated.dayOfMonth.isAny && !translated.dayOfMonth.isAll && translated.dayOfMonth.text;
    hasDayOfWeek = !translated.dayOfWeek.isAny && !translated.dayOfWeek.isAll && translated.dayOfWeek.text;
    hasMonth = !translated.month.isAll && translated.month.text;
    
    if (hasMonth && hasDayOfMonth) {
      // 月がrangeWithIntervalまたはintervalの場合は「各月の」を入れる
      var hasMonthInterval = translated.month.isRangeWithInterval || translated.month.isInterval;
      var dayPrefix = hasMonthInterval ? '各月の' : '';
      var sep = hasMonthInterval ? ' ' : '';
      if (hasDayOfWeek) {
        parts.push(translated.month.text + sep + dayPrefix + translated.dayOfMonth.text + 'の' + translated.dayOfWeek.text);
      } else {
        parts.push(translated.month.text + sep + dayPrefix + translated.dayOfMonth.text);
      }
    } else if (hasMonth) {
      if (hasDayOfWeek) {
        // 月と曜日を連結（スペースなし）
        parts.push(translated.month.text + translated.dayOfWeek.text);
      } else {
        parts.push(translated.month.text);
      }
    } else if (hasDayOfMonth && hasDayOfWeek) {
      parts.push(translated.dayOfMonth.text + 'の' + translated.dayOfWeek.text);
    } else if (hasDayOfMonth) {
      parts.push(translated.dayOfMonth.text);
    } else if (hasDayOfWeek) {
      parts.push(translated.dayOfWeek.text);
    }
    
    // 時刻
    timeDesc = buildTimeDescription(translated, parsed);
    if (timeDesc) {
      parts.push(timeDesc);
    }
    
    // 頻度の接頭辞
    prefix = '';
    if (translated.month.isAll && !hasDayOfMonth && !hasDayOfWeek) {
      if (translated.hour.isInterval) {
        // 時の間隔パターンでも「毎日」を付ける
        prefix = '毎日';
      } else if (translated.hour.isAll) {
        // 時が*の場合
        prefix = '';
      } else if (translated.minute.isInterval) {
        // 分が間隔パターンの場合
        prefix = '毎日';
      } else if (translated.minute.isAll) {
        // 分が*で時が具体値の場合 → 毎日
        prefix = '毎日';
      } else {
        prefix = '毎日';
      }
    } else if (translated.month.isAll && (hasDayOfMonth || hasDayOfWeek)) {
      prefix = '毎月';
      if (!hasDayOfMonth && hasDayOfWeek) {
        var dayOfWeekType = parsed.dayOfWeek.type;
        var isMonthlyPattern = dayOfWeekType === 'lastWeekdayOfMonth' || dayOfWeekType === 'nthWeekday';
        
        // リストの場合、lastWeekdayOfMonth が含まれていれば毎月パターン
        if (dayOfWeekType === 'list') {
          isMonthlyPattern = parsed.dayOfWeek.items.some(function(item) {
            return item.type === 'lastWeekdayOfMonth' || item.type === 'nthWeekday';
          });
        }
        
        if (!isMonthlyPattern) {
          prefix = '毎週';
        }
      }
    } else if (hasMonth && !hasDayOfMonth && !hasDayOfWeek) {
      // 月指定あり、日指定なしの場合は「毎年」を付ける（年指定がない場合のみ）
      if (!yearPrefix) {
        prefix = '毎年';
      }
    } else if (hasMonth && hasDayOfMonth) {
      // 月+日指定の場合も「毎年」を付ける（年指定がない場合のみ）
      if (!yearPrefix) {
        prefix = '毎年';
      }
    } else if (hasMonth && hasDayOfWeek) {
      // 月+曜日指定の場合も「毎年」を付ける（年指定がない場合のみ）
      if (!yearPrefix) {
        prefix = '毎年';
      }
    }
    
    // 年と頻度の接続
    // 年の間隔指定（2022/2 や 2022-2030/2）の場合は「の」で接続
    var yearNeedsConnect = yearPrefix && (parsed.year.type === 'interval' || parsed.year.type === 'rangeWithInterval');
    yearConnect = (yearPrefix && prefix) ? 'の' : (yearNeedsConnect && parts.length > 0) ? 'の' : '';
    
    result = yearPrefix + yearConnect + prefix + parts.join(' ');
    
    return result || '指定された条件で実行';
  }

  // ============================================================
  // バリデーター
  // ============================================================

  function validateFieldRange(field, name, min, max, excludeStep) {
    if (!field || field === '*' || field === '?') return null;
    
    // ステップ値を除外してチェックする場合
    var checkField = field;
    if (excludeStep && field.indexOf('/') !== -1) {
      // ステップ部分を除外（例: 2025/2 → 2025, 2025-2035/3 → 2025-2035）
      checkField = field.replace(/\/\d+$/, '');
    }
    
    var numbers = checkField.match(/\d+/g);
    if (!numbers) return null;
    
    for (var i = 0; i < numbers.length; i++) {
      var num = parseInt(numbers[i], 10);
      if (num < min || num > max) {
        return name + 'の値「' + num + '」は範囲外です（' + min + '〜' + max + '）';
      }
    }
    return null;
  }

  /**
   * ステップ値（/の後の値）が0でないかチェック
   */
  function validateStepValue(field, name) {
    if (!field || field === '*' || field === '?') return null;
    
    var stepMatch = field.match(/\/(\d+)/);
    if (stepMatch && parseInt(stepMatch[1], 10) === 0) {
      return name + 'のステップ値「0」は無効です（1以上を指定してください）';
    }
    return null;
  }

  /**
   * 範囲指定（from-to）が正しいかチェック
   * 跨ぎ（wrap-around）を許容するフィールドでは from > to も有効
   */
  function validateRange(field, name, valueMap, fieldType) {
    if (!field || field === '*' || field === '?') return null;
    
    // 跨ぎを許容するフィールド（秒、分、時、日、月、曜日）
    // 年のみ跨ぎ非対応（意味がない）
    var wrapAllowedFields = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    var allowWrap = wrapAllowedFields.indexOf(fieldType) !== -1;
    
    // 範囲を抽出（例: 10-1, MON-FRI）
    var rangePattern = /([A-Za-z]+|\d+)-([A-Za-z]+|\d+)/g;
    var match;
    
    while ((match = rangePattern.exec(field)) !== null) {
      var fromStr = match[1];
      var toStr = match[2];
      
      // 数値または名前を数値に変換
      var from = valueMap ? (valueMap[fromStr.toUpperCase()] || parseInt(fromStr, 10)) : parseInt(fromStr, 10);
      var to = valueMap ? (valueMap[toStr.toUpperCase()] || parseInt(toStr, 10)) : parseInt(toStr, 10);
      
      if (!isNaN(from) && !isNaN(to) && from > to && !allowWrap) {
        return name + 'の範囲「' + fromStr + '-' + toStr + '」が不正です（開始値が終了値より大きい）';
      }
    }
    return null;
  }

  /**
   * #記号のバリデーション（曜日フィールド用）
   */
  function validateNthWeekday(field) {
    if (!field || field.indexOf('#') === -1) return null;
    
    // #の前後をチェック
    var hashMatch = field.match(/([A-Za-z]+|\d+)?#(\d+)?/);
    if (hashMatch) {
      var dayPart = hashMatch[1];
      var nthPart = hashMatch[2];
      
      // #の前に曜日がない
      if (!dayPart) {
        return '「#」の前に曜日を指定してください';
      }
      
      // #の後に数値がない
      if (!nthPart) {
        return '「#」の後に週番号（1〜5）を指定してください';
      }
      
      // 週番号が1-5の範囲外
      var nth = parseInt(nthPart, 10);
      if (nth < 1 || nth > 5) {
        return '「#」の週番号「' + nth + '」は範囲外です（1〜5）';
      }
    }
    return null;
  }

  /**
   * #記号の単独使用チェック（カンマとの併用不可）
   */
  function validateHashAlone(field) {
    if (!field || field.indexOf('#') === -1) return null;
    
    // カンマが含まれている場合はエラー
    if (field.indexOf(',') !== -1) {
      return '「#」（第n曜日）はカンマとの併用ができません。単独で指定してください';
    }
    
    // 範囲（-）が含まれている場合もエラー
    if (field.indexOf('-') !== -1) {
      return '「#」（第n曜日）は範囲指定との併用ができません。単独で指定してください';
    }
    
    return null;
  }

  /**
   * W記号の単独使用チェック（カンマとの併用不可）
   */
  function validateWeekdayAlone(field) {
    if (!field || field.indexOf('W') === -1) return null;
    
    // カンマが含まれている場合はエラー
    if (field.indexOf(',') !== -1) {
      return '「W」（最寄り平日）はカンマとの併用ができません。単独で指定してください';
    }
    
    // 範囲（-）が含まれている場合もエラー
    if (field.indexOf('-') !== -1) {
      return '「W」（最寄り平日）は範囲指定との併用ができません。単独で指定してください';
    }
    
    return null;
  }

  /**
   * フィールドの構文チェック（連続カンマ、不完全な範囲など）
   */
  function validateFieldSyntax(field, name) {
    if (!field || field === '*' || field === '?') return null;
    
    // 不正な文字のチェック（許可: 0-9, A-Z, a-z, *, ?, -, /, ,, #, L, W）
    var invalidChars = field.match(/[^0-9A-Za-z*?\-/,#LW]/g);
    if (invalidChars) {
      var uniqueChars = invalidChars.filter(function(v, i, a) { return a.indexOf(v) === i; });
      return name + 'に不正な文字「' + uniqueChars.join('」「') + '」が含まれています';
    }
    
    // 連続カンマ
    if (/,,/.test(field)) {
      return name + 'に連続したカンマがあります';
    }
    
    // 先頭カンマ
    if (/^,/.test(field)) {
      return name + 'の先頭に不正なカンマがあります';
    }
    
    // 末尾カンマ
    if (/,$/.test(field)) {
      return name + 'の末尾に不正なカンマがあります';
    }
    
    // 連続アスタリスク（**）
    if (/\*\*/.test(field)) {
      return name + 'に連続した「*」があります';
    }
    
    // 連続スラッシュ（//）
    if (/\/\//.test(field)) {
      return name + 'に連続した「/」があります';
    }
    
    // 連続ハイフン（--）
    if (/--/.test(field)) {
      return name + 'に連続した「-」があります';
    }
    
    // 不完全な範囲（末尾が-）
    if (/-$/.test(field) || /-[,\/]/.test(field)) {
      return name + 'の範囲指定が不完全です（終了値がありません）';
    }
    
    // 不完全な範囲（先頭が-）
    if (/^-/.test(field) || /[,\/]-/.test(field)) {
      return name + 'の範囲指定が不完全です（開始値がありません）';
    }
    
    // 不完全なステップ（末尾が/）
    if (/\/$/.test(field)) {
      return name + 'のステップ指定が不完全です（間隔値がありません）';
    }
    
    // 不完全なステップ（先頭が/）
    if (/^\//.test(field)) {
      return name + 'のステップ指定が不完全です（開始値がありません）';
    }
    
    return null;
  }

  /**
   * 年フィールドが数値かチェック
   */
  function validateYearFormat(field) {
    if (!field || field === '*') return null;
    
    // 年は数値、範囲、リスト、ステップのみ許可
    if (!/^[\d,\-\/\*]+$/.test(field)) {
      return '年の値「' + field + '」は無効です（数値を指定してください）';
    }
    return null;
  }

  function validateDayOfWeek(field) {
    var cleaned = field.replace(/[?*#\d]/g, '');
    var parts = cleaned.split(/[-\/,L]+/).filter(Boolean);
    
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].toUpperCase();
      if (name && VALID_DAY_NAMES.indexOf(name) === -1) {
        return '曜日「' + parts[i] + '」は無効です。SUN, MON, TUE, WED, THU, FRI, SAT または 1-7 を使用してください';
      }
    }
    return null;
  }

  function validateMonthName(field) {
    var cleaned = field.replace(/[?*\d]/g, '');
    var parts = cleaned.split(/[-\/,]+/).filter(Boolean);
    
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].toUpperCase();
      if (name && VALID_MONTH_NAMES.indexOf(name) === -1) {
        return '月「' + parts[i] + '」は無効です。JAN-DEC または 1-12 を使用してください';
      }
    }
    return null;
  }

  /**
   * Quartz Cron式のバリデーション
   * @param {string} cronExpression - Cron式
   * @returns {Object} バリデーション結果
   */
  function validate(cronExpression) {
    var errors = [];
    var warnings = [];
    var parts = cronExpression.trim().split(/\s+/);
    
    // フィールド数チェック
    if (parts.length < 6 || parts.length > 7) {
      errors.push('Quartz Cronは6〜7フィールド必要です（秒 分 時 日 月 曜日 [年]）');
      return { isValid: false, errors: errors, warnings: warnings };
    }
    
    var second = parts[0];
    var minute = parts[1];
    var hour = parts[2];
    var dayOfMonth = parts[3];
    var month = parts[4];
    var dayOfWeek = parts[5];
    var year = parts[6];
    
    // 日と曜日の同時指定チェック（Quartzでは必ずどちらかが「?」である必要がある）
    var dayIsQuestion = dayOfMonth === '?';
    var weekIsQuestion = dayOfWeek === '?';
    
    if (!dayIsQuestion && !weekIsQuestion) {
      errors.push('日と曜日のどちらかは必ず「?」にしてください');
    }
    
    if (dayIsQuestion && weekIsQuestion) {
      errors.push('日と曜日の両方を「?」にすることはできません');
    }
    
    // 範囲チェック
    var rangeChecks = [
      { field: second, name: '秒', min: 0, max: 59 },
      { field: minute, name: '分', min: 0, max: 59 },
      { field: hour, name: '時', min: 0, max: 23 },
      { field: dayOfMonth, name: '日', min: 1, max: 31 },
      { field: month, name: '月', min: 1, max: 12 },
      { field: dayOfWeek, name: '曜日', min: 1, max: 7 }
    ];
    
    if (year) {
      // 年フィールドはステップ値を除外してチェック
      rangeChecks.push({ field: year, name: '年', min: 1970, max: 2099, excludeStep: true });
    }
    
    rangeChecks.forEach(function(check) {
      var error = validateFieldRange(check.field, check.name, check.min, check.max, check.excludeStep);
      if (error) errors.push(error);
    });
    
    // ステップ値チェック（/0は不正）
    var stepChecks = [
      { field: second, name: '秒' },
      { field: minute, name: '分' },
      { field: hour, name: '時' },
      { field: dayOfMonth, name: '日' },
      { field: month, name: '月' },
      { field: dayOfWeek, name: '曜日' }
    ];
    
    stepChecks.forEach(function(check) {
      var error = validateStepValue(check.field, check.name);
      if (error) errors.push(error);
    });
    
    // 構文チェック（連続カンマ、不完全な範囲など）
    var syntaxChecks = [
      { field: second, name: '秒' },
      { field: minute, name: '分' },
      { field: hour, name: '時' },
      { field: dayOfMonth, name: '日' },
      { field: month, name: '月' },
      { field: dayOfWeek, name: '曜日' }
    ];
    
    syntaxChecks.forEach(function(check) {
      var error = validateFieldSyntax(check.field, check.name);
      if (error) errors.push(error);
    });
    
    // 範囲の方向チェック（跨ぎ非対応フィールドのみ from > to は不正）
    var dayOfWeekMap = { SUN: 1, MON: 2, TUE: 3, WED: 4, THU: 5, FRI: 6, SAT: 7 };
    var monthMap = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
    
    var rangeDirectionChecks = [
      { field: second, name: '秒', map: null, fieldType: 'second' },
      { field: minute, name: '分', map: null, fieldType: 'minute' },
      { field: hour, name: '時', map: null, fieldType: 'hour' },
      { field: dayOfMonth, name: '日', map: null, fieldType: 'dayOfMonth' },
      { field: month, name: '月', map: monthMap, fieldType: 'month' },
      { field: dayOfWeek, name: '曜日', map: dayOfWeekMap, fieldType: 'dayOfWeek' }
    ];
    
    if (year) {
      rangeDirectionChecks.push({ field: year, name: '年', map: null, fieldType: 'year' });
    }
    
    rangeDirectionChecks.forEach(function(check) {
      var error = validateRange(check.field, check.name, check.map, check.fieldType);
      if (error) errors.push(error);
    });
    
    // 特殊記号の位置チェック
    if (hasSymbol(second, 'L') || hasSymbol(minute, 'L') || hasSymbol(hour, 'L') || hasSymbol(month, 'L')) {
      errors.push('「L」は日または曜日フィールドでのみ使用できます');
    }
    
    if (hasSymbol(second, 'W') || hasSymbol(minute, 'W') || hasSymbol(hour, 'W') ||
        hasSymbol(month, 'W') || hasSymbol(dayOfWeek, 'W')) {
      errors.push('「W」は日フィールドでのみ使用できます');
    }
    
    if (hasSymbol(second, '#') || hasSymbol(minute, '#') || hasSymbol(hour, '#') ||
        hasSymbol(dayOfMonth, '#') || hasSymbol(month, '#')) {
      errors.push('「#」は曜日フィールドでのみ使用できます');
    }
    
    // #記号のバリデーション（曜日フィールド）
    if (dayOfWeek !== '?' && dayOfWeek !== '*' && dayOfWeek.indexOf('#') !== -1) {
      var nthError = validateNthWeekday(dayOfWeek);
      if (nthError) errors.push(nthError);
      
      // #の単独使用チェック
      var hashAloneError = validateHashAlone(dayOfWeek);
      if (hashAloneError) errors.push(hashAloneError);
    }
    
    // W記号のバリデーション（日フィールド）
    if (dayOfMonth !== '?' && dayOfMonth !== '*' && dayOfMonth.indexOf('W') !== -1) {
      var weekdayAloneError = validateWeekdayAlone(dayOfMonth);
      if (weekdayAloneError) errors.push(weekdayAloneError);
    }
    
    // L-n のバリデーション（オフセットが大きすぎないか）
    var lastOffsetMatch = dayOfMonth.match(/^L-(\d+)$/);
    if (lastOffsetMatch) {
      var offset = parseInt(lastOffsetMatch[1], 10);
      if (offset > 30) {
        errors.push('「L-' + offset + '」のオフセットが大きすぎます（最大30日）');
      }
    }
    
    // カレンダーの論理チェック（2月31日、4月31日など）
    if (dayOfMonth !== '?' && dayOfMonth !== '*' && month !== '*') {
      var dayNum = parseInt(dayOfMonth, 10);
      var monthNum = parseInt(month, 10);
      if (!isNaN(dayNum) && !isNaN(monthNum)) {
        var maxDays = { 2: 29, 4: 30, 6: 30, 9: 30, 11: 30 };
        var maxDay = maxDays[monthNum];
        if (maxDay && dayNum > maxDay) {
          var monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
          errors.push(monthNames[monthNum] + dayNum + '日は存在しません（最大' + maxDay + '日）');
        }
      }
    }
    
    // 曜日名チェック
    if (dayOfWeek !== '?' && dayOfWeek !== '*') {
      var dayError = validateDayOfWeek(dayOfWeek);
      if (dayError) errors.push(dayError);
    }
    
    // 月名チェック
    if (month !== '?' && month !== '*') {
      var monthError = validateMonthName(month);
      if (monthError) errors.push(monthError);
    }
    
    // 年フォーマットチェック
    if (year) {
      var yearFormatError = validateYearFormat(year);
      if (yearFormatError) errors.push(yearFormatError);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  // ============================================================
  // メインAPI
  // ============================================================

  /**
   * Quartz Cron式を日本語に翻訳
   * @param {string} cronExpression - Cron式
   * @param {Object} options - オプション
   * @param {boolean} options.skipValidation - バリデーションをスキップ
   * @returns {Object} 翻訳結果
   */
  function translate(cronExpression, options) {
    options = options || {};
    
    var parts = cronExpression.trim().split(/\s+/);
    
    // フィールド数チェック
    if (parts.length < 6 || parts.length > 7) {
      return {
        success: false,
        error: 'Quartz Cronは6〜7フィールド必要です（秒 分 時 日 月 曜日 [年]）',
        validationErrors: ['フィールド数が不正です']
      };
    }
    
    // バリデーション
    if (!options.skipValidation) {
      var validation = validate(cronExpression);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0],
          validationErrors: validation.errors
        };
      }
    }
    
    var second = parts[0];
    var minute = parts[1];
    var hour = parts[2];
    var dayOfMonth = parts[3].toUpperCase();  // 小文字対応（L, W）
    var month = parts[4].toUpperCase();        // 小文字対応（JAN-DEC）
    var dayOfWeek = parts[5].toUpperCase();    // 小文字対応（SUN-SAT, L）
    var year = parts[6];
    
    // 解析
    var parsed = {
      second: parseField(second, 'second'),
      minute: parseField(minute, 'minute'),
      hour: parseField(hour, 'hour'),
      dayOfMonth: parseField(dayOfMonth, 'dayOfMonth'),
      month: parseField(month, 'month'),
      dayOfWeek: parseField(dayOfWeek, 'dayOfWeek'),
      year: year ? parseField(year, 'year') : null
    };
    
    // 翻訳
    var translated = {
      second: translateField(parsed.second, 'second'),
      minute: translateField(parsed.minute, 'minute'),
      hour: translateField(parsed.hour, 'hour'),
      dayOfMonth: translateField(parsed.dayOfMonth, 'dayOfMonth'),
      month: translateField(parsed.month, 'month'),
      dayOfWeek: translateField(parsed.dayOfWeek, 'dayOfWeek'),
      year: parsed.year ? translateField(parsed.year, 'year') : null
    };
    
    // 説明文生成
    var description = buildDescription(translated, parsed);
    
    return {
      success: true,
      description: description,
      fields: {
        second: { raw: second, parsed: parsed.second, translated: translated.second.text },
        minute: { raw: minute, parsed: parsed.minute, translated: translated.minute.text },
        hour: { raw: hour, parsed: parsed.hour, translated: translated.hour.text },
        dayOfMonth: { raw: dayOfMonth, parsed: parsed.dayOfMonth, translated: translated.dayOfMonth.text },
        month: { raw: month, parsed: parsed.month, translated: translated.month.text },
        dayOfWeek: { raw: dayOfWeek, parsed: parsed.dayOfWeek, translated: translated.dayOfWeek.text },
        year: year ? { raw: year, parsed: parsed.year, translated: translated.year.text } : null
      }
    };
  }

  // ============================================================
  // 公開API
  // ============================================================

  return {
    /**
     * バージョン
     */
    version: '1.0.0',
    
    /**
     * Cron式を日本語に翻訳
     * @param {string} cronExpression - Quartz Cron式
     * @param {Object} [options] - オプション
     * @returns {Object} 翻訳結果
     */
    translate: translate,
    
    /**
     * Cron式のバリデーション
     * @param {string} cronExpression - Quartz Cron式
     * @returns {Object} バリデーション結果
     */
    validate: validate,
    
    /**
     * フィールドを解析（上級者向け）
     * @param {string} value - フィールド値
     * @param {string} fieldType - フィールドタイプ
     * @returns {Object} 解析結果
     */
    parseField: parseField,
    
    /**
     * 解析結果を翻訳（上級者向け）
     * @param {Object} parsed - parseFieldの結果
     * @param {string} fieldType - フィールドタイプ
     * @returns {Object} 翻訳結果
     */
    translateField: translateField
  };
}));
