namespace DWTS {

    export interface IRange {
        setStart: (start: number) => void;
        getStart: () => number;
        setEnd: (end: number) => void;
        getEnd: () => number;
        getCount: () => number;
        equals: (range: IRange) => boolean;
        isSubrange: (range: IRange) => boolean;
    }

    export class Range implements IRange {
        constructor(private start: number, private end: number) {
            this.setStart(start);
            this.setEnd(end);
        }

        public getStart = () => this.start;
        public getEnd = () => this.end;
        public equals = (range: IRange) => range && range.getStart() === this.getStart() && range.getEnd() === this.getEnd();
        public isSubrange = (range: IRange) => range && range.getStart() <= this.getStart() && range.getEnd() >= this.getEnd();
        public getCount = () => this.getEnd() - this.getStart();

        public setStart(start: number): void {
            this.start = start;
        }

        public setEnd(end: number): void {
            this.end = end;
        }
    }
}