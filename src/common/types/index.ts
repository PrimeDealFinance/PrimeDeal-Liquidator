import { ethers } from 'ethers';
import { z } from 'zod';

/** positions */
export const CreatePositionDto = z.object({
  user: z.string(),
  positionId: z.number(),
  stopTick: z.number(),
  poolAddress: z.string(),
  amount: z.number(),
  direction: z.string(),
});

export type CreatePositionDtoType = z.infer<typeof CreatePositionDto>;

export const EventPositionParametersSchema = z.object({
  positionId: z.string(),
  user: z.string(),
  stopTick: z.number(),
  poolAddress: z.string(),
  amountA: z.instanceof(ethers.BigNumber),
  direction: z.enum(['buy', 'sell']),
});

export type EventPositionParameters = z.infer<
  typeof EventPositionParametersSchema
>;

/** pools */

export const CreatePoolDto = z.object({
  poolAddress: z.string(),
  tokenAcontract: z.string(),
  tokenBcontract: z.string(),
  tokenAsymbol: z.string(),
  tokenBsymbol: z.string(),
});

export type CreatePoolDtoType = z.infer<typeof CreatePoolDto>;

/** queues */
export const NewPositionSchema = z.object({
  positionId: z.number(),
  user: z.string(),
  stopTick: z.number(),
  poolAddress: z.string(),
  amount: z.number(),
  direction: z.string(),
});

export type NewPositionType = z.infer<typeof NewPositionSchema>;

export const SwapEventSchema = z.object({
  poolAddress: z.string(),
  tick: z.number(),
});

export type SwapEventType = z.infer<typeof SwapEventSchema>;

/** types */

export type KeepAliveParams = {
  provider: ethers.providers.WebSocketProvider;
  onDisconnect: (err: any) => void;
  expectedPongBack?: number;
  checkInterval?: number;
};
