import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';

export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: APP_CONFIG.version,
      network: APP_CONFIG.network,
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}