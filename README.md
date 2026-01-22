# QuartzCronJP

Quartz Cron式を日本語に翻訳するJavaScriptライブラリ

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 特徴

- 🇯🇵 自然な日本語翻訳
- ✅ 詳細なバリデーション機能
- 📦 依存関係なし（Vanilla JS）
- 🌐 ブラウザ/Node.js両対応（UMD形式）
- 🔧 Quartz特有の記号（L, W, #）に対応

## インストール

### ブラウザ

```html
<script src="quartz-cron-jp.js"></script>
```

### Node.js

```bash
npm install quartz-cron-jp
```

```javascript
const QuartzCronJP = require('quartz-cron-jp');
```

### ES Modules

```javascript
import QuartzCronJP from 'quartz-cron-jp';
```

## 基本的な使い方

```javascript
// 翻訳
var result = QuartzCronJP.translate('0 30 9 ? * MON-FRI');

if (result.success) {
  console.log(result.description);
  // → "毎週平日（月〜金） 9時30分"
} else {
  console.error(result.error);
}
```

## API

### `QuartzCronJP.translate(cronExpression, [options])`

Cron式を日本語に翻訳します。

#### パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `cronExpression` | string | Quartz Cron式 |
| `options.skipValidation` | boolean | バリデーションをスキップ（デフォルト: false） |

#### 戻り値

成功時:
```javascript
{
  success: true,
  description: "毎週平日（月〜金） 9時30分",
  fields: {
    second: { raw: "0", parsed: {...}, translated: "0秒" },
    minute: { raw: "30", parsed: {...}, translated: "30分" },
    hour: { raw: "9", parsed: {...}, translated: "9時" },
    dayOfMonth: { raw: "?", parsed: {...}, translated: "" },
    month: { raw: "*", parsed: {...}, translated: "毎月" },
    dayOfWeek: { raw: "MON-FRI", parsed: {...}, translated: "平日（月〜金）" },
    year: null
  }
}
```

エラー時:
```javascript
{
  success: false,
  error: "日と曜日のどちらかは必ず「?」にしてください",
  validationErrors: [
    "日と曜日のどちらかは必ず「?」にしてください"
  ]
}
```

### `QuartzCronJP.validate(cronExpression)`

Cron式のバリデーションのみを実行します。

```javascript
var validation = QuartzCronJP.validate('0 0 25 * * ?');

console.log(validation.isValid);  // false
console.log(validation.errors);   // ["時の値「25」は範囲外です（0〜23）"]
```

#### 戻り値

```javascript
{
  isValid: boolean,
  errors: string[],
  warnings: string[]
}
```

### `QuartzCronJP.parseField(value, fieldType)`

個別フィールドを解析します（上級者向け）。

```javascript
var parsed = QuartzCronJP.parseField('MON-FRI', 'dayOfWeek');
// → { type: 'range', from: 'MON', to: 'FRI' }
```

### `QuartzCronJP.translateField(parsed, fieldType)`

解析結果を日本語に変換します（上級者向け）。

```javascript
var translated = QuartzCronJP.translateField(
  { type: 'range', from: 'MON', to: 'FRI' },
  'dayOfWeek'
);
// → { text: '平日（月〜金）' }
```

## 翻訳例

### 基本パターン

| Cron式 | 日本語 | 説明 |
|--------|--------|------|
| `0 0 12 * * ?` | 毎日12時00分 | 毎日正午 |
| `0 30 9 ? * MON-FRI` | 毎週平日（月〜金） 9時30分 | 平日の朝 |
| `0 0 0 1 * ?` | 毎月1日 0時00分 | 月初め |
| `0 0 0 1 1 ? 2025` | 2025年1月1日 0時00分 | 特定日時 |

### 間隔指定

| Cron式 | 日本語 | 説明 |
|--------|--------|------|
| `0 0/15 * * * ?` | 毎時0分起点で15分間隔 | 毎時0,15,30,45分 |
| `0 5/15 * * * ?` | 毎時5分起点で15分間隔 | 毎時5,20,35,50分 |
| `0 0/30 9-17 ? * MON-FRI` | 平日9〜17時の間、毎時0分起点で30分間隔 | 業務時間中30分間隔 |
| `0/10 * * * * ?` | 0秒起点で10秒間隔 | 10秒間隔 |
| `0 0 0/2 * * ?` | 毎日0時00分起点で2時間間隔 | 0:00, 2:00, 4:00... |
| `0 30 0/2 * * ?` | 毎日0時30分起点で2時間間隔 | 0:30, 2:30, 4:30... |

### 複数値・範囲指定

| Cron式 | 日本語 | 説明 |
|--------|--------|------|
| `0 30 8,12,18 * * ?` | 毎日8・12・18時30分 | 複数時刻 |
| `0 0 9-17 ? * MON-FRI` | 毎週平日（月〜金） 9時〜17時の間、毎時00分 | 業務時間毎時 |
| `0 0 9 1,15 * ?` | 毎月1、15日 9時00分 | 月2回 |

### 特殊記号（L, W, #）

| Cron式 | 日本語 | 説明 |
|--------|--------|------|
| `0 0 18 L * ?` | 毎月末日 18時00分 | 月末処理 |
| `0 0 9 15W * ?` | 毎月15日に最も近い平日 9時00分 | 15日が休日なら前後の平日 |
| `0 0 10 ? * MON#1` | 毎月第1月曜日 10時00分 | 第1月曜 |
| `0 0 10 ? * FRI#3` | 毎月第3金曜日 10時00分 | 第3金曜 |
| `0 30 9 ? * 1L` | 毎月最終日曜日 9時30分 | 月末の日曜 |

## バリデーション

以下のチェックを行います：

| チェック項目 | エラーメッセージ例 |
|-------------|------------------|
| フィールド数（6-7） | Quartz Cronは6〜7フィールド必要です |
| 日と曜日の?指定 | 日と曜日のどちらかは必ず「?」にしてください |
| 日と曜日の両方が? | 日と曜日の両方を「?」にすることはできません |
| 値の範囲 | 時の値「25」は範囲外です（0〜23） |
| ステップ値 | 秒のステップ値「0」は無効です（1以上を指定してください） |
| 範囲の方向 | 日の範囲「10-1」が不正です（開始値が終了値より大きい） |
| 構文エラー | 日に連続したカンマがあります |
| 特殊記号の位置 | 「L」は日または曜日フィールドでのみ使用できます |
| #の週番号 | 「#」の週番号「6」は範囲外です（1〜5） |
| 曜日名の妥当性 | 曜日「ABC」は無効です |
| 月名の妥当性 | 月「XYZ」は無効です |
| 年フォーマット | 年の値「ABC」は無効です（数値を指定してください） |

## Quartz Cron形式

```
秒 分 時 日 月 曜日 [年]
```

### フィールドの範囲

| フィールド | 範囲 | 特殊文字 |
|-----------|------|----------|
| 秒 | 0-59 | , - * / |
| 分 | 0-59 | , - * / |
| 時 | 0-23 | , - * / |
| 日 | 1-31 | , - * / ? L W |
| 月 | 1-12 または JAN-DEC | , - * / |
| 曜日 | 1-7 または SUN-SAT | , - * / ? L # |
| 年 | 1970-2099 | , - * / |

### 特殊文字

| 文字 | 説明 | 使用可能フィールド |
|------|------|------------------|
| `*` | すべての値 | すべて |
| `?` | 値を指定しない | 日、曜日 |
| `-` | 範囲 | すべて |
| `,` | 複数の値 | すべて |
| `/` | 間隔 | すべて |
| `L` | 最終 | 日、曜日 |
| `W` | 最も近い平日 | 日 |
| `#` | 第n曜日 | 曜日 |

## ライセンス

MIT License

## 作者

Ryohei Takada (with Claude)