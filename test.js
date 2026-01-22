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
// 翻訳テスト
// ============================================================

console.log('── 翻訳テスト ────────────────────────────────────────────────');

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

test('15分ごと', function() {
  var result = QuartzCronJP.translate('0 0/15 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時0分起点で15分間隔');
});

test('10分から20分間隔', function() {
  var result = QuartzCronJP.translate('0 10/20 * * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎時10分起点で20分間隔');
});

test('毎月第1月曜', function() {
  var result = QuartzCronJP.translate('0 0 10 ? * 2#1');
  assertTrue(result.success);
  assertEquals(result.description, '毎月第1月曜日 午前10時');
});

test('毎月最終日曜', function() {
  var result = QuartzCronJP.translate('0 30 9 ? * 1L');
  assertTrue(result.success);
  assertEquals(result.description, '毎月最終日曜日 午前9時30分');
});

test('毎月末', function() {
  var result = QuartzCronJP.translate('0 0 18 L * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月末日 午後6時');
});

test('15日最寄り平日', function() {
  var result = QuartzCronJP.translate('0 0 9 15W * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎月15日に最も近い平日 午前9時');
});

test('時間リスト', function() {
  var result = QuartzCronJP.translate('0 30 8,12,18 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前8・午後12・午後6時30分');
});

test('年指定', function() {
  var result = QuartzCronJP.translate('0 0 0 1 1 ? 2025');
  assertTrue(result.success);
  assertEquals(result.description, '2025年1月1日 午前0時');
});

test('秒間隔+時刻', function() {
  var result = QuartzCronJP.translate('0/1 0 2 * * ?');
  assertTrue(result.success);
  assertEquals(result.description, '毎日午前2時0分に毎秒');
});

// ============================================================
// バリデーションテスト
// ============================================================

console.log('');
console.log('── バリデーションテスト ─────────────────────────────────────────');

test('日と曜日の同時指定でエラー', function() {
  var result = QuartzCronJP.translate('0 0 12 15 * MON');
  assertFalse(result.success);
  assertTrue(result.validationErrors.length > 0);
});

test('両方?でエラー', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * ?');
  assertFalse(result.success);
});

test('時の範囲外でエラー', function() {
  var result = QuartzCronJP.translate('0 0 25 * * ?');
  assertFalse(result.success);
  assertTrue(result.validationErrors[0].indexOf('25') !== -1);
});

test('無効な曜日名でエラー', function() {
  var result = QuartzCronJP.translate('0 0 12 ? * ABC');
  assertFalse(result.success);
});

test('validate関数', function() {
  var result = QuartzCronJP.validate('0 0 12 * * ?');
  assertTrue(result.isValid);
  assertEquals(result.errors.length, 0);
});

test('validate関数（エラーあり）', function() {
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
