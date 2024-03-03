import { ethers } from 'ethers';

export function createProviderWs(
  url: string,
): ethers.providers.WebSocketProvider {
  return new ethers.providers.WebSocketProvider(url);
}

export function createProvider(url: string): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(url);
}
