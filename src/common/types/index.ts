import { z } from 'zod';

/** positions */
export const CreatePositionDto = z.object({
  user: z.string(),
  positionId: z.number(),
  stopTick: z.number(),
  poolAddress: z.string(),
  amountA: z.number(),
  direction: z.string(),
});

export type CreatePositionDtoType = z.infer<typeof CreatePositionDto>;
