module TK.SpaceTac.UI.Specs {
    testing("ParticleBuilder", test => {
        let testgame = setupEmptyView(test);

        test.case("builds composed particles", check => {
            let builder = new ParticleBuilder(testgame.view);
            let particle = builder.build([
                new ParticleConfig(ParticleShape.ROUND, ParticleColor.BLUE, 2, 1, 45, 10, -20),
                new ParticleConfig(ParticleShape.DISK_HALO, ParticleColor.WHITE, 0.5, 1, 0, 5, 0)
            ]);

            check.equals(particle.length, 2);

            let child = particle.list[0];
            if (check.instance(child, Phaser.GameObjects.Image, "first particle is an image")) {
                check.equals((<any>child.data).frame, 4);
                check.equals((<any>child.data).key, "common-particles");
                check.equals(child.scaleX, 2);
                check.equals(child.scaleY, 2);
                check.equals(child.x, 10);
                check.equals(child.y, -20);
                check.equals(child.angle, 45);
            }

            child = particle.list[1];
            if (check.instance(child, Phaser.GameObjects.Image, "second particle is an image")) {
                check.equals((<any>child.data).frame, 16);
                check.equals((<any>child.data).key, "common-particles");
                check.equals(child.scaleX, 0.5);
                check.equals(child.scaleY, 0.5);
                check.equals(child.x, 5);
                check.equals(child.y, 0);
                check.equals(child.angle, 0);
            }
        });
    });
}
