/**
 * Various testing functions.
 */
module TK {
    export type FakeClock = { forward: (milliseconds: number) => void }
    export type Mock<F extends Function> = { func: F, getCalls: () => any[][], reset: () => void }

    /**
     * Main test suite descriptor
     */
    export function testing(desc: string, body: (test: TestSuite) => void) {
        if (typeof describe != "undefined") {
            describe(desc, () => {
                beforeEach(() => jasmine.addMatchers(CUSTOM_MATCHERS));

                let test = new TestSuite(desc);
                body(test);
            });
        }
    }

    /**
     * Test suite (group of test cases)
     */
    export class TestSuite {
        private desc: string
        constructor(desc: string) {
            this.desc = desc;
        }

        /**
         * Add a setup step for each case of the suite
         */
        setup(body: Function, cleanup?: Function): void {
            beforeEach(() => body());
            if (cleanup) {
                afterEach(() => cleanup());
            }
        }

        /**
         * Add an asynchronous setup step for each case of the suite
         */
        asetup(body: () => Promise<void>, cleanup?: () => Promise<void>): void {
            beforeEach(async () => await body());
            if (cleanup) {
                afterEach(async () => await cleanup());
            }
        }

        /**
         * Describe a single test case
         */
        case(desc: string, body: (ctx: TestContext) => void): void {
            it(desc, () => {
                console.debug(`${this.desc} ${desc}`);
                body(new TestContext())
            });
        }

        /**
         * Describe an asynchronous test case
         */
        acase<T>(desc: string, body: (ctx: TestContext) => Promise<T>): void {
            it(desc, done => {
                console.debug(`${this.desc} ${desc}`);
                body(new TestContext()).then(done).catch(done.fail);
            });
        }

        /**
         * Setup fake clock for the suite
         */
        clock(): FakeClock {
            let current = 0;

            beforeEach(function () {
                current = 0;
                jasmine.clock().install();
                spyOn(Timer, "nowMs").and.callFake(() => current);
            });

            afterEach(function () {
                jasmine.clock().uninstall();
            });

            return {
                forward: milliseconds => {
                    current += milliseconds;
                    jasmine.clock().tick(milliseconds);
                }
            };
        }

        /**
         * Out-of-context assertion helpers
         * 
         * It is better to use in-context checks, for better information
         */
        get check(): TestContext {
            return new TestContext();
        }
    }

    /**
     * A test context, with assertion helpers
     */
    export class TestContext {
        info: string[];

        constructor(info: string[] = []) {
            this.info = info;
        }

        /**
         * Create a sub context (adds information for all assertions done with this context)
         */
        sub(info: string): TestContext {
            return new TestContext(this.info.concat([info]));
        }

        /**
         * Execute a body in a sub context
         */
        in(info: string, body: (ctx: TestContext) => void): void {
            body(this.sub(info));
        }

        /**
         * Builds a message, with context information added
         */
        message(message?: string): string | undefined {
            let parts = this.info;
            if (message) {
                parts = parts.concat([message]);
            }
            return parts.length ? parts.join(" - ") : undefined;
        }

        /**
         * Patch an object's method with a mock
         * 
         * Replacement may be:
         * - undefined to call through
         * - null to not call anything
         * - a fake function to call instead
         * 
         * All patches are removed at the end of a case
         */
        patch<T extends Object, K extends keyof T, F extends T[K] & Function>(obj: T, method: K, replacement?: F | null): Mock<F> {
            let spy = spyOn(obj, <any>method);
            if (replacement === null) {
                spy.and.stub();
            } else if (replacement) {
                spy.and.callFake(<any>replacement);
            } else {
                spy.and.callThrough();
            }

            return {
                func: <any>spy,
                getCalls: () => spy.calls.all().map(info => info.args),
                reset: () => spy.calls.reset()
            }
        }

        /**
         * Create a mock function
         */
        mockfunc<F extends Function>(name = "mock", replacement?: F): Mock<F> {
            let spy = jasmine.createSpy(name, <any>replacement);

            if (replacement) {
                spy = spy.and.callThrough();
            }

            return {
                func: <any>spy,
                getCalls: () => spy.calls.all().map(info => info.args),
                reset: () => spy.calls.reset()
            }
        }

        /**
         * Check that a mock have been called a given number of times, or with specific args
         */
        called(mock: Mock<any>, calls: number | any[][], reset = true): void {
            if (typeof calls == "number") {
                expect(mock.getCalls().length).toEqual(calls, this.message());
            } else {
                expect(mock.getCalls()).toEqual(calls, this.message());
            }

            if (reset) {
                mock.reset();
            }
        }

        /**
         * Check that a function call throws an error
         */
        throw(call: Function, error?: string | Error): void {
            if (typeof error == "undefined") {
                expect(call).toThrow();
            } else if (typeof error == "string") {
                expect(call).toThrowError(error);
            } else {
                expect(call).toThrow(error);
            }
        }

        /**
         * Check that an object is an instance of a given type
         */
        instance<T>(obj: any, classref: { new(...args: any[]): T }, message: string): obj is T {
            let result = obj instanceof classref;
            expect(result).toBe(true, this.message(message));
            return result;
        }

        /**
         * Check that two references are the same object
         */
        same<T extends Object>(ref1: T | null | undefined, ref2: T | null | undefined, message?: string): void {
            expect(ref1).toBe(ref2, this.message(message));
        }

        /**
         * Check that two references are not the same object
         */
        notsame<T extends Object>(ref1: T | null, ref2: T | null, message?: string): void {
            expect(ref1).not.toBe(ref2, this.message(message));
        }

        /**
         * Check that two values are equal, in the sense of deep comparison
         */
        equals<T>(val1: T, val2: T, message?: string): void {
            expect(val1).toEqual(val2, this.message(message));
        }

        /**
         * Check that two values differs, in the sense of deep comparison
         */
        notequals<T>(val1: T, val2: T, message?: string): void {
            expect(val1).not.toEqual(val2, this.message(message));
        }

        /**
         * Check that a numerical value is close to another, at a given number of digits precision
         */
        nears(val1: number, val2: number, precision = 8, message?: string): void {
            if (precision != Math.round(precision)) {
                throw new Error(`'nears' precision should be integer, not {precision}`);
            }
            expect(val1).toBeCloseTo(val2, precision, this.message(message));
        }

        /**
         * Check that a numerical value is greater than another
         */
        greater(val1: number, val2: number, message?: string): void {
            expect(val1).toBeGreaterThan(val2, this.message(message));
        }

        /**
         * Check that a numerical value is greater than or equal to another
         */
        greaterorequal(val1: number, val2: number, message?: string): void {
            expect(val1).toBeGreaterThanOrEqual(val2, this.message(message));
        }

        /**
         * Check that a string matches a regex
         */
        regex(pattern: RegExp, value: string, message?: string): void {
            expect(value).toMatch(pattern, this.message(message));
        }

        /**
         * Check that an array contains an item
         */
        contains<T>(array: T[], item: T, message?: string): void {
            expect(array).toContain(item, this.message(message));
        }

        /**
         * Check that an array does not contain an item
         */
        notcontains<T>(array: T[], item: T, message?: string): void {
            expect(array).not.toContain(item, this.message(message));
        }

        /**
         * Check than an object contains a set of properties
         */
        containing<T>(val: T, props: Partial<T>, message?: string): void {
            expect(val).toEqual(jasmine.objectContaining(props), this.message(message));
        }

        /**
         * Fail the whole case
         */
        fail(message?: string): void {
            fail(this.message(message));
        }
    }

    const CUSTOM_MATCHERS = {
        toEqual: function (util: any, customEqualityTesters: any) {
            customEqualityTesters = customEqualityTesters || [];

            return {
                compare: function (actual: any, expected: any, message?: string) {
                    let result: any = { pass: false };
                    let diffBuilder = (<any>jasmine).DiffBuilder();

                    result.pass = util.equals(actual, expected, customEqualityTesters, diffBuilder);

                    result.message = diffBuilder.getMessage();
                    if (message) {
                        result.message += " " + message;
                    }

                    return result;
                }
            };
        }
    }
}