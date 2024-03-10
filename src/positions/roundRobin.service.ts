import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { createProvider } from 'src/common/utils/providers';

@Injectable()
export class RoundRobinService {
  private signers: ethers.Wallet[] = [];
  private currentSignerIndex = 0;

  constructor(private configService: ConfigService) {
    const keys = [
      // this.configService.get<string>('PRIVATE_KEY2'),
      this.configService.get<string>('PRIVATE_KEY1'),
    ];
    const provider = createProvider(
      this.configService.get<string>('ALCHEMY_MUMBAI_HTTPS'),
    );

    this.signers = keys.map((key) => new ethers.Wallet(key, provider));
  }

  getNextSigner(): ethers.Wallet {
    const signer = this.signers[this.currentSignerIndex];
    this.currentSignerIndex =
      (this.currentSignerIndex + 1) % this.signers.length;
    return signer;
  }
}
