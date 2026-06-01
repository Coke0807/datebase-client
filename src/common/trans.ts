/**
 * avoid run send after date on query result.
 */
export class Trans {
    public static transId: string;
    private static counter: number = 0;
    public static begin() {
        this.transId = `${Date.now()}-${++this.counter}-query`;
    }
}