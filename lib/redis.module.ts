import { DynamicModule, Module } from '@nestjs/common';

import {RedisService} from "./redis.service";
import {RedisOptions} from "ioredis";

@Module({})
export class RedisModule {
    static forRoot(options: RedisOptions): DynamicModule {
        return {
            module: RedisModule,
            providers: [
                {
                    provide: 'REDIS_MODULE_OPTIONS',
                    useValue: options,
                },
                RedisService,
            ],
            exports: [RedisService],
        };
    }
}