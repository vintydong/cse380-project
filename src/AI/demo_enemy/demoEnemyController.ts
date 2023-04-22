import { CustomGameEvents } from "../../CustomGameEvents";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import { BasicEnemyController } from "../BasicEnemyController";
import { PlayerControls, PlayerStates } from "../Player/PlayerController";
import { Air, Dead, EnemyStates, Ground } from "./EnemyStates";
import demoEnemyActor from "./demoEnemyActor";

export enum demoEnemyAnimations {
    IDLE = "IDLE",
    RUNNING_LEFT = "RUNNING_LEFT",
    RUNNING_RIGHT = "RUNNING_RIGHT",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",    
}

export default class demoEnemyController extends BasicEnemyController  {

    protected override owner: demoEnemyActor;
    protected tilemap: OrthogonalTilemap;

    /** 
     * Attributes for the Eneemy
     */
    public MAX_SPEED = 200;
    public MIN_SPEED = 100;

    public initializeAI(owner: demoEnemyActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.speed = 200;
        this.velocity = Vec2.ZERO;
        // this.receiver.subscribe(ItemEvent.LASERGUN_FIRED);

        this.addState(EnemyStates.DEAD, new Dead(this, this.owner));
        this.addState(EnemyStates.GROUND, new Ground(this, this.owner));
        this.addState(EnemyStates.AIR, new Air(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);
        this.initialize(EnemyStates.AIR);
    }

    public activate(options: Record<string, any>): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case CustomGameEvents.ENEMY_HIT:
                // console.log(event.data);
                let id = event.data.get('node');
                if(id === this.owner.id){
                    this.owner.position = new Vec2(3000,3000);
                    this.owner.visible = false;
                }
                break;
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }    
}