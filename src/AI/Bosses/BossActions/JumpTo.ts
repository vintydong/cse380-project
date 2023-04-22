import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { BossAction, BossBehavior, BossController } from "../Boss";

/** 
 * This inheritted class defines the actions a slime performs -- jumping to a player
 * @author vintydong
*/
export default class JumpTo extends BossAction {
    public constructor(parent: BossBehavior, actor: BossController) {
        super(parent, actor);
        this._target = null;
    }

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    public performAction(target: Vec2) {
        if(this.actor.onGround){
            this.actor._velocity.y = -500;
        }
        this.finished();
    }

    public onExit(): Record<string, any> {
        return super.onExit();
    }

    public handleInput(event: GameEvent): void {
        switch (event.type) {
            default: {
                super.handleInput(event);
            }
        }
    }
}
