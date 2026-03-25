import { Injectable } from '@nestjs/common';
import { Snowflake } from '@theinternetfolks/snowflake';

@Injectable()
export class SnowflakeService {
  getNextId(): bigint {
    return BigInt(Snowflake.generate());
  }

  isValid(id: string | bigint): boolean {
    if (!id) return false;
    return Snowflake.isValid(id.toString());
  }
}
