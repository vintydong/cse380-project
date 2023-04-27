import PlayerController from "../AI/Player/PlayerController";
import { CustomGameEvent, CustomGameEvents, MenuEvents } from "../CustomGameEvents";
import { uiElementProps } from "../Factory/CustomFactoryManager";
import Level from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { HAlign, VAlign } from "../Wolfie2D/Nodes/UIElements/Label";
import Layer from "../Wolfie2D/Scene/Layer"
import UILayer from "../Wolfie2D/Scene/Layers/UILayer";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import CheatManager from "./CheatManager";
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

    private skillPoints = 0;
    private allSkills: Skill[];
    private activeSkills: [Skill, Skill, Skill, Skill];

    public static readonly SKILL_BOOK_SPRITE_KEY = "SKILL_BOOK_BG";
    public static readonly SKILL_BOOK_SPRITE_PATH = "assets/sprites/scroll.png";

    private skillBookLayer: UILayer;

    private cheatManager: CheatManager;

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

        // Initialize all the skills into the system
        this.loadAllSkills();

        this.cheatManager = CheatManager.getInstance();
    }

    private initSkillBook() {
        let bg = this.scene.add.sprite(SkillManager.SKILL_BOOK_SPRITE_KEY, SkillBookLayers.background);

        let center = this.scene.getViewport().getCenter();
        bg.position.set(center.x, center.y);
        // bg.size = new Vec2(70, 51);
        // Total size of background is 630,357
        bg.scale = new Vec2(9, 7);
    }

    private loadAllSkills() {
        this.allSkills = new Array();
        this.allSkills.push(new Melee(this));
        this.allSkills.push(new Slash(this));

        let center = this.scene.getViewport().getCenter();
        let dy = -400;
        let dx = -325;

        let rowHeight = 150;

        // for(let skill of this.allSkills){
        for (let i = 0; i < 6; i++) {
            let skill = this.allSkills[0];

            let rowLeft = center.x + dx;
            let rowCenterY = center.y + dy / 2;

            let skillIcon = this.scene.add.sprite(skill.spriteKey, SkillBookLayers.background);
            skillIcon.position.set(rowLeft, rowCenterY);
            skillIcon.scale = new Vec2(3.5, 3.5);

            rowLeft = rowLeft + 65;

            let skillAttributes = skill.getAttributes();
            let { level, damage, description, cooldown } = skillAttributes;

            let layer = SkillBookLayers.background as any

            let text = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), `${level}/3`)
            text.size = new Vec2(50, rowHeight / 2);
            // text.backgroundColor = new Color(255, 0, 0, 0.5);
            text.setHAlign(HAlign.LEFT);
            text.setVAlign(VAlign.CENTER);
            text.fontSize = 25;

            rowLeft = rowLeft + 40;

            let buttonOptions : uiElementProps = {
                size: new Vec2(40, 40),
                backgroundColor: new Color(243, 186, 132, 0.5),
                textColor: Color.BLACK,
            }

            let subButton = this.scene.factory.addButton(layer, new Vec2(rowLeft, rowCenterY), '-', buttonOptions)
            let addButton = this.scene.factory.addButton(layer, new Vec2(rowLeft + 50, rowCenterY), '+', buttonOptions)

            rowLeft = rowLeft + 180;

            let attributes = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), `DMG: ${damage}\tCD: ${(cooldown / 1000).toFixed(1)}`)
            attributes.backgroundColor = new Color(255, 0, 0, 0.5);
            attributes.size = new Vec2(200, rowHeight / 2);
            attributes.setHAlign(HAlign.LEFT)
            attributes.fontSize = 25;

            rowLeft = rowLeft + 250;
            let desc = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), description)
            desc.size = new Vec2(275, rowHeight/2)
            desc.fontSize = 20;
            desc.backgroundColor = new Color(255, 0, 0, 0.5);
            desc.setHAlign(HAlign.CENTER);
            desc.setVAlign(VAlign.CENTER);

            dy = dy + rowHeight;
        }
    }

    /** Returns the cooldown of the skill at position index 
     * 
     * @param index The 0-indexed position of the skill (from 0 to 3)
     * @returns true if the skill can be activated; false if on cooldown
    */
    public getSkillCooldown(index: number): boolean {
        if (this.cheatManager.getInfiniteSkills())
            return true;
        if (index > 3 || index < 0) return false;

        if (this.activeSkills[index])
            return this.activeSkills[index].getCooldown();

        return false;
    }

    public getSkillCooldownFromEvent(event: string): boolean {
        switch (event) {
            case CustomGameEvents.SKILL_1_FIRED:
                return this.getSkillCooldown(0);
            case CustomGameEvents.SKILL_2_FIRED:
                return this.getSkillCooldown(1);
            case CustomGameEvents.SKILL_3_FIRED:
                return this.getSkillCooldown(2);
            case CustomGameEvents.SKILL_4_FIRED:
                return this.getSkillCooldown(3);
            default:
                return false;
        }
    }

    public activateSkill(index: number, options?: Record<string, any>) {
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