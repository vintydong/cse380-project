import PlayerParticleSystem from "../../AI/Player/PlayerParticleSystem";
import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import { LevelLayers } from "../../Scenes/Level";
import ParticleShaderType from "../../Shaders/ParticleShaderType";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { SkillManager } from "../SkillManager";
import Skill from "./Skill";

/**
 * A class that represents a ranged attack that can be used by the player
 * @author vintydong
 */
export default class Slash extends Skill {
    private weaponParticles: PlayerParticleSystem;
    private hitbox: Sprite;
    public static readonly SLASH_SPRITE_KEY = "SLASH_SPRITE_KEY";
    public static readonly SLASH_SPRITE_PATH = "assets/sprites/attacks/ranged.png";

    public static readonly SLASH_ICON_KEY = "SLASH_ICON_KEY";
    public static readonly SLASH_ICON_PATH = "assets/sprites/icons/slash_icon.png";

    public constructor(skill_manager: SkillManager) {
        let damage = [15, 30, 45];
        let cooldown = [new Timer(1000), new Timer(900), new Timer(800)];
        let cost = [0, 0, 0];
        let description = ['Sends a slash of dark energy', 'Increase damage and slightly reduce cooldown', 'Greatly increase damage'];

        super(skill_manager, damage, cooldown, cost, description, Slash.SLASH_ICON_KEY);
    }

    public initialize() {
        let scene = this.skill_manager.getScene();

        this.hitbox = scene.add.sprite(Slash.SLASH_SPRITE_KEY, LevelLayers.PRIMARY)
        this.hitbox.scale = new Vec2(2,2);
        this.hitbox.visible = false;

        this.hitbox.addAI(SlashBehavior);

        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.WEAPON);
        this.hitbox.setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);

        this.hitbox.tweens.add("fadeout", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0.35,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ],
            onEnd: 'SLASH_ATTACK_END',
        });

        // Init particle system of 50 particles
        // const particle_size = 5;
        // this.weaponParticles = new PlayerParticleSystem(50, Vec2.ZERO, 2000, particle_size, 0, 50);
        // this.weaponParticles.initializePool(scene, LevelLayers.PRIMARY);

        // let pool = this.weaponParticles.getPool();

        // for (let i = 0; i < this.weaponParticles.getPool().length; i++) {
        //     pool[i].useCustomShader(ParticleShaderType.KEY);
        //     pool[i].visible = false;
        //     pool[i].color = Color.BLUE;

        //     // Give the particles AI
        //     pool[i].addAI(SlashBehavior);

        //     // Give the particles a collider
        //     let collider = new Circle(Vec2.ZERO, particle_size*particle_size);
        //     pool[i].setCollisionShape(collider);
        //     pool[i].addPhysics();
        //     pool[i].setGroup(PhysicsGroups.WEAPON);
        //     pool[i].setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);
        // }
    }

    public activate(options?: Record<string, any>) {
        const { direction } = options;
        // Bring this ranged attack to life
        if (!this.hitbox.visible) {
            this.hitbox.visible = true;
            this.hitbox.alpha = 1;
            this.hitbox.position = this.skill_manager.getPlayer().position.clone();

            this.cooldown[this.level].start();
            
            this.hitbox.setAIActive(true, {direction: direction, damage: this.damage});
            this.hitbox.tweens.play("fadeout");
        }

       // Find the first visible particle
       // this.weaponParticles.startSystem(2000, 0, this.skill_manager.getPlayer().position.clone());
    //    let particle: Particle = this.weaponParticles.getPool().find((bubble: Particle) => { return !bubble.visible });
    //    if (particle) {
    //        // Bring this bubble to life
    //        particle.visible = true;
    //        particle.position = this.skill_manager.getPlayer().position.clone();
    //        particle.setAIActive(true, { direction: direction });
    //    }
    }
}

/**
 * A class that represents the behavior of the ranged attack
 */
export class SlashBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Sprite;
    private receiver: Receiver;
    private emitter: Emitter;

    // The direction to fire the bubble
    private direction: string;

    // The current horizontal and vertical speed of the bubble
    private currentXSpeed: number;
    private currentYSpeed: number;

    // How much to increase the speed of the bubble by each frame
    private xSpeedIncrement: number;

    // Upper and lower bounds on the horizontal speed of the bubble
    private minXSpeed: number;
    private maxXSpeed: number;

    private damage: number;

    public initializeAI(owner: Sprite, options: Record<string, any>): void {
        this.owner = owner;

        this.receiver = new Receiver();
        this.emitter = new Emitter();
        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);
        this.receiver.subscribe('SLASH_ATTACK_END');

        this.currentXSpeed = 300;
        this.xSpeedIncrement = 600;
        this.minXSpeed = 300;
        this.maxXSpeed = 1500;

        this.activate(options);
    }

    public destroy(): void {

    }

    public activate(options: Record<string, any>): void {
        // console.log(options);
        if (options) {
            this.currentXSpeed = 300;
            this.direction = options.direction;
            this.damage = options.damage;
        }
        this.owner.invertX = (this.direction == "left") ? true : false;
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case 'SLASH_ATTACK_END':
                this.owner.position.copy(Vec2.ZERO);
                this.owner._velocity.copy(Vec2.ZERO);
                this.owner.visible = false;
                break;
            case CustomGameEvents.ENEMY_HIT:
                let id = event.data.get('other');
                if (id === this.owner.id) {
                    console.log("Hit an enemy with Slash", event.data);
                    this.emitter.fireEvent(CustomGameEvents.ENEMY_DAMAGE, {node: event.data.get('node'), damage: this.damage});    
                    this.owner.position.copy(Vec2.ZERO);
                    this.owner._velocity.copy(Vec2.ZERO);
                    this.owner.visible = false;
                }
                break;
            default: {
                throw new Error("Unhandled event caught in SlashBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        // Only update the particle if it's visible
        if (this.owner.visible) {
            // Increment the speeds
            this.currentXSpeed += this.xSpeedIncrement * deltaT;

            // Clamp the speeds if need be
            this.currentXSpeed = MathUtils.clamp(this.currentXSpeed, this.minXSpeed, this.maxXSpeed)

            // Update position of the particle - Scale up and move left
            let value = (this.direction == "left") ? Vec2.LEFT.scale(this.currentXSpeed * deltaT) : Vec2.RIGHT.scale(this.currentXSpeed * deltaT);
            this.owner.position.add(value);
        }
    }
}