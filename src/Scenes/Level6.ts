import { LichActor, LichController } from "../AI/Bosses/Lich";
import { TalonActor, TalonController } from "../AI/Enemies/Talon";
import { CustomGameEvents } from "../CustomGameEvents";
import { PhysicsGroups } from "../Physics";
import Repel from "../Systems/Skills/Repel";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import Level, { LevelLayers } from "./Level";
import MainMenu from "./MenuScenes/MainMenu";

export default class Level6 extends Level {   
    // Level Keys
    public static readonly TILEMAP_KEY = "Level6";
    public static readonly TILEMAP_PATH = "assets/tilemaps/Level6_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "assets/music/level6_music.mp3";  // Royalty free music from https://www.chosic.com/free-music/dark/

    // Lich Keys 
    public static readonly LICH_SPRITE_KEY = "LICH_SPRITE_KEY";
    public static readonly LICH_SPRITE_PATH = "assets/spritesheets/Bosses/Lich/Lich.json";
    public static readonly LICH_POSITION_KEY = "LICH_POSITION_KEY";

    public static readonly LICH_WAND_KEY = "LICH_WAND_KEY"
    public static readonly LICH_WAND_PATH = "assets/spritesheets/Bosses/Lich/Lich_Wand.json";

    public static readonly LICH_CUP_KEY = "LICH_CUP_KEY"
    public static readonly LICH_CUP_PATH = "assets/spritesheets/Bosses/Lich/Lich_Cup.json";

    public static readonly LICH_SWORD_KEY = "LICH_SWORD_KEY"
    public static readonly LICH_SWORD_PATH = "assets/spritesheets/Bosses/Lich/Lich_Sword.json";
    
    //Sound Effect from <a href="https://pixabay.com/sound-effects/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=80368">Pixabay</a>
    public static readonly LICH_ATTACK_AUDIO_KEY = "LICH_DYING_AUDIO_KEY";
    public static readonly LICH_ATTACK_AUDIO_PATH = "assets/sounds/lich_attack.mp3";

    //Sound Effect from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=88481">Pixabay</a>
    public static readonly LICH_DYING_AUDIO_KEY = "LICH_DYING_AUDIO_KEY";
    public static readonly LICH_DYING_AUDIO_PATH = "assets/sounds/lich_dying.mp3";  

    // Talon Keys
    public static readonly TALON_SPRITE_KEY = "TALON_SPRITE_KEY";
    public static readonly TALON_SPRITE_PATH = "assets/spritesheets/Enemies/Talon/Talon.json";

    public static readonly TALON_PROJECTILE_KEY = "TALON_PROJECTILE_KEY"
    public static readonly TALON_PROJECTILE_PATH = "assets/spritesheets/Enemies/Talon/Talon_Projectile.json";

    public static readonly TALON_DYING_AUDIO_KEY = "TALON_DYING_AUDIO_KEY";
    public static readonly TALON_DYING_AUDIO_PATH = "assets/sounds/talon_dying.wav";

    protected platFormPositions: Array<Vec2>;
    protected lichAttackAudioKey: string;
    protected lichDyingAudioKey: string;
    protected talonDyingAudioKey: string;
    
    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level6.TILEMAP_KEY;
        this.tilemapScale = Level6.TILEMAP_SCALE;
        // this.levelMusicKey = Level6.LEVEL_MUSIC_KEY;

        // Set the player's spawn
        this.playerSpawn = new Vec2(8 * 6 * 7, 8 * 6 * 8);

        // Music and sound
        this.lichAttackAudioKey = Level6.LICH_ATTACK_AUDIO_KEY;
        this.lichDyingAudioKey = Level6.LICH_DYING_AUDIO_KEY;
        this.talonDyingAudioKey = Level6.TALON_DYING_AUDIO_KEY;

        //Extras
        this.platFormPositions = [new Vec2(720, 544), new Vec2(336, 400), new Vec2(1104, 400), new Vec2(720, 256)]
    }

    /**
     * Load in our resources for demo level
     * These things should be laoded in Level 1 and then kept in the resource manager
     */
    public loadScene(): void {
        super.loadScene();
        
        /* Tilemap */
        this.load.tilemap(this.tilemapKey, Level6.TILEMAP_PATH);
                
        /* Audio and Sounds */
        this.load.audio(this.levelMusicKey, Level6.LEVEL_MUSIC_PATH)
        this.load.audio(Level6.LICH_ATTACK_AUDIO_KEY, Level6.LICH_ATTACK_AUDIO_PATH);
        this.load.audio(Level6.LICH_DYING_AUDIO_KEY, Level6.LICH_DYING_AUDIO_PATH);
        this.load.audio(Level6.TALON_DYING_AUDIO_KEY, Level6.TALON_DYING_AUDIO_PATH);

        /* AI */
        this.load.spritesheet(Level6.LICH_SPRITE_KEY, Level6.LICH_SPRITE_PATH);
        this.load.spritesheet(Level6.LICH_WAND_KEY, Level6.LICH_WAND_PATH);
        this.load.spritesheet(Level6.LICH_CUP_KEY, Level6.LICH_CUP_PATH);
        this.load.spritesheet(Level6.LICH_SWORD_KEY, Level6.LICH_SWORD_PATH);
        this.load.spritesheet(Level6.TALON_SPRITE_KEY, Level6.TALON_SPRITE_PATH);
        this.load.spritesheet(Level6.TALON_PROJECTILE_KEY, Level6.TALON_PROJECTILE_PATH);
        this.load.object(Level6.LICH_POSITION_KEY, Level6.TILEMAP_PATH);

        /* Abilities */
        this.load.image(Repel.REPEL_SPRITE_KEY, Repel.REPEL_SPRITE_PATH);
    }

    /**
     * Unload resources for level 6
     */
    public unloadScene(): void {
        // Unload all resources
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.levelMusicKey});
    }

    public startScene(): void {
        super.startScene();

        // Initialize enemies
        let tilemap_json = this.load.getObject(Level6.LICH_POSITION_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        // Initialize Enemy
        let lich = this.factory.addAnimatedSprite(LichActor, Level6.LICH_SPRITE_KEY, LevelLayers.PRIMARY) as LichActor
        lich.scale.set(2, 2);
        lich.position.set(enemies.objects[0].x * this.tilemapScale.x, enemies.objects[0].y * this.tilemapScale.y);
        
        lich.addPhysics(new AABB(lich.position.clone(), lich.boundary.getHalfSize().clone()));
        lich.setGroup(PhysicsGroups.NPC);
        lich.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
        lich.navkey = "navmesh";

        lich.addAI(LichController, { tilemap: this.tilemapKey });
        lich.animation.play("IDLE");
        this.enemies.push(lich);

        // Initialize Viewport
        this.viewport.setBounds(0, 0, 8 * 6 * 30, 8 * 6 * 18);

        // Play music
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: this.levelMusicKey, loop: true, holdReference: true});
    }

    public updateScene(deltaT) {
        // console.log(this.player.position.x, this.player.position.y)
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        if (!this.enemies[0].visible) { this.emitter.fireEvent(CustomGameEvents.LEVEL_END); }
        super.updateScene(deltaT);
    }

    /**
     * This method helps with handling events. 
     * 
     * @param event the event to be handled
     * @see GameEvent
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case CustomGameEvents.PLAYER_ENTER_LEVEL_END: {
                for (let i = 0; i < this.enemies.length; i++) {
                    if (this.enemies[i].visible) return;
                }
                this.emitter.fireEvent(CustomGameEvents.LEVEL_END)
                break;
            }
            case CustomGameEvents.LEVEL_END: {
                this.sceneManager.changeToScene(MainMenu);
                break;
            }
            // Let Level.ts handle it by default
            default:
                super.handleEvent(event);
                break;
        }
    }

    /* Getters */
    public getNewRandomPlatform(curPos: Vec2): Record<string, any> {
        /* *
         * Platform Positions 
         * Top - (720, 256)
         * Bottom - (720, 544)
         * Left - (336, 400) 
         * Right - (1104, 400) 
         * */  
        var newIndex: number
        let prevIndex = this.platFormPositions.indexOf(curPos)
        while (newIndex == null || newIndex === prevIndex) { 
            newIndex = Math.floor(Math.random() * this.platFormPositions.length)
        }
        return {index: newIndex, position: this.platFormPositions[newIndex]}
    }

    public getLichAttackAudioKey(): string {
        return this.lichAttackAudioKey
    }

    public getLichDyingAudioKey(): string {
        return this.lichDyingAudioKey
    }

    public getTalonDyingAudioKey(): string {
        return this.talonDyingAudioKey
    }

}