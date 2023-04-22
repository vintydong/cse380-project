import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { BossAction } from "../Boss";

/**
 * An Idle action for the NPCGoapAI. Basically a default action for all of the NPCs
 * to do nothing.
 */
export default class IdleAction extends BossAction {

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