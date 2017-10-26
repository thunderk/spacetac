module TK.SpaceTac.Specs {
    testing("Cooldown", test => {
        test.case("applies overheat and cooldown", check => {
            let cooldown = new Cooldown();
            check.equals(cooldown.canUse(), true);

            cooldown.use();
            check.equals(cooldown.canUse(), true);

            cooldown.configure(2, 3);
            check.equals(cooldown.canUse(), true);

            cooldown.use();
            check.equals(cooldown.canUse(), true);

            cooldown.use();
            check.equals(cooldown.canUse(), false);

            cooldown.cool();
            check.equals(cooldown.canUse(), false);

            cooldown.cool();
            check.equals(cooldown.canUse(), false);

            cooldown.cool();
            check.equals(cooldown.canUse(), true);

            cooldown.configure(1, 0);
            check.equals(cooldown.canUse(), true);

            cooldown.use();
            check.equals(cooldown.canUse(), false);

            cooldown.cool();
            check.equals(cooldown.canUse(), true);
        });
    });
}