# 📈 お勉強: Golang GraphQL サーバーレス株取引デモアプリ

このプロジェクトは、Golang (Gin, gqlgen) を用いた高性能なバックエンド API と、React/TypeScript による型安全なフロントエンドを組み合わせた、**サーバーレス構成のデモ株取引アプリケーション**です。

<br>

## 🚀 システムの概要とアーキテクチャ

[Image of System architecture diagram]

このアプリケーションは、フロントエンドとバックエンドを完全に分離したマイクロサービス的な構成を採用しています。

| 要素                    | 技術                               | 役割と構成                                                                                       |
| :---------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------- |
| **フロントエンド (FE)** | React / TypeScript / Apollo Client | UI 構築、型安全なデータフェッチング、WebSocket によるリアルタイム通信。                          |
| **バックエンド (BE)**   | Golang (Gin, gqlgen)               | 認証、DB 操作、外部 API 連携、GraphQL スキーマの処理、**並行処理によるリアルタイムデータ配信**。 |
| **データベース**        | Neon (PostgreSQL)                  | ユーザー、口座残高、注文/約定履歴の永続化。注文処理に**トランザクション**を使用。                |
| **外部連携 API**        | 立花証券 e 支店 API (デモ環境)     | 実際の株価データ取得および注文処理の**シミュレーション**。                                       |
| **FE デプロイ**         | **Vercel / Netlify**               | 静的ファイルのホスティングと高速な CDN 配信。                                                    |
| **BE デプロイ**         | **Google Cloud Run**               | Golang コンテナの実行環境。トラフィックに応じたスケーリング。                                    |

---

## ⚙️ 開発環境のセットアップ

### 1\. クローン

```bash
git clone git@github.com:makoto-teieki/stock-trader-graphql.git
cd stock-trader-graphql
```

### 2\. バックエンド (API) セットアップ

**（`api` ディレクトリ内）**

1.  **依存関係のインストール**

    ```bash
    go mod tidy
    ```

2.  **環境変数ファイル (`.env`) の作成**

    Neon DB 接続情報、JWT シークレット、立花証券デモ API のクレデンシャルを設定します。

    ```bash
    touch .env
    # ※内容は機密情報のため、GitHubにはプッシュしていません。
    ```

3.  **ローカルでの実行**

    ```bash
    go run server.go
    # http://localhost:8080 で GraphQL サーバーが起動
    ```

### 3\. フロントエンド (Web) セットアップ

**（`web` ディレクトリ内）**

1.  **依存関係のインストール**

    ```bash
    npm install
    ```

2.  **GraphQL 型定義の自動生成**

    ローカルでバックエンドサーバーを起動した後、以下のコマンドで TypeScript のカスタム Hook を生成します。

    ```bash
    npx graphql-codegen
    ```

3.  **ローカルでの実行**

    ```bash
    npm start
    # 通常 http://localhost:3000 でクライアントが起動
    ```

---

## ☁️ デプロイ手順

### 1\. データベース設定

- Neon (PostgreSQL) にテーブルスキーマを適用（マイグレーション）。

### 2\. Google Cloud Run (バックエンド)

1.  **Docker イメージのビルドとプッシュ**

    ```bash
    cd api
    # gcloud auth login, gcloud config set project [PROJECT_ID] を実行
    docker build -t gcr.io/[PROJECT_ID]/stock-trader-api .
    docker push gcr.io/[PROJECT_ID]/stock-trader-api
    ```

2.  **Cloud Run デプロイ**

    **コスト効率を最優先した設定**でデプロイします。

    ```bash
    gcloud run deploy stock-trader-api \
        --image gcr.io/[PROJECT_ID]/stock-trader-api \
        --platform managed \
        --min-instances 0 \
        --max-instances 1 \
        --cpu-throttling \
        --set-env-vars-from-file=.env \
        --allow-unauthenticated
    ```

### 3\. Vercel/Netlify (フロントエンド)

1.  Cloud Run の公開 URL (`https://[...].run.app`) を取得。
2.  Vercel または Netlify のダッシュボードで、リポジトリ (`stock-trader-graphql/web`) を連携。
3.  環境変数 `REACT_APP_GRAPHQL_URI` および `REACT_APP_WEBSOCKET_URI` に、Cloud Run の URL を設定。
4.  デプロイを実行。

---

## 📝 スキーマ抜粋

### リアルタイム株価購読 (Subscription)

```graphql
# 接続中のクライアントにリアルタイムで株価更新をブロードキャスト
type Subscription {
  stockPriceUpdate(code: String!): Stock!
}
```

### 注文実行 (Mutation)

```graphql
# トランザクション処理を伴う注文処理
type Mutation {
  placeOrder(
    code: String!
    quantity: Int!
    price: Float
    orderType: String!
  ): Order!
}
```
