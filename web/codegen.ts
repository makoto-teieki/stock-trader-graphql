
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:8080/query",
  documents: "src/**/*.ts*",
  generates: {
    "src/generated/graphql.tsx": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
