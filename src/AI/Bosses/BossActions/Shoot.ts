import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { BossAction } from "../Boss";

/**
 * A Shoot action for the GoapAI
 */
export default class Shoot extends BossAction {
    public performAction(target: Vec2): void {
        this.finished();
    }

    public handleInput(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleInput(event);
                break;
            }
        }
    }
    
}