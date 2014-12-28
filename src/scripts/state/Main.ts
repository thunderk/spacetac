module SpaceTac.State {
  export class Main extends Phaser.State {

    create() {
      this.add.text(10, 10, "Let's code !", { font: "65px Arial" });
    }
  }
}
