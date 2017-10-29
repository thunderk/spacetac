module TK.SpaceTac.UI.Specs {
    testing("ParticleBuilder", test => {
        let testgame = setupEmptyView(test);

        test.case("builds composed particles", check => {
            let builder = new ParticleBuilder(testgame.view);
            let particle = builder.build([
                new ParticleConfig(ParticleShape.ROUND, ParticleColor.BLUE, 2, 1, 45, 10, -20),
                new ParticleConfig(ParticleShape.DISK_HALO, ParticleColor.WHITE, 0.5, 1, 0, 5, 0)
            ]);

            check.equals(particle instanceof Phaser.Image, true);
            check.equals(particle.data.frame, 4);
            check.equals(particle.data.key, "common-particles");
            check.equals(particle.scale.x, 2);
            check.equals(particle.scale.y, 2);
            check.equals(particle.x, 10);
            check.equals(particle.y, -20);
            check.equals(particle.angle, 45);

            check.equals(particle.children.length, 1);
            let subparticle = <Phaser.Image>particle.getChildAt(0);
            check.equals(subparticle instanceof Phaser.Image, true);
            check.equals(subparticle.data.frame, 16);
            check.equals(subparticle.data.key, "common-particles");
            check.equals(subparticle.scale.x, 0.25);
            check.equals(subparticle.scale.y, 0.25);
            check.equals(subparticle.x, 2.5);
            check.equals(subparticle.y, 0);
            check.equals(subparticle.angle, -45);
        });
    });
}
