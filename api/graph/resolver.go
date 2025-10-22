package graph

import ()

// Resolver の定義に依存関係（DBとAPIクライアント）を追加
type Resolver struct {
	DB          *gorm.DB                // DB接続インスタンス
	Repos       *repository.Repository  // リポジトリの集合体
	TradeClient tradeclient.TradeClient // 外部APIクライアント
	// Subscriptionのためのマップやチャネルなどもここに追加
	PriceChannels map[string]chan *model.Stock // リアルタイムデータ配信
}

// Resolver の初期化関数（main関数から呼び出す）
func NewResolver(db *gorm.DB, tradeClient tradeclient.TradeClient) *Resolver {
	return &Resolver{
		DB:            db,
		Repos:         repository.NewRepository(db),
		TradeClient:   tradeClient,
		PriceChannels: make(map[string]chan *model.Stock),
	}
}
