#!/bin/bash

# Firebase エミュレータ起動スクリプト

echo "🔥 Firebase エミュレータを起動中..."
echo "このスクリプトは以下を実行します:"
echo "  - Firebase エミュレータ起動"
echo "  - テストデータの投入"
echo "  - Web UIの起動"
echo ""

# エミュレータ起動
echo "📡 エミュレータを起動しています..."
firebase emulators:start --only auth,firestore,functions,hosting,storage &

# エミュレータの起動を待つ
echo "⏳ エミュレータの起動を待っています..."
sleep 15

# テストデータの投入
echo "🌱 テストデータを投入中..."
node scripts/seed-data.js

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "🌐 アクセス可能なURL:"
echo "  - Firebase UI: http://localhost:4000"
echo "  - アプリケーション: http://localhost:5000"
echo "  - Firestore: http://localhost:4000/firestore"
echo "  - Authentication: http://localhost:4000/auth"
echo ""
echo "📝 テスト用ログイン情報:"
echo "  Email: test@example.com"
echo "  Password: test123456"
echo ""
echo "🛑 終了するには Ctrl+C を押してください"

# バックグラウンドプロセスを待つ
wait
