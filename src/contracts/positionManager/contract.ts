import { getDefaultProvider, Contract } from 'ethers';
import { abi_position } from './abi'; // Adjust the path based on the actual location of your abi file
import { config } from 'dotenv';
config();

const address = '0x5ce832046e25fBAc5De4519f4d3b8052EDA5Fa86'; //position-manager contract
// '0xEcce1DCCF0880BC0E816Ad3f56782364B2D19692';
//'0xC9B8ACcCF9223DE977606F20138F057D007e1F40';
// '0x08782f539794c7f6943a3f9bb363Ce541F568C42';
const provider = getDefaultProvider(process.env.ALCHEMY_WS_URL);
const contract = new Contract(address, abi_position, provider);
export { contract, address };
