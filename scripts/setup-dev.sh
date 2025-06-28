#!/bin/bash

# ゴルフスコア管理システム - 開発環境セットアップスクリプト

set -e  # エラー時に停止

echo "🏌️ ゴルフスコア管理システム 開発環境セットアップ"
echo "================================================="

# 色付きログ関数
log_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# Node.js バージョンチェック
check_node_version() {
    log_info "Node.js バージョンをチェック中..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js がインストールされていません"
        log_info "Node.js 18以上をインストールしてください: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        log_error "Node.js 18以上が必要です (現在: v$NODE_VERSION)"
        exit 1
    fi
    
    log_info "✅ Node.js v$NODE_VERSION"
}

# Firebase CLI チェック
check_firebase_cli() {
    log_info "Firebase CLI をチェック中..."
    
    if ! command -v firebase &> /dev/null; then
        log_warn "Firebase CLI がインストールされていません"
        log_info "Firebase CLI をインストール中..."
        npm install -g firebase-tools
    fi
    
    FIREBASE_VERSION=$(firebase --version)
    log_info "✅ Firebase CLI $FIREBASE_VERSION"
}

# 依存関係インストール
install_dependencies() {
    log_info "依存関係をインストール中..."
    
    if [ ! -d "node_modules" ]; then
        npm install
    else
        log_info "node_modules が存在します。npm ci を実行..."
        npm ci
    fi
    
    log_info "✅ 依存関係インストール完了"
}

# 環境設定ファイルチェック
setup_env_files() {
    log_info "環境設定ファイルをチェック中..."
    
    # .env.local が存在するかチェック
    if [ ! -f ".env.local" ]; then
        log_warn ".env.local が見つかりません"
        log_info "デフォルトの .env.local を作成しています..."
        
        cat > .env.local << 'EOF'
# ローカル開発環境設定（Firebase Emulator使用）
VITE_FIREBASE_USE_EMULATOR=true
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:demo
VITE_ENVIRONMENT=local

# エミュレーター設定
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# 開発用設定
VITE_APP_DEBUG=true
VITE_APP_LOG_LEVEL=debug
EOF
    fi
    
    log_info "✅ 環境設定ファイル準備完了"
}

# Firebase エミュレーター初期化チェック
check_firebase_config() {
    log_info "Firebase 設定をチェック中..."
    
    if [ ! -f "firebase.json" ]; then
        log_warn "firebase.json が見つかりません"
        log_info "Firebase を初期化してください: firebase init"
        return 1
    fi
    
    if [ ! -f "firestore.rules" ]; then
        log_warn "firestore.rules が見つかりません"
        log_info "デフォルトの Firestore ルールを作成しています..."
        
        cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発用：全てのドキュメントにアクセス許可
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF
    fi
    
    if [ ! -f "storage.rules" ]; then
        log_info "デフォルトの Storage ルールを作成しています..."
        
        cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
EOF
    fi
    
    log_info "✅ Firebase 設定完了"
}

# ポート使用状況チェック
check_ports() {
    log_info "ポート使用状況をチェック中..."
    
    PORTS=(3000 4000 5000 5001 8080 9099 9199)
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warn "ポート $port が使用中です"
            log_info "使用中のプロセス:"
            lsof -Pi :$port -sTCP:LISTEN
        fi
    done
}

# エミュレーターデータディレクトリ作成
setup_emulator_data() {
    log_info "エミュレーターデータディレクトリを準備中..."
    
    if [ ! -d "firebase-data" ]; then
        mkdir -p firebase-data
        log_info "✅ firebase-data ディレクトリを作成しました"
    fi
    
    if [ ! -d "firebase-data-backup" ]; then
        mkdir -p firebase-data-backup
        log_info "✅ firebase-data-backup ディレクトリを作成しました"
    fi
}

# 開発用スクリプト情報表示
show_dev_commands() {
    log_info "🚀 開発環境の準備が完了しました！"
    echo ""
    echo "📋 利用可能なコマンド:"
    echo "  npm run dev              # 開発サーバー起動（Vite）"
    echo "  npm run emulators        # Firebase エミュレーター起動"
    echo "  npm run seed:emulator    # サンプルデータ投入"
    echo "  npm run build            # プロダクションビルド"
    echo "  npm run test             # テスト実行"
    echo "  npm run lint             # ESLint実行"
    echo "  npm run typecheck        # TypeScript チェック"
    echo ""
    echo "🔧 エミュレーター:"
    echo "  Firestore:    http://localhost:8080"
    echo "  Auth:         http://localhost:9099"
    echo "  Functions:    http://localhost:5001"
    echo "  Storage:      http://localhost:9199"
    echo "  UI:           http://localhost:4000"
    echo ""
    echo "🌐 アプリケーション:"
    echo "  開発サーバー:  http://localhost:3000"
    echo ""
    echo "📖 開始手順:"
    echo "  1. ターミナル1: npm run emulators"
    echo "  2. ターミナル2: npm run dev"
    echo "  3. ブラウザで http://localhost:3000 にアクセス"
}

# メイン実行
main() {
    check_node_version
    check_firebase_cli
    install_dependencies
    setup_env_files
    check_firebase_config
    setup_emulator_data
    check_ports
    show_dev_commands
}

# スクリプト実行
main "$@"