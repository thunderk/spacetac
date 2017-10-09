module TK.SpaceTac.UI.Specs {
    describe("ParticleBuilder", () => {
        let testgame = setupEmptyView();

        it("builds composed particles", function () {
            let builder = new ParticleBuilder(testgame.view);
            let particle = builder.build([
                new ParticleConfig(ParticleShape.ROUND, ParticleColor.BLUE, 2, 1, 45, 10, -20),
                new ParticleConfig(ParticleShape.DISK_HALO, ParticleColor.WHITE, 0.5, 1, 0, 5, 0)
            ]);

            expect(particle instanceof Phaser.Image).toBe(true);
            expect(particle.data.frame).toEqual(4);
            expect(particle.data.key).toEqual("common-particles");
            expect(particle.scale.x).toEqual(2);
            expect(particle.scale.y).toEqual(2);
            expect(particle.x).toEqual(10);
            expect(particle.y).toEqual(-20);
            expect(particle.angle).toEqual(45);

            expect(particle.children.length).toEqual(1);
            let subparticle = <Phaser.Image>particle.getChildAt(0);
            expect(subparticle instanceof Phaser.Image).toBe(true);
            expect(subparticle.data.frame).toEqual(16);
            expect(subparticle.data.key).toEqual("common-particles");
            expect(subparticle.scale.x).toEqual(0.25);
            expect(subparticle.scale.y).toEqual(0.25);
            expect(subparticle.x).toEqual(2.5);
            expect(subparticle.y).toEqual(0);
            expect(subparticle.angle).toEqual(-45);
        });
    });
}
