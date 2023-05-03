import { CustomGameEvents } from "../CustomGameEvents";
import { uiElementProps } from "../Factory/CustomFactoryManager";
import Level from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import Button from "../Wolfie2D/Nodes/UIElements/Button";
import Label, { HAlign, VAlign } from "../Wolfie2D/Nodes/UIElements/Label";
import UILayer from "../Wolfie2D/Scene/Layers/UILayer";
import Color from "../Wolfie2D/Utils/Color";
import CheatManager from "./CheatManager";
import Melee from "./Skills/Melee";
import Repel from "./Skills/Repel";
import Skill from "./Skills/Skill";
import Slash from "./Skills/Slash";

export const SkillBookLayers = {
    background: "SKILL_BOOK_BACKGROUND"
} as const;

export type LevelUILayer = typeof SkillBookLayers[keyof typeof SkillBookLayers]

export const SkillBookEvents = {
    LEVEL_UP_MELEE: 'LEVEL_UP_MELEE',
    LEVEL_DOWN_MELEE: 'LEVEL_DOWN_MELEE',

} as const;

export type SkillBookEvent = typeof SkillBookEvents[keyof typeof SkillBookEvents]

interface SkillBookRow {
    icon: Sprite,
    levelLabel: Label,
    levelDownButton: Button,
    levelUpButton: Button,
    attributeLabel: Label,
    descLabel: Label,
}

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
    private allSkills: [Melee, Slash, Skill, Skill, Skill, Skill];
    private activeSkills: [Skill, Skill, Skill, Skill];

    public static readonly SKILL_BOOK_SPRITE_KEY = "SKILL_BOOK_BG";
    public static readonly SKILL_BOOK_SPRITE_PATH = "assets/sprites/scroll.png";

    private skillBookLayer: UILayer;
    private skillBookItems: SkillBookRow[];

    private cheatManager: CheatManager;

    /** Instance for the singleton */
    private static instance: SkillManager;

    /**
     * Singleton
     * 
     * Returns the current instance of this class or a new instance if none exist
     * @returns CheatManager
     */
    public static getInstance(scene?: Level, player?: AnimatedSprite): SkillManager {
        if(!scene || !player) return null; 

        if(!this.instance){
            this.instance = new SkillManager(scene, player);
        } else {
            this.instance.setScene(scene);
            this.instance.setPlayer(player);
            this.instance.initSkillBook();
            this.instance.drawSkillBook();
        }

        console.log("ACTIVE KSKILLS", this.instance.activeSkills);

        return this.instance;
    }

    private constructor(scene: Level, player?: AnimatedSprite) {
        this.scene = scene;
        this.player = player;

        this.initSkillBook();
        this.skillBookItems = [];

        // Initialize all the skills into the system
        this.loadAllSkills();
        this.drawSkillBook();

        // TODO: Remove this unless we want default skills
        this.activeSkills = [null, null, null, null];
        this.activeSkills[0] = this.allSkills[0];
        this.activeSkills[1] = this.allSkills[1];
        this.activeSkills[2] = this.allSkills[2];

        this.cheatManager = CheatManager.getInstance();
    }

    /** Setups the layer and sprites */
    private initSkillBook() {
        this.skillBookLayer = this.scene.addUILayer(SkillBookLayers.background);
        this.skillBookLayer.disable();

        let bg = this.scene.add.sprite(SkillManager.SKILL_BOOK_SPRITE_KEY, SkillBookLayers.background);

        let center = this.scene.getViewport().getCenter();
        bg.position.set(center.x, center.y);
        // bg.size = new Vec2(70, 51);
        // Total size of background is 630,357
        bg.scale = new Vec2(9, 7);
    }

    private loadAllSkills() {
        this.allSkills = [new Melee(this), new Slash(this), new Repel(this), null, null, null];
    }

    /** Called when the skillbook and all of its skills need to be drawn for the first time */
    private drawSkillBook(){
        let center = this.scene.getViewport().getCenter();
        let dy = -400;
        let dx = -325;

        let rowHeight = 150;

        // for(let skill of this.allSkills){
        for (let i = 0; i < this.allSkills.length; i++) {
            let skill = this.allSkills[i];

            if(!skill) continue;

            skill.initialize();

            let rowLeft = center.x + dx;
            let rowCenterY = center.y + dy / 2;

            let skillIcon = this.scene.add.sprite(skill.spriteKey, SkillBookLayers.background);
            skillIcon.position.set(rowLeft, rowCenterY);
            skillIcon.scale = new Vec2(3.5, 3.5);

            let layer = SkillBookLayers.background as any

            let miniButtonProps = {size: new Vec2(15,15), fontSize: 15, backgroundColor: new Color(100,100,100)}

            if(i > 1){
                let setQ = this.scene.factory.addButton(layer, new Vec2(rowLeft - 10, rowCenterY + 20), 'Q', miniButtonProps)
                setQ.onClickEventId = 'SET-Q-' + i
                let setE = this.scene.factory.addButton(layer, new Vec2(rowLeft + 10, rowCenterY + 20), 'E', miniButtonProps)
                setE.onClickEventId = 'SET-E-' + i
            }

            rowLeft = rowLeft + 65;

            let skillAttributes = skill.getAttributes();
            let { level, damage, description, cooldown } = skillAttributes;


            let levelText = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), `${level}/3`)
            levelText.size = new Vec2(50, rowHeight / 2);
            // levelText.backgroundColor = new Color(255, 0, 0, 0.5);
            levelText.setHAlign(HAlign.LEFT);
            levelText.setVAlign(VAlign.CENTER);
            levelText.fontSize = 25;

            rowLeft = rowLeft + 40;

            let buttonOptions : uiElementProps = {
                size: new Vec2(40, 40),
                backgroundColor: new Color(243, 186, 132, 0.5),
                textColor: Color.BLACK,
            }

            let subButton = this.scene.factory.addButton(layer, new Vec2(rowLeft, rowCenterY), '-', buttonOptions)
            subButton.onClickEventId = 'LEVEL_DOWN_MELEE';
            subButton.font = 'Arial';
            subButton.fontSize = 25;
            subButton.setHAlign(HAlign.CENTER);
            subButton.setVAlign(VAlign.CENTER);

            let addButton = this.scene.factory.addButton(layer, new Vec2(rowLeft + 50, rowCenterY), '+', buttonOptions)
            addButton.onClickEventId = 'LEVEL_UP_MELEE';
            addButton.font = 'Arial';
            addButton.fontSize = 25;
            addButton.setHAlign(HAlign.CENTER);
            addButton.setVAlign(VAlign.CENTER);

            rowLeft = rowLeft + 180;

            let attributes = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), `DMG: ${damage}\tCD: ${(cooldown / 1000).toFixed(1)}`)
            attributes.backgroundColor = new Color(255, 0, 0, 0.5);
            attributes.size = new Vec2(200, rowHeight / 2);
            attributes.setHAlign(HAlign.CENTER)
            attributes.fontSize = 25;

            rowLeft = rowLeft + 250;
            let desc = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), description)
            desc.size = new Vec2(275, rowHeight/2)
            desc.fontSize = 25;
            desc.backgroundColor = new Color(255, 0, 0, 0.5);
            desc.setHAlign(HAlign.LEFT);
            desc.setVAlign(VAlign.CENTER);

            dy = dy + rowHeight;

            // Add to skillrow object
            let skillRow: SkillBookRow = {
                icon: skillIcon,
                levelLabel: levelText,
                levelDownButton: subButton,
                levelUpButton: addButton,
                attributeLabel: attributes,
                descLabel: desc,
            };
            this.skillBookItems.push(skillRow);
        }
    }

    /** Update each row of the skill book with the current skill attributes */
    private updateSkillBook(){
        this.skillBookItems.forEach((row, index) => {
            let skill = this.allSkills[index];

            if(!skill) return;

            let skillAttr = skill.getAttributes();

            row.levelLabel.text = `${skillAttr.level}/3`
            row.attributeLabel.text = `DMG: ${skillAttr.damage}\tCD: ${(skillAttr.cooldown / 1000).toFixed(1)}`
            row.descLabel.text = skillAttr.description;
        })
    }

    public handleLevelEvent(event: SkillBookEvent) {
        switch(event){
            case SkillBookEvents.LEVEL_DOWN_MELEE:
                this.decreaseLevel(this.allSkills[0]);
                break;
            case SkillBookEvents.LEVEL_UP_MELEE:
                this.increaseLevel(this.allSkills[0]);
                break;
        }
        // Redraw skillbook layer on updates
        this.updateSkillBook();
    }

    /**
     * Called to handle binding of active skills
     * @param eventType Should be a string of the form 'SET-[Q|E]-#'
     */
    public handleSetSkill(eventType: string) {
        let s = eventType.split('-')
        let key = s[1]
        let index = Number(s[2])

        if(key != 'Q' && key != 'E') return;
        if(index < 2 || index > 5) return;

        let skillToSet = this.allSkills[index];

        for(let skill of this.activeSkills){
            if(skill == skillToSet)
                return console.log("Skill already active");
        }

        if(key == 'Q')
            this.activeSkills[2] = this.allSkills[index];
        else if(key == 'E')
            this.activeSkills[3] = this.allSkills[index];
    }

    private increaseLevel(skill: Skill){
        // console.log("Increase level");
        if(skill) skill.changeLevel(1);
    }

    private decreaseLevel(skill: Skill){
        // console.log("Decrease level");
        if(skill) skill.changeLevel(-1);
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
        // console.log(this.activeSkills);
        this.activeSkills[index].activate(options);
    }

    public isOpen() { return !this.skillBookLayer.isHidden(); }

    public toggleSkillBook() {
        this.updateSkillBook();
        this.skillBookLayer.isHidden() ?
            this.skillBookLayer.enable() :
            this.skillBookLayer.disable();
    }

    public getScene() { return this.scene; }

    public getPlayer() { return this.player; }

    public setScene(scene: Level) { this.scene = scene; }

    public setPlayer(player: AnimatedSprite) { this.player = player; }
}