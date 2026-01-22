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
    var m = String(minute).padStart(2, '0');
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
    var m = String(minute).padStart(2, '0');
    var s = String(second);
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
    
    if (value.slice(-1) === 'L' && value !== 'L') {
      return { type: 'lastWeekday', day: value.slice(0, -1) };
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
      return { type: 'interval', start: slashParts[0], interval: slashParts[1] };
    }
    
    if (value.indexOf('-') !== -1 && value.indexOf(',') === -1) {
      var rangeParts = value.split('-');
      return { type: 'range', from: rangeParts[0], to: rangeParts[1] };
    }
    
    if (value.indexOf(',') !== -1) {
      var items = value.split(',').map(function(item) {
        if (item.indexOf('-') !== -1) {
          var itemParts = item.split('-');
          return { type: 'range', from: itemParts[0], to: itemParts[1] };
        }
        return { type: 'single', value: item };
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
        return { text: '最終' + translateDay(parsed.day) + '曜日' };
      
      case 'nearestWeekday':
        return { text: parsed.day + '日に最も近い平日' };
      
      case 'nthWeekday':
        return { text: '第' + parsed.nth + translateDay(parsed.day) + '曜日' };
      
      case 'interval':
        startVal = parsed.start === '*' ? '0' : parsed.start;
        intervalVal = parsed.interval;
        unit = fieldType === 'hour' ? '時間' : getFieldUnit(fieldType);
        
        if (intervalVal === '1') {
          if (fieldType === 'second') return { text: '毎秒', isInterval: true, isEverySecond: true };
          if (fieldType === 'minute') return { text: '毎分', isInterval: true, isEveryMinute: true };
          if (fieldType === 'hour') return { text: '毎時', isInterval: true, isEveryHour: true };
        }
        
        // 「起点で〜間隔」形式で表示
        return {
          text: startVal + getFieldUnit(fieldType) + '起点で' + intervalVal + unit + '間隔',
          isInterval: true,
          startValue: startVal
        };
      
      case 'range':
        if (fieldType === 'dayOfWeek') {
          from = translateDay(parsed.from);
          to = translateDay(parsed.to);
          if ((parsed.from === 'MON' || parsed.from === '2') &&
              (parsed.to === 'FRI' || parsed.to === '6')) {
            return { text: '平日（月〜金）' };
          }
          return { text: from + '曜日〜' + to + '曜日' };
        }
        if (fieldType === 'month') {
          return { text: translateMonth(parsed.from) + '〜' + translateMonth(parsed.to) };
        }
        return { text: parsed.from + '〜' + parsed.to + getFieldUnit(fieldType) };
      
      case 'list':
        items = parsed.items.map(function(item) {
          if (item.type === 'range') {
            if (fieldType === 'dayOfWeek') {
              return translateDay(item.from) + '〜' + translateDay(item.to);
            }
            return item.from + '〜' + item.to;
          }
          if (fieldType === 'dayOfWeek') return translateDay(item.value);
          if (fieldType === 'month') return translateMonth(item.value);
          return item.value;
        });
        
        if (fieldType === 'dayOfWeek') {
          return { text: items.join('・') + '曜日' };
        }
        if (fieldType === 'month') {
          return { text: items.join('・') };
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
    var h, m, s, hours;
    
    // 秒の間隔パターン
    if (second.isInterval) {
      // 分も間隔指定の場合（例: 10/3 1/10 2）
      if (minute.isInterval) {
        // 時も間隔指定の場合（例: 10/3 1/10 2/2）
        if (hour.isInterval) {
          return hour.text + '、' + minute.text + '、' + second.text;
        }
        if (!hour.isAll) {
          h = parsed.hour.value || '0';
          return formatHour12(h) + '台に' + minute.text + '、' + second.text;
        }
        return minute.text + '、' + second.text;
      }
      // 時だけ間隔指定の場合（例: 0/5 0 2/2）
      if (hour.isInterval) {
        if (!minute.isAll) {
          m = (parsed.minute.value || '0').toString().padStart(2, '0');
          return hour.text + '、' + m + '分に' + second.text;
        }
        return hour.text + '、' + second.text;
      }
      if (!hour.isAll && !minute.isAll) {
        h = parsed.hour.value || '0';
        m = (parsed.minute.value || '0').toString().padStart(2, '0');
        return formatTime12(h, m) + 'に' + second.text;
      }
      if (!hour.isAll && minute.isAll) {
        h = parsed.hour.value || '0';
        return formatHour12(h) + '台に' + second.text;
      }
      return second.text;
    }
    
    // 分の間隔パターン
    if (minute.isInterval) {
      // 分の起点を取得
      var minStart = parsed.minute.start === '*' ? '0' : parsed.minute.start;
      var minInterval = parsed.minute.interval;
      // 秒が0でない場合は秒も起点に含める
      s = parsed.second.value || '0';
      
      if (hour.isAll) {
        // 毎時の場合
        if (s !== '0' && parsed.second.type === 'single') {
          return '毎時' + minStart + '分' + s + '秒起点で' + minInterval + '分間隔';
        }
        return '毎時' + minStart + '分起点で' + minInterval + '分間隔';
      }
      if (parsed.hour.type === 'range') {
        // 時間範囲の場合（例: 9-17時の間）
        var fromH = formatHour12(parsed.hour.from);
        var toH = formatHour12(parsed.hour.to);
        if (s !== '0' && parsed.second.type === 'single') {
          return fromH + '〜' + toH + 'の間、毎時' + minStart + '分' + s + '秒起点で' + minInterval + '分間隔';
        }
        return fromH + '〜' + toH + 'の間、毎時' + minStart + '分起点で' + minInterval + '分間隔';
      }
      // 時が単一値の場合（例: 3時）→ 時分を組み合わせた起点表現
      h = parsed.hour.value || '0';
      if (s !== '0' && parsed.second.type === 'single') {
        return formatTimeWithSec12(h, minStart, s) + '起点で' + minInterval + '分間隔';
      }
      return formatTime12(h, minStart) + '起点で' + minInterval + '分間隔';
    }
    
    // 時の間隔パターン
    if (hour.isInterval) {
      if (!minute.isAll) {
        m = (parsed.minute.value || '0').toString().padStart(2, '0');
        if (hour.isEveryHour) {
          return '毎時' + m + '分';
        }
        // 時の起点と分を組み合わせて表現（例: 午前0時30分起点で2時間間隔）
        var hourStart = parsed.hour.start === '*' ? '0' : parsed.hour.start;
        return formatTime12(hourStart, m) + '起点で' + parsed.hour.interval + '時間間隔';
      }
      return hour.text;
    }
    
    // 通常の時刻
    if (hour.isAll && minute.isAll) {
      if (!second.isAll && second.text) {
        return '毎分' + second.text;
      }
      return '毎分';
    }
    
    if (hour.isAll) {
      return '毎時' + (parsed.minute.value || '0') + '分';
    }
    
    // 具体的な時刻
    m = (parsed.minute.value || '0').toString().padStart(2, '0');
    s = parsed.second.value || '0';
    
    // 時間がリストの場合
    if (parsed.hour.type === 'list') {
      hours = parsed.hour.items.map(function(item) {
        if (item.type === 'range') {
          return formatHour12(item.from) + '〜' + formatHour12(item.to);
        }
        return formatHour12(item.value).replace('時', '');
      }).join('・') + '時';
      return hours + m + '分';
    }
    
    if (parsed.hour.type === 'range') {
      var rangeFrom = formatHour12(parsed.hour.from);
      var rangeTo = formatHour12(parsed.hour.to);
      return rangeFrom + '〜' + rangeTo + 'の間、毎時' + m + '分';
    }
    
    h = parsed.hour.value || parsed.hour.from || '0';
    
    if (s !== '0' && parsed.second.type === 'single') {
      return formatTimeWithSec12(h, m, s);
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
      }
    }
    
    // 日または曜日
    hasDayOfMonth = !translated.dayOfMonth.isAny && !translated.dayOfMonth.isAll && translated.dayOfMonth.text;
    hasDayOfWeek = !translated.dayOfWeek.isAny && !translated.dayOfWeek.isAll && translated.dayOfWeek.text;
    hasMonth = !translated.month.isAll && translated.month.text;
    
    if (hasMonth && hasDayOfMonth) {
      if (hasDayOfWeek) {
        parts.push(translated.month.text + translated.dayOfMonth.text + 'の' + translated.dayOfWeek.text);
      } else {
        parts.push(translated.month.text + translated.dayOfMonth.text);
      }
    } else if (hasMonth) {
      parts.push(translated.month.text);
      if (hasDayOfWeek) {
        parts.push(translated.dayOfWeek.text);
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
        prefix = '';
      } else if (translated.minute.isAll || translated.minute.isInterval) {
        if (translated.minute.isInterval && (parsed.hour.type === 'range' || parsed.hour.type === 'single')) {
          prefix = '';
        } else if (!translated.minute.isInterval) {
          prefix = '毎時';
        }
      } else {
        prefix = '毎日';
      }
    } else if (translated.month.isAll && (hasDayOfMonth || hasDayOfWeek)) {
      prefix = '毎月';
      if (!hasDayOfMonth && hasDayOfWeek) {
        var dayOfWeekType = parsed.dayOfWeek.type;
        var isMonthlyPattern = dayOfWeekType === 'lastWeekday' || dayOfWeekType === 'nthWeekday';
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
    }
    
    // 年と頻度の接続
    yearConnect = (yearPrefix && prefix) ? 'の' : '';
    
    result = yearPrefix + yearConnect + prefix + parts.join(' ');
    
    return result || '指定された条件で実行';
  }

  // ============================================================
  // バリデーター
  // ============================================================

  function validateFieldRange(field, name, min, max) {
    if (!field || field === '*' || field === '?') return null;
    
    var numbers = field.match(/\d+/g);
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
   */
  function validateRange(field, name, valueMap) {
    if (!field || field === '*' || field === '?') return null;
    
    // 範囲を抽出（例: 10-1, MON-FRI）
    var rangePattern = /([A-Za-z]+|\d+)-([A-Za-z]+|\d+)/g;
    var match;
    
    while ((match = rangePattern.exec(field)) !== null) {
      var fromStr = match[1];
      var toStr = match[2];
      
      // 数値または名前を数値に変換
      var from = valueMap ? (valueMap[fromStr.toUpperCase()] || parseInt(fromStr, 10)) : parseInt(fromStr, 10);
      var to = valueMap ? (valueMap[toStr.toUpperCase()] || parseInt(toStr, 10)) : parseInt(toStr, 10);
      
      if (!isNaN(from) && !isNaN(to) && from > to) {
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
   * フィールドの構文チェック（連続カンマ、不完全な範囲など）
   */
  function validateFieldSyntax(field, name) {
    if (!field || field === '*' || field === '?') return null;
    
    // 連続カンマ
    if (/,,/.test(field)) {
      return name + 'に連続したカンマがあります';
    }
    
    // 不完全な範囲（末尾が-）
    if (/-$/.test(field) || /-[,\/]/.test(field)) {
      return name + 'の範囲指定が不完全です（終了値がありません）';
    }
    
    // 不完全な範囲（先頭が-）
    if (/^-/.test(field) || /[,\/]-/.test(field)) {
      return name + 'の範囲指定が不完全です（開始値がありません）';
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
      rangeChecks.push({ field: year, name: '年', min: 1970, max: 2099 });
    }
    
    rangeChecks.forEach(function(check) {
      var error = validateFieldRange(check.field, check.name, check.min, check.max);
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
    
    // 範囲の方向チェック（from > to は不正）
    var dayOfWeekMap = { SUN: 1, MON: 2, TUE: 3, WED: 4, THU: 5, FRI: 6, SAT: 7 };
    var monthMap = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
    
    var rangeDirectionChecks = [
      { field: second, name: '秒', map: null },
      { field: minute, name: '分', map: null },
      { field: hour, name: '時', map: null },
      { field: dayOfMonth, name: '日', map: null },
      { field: month, name: '月', map: monthMap },
      { field: dayOfWeek, name: '曜日', map: dayOfWeekMap }
    ];
    
    rangeDirectionChecks.forEach(function(check) {
      var error = validateRange(check.field, check.name, check.map);
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
    var dayOfMonth = parts[3];
    var month = parts[4];
    var dayOfWeek = parts[5];
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
