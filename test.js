/**
 * QuartzCronJP テストスイート
 */

var QuartzCronJP = require('./quartz-cron-jp.js');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║                   QuartzCronJP テストスイート                         ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('バージョン:', QuartzCronJP.version);
console.log('');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('✅ ' + name);
    passed++;
  } catch (e) {
    console.log('❌ ' + name);
    console.log('   Error: ' + e.message);
    failed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error((message || '') + ' Expected: ' + expected + ', Got: ' + actual);
  }
}

function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || 'Expected true but got false');
  }
}

function assertFalse(value, message) {
  if (value) {
    throw new Error(message || 'Expected false but got true');
  }
}

// ============================================================
// 翻訳テスト：基本パターン
// ============================================================

console.log('── 基本パターン ──────────────────────────────────────────────');

test('毎日正午', function() {
  var result = QuartzCronJP.translate('0 0 12 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午後12時');
});

test('平日9:30', function() {
  var result = QuartzCronJP.translate('0 30 9 ? * MON-FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週平日（月〜金） 午前9時30分');
});

test('毎月1日', function() {
  var result = QuartzCronJP.translate('0 0 9 1 * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月1日 午前9時');
});

test('年指定', function() {
  var result = QuartzCronJP.translate('0 0 0 1 1 ? 2025');
  assertTrue(result.success);
  assertEquals(result.description, '2025年1月1日 午前0時');
});

// ============================================================
// 翻訳テスト：12時間表記
// ============================================================

console.log('');
console.log('── 12時間表記 ────────────────────────────────────────────────');

test('午前0時（深夜）', function() {
  var result = QuartzCronJP.translate('0 0 0 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前0時');
});

test('午前11時', function() {
  var result = QuartzCronJP.translate('0 0 11 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前11時');
});

test('午後12時（正午）', function() {
  var result = QuartzCronJP.translate('0 0 12 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午後12時');
});

test('午後1時', function() {
  var result = QuartzCronJP.translate('0 0 13 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午後1時');
});

test('午後11時', function() {
  var result = QuartzCronJP.translate('0 0 23 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午後11時');
});

// ============================================================
// 翻訳テスト：0分省略
// ============================================================

console.log('');
console.log('── 0分省略 ───────────────────────────────────────────────────');

test('0分省略あり', function() {
  var result = QuartzCronJP.translate('0 0 9 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9時');
});

test('30分は省略しない', function() {
  var result = QuartzCronJP.translate('0 30 9 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9時30分');
});

test('秒付きは0分でも省略しない', function() {
  var result = QuartzCronJP.translate('30 0 9 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9時0分30秒');
});

// ============================================================
// 翻訳テスト：毎秒・毎分・毎時
// ============================================================

console.log('');
console.log('── 毎秒・毎分・毎時 ──────────────────────────────────────────');

test('毎秒（* * *）', function() {
  var result = QuartzCronJP.translate('* * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎秒');
});

test('毎分0秒', function() {
  var result = QuartzCronJP.translate('0 * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分');
});

test('毎分30秒', function() {
  var result = QuartzCronJP.translate('30 * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分30秒');
});

test('毎時0分', function() {
  var result = QuartzCronJP.translate('0 0 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時0分');
});

test('毎時30分', function() {
  var result = QuartzCronJP.translate('0 30 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時30分');
});

test('毎時30分15秒', function() {
  var result = QuartzCronJP.translate('15 30 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時30分15秒');
});

test('6時台に毎分', function() {
  var result = QuartzCronJP.translate('0 * 6 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前6時台に毎分');
});

test('6時台に毎秒', function() {
  var result = QuartzCronJP.translate('* * 6 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前6時台に毎秒');
});

test('6時台に毎分12秒', function() {
  var result = QuartzCronJP.translate('12 * 6 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前6時台に毎分12秒');
});

test('6時50分に毎秒', function() {
  var result = QuartzCronJP.translate('* 50 6 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前6時50分に毎秒');
});

// ============================================================
// 翻訳テスト：間隔パターン（起点）
// ============================================================

console.log('');
console.log('── 間隔パターン（起点） ──────────────────────────────────────');

test('分間隔：0分起点', function() {
  var result = QuartzCronJP.translate('0 0/15 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時0分起点で15分間隔');
});

test('分間隔：5分起点', function() {
  var result = QuartzCronJP.translate('0 5/20 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時5分起点で20分間隔');
});

test('時間間隔：0時起点', function() {
  var result = QuartzCronJP.translate('0 0 0/2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前0時0分起点で2時間間隔');
});

test('時間間隔：0時30分起点', function() {
  var result = QuartzCronJP.translate('0 30 0/2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前0時30分起点で2時間間隔');
});

test('秒間隔：0秒起点', function() {
  var result = QuartzCronJP.translate('0/10 * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分0秒起点で10秒間隔');
});

test('秒間隔：5秒起点', function() {
  var result = QuartzCronJP.translate('5/15 * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分5秒起点で15秒間隔');
});

test('分間隔＋時間範囲', function() {
  var result = QuartzCronJP.translate('0 0/30 9-17 ? * MON-FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週平日（月〜金） 午前9時〜午後5時の間、毎時0分起点で30分間隔');
});

test('分間隔＋特定時刻', function() {
  var result = QuartzCronJP.translate('0 5/20 3 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前3時5分起点で20分間隔');
});

test('分間隔＋特定時刻＋秒', function() {
  var result = QuartzCronJP.translate('30 5/20 3 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前3時5分30秒起点で20分間隔');
});

test('時間＋分 両方間隔', function() {
  var result = QuartzCronJP.translate('0 2/30 0/2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前0時2分起点で2時間・30分間隔');
});

test('時間＋分 両方間隔＋秒', function() {
  var result = QuartzCronJP.translate('30 5/10 2/4 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前2時5分30秒起点で4時間・10分間隔');
});

// ============================================================
// 翻訳テスト：曜日パターン
// ============================================================

console.log('');
console.log('── 曜日パターン ──────────────────────────────────────────────');

test('平日（MON-FRI）', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * MON-FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週平日（月〜金） 午前9時');
});

test('全曜日（1-7）→月〜日', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * 1-7');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月〜日曜日 午前9時');
});

test('全曜日（SUN-SAT）→月〜日', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * SUN-SAT');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月〜日曜日 午前9時');
});

test('曜日リスト→日本式ソート', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * SUN,MON,TUE');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月・火・日曜日 午前9時');
});

test('曜日リスト→連続グループ化（全曜日）', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * 1,2,3,4,5,6,7');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月〜日曜日 午前9時');
});

test('曜日リスト→連続グループ化（一部連続）', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * MON,TUE,WED,SAT,SUN');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月〜水・土・日曜日 午前9時');
});

test('曜日リスト→連続なし', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * MON,WED,FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月・水・金曜日 午前9時');
});

test('曜日リスト→2連続は個別', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * MON,TUE');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月・火曜日 午前9時');
});

test('曜日リスト→土日', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * SAT,SUN');
  assertTrue(result.success);
  assertEquals(result.description, '毎週土・日曜日 午前9時');
});

test('曜日リスト→範囲混在', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * MON-WED,FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月〜水・金曜日 午前9時');
});

// ============================================================
// 翻訳テスト：特殊記号（L, W, #）
// ============================================================

console.log('');
console.log('── 特殊記号（L, W, #） ───────────────────────────────────────');

test('月末（L）', function() {
  var result = QuartzCronJP.translate('0 0 18 L * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月末日 午後6時');
});

test('最寄り平日（W）', function() {
  var result = QuartzCronJP.translate('0 0 9 15W * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月15日に最も近い平日 午前9時');
});

test('第1月曜（#）', function() {
  var result = QuartzCronJP.translate('0 0 10 ? * 2#1');
  assertTrue(result.success);
  assertEquals(result.description, '毎月第1月曜日 午前10時');
});

test('第3金曜（#）', function() {
  var result = QuartzCronJP.translate('0 0 10 ? * 6#3');
  assertTrue(result.success);
  assertEquals(result.description, '毎月第3金曜日 午前10時');
});

test('最終日曜（1L）', function() {
  var result = QuartzCronJP.translate('0 30 9 ? * 1L');
  assertTrue(result.success);
  assertEquals(result.description, '毎月最終日曜日 午前9時30分');
});

test('最終金曜（6L）', function() {
  var result = QuartzCronJP.translate('0 0 17 ? * 6L');
  assertTrue(result.success);
  assertEquals(result.description, '毎月最終金曜日 午後5時');
});

// ============================================================
// 翻訳テスト：時間リスト・範囲
// ============================================================

console.log('');
console.log('── 時間リスト・範囲 ──────────────────────────────────────────');

test('時間リスト', function() {
  var result = QuartzCronJP.translate('0 30 8,12,18 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前8・午後12・午後6時30分');
});

test('時間範囲（9-17時）', function() {
  var result = QuartzCronJP.translate('0 0 9-17 ? * MON-FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週平日（月〜金） 午前9時〜午後5時の間、毎時0分');
});

test('日リスト', function() {
  var result = QuartzCronJP.translate('0 0 9 1,15 * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月1、15日 午前9時');
});

test('月リスト', function() {
  var result = QuartzCronJP.translate('0 0 9 1 3,6,9,12 ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎年3月・6月・9月・12月1日 午前9時');
});

// ============================================================
// 翻訳テスト：複合パターン
// ============================================================

console.log('');
console.log('── 複合パターン ──────────────────────────────────────────────');

test('秒間隔＋分*＋時', function() {
  var result = QuartzCronJP.translate('12/3 * 6 ? * MON');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月曜日 午前6時台に毎分12秒起点で3秒間隔');
});

test('毎秒＋時刻', function() {
  var result = QuartzCronJP.translate('0/1 0 2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前2時0分に毎秒');
});

test('月指定＋曜日', function() {
  var result = QuartzCronJP.translate('0 0 9 ? 1 MON');
  assertTrue(result.success);
  assertEquals(result.description, '毎年1月 月曜日 午前9時');
});

test('年範囲', function() {
  var result = QuartzCronJP.translate('0 0 9 1 1 ? 2025-2030');
  assertTrue(result.success);
  assertEquals(result.description, '2025年〜2030年1月1日 午前9時');
});

// ============================================================
// バリデーションテスト
// ============================================================

console.log('');
console.log('── バリデーション：構文エラー ────────────────────────────────');

test('フィールド数不足', function() {
  var result = QuartzCronJP.translate('0 0 12 * *');
  assertFalse(result.success);
});

test('フィールド数過多', function() {
  var result = QuartzCronJP.translate('0 0 12 * * ? 2025 extra');
  assertFalse(result.success);
});

test('無効な曜日名', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * ABC');
  assertFalse(result.success);
});

test('無効な月名', function() {
  var result = QuartzCronJP.translate('0 0 12 1 ABC ?');
  assertFalse(result.success);
});

test('不正な文字（@+）', function() {
  var result = QuartzCronJP.translate('@+ 0 09 ? * MON');
  assertFalse(result.success);
  assertTrue(result.validationErrors[0].indexOf('不正な文字') !== -1);
});

test('不正な文字（!）', function() {
  var result = QuartzCronJP.translate('0! 0 09 ? * MON');
  assertFalse(result.success);
});

console.log('');
console.log('── バリデーション：範囲エラー ────────────────────────────────');

test('秒が範囲外（60）', function() {
  var result = QuartzCronJP.translate('60 0 12 * * ?');
  assertFalse(result.success);
});

test('分が範囲外（60）', function() {
  var result = QuartzCronJP.translate('0 60 12 * * ?');
  assertFalse(result.success);
});

test('時が範囲外（24）', function() {
  var result = QuartzCronJP.translate('0 0 24 * * ?');
  assertFalse(result.success);
});

test('時が範囲外（25）', function() {
  var result = QuartzCronJP.translate('0 0 25 * * ?');
  assertFalse(result.success);
  assertTrue(result.validationErrors[0].indexOf('25') !== -1);
});

test('日が範囲外（32）', function() {
  var result = QuartzCronJP.translate('0 0 12 32 * ?');
  assertFalse(result.success);
});

test('月が範囲外（13）', function() {
  var result = QuartzCronJP.translate('0 0 12 1 13 ?');
  assertFalse(result.success);
});

test('曜日が範囲外（8）', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * 8');
  assertFalse(result.success);
});

console.log('');
console.log('── バリデーション：日/曜日ルール ─────────────────────────────');

test('日と曜日の同時指定でエラー', function() {
  var result = QuartzCronJP.translate('0 0 12 15 * MON');
  assertFalse(result.success);
  assertTrue(result.validationErrors.length > 0);
});

test('両方?でエラー', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * ?');
  assertFalse(result.success);
});

test('日が?、曜日が値はOK', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * MON');
  assertTrue(result.success);
});

test('日が値、曜日が?はOK', function() {
  var result = QuartzCronJP.translate('0 0 12 15 * ?');
  assertTrue(result.success);
});

console.log('');
console.log('── バリデーション：その他 ────────────────────────────────────');

test('ステップが0でエラー', function() {
  var result = QuartzCronJP.translate('0 0/0 12 * * ?');
  assertFalse(result.success);
});

test('#の週番号が範囲外（6）', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * 2#6');
  assertFalse(result.success);
});

test('#の週番号が範囲外（0）', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * 2#0');
  assertFalse(result.success);
});

test('#とカンマの併用でエラー', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * 1#1,2,3');
  assertFalse(result.success);
  assertTrue(result.validationErrors[0].indexOf('カンマとの併用') !== -1);
});

test('Wとカンマの併用でエラー', function() {
  var result = QuartzCronJP.translate('0 0 9 23W,12W * ?');
  assertFalse(result.success);
  assertTrue(result.validationErrors[0].indexOf('カンマとの併用') !== -1);
});

test('validate関数：正常', function() {
  var result = QuartzCronJP.validate('0 0 12 * * ?');
  assertTrue(result.isValid);
  assertEquals(result.errors.length, 0);
});

test('validate関数：エラー', function() {
  var result = QuartzCronJP.validate('0 0 25 * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors.length > 0);
});

// ============================================================
// パーサーテスト
// ============================================================

console.log('');
console.log('── パーサーテスト ───────────────────────────────────────────────');

test('parseField: all', function() {
  var result = QuartzCronJP.parseField('*', 'minute');
  assertEquals(result.type, 'all');
});

test('parseField: any', function() {
  var result = QuartzCronJP.parseField('?', 'dayOfMonth');
  assertEquals(result.type, 'any');
});

test('parseField: range', function() {
  var result = QuartzCronJP.parseField('MON-FRI', 'dayOfWeek');
  assertEquals(result.type, 'range');
  assertEquals(result.from, 'MON');
  assertEquals(result.to, 'FRI');
});

test('parseField: interval', function() {
  var result = QuartzCronJP.parseField('0/15', 'minute');
  assertEquals(result.type, 'interval');
  assertEquals(result.start, '0');
  assertEquals(result.interval, '15');
});

test('parseField: nthWeekday', function() {
  var result = QuartzCronJP.parseField('2#1', 'dayOfWeek');
  assertEquals(result.type, 'nthWeekday');
  assertEquals(result.day, '2');
  assertEquals(result.nth, '1');
});

// ============================================================
// 翻訳テスト：複雑・意地悪パターン
// ============================================================

console.log('');
console.log('── 複雑・意地悪パターン ─────────────────────────────────────');

test('分リスト（0,30）', function() {
  var result = QuartzCronJP.translate('0 0,30 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時0・30分');
});

test('分リスト＋時リスト', function() {
  var result = QuartzCronJP.translate('0 15,45 9,12,18 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9・午後12・午後6時の15・45分');
});

test('時間範囲＋間隔（9-17/2）', function() {
  var result = QuartzCronJP.translate('0 0 9-17/2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9時〜午後5時の間、2時間間隔');
});

test('曜日範囲＋間隔（2-6/2）', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * 2-6/2');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月・水・金曜日 午前9時');
});

test('秒＋分＋時 全部間隔', function() {
  var result = QuartzCronJP.translate('0/10 5/15 2/3 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前2時起点で3時間間隔、5分起点で15分間隔、0秒起点で10秒間隔');
});

test('日の範囲＋間隔（1-15/5）', function() {
  var result = QuartzCronJP.translate('0 0 0 1-15/5 * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月1〜15日の間、5日間隔 午前0時');
});

test('月の範囲＋間隔（1-6/2）', function() {
  var result = QuartzCronJP.translate('0 0 0 1 1-6/2 ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎年1月〜6月の間、2ヶ月間隔 1日 午前0時');
});

test('時リスト（0,12）', function() {
  var result = QuartzCronJP.translate('0 0 0,12 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前0・午後12時');
});

test('平日＋時間範囲＋間隔', function() {
  var result = QuartzCronJP.translate('0 0 6-20/2 ? * MON-FRI');
  assertTrue(result.success);
  assertEquals(result.description, '毎週平日（月〜金） 午前6時〜午後8時の間、2時間間隔');
});

test('特定日時（年末カウントダウン）', function() {
  var result = QuartzCronJP.translate('59 59 23 31 12 ? 2099');
  assertTrue(result.success);
  assertEquals(result.description, '2099年12月31日 午後11時59分59秒');
});

test('分リスト（4つ）', function() {
  var result = QuartzCronJP.translate('0 0,15,30,45 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時0・15・30・45分');
});

test('秒＋分＋時 全部*/n', function() {
  var result = QuartzCronJP.translate('*/5 */10 */2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前0時起点で2時間間隔、0分起点で10分間隔、0秒起点で5秒間隔');
});

test('1Wパターン（月初最寄り平日）', function() {
  var result = QuartzCronJP.translate('0 0 9 1W * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月1日に最も近い平日 午前9時');
});

test('最終木曜日（5L）', function() {
  var result = QuartzCronJP.translate('0 0 0 ? * 5L');
  assertTrue(result.success);
  assertEquals(result.description, '毎月最終木曜日 午前0時');
});

test('第4金曜日（6#4）', function() {
  var result = QuartzCronJP.translate('0 30 10 ? * 6#4');
  assertTrue(result.success);
  assertEquals(result.description, '毎月第4金曜日 午前10時30分');
});

test('四半期月の第1月曜', function() {
  var result = QuartzCronJP.translate('0 0 0 ? 1,4,7,10 MON#1');
  assertTrue(result.success);
  assertEquals(result.description, '毎年1月・4月・7月・10月 第1月曜日 午前0時');
});

test('LW（月末最寄り平日）', function() {
  var result = QuartzCronJP.translate('0 0 9 LW * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月末日に最も近い平日 午前9時');
});

test('L-3（月末3日前）', function() {
  var result = QuartzCronJP.translate('0 0 0 L-3 * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月末日の3日前 午前0時');
});

// ============================================================
// インターバル1の特殊処理
// ============================================================

console.log('');
console.log('── インターバル1の特殊処理 ──────────────────────────────────');

test('*/1秒 → 毎秒', function() {
  var result = QuartzCronJP.translate('*/1 * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎秒');
});

test('*/1分 → 毎分', function() {
  var result = QuartzCronJP.translate('0 */1 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分');
});

test('0/1分 → 毎分', function() {
  var result = QuartzCronJP.translate('0 0/1 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分');
});

test('*/1時 → 毎時0分', function() {
  var result = QuartzCronJP.translate('0 0 */1 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日毎時0分');
});

test('59/1秒（境界値）→ 毎分59秒', function() {
  var result = QuartzCronJP.translate('59/1 * * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎分59秒');
});

test('59/1分（境界値）→ 毎時59分', function() {
  var result = QuartzCronJP.translate('0 59/1 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時59分');
});

test('23/1時（境界値）→ 午後11時', function() {
  var result = QuartzCronJP.translate('0 0 23/1 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午後11時0分');
});

// ============================================================
// 構文バリデーション強化
// ============================================================

console.log('');
console.log('── 構文バリデーション強化 ───────────────────────────────────');

test('連続**でエラー', function() {
  var result = QuartzCronJP.validate('0 0 ** * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('連続した「*」') >= 0);
});

test('連続//でエラー', function() {
  var result = QuartzCronJP.validate('0 //15 * * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('連続した「/」') >= 0);
});

test('先頭カンマでエラー', function() {
  var result = QuartzCronJP.validate(',0 0 9 * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('先頭に不正なカンマ') >= 0);
});

test('末尾カンマでエラー', function() {
  var result = QuartzCronJP.validate('0, 0 9 * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('末尾に不正なカンマ') >= 0);
});

test('連続--でエラー', function() {
  var result = QuartzCronJP.validate('0 0 9--17 * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('連続した「-」') >= 0);
});

test('先頭/でエラー', function() {
  var result = QuartzCronJP.validate('/15 0 * * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('開始値がありません') >= 0);
});

test('末尾/でエラー', function() {
  var result = QuartzCronJP.validate('0 15/ * * * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('間隔値がありません') >= 0);
});

// ============================================================
// カレンダーロジック検証
// ============================================================

console.log('');
console.log('── カレンダーロジック検証 ───────────────────────────────────');

test('2月31日でエラー', function() {
  var result = QuartzCronJP.validate('0 0 9 31 2 ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('2月31日は存在しません') >= 0);
});

test('2月30日でエラー', function() {
  var result = QuartzCronJP.validate('0 0 9 30 2 ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('2月30日は存在しません') >= 0);
});

test('4月31日でエラー', function() {
  var result = QuartzCronJP.validate('0 0 9 31 4 ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('4月31日は存在しません') >= 0);
});

test('2月29日はOK（閏年考慮）', function() {
  var result = QuartzCronJP.validate('0 0 9 29 2 ?');
  assertTrue(result.isValid);
});

test('L-31でエラー（オフセット最大30）', function() {
  var result = QuartzCronJP.validate('0 0 9 L-31 * ?');
  assertFalse(result.isValid);
  assertTrue(result.errors[0].indexOf('オフセットが大きすぎます') >= 0);
});

test('L-30はOK', function() {
  var result = QuartzCronJP.validate('0 0 9 L-30 * ?');
  assertTrue(result.isValid);
});

// ============================================================
// 小文字対応
// ============================================================

console.log('');
console.log('── 小文字対応 ───────────────────────────────────────────────');

test('小文字lw', function() {
  var result = QuartzCronJP.translate('0 0 9 lw * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月末日に最も近い平日 午前9時');
});

test('小文字曜日（sun-sat）', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * sun-sat');
  assertTrue(result.success);
  assertEquals(result.description, '毎週月〜日曜日 午前9時');
});

test('小文字月（jan-dec）', function() {
  var result = QuartzCronJP.translate('0 0 9 1 jan-dec ?');
  assertTrue(result.success);
});

// ============================================================
// 重複値・リスト処理
// ============================================================

console.log('');
console.log('── 重複値・リスト処理 ──────────────────────────────────────');

test('重複値の除去（9,9,9→9）', function() {
  var result = QuartzCronJP.translate('0 0 9,9,9 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9時');
});

test('秒リスト＋時分リスト', function() {
  var result = QuartzCronJP.translate('10,20 15,45 9,17 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前9・午後5時の15・45分10・20秒');
});

// ============================================================
// 月・曜日インターバルの単位
// ============================================================

console.log('');
console.log('── 月・曜日インターバルの単位 ──────────────────────────────');

test('月インターバル（1/3）→ ヶ月間隔', function() {
  var result = QuartzCronJP.translate('0 0 9 1 1/3 ?');
  assertTrue(result.success);
  assertTrue(result.description.indexOf('ヶ月間隔') >= 0);
});

test('曜日インターバル（2/2）→ 日間隔', function() {
  var result = QuartzCronJP.translate('0 0 9 ? * 2/2');
  assertTrue(result.success);
  assertTrue(result.description.indexOf('日間隔') >= 0);
});

// ============================================================
// 年フィールドのステップ値
// ============================================================

console.log('');
console.log('── 年フィールドのステップ値 ────────────────────────────────');

test('年ステップ（2025/2）', function() {
  var result = QuartzCronJP.translate('0 0 9 1 1 ? 2025/2');
  assertTrue(result.success);
});

test('年範囲＋ステップ（2025-2035/3）', function() {
  var result = QuartzCronJP.translate('0 0 9 1 1 ? 2025-2035/3');
  assertTrue(result.success);
});

// ============================================================
// 結果
// ============================================================

console.log('');
console.log('═'.repeat(74));
console.log('結果: ' + passed + ' passed / ' + failed + ' failed');

if (failed > 0) {
  console.log('');
  process.exit(1);
} else {
  console.log('🎉 All tests passed!');
  console.log('');
}
