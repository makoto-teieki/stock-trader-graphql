# --- ステージ 1: ビルドステージ ---
FROM golang:1.21-alpine AS builder

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のコピーとダウンロード
COPY go.mod go.sum ./
RUN go mod download

# ソースコードのコピー
COPY . .

# アプリケーションのビルド
# CGO_ENABLED=0: 静的リンクでビルドし、実行環境のCライブラリに依存しないようにする
# -ldflags -s -w: バイナリサイズを削減
RUN CGO_ENABLED=0 go build -ldflags "-s -w" -o /go-server ./server.go


# --- ステージ 2: 最終実行ステージ ---
# 軽量なスクラッチイメージを使用し、セキュリティとサイズを最適化
FROM scratch

# タイムゾーンデータの追加 (Goのtime.Time処理のため)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
ENV TZ Asia/Tokyo

# ビルドしたバイナリをコピー
COPY --from=builder /go-server /go-server

# 環境変数をコピー (実行時に必要なもののみ)
# Cloud Runで環境変数を設定する場合は不要だが、コンテナ内に含める場合
# COPY .env ./.env 

# ポートは環境変数 PORT から取得するのがサーバーレスの慣習
EXPOSE 8080 

# コンテナ起動時に実行されるコマンド
CMD ["/go-server"]