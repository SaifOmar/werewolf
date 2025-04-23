export class Effect {
  effectName;
  action;

  constructor(effectName, action) {
    this.effectName = effectName;
    this.action = action;
  }

  // should print hello
  DoEffect() {
    console.log(this.action);
  }
}
