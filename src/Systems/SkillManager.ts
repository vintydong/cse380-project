import PlayerController from "../AI/Player/PlayerController";
import { MenuEvents } from "../CustomGameEvents";
import Level from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Layer from "../Wolfie2D/Scene/Layer"
import UILayer from "../Wolfie2D/Scene/Layers/UILayer";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import Melee from "./Skills/Melee";
import Skill from "./Skills/Skill";
import Slash from "./Skills/Slash";

export const SkillBookLayers = {
    background: "SKILL_BOOK_BACKGROUND"
} as const;

export type LevelUILayer = typeof SkillBookLayers[keyof typeof SkillBookLayers]

/** 
 * Manages the skills of the player including displaying the skill book UI 
 * @author vintydong
 */
export class SkillManager {
    /** The level that will use this LayerManager */
    private scene: Level;
    /** The player that this SkillManager belongs to */
    private player: AnimatedSprite;

    private activeSkills: [Skill, Skill, Skill, Skill];

    public static readonly SKILL_BOOK_SPRITE_KEY = "SKILL_BOOK_BG";
    public static readonly SKILL_BOOK_SPRITE_PATH = "assets/sprites/scroll.png";

    private skillBookLayer: UILayer;

    // TODO: Change to singleton so it is preserved across levels
    public constructor(scene: Level, player?: AnimatedSprite) {
        this.scene = scene;
        this.player = player;

        // TODO: Remove this unless we want default skills
        this.activeSkills = [null, null, null, null];
        this.activeSkills[0] = new Melee(this);
        this.activeSkills[1] = new Slash(this);

        this.skillBookLayer = scene.addUILayer(SkillBookLayers.background);
        this.initSkillBook();
        this.skillBookLayer.disable();
    }

    private initSkillBook() {
        let bg = this.scene.add.sprite(SkillManager.SKILL_BOOK_SPRITE_KEY, SkillBookLayers.background);

        let center = this.scene.getViewport().getCenter();
        bg.position.set(center.x, center.y);
        bg.scale = new Vec2(9, 7);
    }

    public activateSkill(index: number, options?: Record<string, any>){
        console.log("Activating skill ", index, options);
        this.activeSkills[index].activate(options);
    }

    public toggleSkillBook() {
        this.skillBookLayer.isHidden() ?
            this.skillBookLayer.enable() :
            this.skillBookLayer.disable();
    }

    public getScene() { return this.scene; }

    public getPlayer() { return this.player; }
}