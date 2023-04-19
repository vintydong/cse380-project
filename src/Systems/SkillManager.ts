import { MenuEvents } from "../CustomGameEvents";
import Level from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import Layer from "../Wolfie2D/Scene/Layer"
import UILayer from "../Wolfie2D/Scene/Layers/UILayer";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";

export const SkillBookLayers = {
    background: "SKILL_BOOK_BACKGROUND"
} as const;

export type LevelUILayer = typeof SkillBookLayers[keyof typeof SkillBookLayers]

/** Manages the skills of the player including displaying the skill book UI */
export class SkillManager {
    /** The level that will use this LayerManager */
    private scene: Level;

    public static readonly SKILL_BOOK_SPRITE_KEY = "SKILL_BOOK_BG";
    public static readonly SKILL_BOOK_SPRITE_PATH = "assets/sprites/scroll.png";

    private skillBookLayer: UILayer;

    public constructor(scene: Level){
        this.scene = scene;

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

    private initTransitionLayer() {
        throw new Error("Method not implemented.");
    }

}