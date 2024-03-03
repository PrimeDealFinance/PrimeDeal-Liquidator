import { ethers } from 'ethers';

export function createContract(
  address: string,
  abi: ethers.ContractInterface,
  provider: ethers.providers.WebSocketProvider,
): ethers.Contract {
  return new ethers.Contract(address, abi, provider);
}
