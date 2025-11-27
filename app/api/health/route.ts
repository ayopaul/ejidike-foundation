/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/health/route.ts
 * PURPOSE: Simple health check endpoint
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Ejidike Foundation API'
  });
}