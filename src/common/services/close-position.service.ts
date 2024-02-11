import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { config } from 'dotenv';
import { abi_position } from '../../contracts/positionManager/abi';
import { address } from '../../contracts/positionManager/contract';

config();

@Injectable()
export class ClosePositionService {
  private readonly privateKey = process.env.KEY;
  private readonly provider = new ethers.providers.JsonRpcProvider(
    'https://polygon-mumbai-pokt.nodies.app',
  );
  private readonly wallet = new ethers.Wallet(this.privateKey, this.provider);
  private readonly contract = new ethers.Contract(
    address,
    abi_position,
    this.wallet,
  );

  async closePosition(positionId: string): Promise<any> {
    try {
      console.log(
        'Wallet Balance:',
        ethers.utils.formatEther(
          await this.provider.getBalance(this.wallet.address),
        ),
      );

      const feeData = await this.provider.getFeeData();

      // const estimatedGas = await this.contract.estimateGas.closePosition(
      //   positionId,

      //   {
      //     maxFeePerGas: feeData.maxFeePerGas,
      //     maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      //   },
      // );
      // console.log('estimated GAS', Number(estimatedGas));
      // if (estimatedGas.gt(ethers.utils.parseUnits('100000', 'wei'))) {
      //   console.log('Gas cost too high, not sending transaction');
      //   return; // Exit the function if the gas estimate is too high
      // }

      const transaction = await this.contract.closePosition(positionId, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 2000000,
      });

      const resp = await transaction.wait();

      return resp;
    } catch (error) {
      console.error('Error close position:', (error as Error).message);
      throw error;
    }
  }
}
