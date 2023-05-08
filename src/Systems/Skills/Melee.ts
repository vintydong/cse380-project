import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import { LevelLayers } from "../../Scenes/Level";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import CheatManager from "../CheatManager";
import { SkillManager } from "../SkillManager";
import Skill from "./Skill";

/**
 * A class that represents a melee attack that can be used by the player
 * @author vintydong
 */
export default class Melee extends Skill {
    private hitbox: Sprite;
    public static readonly MELEE_SPRITE_KEY = "MELEE_SPRITE_KEY";
    public static readonly MELEE_SPRITE_PATH = "assets/sprites/attacks/melee.png";

    public static readonly MELEE_ICON_KEY = "MELEE_ICON_KEY";
    public static readonly MELEE_ICON_PATH = "assets/sprites/icons/melee_icon.png";

    public constructor(skill_manager: SkillManager) {
        let damage = [20, 30, 40];
        let cooldown = [new Timer(800), new Timer(600), new Timer(400)];
        let cost = [0, 0, 0];
        let description = ['Swings sword at enemy', 'Increase DMG and reduce CD', 'Greatly increase DMG'];

        super(skill_manager, damage, cooldown, cost, description, Melee.MELEE_ICON_KEY);
        this.level = 0;
    }

    public initialize(){
        let scene = this.skill_manager.getScene();

        this.cooldown = [new Timer(800), new Timer(600), new Timer(400)];
        
        this.hitbox = scene.add.sprite(Melee.MELEE_SPRITE_KEY, LevelLayers.PRIMARY)
        this.hitbox.scale = new Vec2(3,3);
        this.hitbox.visible = false;

        this.hitbox.addAI(MeleeBehavior);

        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.WEAPON);
        this.hitbox.setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);

        // Add tween to particle
        this.hitbox.tweens.add("fadeout", {
            startDelay: 0,
            duration: 200,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ],
            onEnd: 'MELEE_ATTACK_END',
        });
    }

    public activate(options?: Record<string, any>) {
        const { direction } = options;
        // Bring this basic attack to life
        this.hitbox.visible = true;
        this.hitbox.alpha = 1;

        // Calculate basic attack offset from player center
        let newPosition = this.skill_manager.getPlayer().position.clone();
        let xOffset = this.hitbox.boundary.getHalfSize().x
        newPosition.x += (direction == "left") ? -1 * xOffset : xOffset;
        this.hitbox.position = newPosition;

        this.cooldown[this.level].start();

        this.hitbox.setAIActive(true, {direction: direction, damage: this.damage[this.level]});
        this.hitbox.tweens.play("fadeout");
    }
}

/**
 * A class that represents the behavior of the melee attack in the HW2Scene
 * @author HenryLam
 */
export class MeleeBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Sprite;
    private receiver: Receiver;
    private emitter: Emitter;

    // The direction to fire the bubble
    private direction: string;
    private damage: number;

    public initializeAI(owner: Sprite, options: Record<string, any>): void {
        this.owner = owner;

        this.emitter = new Emitter();
        this.receiver = new Receiver();
        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);
        this.receiver.subscribe('MELEE_ATTACK_END');

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        // console.log(options);
        if (options) {
            this.damage = options.damage || 10;
            this.direction = options.direction;
        }
        this.owner.invertX = (this.direction == "left") ? true : false;
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case 'MELEE_ATTACK_END':
                this.owner.position.copy(Vec2.ZERO);
                this.owner._velocity.copy(Vec2.ZERO);
                this.owner.visible = false;
                break;
            case CustomGameEvents.ENEMY_HIT:
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Hit an enemy with Melee", event.data);
                    let damage = CheatManager.getInstance().getInfiniteDamage() ? 999 : this.damage;
                    this.emitter.fireEvent(CustomGameEvents.ENEMY_DAMAGE, {node: event.data.get('node'), damage: damage});
                    this.owner.position.copy(Vec2.ZERO);
                    this.owner._velocity.copy(Vec2.ZERO);
                    this.owner.visible = false;
                }
                break;
            default: {
                throw new Error("Unhandled event caught in MeleeBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }    
}


