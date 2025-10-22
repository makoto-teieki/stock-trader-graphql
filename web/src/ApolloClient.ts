import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

// 環境変数からエンドポイントを取得
const httpUri =
  process.env.REACT_APP_GRAPHQL_URI || "http://localhost:8080/query";
// WebSocket URIは http -> ws, https -> wss に変更
const wsUri = httpUri.replace("http", "ws");

// 1. HTTP Link (Query & Mutation用)
const httpLink = new HttpLink({
  uri: httpUri,
});

// 2. WebSocket Link (Subscription用)
const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true, // 接続が切れたら再接続
    // 認証トークンをWebSocket接続時に送る設定
    connectionParams: () => ({
      authToken: localStorage.getItem("jwtToken") || "",
    }),
  },
});

// 3. スプリット処理: オペレーションの種類によって使用するLinkを分ける
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink, // SubscriptionならWebSocket
  httpLink // その他 (Query/Mutation) ならHTTP
);

export const client = new ApolloClient({
  link: splitLink, // 分割したLinkを適用
  cache: new InMemoryCache(),
});

// src/index.tsx でこの client を使用して ApolloProvider を設定します。
