module AppCommon {
    export class GuidService {

        // Static member
        static NewGuid(): string {
            let result: string;
            let i: string;
            let j: number;

            result = "";
            for (j = 0; j < 32; j++) {
                if (j == 8 || j == 12 || j == 16 || j == 20)
                    result = result + "-";
                i = Math.floor(Math.random() * 16).toString(16).toLowerCase();
                result = result + i;
            }
            return result;
        }

        static EmptyGuid(): string {
            let result: string;
            let j: number;

            result = "";
            for (j = 0; j < 32; j++) {
                if (j == 8 || j == 12 || j == 16 || j == 20)
                    result = result + "-";
                result = result + 0;
            }
            return result;
        }

    }
}