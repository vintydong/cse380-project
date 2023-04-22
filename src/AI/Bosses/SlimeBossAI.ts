import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import FalseStatus from "../GOAP/FalseStatus";
import { BOSS_GOAL, BossAction, BossBehavior, BossController } from "./Boss";
import Idle from "./BossActions/Idle";
import JumpTo from "./BossActions/JumpTo";
import Shoot from "./BossActions/Shoot";

export const SlimeActions = {
    IDLE: "IDLE",
    JUMP_TO_PLAYER: "JUMP_TO_PLAYER",
    SHOOT_PLAYER: "SHOOT_PLAYER",
    SUMMON_SLIMES: "SUMMON_SLIMES",
} as const;

export type SlimeAction = typeof SlimeActions[keyof typeof SlimeActions];

/** 
 * Class that defines SlimeBehavior 
 * Empty due to SlimeBoss's simplicity
 * Any overridden function should call super.method() either at the beginning or end
 * (depending on the method)
 * @author vintydong
*/
export class SlimeBehavior extends BossBehavior {
    public initializeAI(owner: BossController, options: any): void {
        super.initializeAI(owner, options);

        // Initialize behavior
        this.addStatus(BOSS_GOAL, new FalseStatus());
        
        let jumpToPlayer = new JumpTo(this, owner);
        jumpToPlayer.addEffect(BOSS_GOAL);
        jumpToPlayer.cost = 1;
        this.addState(SlimeActions.JUMP_TO_PLAYER, jumpToPlayer);
        
        let shootPlayer = new Shoot(this, owner);
        shootPlayer.addEffect(BOSS_GOAL);
        shootPlayer.cost = 1;
        this.addState(SlimeActions.SHOOT_PLAYER, shootPlayer);

        let idle = new Idle(this, this.owner);
        idle.addEffect(BOSS_GOAL);
        idle.cost = 100;
        this.addState(SlimeActions.IDLE, idle);

        this.goal = BOSS_GOAL;

        this.initialize();
    }
}

/** 
 * Class that defines SlimeController (empty due to SlimeBoss's simplicity).
 * Any overridden function should call super.method() either at the beginning or end.
 * (depending on the method)
 * @author vintydong
*/
export class SlimeController extends BossController {

}