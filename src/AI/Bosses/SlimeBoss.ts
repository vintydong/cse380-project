import { CustomGameEvents } from "../../CustomGameEvents";
import Level from "../../Scenes/Level";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import { BasicEnemyController } from "../BasicEnemyController";
import { Air, Dead, EnemyState, Ground } from "../demo_enemy/EnemyStates";

enum SlimeAnimations {
    IDLE = "IDLE",
    RUNNING_LEFT = "RUNNING_LEFT",
    RUNNING_RIGHT = "RUNNING_RIGHT",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum SlimeBossStates {
    GROUND = "GROUND",
    AIR = "AIR",
    DEAD = "DEAD",
}

class SlimeGround extends EnemyState {
    private dir: number = null;
    private time: number = 100;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = 750;
    }

    public update(deltaT: number): void {
        if (this.dir && this.time > 0) {
            this.owner.move(this.parent.velocity.scaled(deltaT));
            this.time -= 1;
        }
        else {
            this.time = 100;
            this.dir = (Math.random() - 0.5) * this.parent.speed;
            this.parent.velocity.x = this.dir;
            console.log("move", this.parent.velocity.x, this.parent.velocity.y);
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class SlimeBossController extends BasicEnemyController {
    protected override owner: SlimeBossActor;
    
    // protected _maxHealth: number = 100;
    // protected _health: number = 100;
    // protected _speed: number = 100;
    // protected _velocity: Vec2;
    // protected _gravity: number = 1000;

    public initializeAI(owner: SlimeBossActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.velocity = Vec2.ZERO;
        this.MAX_SPEED = 1000;
        this.MIN_SPEED = 500;
        this.speed = this.MIN_SPEED

        this.addState(SlimeBossStates.AIR, new Air(this, this.owner));
        this.addState(SlimeBossStates.GROUND, new SlimeGround(this, this.owner));
        this.addState(SlimeBossStates.DEAD, new Dead(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);
        this.initialize(SlimeBossStates.AIR);
    }

    public activate(options: Record<string, any>): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case CustomGameEvents.ENEMY_HIT:
                // console.log(event.data);
                let id = event.data.get('node');
                if (id === this.owner.id) {
                    this.owner.position = new Vec2(3000, 3000);
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

export class SlimeBossActor extends AnimatedSprite {
    protected scene: Level

    // Key for the navmesh to use to build paths
    protected _navkey: string;

    public override setScene(scene: Level): void { this.scene = scene; }
    public override getScene(): Level { return this.scene; }

    public get navkey(): string { return this._navkey; }
    public set navkey(navkey: string) { this._navkey = navkey; }
}