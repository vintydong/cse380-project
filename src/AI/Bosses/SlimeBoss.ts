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
    RUNNING = "RUNNING",
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
    private time: number = 0;
    private jumping: boolean = false;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = 750;
    }

    public update(deltaT: number): void {
        super.update(deltaT);
        this.owner.move(this.parent.velocity.scaled(deltaT));

        if (this.time > 0 && !this.jumping) {
            this.time -= 1;
        }
        
        if (!this.owner.onGround && (this.owner.onCeiling || this.parent.velocity.y > 0)){
            this.jumping = false;
            return this.finished(SlimeBossStates.AIR);
		} else if (this.parent.velocity.y < 0) {
            this.parent.velocity.y += this.parent.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }

        if (!this.jumping && this.time <= 0) {
            let r = Math.random();
            if (r < .15){
                this.time = 100;
                this.dir = (Math.random() - 0.5) * this.parent.speed;
                this.parent.velocity.x = this.dir;
            }
            else if (r < .65){
                let scene = this.owner.getScene() as Level;
                let player = scene.getPlayer().position.clone();
                let dir = this.owner.position.dirTo(player);
                this.parent.velocity.x = dir.x;
                this.parent.velocity.y = -2;
                this.parent.velocity.scaleTo(this.parent.speed);
                this.jumping = true;
            }
            else // Add attack here
                this.parent;
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class SlimeBossController extends BasicEnemyController {
    protected override owner: SlimeBossActor;

    public initializeAI(owner: SlimeBossActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.velocity = Vec2.ZERO;
        this.MAX_SPEED = 1000;
        this.MIN_SPEED = 500;
        this._health = 100;
        this.speed = this.MIN_SPEED

        this.addState(SlimeBossStates.AIR, new Air(this, this.owner));
        this.addState(SlimeBossStates.GROUND, new SlimeGround(this, this.owner));
        this.addState(SlimeBossStates.DEAD, new Dead(this, this.owner));

        // this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);
        this.receiver.subscribe('DAMAGE_ENEMY');
        this.initialize(SlimeBossStates.AIR);
        console.log(this);
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
            case 'DAMAGE_ENEMY':
                // break;
                // case CustomGameEvents.ENEMY_HIT:
                let id = event.data.get('node');
                let dmg = event.data.get('damage')
                console.log("SLIMEBOSS: ENEMY HIT", id, dmg, this.owner.id);
                if (id === this.owner.id) {
                    console.log("DAMAGE", dmg)
                    // this.owner.position = new Vec2(3000, 3000);
                    // this.owner.visible = false;
                    this.takeDamage(dmg);
                }
                break;
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    public takeDamage(damage: number){
        this.health = this.health - damage;
        console.log("AFTER DAMG:", this.health)
        if(this.health <= 0){
            console.log("DEAD");
            this.owner.position = new Vec2(3000, 3000);
            this.owner.visible = false;
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