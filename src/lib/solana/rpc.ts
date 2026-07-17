import { Connection, clusterApiUrl, type Cluster } from "@solana/web3.js";
import { projectConfig } from "@/lib/config/project";

export type RpcProvider = {
  getConnection: () => Connection;
  getNetwork: () => string;
};

function resolveRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL;
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  }
  if (process.env.HELIUS_API_KEY) {
    const network = projectConfig.SOLANA_NETWORK;
    return `https://${network}.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  }
  const network = projectConfig.SOLANA_NETWORK as Cluster;
  return clusterApiUrl(network);
}

let connection: Connection | null = null;

export const defaultRpcProvider: RpcProvider = {
  getConnection() {
    if (!connection) {
      connection = new Connection(resolveRpcUrl(), "confirmed");
    }
    return connection;
  },
  getNetwork() {
    return projectConfig.SOLANA_NETWORK;
  },
};

export function getFallbackConnection(): Connection | null {
  const fallback = process.env.SOLANA_RPC_FALLBACK_URL;
  if (!fallback) return null;
  return new Connection(fallback, "confirmed");
}
