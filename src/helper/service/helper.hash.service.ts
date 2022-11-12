import { Injectable } from '@nestjs/common';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { enc, SHA256 } from 'crypto-js';
import * as uuid from 'uuid';

@Injectable()
export class HelperHashService {
    randomSalt(rounds: number): string {
        return genSaltSync(rounds);
    }

    bcrypt(passwordString: string, salt: string): string {
        return hashSync(passwordString, salt);
    }

    bcryptCompare(passwordString: string, passwordHashed: string): boolean {
        return compareSync(passwordString, passwordHashed);
    }

    sha256(string: string): string {
        return SHA256(string).toString(enc.Hex);
    }

    sha256Compare(hashOne: string, hashTwo: string): boolean {
        return hashOne === hashTwo;
    }

    uuid(version: 1 | 4 = 4): string {
        switch (version) {
            case 1:
                return uuid.v1();
            case 4:
            default:
                return uuid.v4();
        }
    }
}
