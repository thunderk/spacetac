module TK.SpaceTac.Specs {
    describe("Cooldown", function () {
        it("applies overheat and cooldown", function () {
            let cooldown = new Cooldown();
            expect(cooldown.canUse()).toBe(true);

            cooldown.use();
            expect(cooldown.canUse()).toBe(true);

            cooldown.configure(2, 3);
            expect(cooldown.canUse()).toBe(true);

            cooldown.use();
            expect(cooldown.canUse()).toBe(true);

            cooldown.use();
            expect(cooldown.canUse()).toBe(false);

            cooldown.cool();
            expect(cooldown.canUse()).toBe(false);

            cooldown.cool();
            expect(cooldown.canUse()).toBe(false);

            cooldown.cool();
            expect(cooldown.canUse()).toBe(true);

            cooldown.configure(1, 0);
            expect(cooldown.canUse()).toBe(true);

            cooldown.use();
            expect(cooldown.canUse()).toBe(false);

            cooldown.cool();
            expect(cooldown.canUse()).toBe(true);
        });
    });
}