import {Inject, Injectable, Logger} from "@nestjs/common";
import Redis, {RedisOptions} from "ioredis";
import Redlock from "redlock";

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);
    private readonly client: Redis;
    private readonly lock: Redlock;
    private ready = false;

    constructor(
        @Inject('REDIS_MODULE_OPTIONS') private readonly options: RedisOptions
    ) {
        this.client = new Redis(options);

        this.getClient().on("error", (err) => {
            this.logger.error("Redis Client Error", err);
            this.ready = false;
        });

        this.getClient().on("ready", () => {
            this.logger.log("Redis Client Connected");
            this.ready = true;
        });

        this.lock = new Redlock([this.client], {
            driftFactor: 0.01,
            retryCount: 10,
            retryDelay: 200,
            retryJitter: 200,
            automaticExtensionThreshold: 500
        });

        this.getClient().connect();
    }

    public getClient(): Redis {
        return this.client;
    }

    public getLock(): Redlock {
        return this.lock;
    }

    public isReady(): boolean {
        return this.ready && this.getClient().status === "ready";
    }

    public async setKey(key: string, obj: any): Promise<boolean> {
        if (!this.isReady()) {
            return false;
        }

        if (obj) {
            obj = JSON.stringify(obj);
        } else {
            obj = "";
        }
        return !!(await this.getClient().set(key, obj).catch((err) => {return false;}));
    }

    public async getValue(key: string): Promise<any> {
        if (!this.isReady()) {
            return null;
        }

        let obj = await this.getClient()
            .get(key)
            .then((value) => {
                return value;
            });
        if (obj) {
            obj = JSON.parse(obj);
        }
        return obj;
    }

    public async rPush(key: string, obj: any): Promise<boolean> {
        if (!this.isReady()) {
            return false;
        }

        if (obj) {
            obj = JSON.stringify(obj);
        } else {
            obj = "";
        }

        return !!(await this.getClient().rpush(key, obj).catch((err) => {
            return false;
        }));
    }

    public async rPop(key: string): Promise<any> {
        if (!this.isReady()) {
            return null;
        }

        let obj = await this.getClient()
            .rpop(key)
            .then((value) => {
                return value;
            });
        if (obj) {
            obj = JSON.parse(obj);
        }
        return obj;
    }

    public async lPush(key: string, obj: any): Promise<boolean> {
        if (!this.isReady()) {
            return false;
        }

        if (obj) {
            obj = JSON.stringify(obj);
        } else {
            obj = "";
        }

        return !!(await this.getClient().lpush(key, obj).catch((err) => {
            return false;
        }));
    }

    public async lPop(key: string): Promise<any> {
        if (!this.isReady()) {
            return null;
        }

        let obj = await this.getClient()
            .lpop(key)
            .then((value) => {
                return value;
            });
        if (obj) {
            obj = JSON.parse(obj);
        }
        return obj;
    }
}
