/**
 * Quartz Cron 日本語翻訳ライブラリ - TypeScript型定義
 */

declare module 'quartz-cron-jp' {
  export interface ParsedField {
    type: 'all' | 'any' | 'last' | 'lastWeekday' | 'nearestWeekday' | 'nthWeekday' | 'interval' | 'range' | 'list' | 'single';
    value?: string;
    day?: string;
    nth?: string;
    start?: string;
    interval?: string;
    from?: string;
    to?: string;
    items?: Array<{ type: string; value?: string; from?: string; to?: string }>;
  }

  export interface TranslatedField {
    text: string;
    isAll?: boolean;
    isAny?: boolean;
    isLast?: boolean;
    isInterval?: boolean;
    isEverySecond?: boolean;
    isEveryMinute?: boolean;
    isEveryHour?: boolean;
    startValue?: string;
  }

  export interface FieldInfo {
    raw: string;
    parsed: ParsedField;
    translated: string;
  }

  export interface TranslateSuccessResult {
    success: true;
    description: string;
    fields: {
      second: FieldInfo;
      minute: FieldInfo;
      hour: FieldInfo;
      dayOfMonth: FieldInfo;
      month: FieldInfo;
      dayOfWeek: FieldInfo;
      year: FieldInfo | null;
    };
  }

  export interface TranslateErrorResult {
    success: false;
    error: string;
    validationErrors: string[];
  }

  export type TranslateResult = TranslateSuccessResult | TranslateErrorResult;

  export interface TranslateOptions {
    /** バリデーションをスキップする */
    skipValidation?: boolean;
  }

  export interface ValidationResult {
    /** バリデーションが成功したかどうか */
    isValid: boolean;
    /** エラーメッセージの配列 */
    errors: string[];
    /** 警告メッセージの配列 */
    warnings: string[];
  }

  export type FieldType = 'second' | 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'year';

  export interface QuartzCronJP {
    /** ライブラリバージョン */
    readonly version: string;

    /**
     * Quartz Cron式を日本語に翻訳
     * @param cronExpression Quartz Cron式
     * @param options オプション
     * @returns 翻訳結果
     */
    translate(cronExpression: string, options?: TranslateOptions): TranslateResult;

    /**
     * Quartz Cron式のバリデーション
     * @param cronExpression Quartz Cron式
     * @returns バリデーション結果
     */
    validate(cronExpression: string): ValidationResult;

    /**
     * フィールド値を解析（上級者向け）
     * @param value フィールド値
     * @param fieldType フィールドタイプ
     * @returns 解析結果
     */
    parseField(value: string, fieldType: FieldType): ParsedField;

    /**
     * 解析結果を日本語に変換（上級者向け）
     * @param parsed parseFieldの結果
     * @param fieldType フィールドタイプ
     * @returns 翻訳結果
     */
    translateField(parsed: ParsedField, fieldType: FieldType): TranslatedField;
  }

  const quartzCronJP: QuartzCronJP;
  export default quartzCronJP;
}
