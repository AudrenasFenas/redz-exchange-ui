import { Connection, ConnectionConfig } from '@solana/web3.js';
import { RPC_ENDPOINTS, RPC_CONFIG, NETWORK } from './constants';

/**
 * RPC Connection Manager with automatic failover
 */
export class RpcConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private currentEndpointIndex = 0;
  private network: string;

  constructor(network: string = NETWORK) {
    this.network = network;
  }

  /**
   * Get connection with automatic failover
   */
  public getConnection(): Connection {
    const endpoints = RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS];
    if (!endpoints || endpoints.length === 0) {
      throw new Error(`No RPC endpoints configured for network: ${this.network}`);
    }

    const endpoint = endpoints[this.currentEndpointIndex];
    
    if (!this.connections.has(endpoint)) {
      const config: ConnectionConfig = {
        commitment: RPC_CONFIG.commitment,
        confirmTransactionInitialTimeout: RPC_CONFIG.timeout,
      };
      
      this.connections.set(endpoint, new Connection(endpoint, config));
    }

    return this.connections.get(endpoint)!;
  }

  /**
   * Switch to next RPC endpoint on failure
   */
  public failover(): Connection {
    const endpoints = RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS];
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % endpoints.length;
    
    console.warn(`Switching to RPC endpoint: ${endpoints[this.currentEndpointIndex]}`);
    return this.getConnection();
  }

  /**
   * Test connection to RPC endpoint
   */
  public async testConnection(endpoint?: string): Promise<{ success: boolean; latency: number; error?: string }> {
    const testEndpoint = endpoint || RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS][this.currentEndpointIndex];
    const startTime = Date.now();

    try {
      const connection = new Connection(testEndpoint, { commitment: 'confirmed' });
      await connection.getLatestBlockhash();
      
      return {
        success: true,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find fastest RPC endpoint
   */
  public async findFastestEndpoint(): Promise<string> {
    const endpoints = RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS];
    const tests = await Promise.all(
      endpoints.map(async (endpoint) => ({
        endpoint,
        ...(await this.testConnection(endpoint)),
      }))
    );

    // Filter successful connections and sort by latency
    const successful = tests
      .filter(test => test.success)
      .sort((a, b) => a.latency - b.latency);

    if (successful.length === 0) {
      throw new Error('No working RPC endpoints found');
    }

    const fastest = successful[0];
    console.log(`Fastest RPC endpoint: ${fastest.endpoint} (${fastest.latency}ms)`);
    
    // Update current endpoint index
    this.currentEndpointIndex = endpoints.indexOf(fastest.endpoint);
    
    return fastest.endpoint;
  }

  /**
   * Get all endpoint statuses
   */
  public async getAllEndpointStatuses(): Promise<Array<{
    endpoint: string;
    success: boolean;
    latency: number;
    error?: string;
  }>> {
    const endpoints = RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS];
    return Promise.all(
      endpoints.map(async (endpoint) => ({
        endpoint,
        ...(await this.testConnection(endpoint)),
      }))
    );
  }

  /**
   * Reset connection cache
   */
  public resetConnections(): void {
    this.connections.clear();
    this.currentEndpointIndex = 0;
  }
}

// Export singleton instance
export const rpcManager = new RpcConnectionManager();

/**
 * Get connection with retry logic
 */
export async function getConnectionWithRetry(maxRetries: number = RPC_CONFIG.retryCount): Promise<Connection> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const connection = rpcManager.getConnection();
      
      // Test the connection
      await connection.getLatestBlockhash();
      return connection;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown connection error');
      
      if (attempt < maxRetries - 1) {
        console.warn(`RPC connection attempt ${attempt + 1} failed, trying next endpoint...`);
        rpcManager.failover();
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RPC_CONFIG.retryDelay));
      }
    }
  }

  throw new Error(`Failed to connect to RPC after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

/**
 * Simple connection getter (backwards compatibility)
 */
export function getConnection(): Connection {
  return rpcManager.getConnection();
}