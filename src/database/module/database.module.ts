import { Module } from '@nestjs/common';
import { DatabaseService } from '@database/service/database.config.service';

@Module({
    providers: [DatabaseService],
    exports: [DatabaseService],
    imports: []
})
export class DatabaseModule {}
