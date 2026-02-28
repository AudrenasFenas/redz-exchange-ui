import { Connection, ConnectionConfig } from '@solana/web3.js';
import { RPC_ENDPOINTS, RPC_CONFIG, NETWORK, RPC_URL } from './constants';

/**
 * RPC Connection Manager with automatic failover
 */
export class RpcConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private currentEndpointIndex = 0;
  private network: string;

  constructor(network: string = NETWORK) {
    this.network = network;
    // Log high-level info about endpoint configuration without revealing secrets.
    const base = RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS] || [];
    const overrideUsed = !!(RPC_URL && !base.includes(RPC_URL));
    console.info(`[RpcConnectionManager] network=${this.network} endpoints=${base.length} override=${overrideUsed}`);
  }

  /**
   * Return the effective endpoints for the current network.
   * If `RPC_URL` override is set, prefer it first (but avoid duplicating).
   */
  private getEndpoints(): string[] {
    const base = RPC_ENDPOINTS[this.network as keyof typeof RPC_ENDPOINTS] || [];
    const endpoints = base.slice();

    if (RPC_URL && !endpoints.includes(RPC_URL)) {
      endpoints.unshift(RPC_URL);
    }

    return endpoints;
  }

  /**
   * Get connection with automatic failover
   */
  public getConnection(): Connection {
    const endpoints = this.getEndpoints();
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
  const endpoints = this.getEndpoints();
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % endpoints.length;
    
    console.warn(`Switching to RPC endpoint: ${endpoints[this.currentEndpointIndex]}`);
    return this.getConnection();
  }

  /**
   * Test connection to RPC endpoint
   */
  public async testConnection(endpoint?: string): Promise<{ success: boolean; latency: number; error?: string }> {
  const endpoints = this.getEndpoints();
  const testEndpoint = endpoint || endpoints[this.currentEndpointIndex];
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
    const endpoints = this.getEndpoints();
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
    const endpoints = this.getEndpoints();
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
/**
 * Global RPC connection manager instance for handling remote procedure calls.
 * 
 * This singleton instance manages connections to RPC endpoints and provides
 * a centralized way to handle RPC communications throughout the application.
 * 
 * @alchemyrpc
 * ```typescript
 * // Use the global RPC manager
 * const result = await rpcManager.call('methodName', params);
 * ```
 */
export const rpcManager = new RpcConnectionManager();

/**
 * Compute effective endpoints for a network, honoring runtime env override.
 * Exported for unit tests.
 */
export function computeEndpointsForNetwork(network: string = NETWORK): string[] {
  const override = process.env.NEXT_PUBLIC_RPC_URL || '';
  const base = RPC_ENDPOINTS[network as keyof typeof RPC_ENDPOINTS] || [];
  const endpoints = base.slice();

  if (override && !endpoints.includes(override)) {
    endpoints.unshift(override);
  }

  return endpoints;
}

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