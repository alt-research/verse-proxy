// datastore.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { Redis } from 'ioredis';
import configuration from '../config/configuration';
import { DatastoreService } from './services/datastore.service';
import { RedisService } from './services/redis.service';
import { RdbService } from './services/rdb.service';
import { CacheService } from './services/cache.service';
import { BlockNumberCache, TransactionCount } from './entities';

@Module({})
export class DatastoreModule {
  static register(): DynamicModule {
    const redisUri = process.env.REDIS_URI;
    const rdbUri = process.env.RDB_URI;

    const imports = [];
    const providers = [];
    imports.push(
      ConfigModule.forRoot({
        load: [configuration],
      }),
    );
    imports.push(CacheModule.register());
    providers.push(DatastoreService);
    providers.push(RedisService);
    providers.push(RdbService);
    providers.push(CacheService);

    if (redisUri) {
      const redis = new Redis(redisUri);
      providers.push({
        provide: 'REDIS',
        useValue: redis,
      });
    }

    if (rdbUri) {
      imports.push(
        TypeOrmModule.forFeature([BlockNumberCache, TransactionCount]),
      );
      imports.push(
        TypeOrmModule.forRoot({
          type: 'mysql',
          url: rdbUri,
          synchronize: false,
          logging: false,
          autoLoadEntities: true,
        }),
      );
    }

    return {
      module: DatastoreModule,
      imports,
      providers,
      exports: [DatastoreService, ...providers],
    };
  }
}