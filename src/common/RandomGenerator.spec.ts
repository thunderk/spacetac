module TK {
    testing("RandomGenerator", test => {
        test.case("produces floats", check => {
            var gen = new RandomGenerator();

            var i = 100;
            while (i--) {
                var value = gen.random();
                check.greaterorequal(value, 0);
                check.greater(1, value);
            }
        });

        test.case("produces integers", check => {
            var gen = new RandomGenerator();

            var i = 100;
            while (i--) {
                var value = gen.randInt(5, 12);
                check.equals(Math.round(value), value);
                check.greater(value, 4);
                check.greater(13, value);
            }
        });

        test.case("chooses from an array", check => {
            var gen = new RandomGenerator();

            check.equals(gen.choice([5]), 5);

            var i = 100;
            while (i--) {
                var value = gen.choice(["test", "thing"]);
                check.contains(["thing", "test"], value);
            }
        });

        test.case("samples from an array", check => {
            var gen = new RandomGenerator();

            var i = 100;
            while (i-- > 1) {
                var input = [1, 2, 3, 4, 5];
                var sample = gen.sample(input, i % 5 + 1);
                check.same(sample.length, i % 5 + 1);
                sample.forEach((num, idx) => {
                    check.contains(input, num);
                    check.notcontains(sample.filter((ival, iidx) => iidx != idx), num);
                });
            }
        });

        test.case("choose from weighted ranges", check => {
            let gen = new RandomGenerator();

            check.equals(gen.weighted([]), -1);
            check.equals(gen.weighted([1]), 0);
            check.equals(gen.weighted([0, 1, 0]), 1);
            check.equals(gen.weighted([0, 12, 0]), 1);

            gen = new SkewedRandomGenerator([0, 0.5, 0.7, 0.8, 0.9999]);
            check.equals(gen.weighted([4, 3, 0, 2, 1]), 0);
            check.equals(gen.weighted([4, 3, 0, 2, 1]), 1);
            check.equals(gen.weighted([4, 3, 0, 2, 1]), 3);
            check.equals(gen.weighted([4, 3, 0, 2, 1]), 3);
            check.equals(gen.weighted([4, 3, 0, 2, 1]), 4);
        });

        test.case("generates ids", check => {
            let gen = new SkewedRandomGenerator([0, 0.4, 0.2, 0.1, 0.3, 0.8]);
            check.equals(gen.id(6, "abcdefghij"), "aecbdi");
        });

        test.case("can be skewed", check => {
            var gen = new SkewedRandomGenerator([0, 0.5, 0.2, 0.9]);

            check.equals(gen.random(), 0);
            check.equals(gen.random(), 0.5);
            check.equals(gen.randInt(4, 8), 5);
            check.equals(gen.random(), 0.9);

            var value = gen.random();
            check.greaterorequal(value, 0);
            check.greater(1, value);

            gen = new SkewedRandomGenerator([0.7], true);
            check.equals(gen.random(), 0.7);
            check.equals(gen.random(), 0.7);
            check.equals(gen.random(), 0.7);
        });
    });
}
