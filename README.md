# ものぽりぃ (Monopolii)

7×7マスの盤面でサイコロを振り、土地の契約・ランクアップ・多彩なイベントカードで目標金額を目指す本格すごろくボードゲームです。

- **最大5人対戦**（人間・CPUを自由に組み合わせ可能）
- **🌐 オンライン対戦機能**（WebRTC / PeerJSによる完全サーバーレス通信。部屋コードまたは招待URLを友達に送るだけで、離れた友達とリアルタイム対戦可能！）
- **完全画面フィット**（スマホ・PCの全画面でスクロール不要のコンパクトUI）

---

## 🛠️ ローカルでの起動方法

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (http://localhost:3000)
npm run dev

# 本番用ビルド確認
npm run build
```

---

## 🚀 GitHub と Render へのデプロイ手順

このアプリは **React + Vite** の静的Webアプリ（SPA）なので、Render の **「Static Site（静的サイト）」** を使うことで、**完全無料・サーバーのスリープ（コールドスタート）なし・自動HTTPS付き** で全世界に公開できます！

### STEP 1: GitHub にリポジトリを作成してプッシュする

1. [GitHub](https://github.com) にログインし、右上の「＋」→ **「New repository」** をクリック。
2. リポジトリ名（例: `monopolii`）を入力し、**Public** または **Private** を選んで「Create repository」をクリック。
3. お使いのPCのターミナル（プロジェクトのフォルダ）で以下を実行：

```bash
# Gitの初期化 (まだの場合)
git init

# ファイルを追加してコミット
git add .
git commit -m "Initial commit: Monopolii game"

# mainブランチに設定
git branch -M main

# リモートURLの登録 (your-username と monopolii はご自身のものに置き換えてください)
git remote add origin https://github.com/<your-username>/monopolii.git

# GitHubへプッシュ
git push -u origin main
```

---

### STEP 2: Render (render.com) で公開する

1. [Render.com](https://render.com) にアクセスしてログイン（GitHubアカウントでログインすると連携がスムーズです）。
2. ダッシュボード右上の **「New +」** ボタンを押し、**「Static Site」** を選択。
3. 先ほどプッシュした GitHub リポジトリ（`monopolii`）を選択して「Connect」。
4. 設定項目を以下のように入力します：
   - **Name**: `monopolii`（お好みのサイト名）
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. 一番下の **「Create Static Site」** をクリック！

数分でビルドが完了し、`https://monopolii-xxxx.onrender.com` のような公開URLが発行されます。以降は GitHub に `git push` するだけで自動デプロイされます！
