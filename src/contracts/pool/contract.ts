import { getDefaultProvider, Contract } from 'ethers';
import { abi_pool } from './abi';
import { config } from 'dotenv';
config();

const address = '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B'; //eth:usdt pool on mumbai
const provider = getDefaultProvider(process.env.ALCHEMY_WS_URL);
const contract = new Contract(address, abi_pool, provider);
export { contract, address };
