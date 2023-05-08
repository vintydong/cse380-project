import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import Level, { LevelLayers } from "../../Scenes/Level";
import Level6 from "../../Scenes/Level6";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Receiver from "../../Wolfie2D/Events/Receiver";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { BasicEnemyController } from "../BasicEnemyController";
import { TalonActor, TalonController } from "../Enemies/Talon";
import { EnemyState } from "../demo_enemy/EnemyStates";

/**
 * Lich Outline
 * 
 * Lore Description
 * 1. Intelligent, powerful, immortal wizard
 * 2. Summons the less intelligent undead
 * 3. Horcruxes
 * 
 * General Behavior
 * 1. Teleport to another platform based on hp loss/random intervals
 * 2. Each platform enables a different attack
 * 3. Should player be damaged when touching the lich? Enough platform space?
 * 
 * Abilities - Tarot based
 * 1. Wands - Shoot skulls at player
 * 2. Pentacles - Spawn Talons
 * 3. Cups - Rain green fire / cups
 * 4. Swords - Swords move from map corners towards player
 * 
 * Phase 1 - Above 50% Health
 * 1. Wands - 10 skulls directly towards player
 * 2. Pentacles - Spawn 2 talons
 * 3. Cups - Rain 5 cups
 * 4. Swords - 1 wave of 4 swords come from map corners
 * 
 * Phase 2 - Below 50% Health
 * 1. Wands - Skulls in a cone pattern
 * 2. Pentacles - Spawn 3 or 4 talons
 * 3. Cups - Rain 5 cups, 5 cups rise up
 * 4. Swords - 3 waves of 4 swords come from map corners and mid-lines
 */

enum LichAnimations {
    IDLE = "IDLE",
    ATTACKING = "ATTACKING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum LichStates {
    IDLE = "IDLE",
    ATTACKING = "ATTACKING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum LichAttacks {
    WANDS = 0,
    PENTACLES = 1,
    CUPS = 2,
    SWORDS = 3,
}

/**
 * Classes that represents the Lich boss
 * @author HenryLam
 */
class LichIdle extends EnemyState {
    protected override parent: LichController;
    protected attack: number;

    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(LichAnimations.IDLE);

        // Up the difficulty >:)
        if (this.parent.health <= this.parent.maxHealth/2) { this.parent.maxProjectiles = 8; }
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        // Handle Freeze
        if (this.owner.frozen) { return; }

        // Update facing
        let player = this.parent.target.position
        this.parent.facing = (player.x < this.owner.position.x) ? 0 : 1

        // Don't fire on cooldown / game paused
        if (this.parent.cooldown.isStopped()) {
            // Get random platform
            let scene = (this.owner.getScene() as Level6)
            let newPlatform = scene.getNewRandomPlatform(this.owner.position)
            this.parent.currentAttack = newPlatform.index
            this.owner.position = newPlatform.position

            // Switch to attack
            this.finished(LichStates.ATTACKING);
        }

        this.owner.move(this.parent.velocity.scaled(deltaT));

    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class LichAttacking extends EnemyState {
    protected override parent: LichController
    private player: Vec2
    private curPos: Vec2
    private offSet: number;

    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(LichAnimations.ATTACKING);
        this.player = this.parent.target.position
        this.curPos = this.owner.position.clone()
        this.offSet = (8 * 6 * 3);  // Tile pixels * scale * # tiles
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        var delay = 0;
        // this.parent.currentAttack = LichAttacks.SWORDS;
        switch(this.parent.currentAttack){
            case LichAttacks.WANDS:
                console.log("lich firing WANDS")
                for (let i = 0; i < this.parent.maxProjectiles; i++) {
                    this.parent.wandProjectiles[i].activate({
                        spawn: this.curPos, 
                        delay: delay,
                        direction: this.curPos.dirTo(this.player)
                    });
                    delay += 250;
                }
                break;

            case LichAttacks.PENTACLES: // Bug where hitboxes leave enemy. USE POSITION.SET
                console.log("lich firing PENTACLES")
                for (let i = 0; i < this.parent.maxProjectiles/2; i++) {
                    let talon = this.parent.pentacleProjectiles[i]
                    if (!talon.visible)
                    {
                        (talon.ai as TalonController).activate({
                            spawn: this.curPos, 
                            delay: delay, 
                            direction: this.curPos.dirTo(this.player)
                        })
                        talon.visible = true;
                        delay += 1000;
                    }
                }
                break;
            case LichAttacks.CUPS:
                console.log("lich firing CUPS")
                let newSpawn = Vec2.ZERO;
                var left = 0 + this.offSet;
                var right = (8 * 6 * 30) - this.offSet;
                let chunk = (right - left)/this.parent.maxProjectiles;
                newSpawn.add(new Vec2(this.offSet + chunk/2, this.offSet));
                for (let i = 0; i < this.parent.maxProjectiles; i++) {
                    this.parent.cupProjectiles[i].activate({
                        spawn: newSpawn.clone(), 
                        delay: delay,
                        direction: new Vec2(0, 1)
                    });
                    newSpawn.x += chunk
                    delay += 500
                }
                break;
            case LichAttacks.SWORDS:
                console.log("lich firing SWORDS")
                var left = 0 + this.offSet;
                var up = 0 + this.offSet;
                var right = (8 * 6 * 30) -  this.offSet;
                var down = (8 * 6 * 18) -  this.offSet;
                var xMid = (left + right) / 2;
                var yMid = (up + down) / 2;
                let perpendiculars = [
                    // CORNERS
                    new Vec2(up, left), new Vec2(right, up), new Vec2(left, down), new Vec2(right, down),
                    // CROSS
                    new Vec2(xMid,up), new Vec2(xMid, down), new Vec2(left, yMid), new Vec2(right, yMid)
                ]
                for (let i = 0; i < this.parent.maxProjectiles; i++) {
                    this.parent.swordProjectiles[i].activate({
                        spawn: perpendiculars[i],
                        direction: perpendiculars[i].dirTo(this.player)
                    });
                }
                break;
            default:
                throw new Error("Unhandled attack type in Lich Attacking");
        }
        this.parent.cooldown.start();
        this.finished(LichStates.IDLE);
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class LichTakingDamage extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(LichAnimations.TAKING_DAMAGE);
    }

    public update(deltaT: number): void {
        // Leave state when animation finishes playing
        // If enemy tanks too much from i-frames, reduce animation time
        if (!this.owner.animation.isPlaying(LichAnimations.TAKING_DAMAGE)){
            this.finished(LichStates.IDLE);
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class LichDead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        // Non collidable dead body
        this.owner.disablePhysics();
        this.owner.animation.play(LichAnimations.DEAD);
        let deathAudio = (this.owner.getScene() as Level6).getLichDyingAudioKey();
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: deathAudio, loop: false, holdReference: false});
    }

    public update(deltaT: number): void { 
        if (!this.owner.animation.isPlaying(LichAnimations.DEAD)){
            this.deathCleanup()
        }
    }
    
    public deathCleanup(): void {
        this.owner.position = new Vec2(3000, 3000);
        this.owner.visible = false;
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class LichController extends BasicEnemyController {
    protected override owner: LichActor;
    protected _target: AnimatedSprite;
    protected _currentAttack: number;
    protected _cooldown: Timer;
    protected _maxProjectiles: number;
    protected _wandProjectiles: Array<WandProjectile>;
    protected _pentacleProjectiles: Array<AnimatedSprite>;
    protected _cupProjectiles: Array<CupProjectile>;
    protected _swordProjectiles: Array<SwordProjectile>;

    public initializeAI(owner: LichActor, options: Record<string, any>): void {
        // Initialize Lich
        super.initializeAI(owner, options);
        this.target = this.owner.getScene().getPlayer();
        this.cooldown = new Timer(5000);

        // Initialize Stats
        this.maxHealth = 200;
        this.health = 200;
        this.MIN_SPEED = 50;
        this.MAX_SPEED = 50;
        this.velocity = Vec2.ZERO;
        this.speed = this.MIN_SPEED;
        
        // Initialize Projectiles
        this.maxProjectiles = 8;
        // Wands
        this.wandProjectiles = new Array(this.maxProjectiles);
        for (let i = 0; i < this.wandProjectiles.length; i++){
            this._wandProjectiles[i] = new WandProjectile(this, this.owner);
        }
        // Pentacles (Talons)
        this.pentacleProjectiles = new Array(this.maxProjectiles/2);
        let factory = (this.owner.getScene().factory);
        for (let i = 0; i < this.maxProjectiles/2; i++) {
            let enemy = factory.addAnimatedSprite(TalonActor, Level6.TALON_SPRITE_KEY, LevelLayers.PRIMARY) as TalonActor
            enemy.scale.set(2, 2);
            enemy.position.set(3000,3000);
            enemy.visible = false;
            
            enemy.addPhysics(new AABB(enemy.position.clone(), enemy.boundary.getHalfSize().clone()));
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
            enemy.navkey = "navmesh";

            enemy.addAI(TalonController, { tilemap: Level6.TILEMAP_KEY });
            enemy.animation.play("IDLE");
            this._pentacleProjectiles[i] = enemy;
        }
        // Cups
        this.cupProjectiles = new Array(this.maxProjectiles);
        for (let i = 0; i < this.cupProjectiles.length; i++){
            this._cupProjectiles[i] = new CupProjectile(this, this.owner);
        }

        // Swords
        this.swordProjectiles = new Array(this.maxProjectiles);
        for (let i = 0; i < this.swordProjectiles.length; i++){
            this._swordProjectiles[i] = new SwordProjectile(this, this.owner);
        }

        this.maxProjectiles = 4;

        // Add States
        this.addState(LichStates.IDLE, new LichIdle(this, this.owner));
        this.addState(LichStates.ATTACKING, new LichAttacking(this, this.owner));
        this.addState(LichStates.TAKING_DAMAGE, new LichTakingDamage(this, this.owner));
        this.addState(LichStates.DEAD, new LichDead(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_DAMAGE);

        this.initialize(LichStates.IDLE);
    }

    public activate(options: Record<string, any>): void { }

    public update(deltaT: number): void {
        super.update(deltaT);

        // this.handleFreeze(); 
    }

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case CustomGameEvents.ENEMY_DAMAGE:
                let id = event.data.get('node');
                let dmg = event.data.get('damage')
                if (id === this.owner.id) {
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
        this.health -= damage;
        console.log(this.health);   
        if(this.health <= 0){
            this.changeState(LichStates.DEAD)
        }
        else {
            this.changeState(LichStates.TAKING_DAMAGE)
        }
    }

    public handleFreeze(): void {
        // this.owner.getScene().getLayer(LevelLayers.PRIMARY).isPaused()
        // Freeze projectiles if paused
        if (this.owner.frozen) { 
            // for (let i = 0; i < this.projectiles.length; i++) {
            //     this.projectiles[i].getHitbox().freeze(); 
            //     this.projectiles[i].getHitbox().animation.pause();
            // }
        }
        else { 
            // for (let i = 0; i < this.projectiles.length; i++) {
            //     this.projectiles[i].getHitbox().unfreeze(); 
            //     this.projectiles[i].getHitbox().animation.resume();
            // }
        }
    }

    /** Getters and Setters to enable access in PlayerStates */
    public get target(): AnimatedSprite { return this._target; }
    public set target(target: AnimatedSprite) { this._target = target; }

    public get currentAttack(): number { return this._currentAttack; }
    public set currentAttack(currentAttack: number) { this._currentAttack = currentAttack; }
    
    public get cooldown(): Timer { return this._cooldown; }
    public set cooldown(cooldown: Timer) { this._cooldown = cooldown; }
    
    public get maxProjectiles(): number { return this._maxProjectiles; }
    public set maxProjectiles(maxProjetiles: number) { this._maxProjectiles = maxProjetiles; }

    public get wandProjectiles(): Array<WandProjectile> { return this._wandProjectiles; }
    public set wandProjectiles(wandProjectiles: Array<WandProjectile>) { this._wandProjectiles = wandProjectiles; }

    public get pentacleProjectiles(): Array<AnimatedSprite> { return this._pentacleProjectiles; }
    public set pentacleProjectiles(pentacleProjectiles: Array<AnimatedSprite>) { this._pentacleProjectiles = pentacleProjectiles; }

    public get cupProjectiles(): Array<CupProjectile> { return this._cupProjectiles; }
    public set cupProjectiles(cupProjectiles: Array<CupProjectile>) { this._cupProjectiles = cupProjectiles; }

    public get swordProjectiles(): Array<SwordProjectile> { return this._swordProjectiles; }
    public set swordProjectiles(swordProjectiles: Array<SwordProjectile>) { this._swordProjectiles = swordProjectiles; }


}

export class LichActor extends AnimatedSprite {
    protected scene: Level

    // Key for the navmesh to use to build paths
    protected _navkey: string;

    public override setScene(scene: Level): void { this.scene = scene; }
    public override getScene(): Level { return this.scene; }

    public get navkey(): string { return this._navkey; }
    public set navkey(navkey: string) { this._navkey = navkey; }
}

export abstract class LichProjectile {
    protected actor: LichActor
    protected controller: LichController
    protected hitbox: AnimatedSprite
    protected damage: number

    public constructor(controller: LichController, actor: LichActor) {
        this.actor = actor;
        this.controller = controller;
        this.damage = 10;
        this.initialize();
    }

    public abstract initialize(): void;

    public activate(options?: Record<string, any>) {
        const { spawn, delay, direction } = options;
        this.hitbox.invertX = (direction.x < 0) ? true : false;
        this.hitbox.invertY = (direction.y < 0) ? true : false;
        
        // Bring this projectile to life
        if (!this.hitbox.visible){
            if (delay) { 
                let timer = new Timer(delay, () => this.spawn(spawn, direction))
                timer.start();
            }
            else 
                this.spawn(spawn, direction)
        }
    }

    public spawn = (spawn: Vec2, direction: Vec2) => {
        this.hitbox.visible = true;
        this.hitbox.position.set(spawn.x, spawn.y);
        // this.hitbox.rotation = rotation;
        this.hitbox.setAIActive(true, {direction: direction, damage: this.damage});
    }

    /** Getters and Setters */
    public getHitbox(): AnimatedSprite { return this.hitbox; }
    
}

export class LichProjectileAI implements AI {
    // The GameNode that owns this behavior
    protected owner: AnimatedSprite;
    protected receiver: Receiver;
    protected emitter: Emitter;

    // The direction to fire the projectile
    protected direction: Vec2;

    // The current horizontal and vertical speed of the projectile
    protected currentXSpeed: number;
    protected currentYSpeed: number;

    // How much to increase the speed of the projectile by each frame
    protected speedIncrement: number;

    // Upper and lower bounds on the speeds of the projectile
    protected minXSpeed: number;
    protected maxXSpeed: number;
    protected minYSpeed: number;
    protected maxYSpeed: number;

    protected damage: number;

    public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.emitter = new Emitter();
        this.receiver = new Receiver();

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        if (options) {
            this.damage = options.damage;
            this.direction = options.direction;
        }
        this.owner.animation.play("ACTIVE");
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            default: {
                throw new Error("Unhandled event caught in LichProjectile! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Update projectile behavior if visible
        if (this.owner.visible) {
            // Despawn if collided with environment
            let inScene = this.owner.getScene().getViewport().includes(this.owner);
            if (this.owner.onWall || this.owner.onCeiling || this.owner.onGround || !inScene) {
                this.despawnProjectile();
            }

            // Increment the speeds
            this.currentXSpeed += this.speedIncrement * deltaT;
            this.currentYSpeed += this.speedIncrement * deltaT;

            // Clamp the speeds if need be
            this.currentXSpeed = MathUtils.clamp(this.currentXSpeed, this.minXSpeed, this.maxXSpeed);
            this.currentYSpeed = MathUtils.clamp(this.currentYSpeed, this.minYSpeed, this.maxYSpeed);

            // Move projectile towards target
            let value = new Vec2(this.currentXSpeed * this.direction.x, this.currentYSpeed * this.direction.y);
            this.owner.move(value.scaled(deltaT));
        }
    }    

    public despawnProjectile(): void {
        this.owner.position.copy(new Vec2(600, 0));
        this.owner._velocity.copy(Vec2.ZERO);
        this.owner.visible = false;
    }
}

export class WandProjectile extends LichProjectile {
    public constructor(controller: LichController, actor: LichActor) {
        super(controller, actor);
    }
    
    public initialize() {
        let scene = this.actor.getScene();
        
        // Add projectile to scene
        this.hitbox = scene.add.animatedSprite("LICH_WAND_KEY", LevelLayers.PRIMARY)
        this.hitbox.scale = new Vec2(1, 1);
        this.hitbox.visible = false;

        this.hitbox.addAI(WandProjectileAI)
        // Add physics
        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.NPC_PROJECTILE);

        // Customize AI and Events
        this.hitbox.setTrigger(PhysicsGroups.PLAYER, "WAND_HIT", null);
    }

    public activate(options?: Record<string, any>) {
        super.activate(options);
    }
}

export class WandProjectileAI extends LichProjectileAI {
    public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.receiver.subscribe("WAND_HIT");

        // Modify values here
        this.currentXSpeed = 100;
        this.currentYSpeed = 100;
        this.speedIncrement = 200;
        this.minXSpeed = 100;
        this.maxXSpeed = 500;
        this.minYSpeed = 100;
        this.maxYSpeed = 500;

        this.activate(options);
    }

    public activate(options: Record<string, any>): void {
        super.activate(options);

        // Reset speed
        this.currentXSpeed = 100;
        this.currentYSpeed = 100;
    }

    public handleEvent(event: GameEvent): void {
        console.log(event.type);
        switch(event.type) {
            case "WAND_HIT":
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Player hit with WAND", event.data);
                    this.emitter.fireEvent(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION, {node: event.data.get('node'), damage: this.damage});
                    this.despawnProjectile();
                }
                break;
            default: {
                super.handleEvent(event)
                throw new Error("Unhandled event caught in WandsAI! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        super.update(deltaT);
    }
}

export class CupProjectile extends LichProjectile {
    public constructor(controller: LichController, actor: LichActor) {
        super(controller, actor);
    }
    
    public initialize() {
        let scene = this.actor.getScene();
        
        // Add projectile to scene
        this.hitbox = scene.add.animatedSprite("LICH_CUP_KEY", LevelLayers.PRIMARY)
        this.hitbox.scale = new Vec2(3, 3);
        this.hitbox.visible = false;

        // Add physics
        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.NPC_PROJECTILE);

        // Customize AI and Events
        this.hitbox.addAI(CupProjectileAI)
        this.hitbox.setTrigger(PhysicsGroups.PLAYER, "CUP_HIT", null);
    }

    public activate(options?: Record<string, any>) {
        super.activate(options);
    }
}

export class CupProjectileAI extends LichProjectileAI {
    public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.receiver.subscribe("CUP_HIT");

        // Modify values here
        this.currentXSpeed = 0;
        this.currentYSpeed = 0;
        this.speedIncrement = 500;
        this.minXSpeed = 0;
        this.maxXSpeed = 0;
        this.minYSpeed = 0;
        this.maxYSpeed = 500;
    }

    public activate(options: Record<string, any>): void {
        super.activate(options);

        // Reset speed
        this.currentYSpeed = 0;
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "CUP_HIT":
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Player hit with CUP", event.data);
                    this.emitter.fireEvent(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION, {node: event.data.get('node'), damage: this.damage});
                    this.despawnProjectile();
                }
                break;
            default: {
                super.handleEvent(event)
                throw new Error("Unhandled event caught in CupsAI! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        super.update(deltaT);
    }
}

export class SwordProjectile extends LichProjectile {
    public constructor(controller: LichController, actor: LichActor) {
        super(controller, actor);
    }
    
    public initialize() {
        let scene = this.actor.getScene();
        
        // Add projectile to scene
        this.hitbox = scene.add.animatedSprite("LICH_SWORD_KEY", LevelLayers.PRIMARY)
        this.hitbox.scale = new Vec2(1, 1);
        this.hitbox.visible = false;

        // Add physics
        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.NPC_PROJECTILE);

        // Customize AI and Events
        this.hitbox.addAI(SwordProjectileAI)
        this.hitbox.setTrigger(PhysicsGroups.PLAYER, "SWORD_HIT", null);
    }

    public activate(options?: Record<string, any>) {
        super.activate(options);
    }
}

export class SwordProjectileAI extends LichProjectileAI {
    public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.receiver.subscribe("SWORD_HIT");

        // Modify values here
        this.currentXSpeed = 50;
        this.currentYSpeed = 50;
        this.speedIncrement = 100;
        this.minXSpeed = 100;
        this.maxXSpeed = 300;
        this.minYSpeed = 100;
        this.maxYSpeed = 300;
    }

    public activate(options: Record<string, any>): void {
        super.activate(options);

        // Reset speed
        this.currentXSpeed = 50;
        this.currentYSpeed = 50;
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "SWORD_HIT":
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Player hit with SWORD", event.data);
                    this.emitter.fireEvent(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION, {node: event.data.get('node'), damage: this.damage});
                    this.despawnProjectile();
                }
                break;
            default: {
                super.handleEvent(event)
                throw new Error("Unhandled event caught in SwordsAI! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        super.update(deltaT);
    }
}