# ゴルフスコア管理Webシステム 概要仕様書

## 1. システム概要
ユーザが自身のゴルフラウンドのスコア記録・履歴管理を行い、期間指定で平均スコアを算出できるWebアプリケーション

## 2. 主な機能
1. **ユーザ管理**
   - 会員登録／ログイン／ログアウト（Firebase Authentication）
   - プロフィール編集（名前、メールアドレス、ハンディキャップなど）
2. **スコア入力**
   - 新規ラウンドの追加（プレイ日、ゴルフ場、スタートコース、参加者、各ホールのスコア）
   - 参加者リストから同伴者を選択（未登録の場合はゲスト登録）
3. **スコア履歴表示**
   - ラウンド一覧（年月日順ソート、絞り込み：ゴルフ場／期間など）
   - ラウンド詳細（ホールごとのスコア、同伴者一覧）
4. **統計・分析**
   - 期間指定による平均スコア（総平均、直近 N ラウンドの平均）
   - コース別平均スコア
   - ハンディキャップ推移グラフ（任意実装）
5. **同伴者情報**
   - 同伴者がシステム登録済みの場合：プロフィールへのリンク
   - 未登録時：ゲスト表示
6. **管理機能（オプション）**
   - ゴルフ場マスタ管理（Firestoreコレクション）  
   - 管理者によるユーザ／ラウンドの監査・削除

## 3. ユーザストーリー例
|No.|ユーザ|機能|価値|
|---|---|---|---|
|1|一般ユーザ|スコアを入力できる|ラウンド結果を記録できる|
|2|一般ユーザ|過去スコアを一覧で確認できる|自分のプレイ履歴を振り返れる|
|3|一般ユーザ|期間を指定して平均スコアを確認できる|成績向上の傾向を把握できる|
|4|一般ユーザ|同伴者のプロフィールにアクセスできる|プレイ仲間の情報を共有できる|
|5|管理者|ゴルフ場マスタを編集できる|データの整合性を保てる|

## 4. データモデル（Firestore コレクション設計）
- **users**  
  - Fields: name, email, handicap, createdAt, updatedAt  
- **courses**  
  - Fields: name, address, teeName, holesCount, parTotal, createdAt  
- **rounds**  
  - Fields: userId, courseId, playDate, startTime, participants (array of userIds or guest objects), scores (array of {holeNumber, strokes}), createdAt  
- **stats**（集計用キャッシュ、任意）  
  - Fields: userId, periodType, averageScore, updatedAt  

## 5. API（Cloud Functions／Firebase Functions）エンドポイント例
|機能|HTTP メソッド|エンドポイント|説明|
|---|---|---|---|
|ユーザ登録|POST|/api/register|新規ユーザ作成（Client SDK 併用）|
|ログイン|POST|/api/login|JWT 取得（Firebase Auth 統合）|
|ラウンド追加|POST|/api/rounds|スコア記録（Firestore 書き込み）|
|ラウンド一覧|GET|/api/rounds?from=&to=&courseId=|履歴取得（Firestore クエリ）|
|統計取得|GET|/api/rounds/stats?period=last5|平均スコア等（Cloud Function 経由）|
|同伴者追加|POST|/api/rounds/{id}/participants|同伴者登録（Firestore 更新）|

## 6. UI（画面構成イメージ）
1. **ダッシュボード**  
   - 直近ラウンドサマリ、平均スコア、グラフ  
2. **ラウンド入力画面**  
   - 日付ピッカー、ゴルフ場選択、同伴者選択、ホールごとのスコア入力フォーム  
3. **履歴一覧画面**  
   - テーブル表示、期間／コース／同伴者でフィルタ  
4. **ラウンド詳細画面**  
   - 各ホールスコア、同伴者一覧へのリンク  
5. **プロフィール画面**  
   - ユーザ情報編集、ハンディキャップ参照  

## 7. 技術スタック
- フロントエンド：React (TypeScript) + Material UI  
- バックエンド：Node.js (Express or Firebase Functions)  
- データベース：Google Firestore  
- 認証：Firebase Authentication (Email/Password, OAuth)  
- デプロイ：Firebase Hosting + Firebase Functions  

## 8. 今後の拡張アイデア
- コース難易度係数（Slope／Rating）によるスコア補正  
- モバイルアプリ連携（React Native, Expo）  
- SNSシェア機能（自動投稿）  
- チーム／グループ機能（複数ユーザでのラウンド管理）  
