import { CustomGameEvents } from "../CustomGameEvents";
import { uiElementProps } from "../Factory/CustomFactoryManager";
import Level from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Emitter from "../Wolfie2D/Events/Emitter";
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
import Spin from "./Skills/Spin";

export const SkillBookLayers = {
    background: "SKILL_BOOK_BACKGROUND"
} as const;

export type LevelUILayer = typeof SkillBookLayers[keyof typeof SkillBookLayers]

export const SkillBookEvents = {
    LEVEL_UP_MELEE: 'LEVEL_UP_MELEE',
    LEVEL_DOWN_MELEE: 'LEVEL_DOWN_MELEE',
    LEVEL_UP_SLASH: 'LEVEL_UP_SLASH',
    LEVEL_DOWN_SLASH: 'LEVEL_DOWN_SLASH',
    LEVEL_UP_REPEL: 'LEVEL_UP_REPEL',
    LEVEL_DOWN_REPEL: 'LEVEL_DOWN_REPEL',
    LEVEL_UP_SPIN: 'LEVEL_UP_SPIN',
    LEVEL_DOWN_SPIN: 'LEVEL_DOWN_SPIN',
} as const;

const SkillBookEventSuffix = ['MELEE', 'SLASH', 'REPEL', 'SPIN', ''];

export type SkillBookEvent = typeof SkillBookEvents[keyof typeof SkillBookEvents]

interface SkillBookRow {
    icon: Sprite,
    setQ: Button | null,
    setE: Button | null,
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
    private skillPointsSpent = 0;
    private maxSkillPoints = 0;
    private allSkills: [Melee, Slash, Repel, Spin, Skill, Skill];
    private activeSkills: [Skill, Skill, Skill, Skill];

    public static readonly SKILL_BOOK_SPRITE_KEY = "SKILL_BOOK_BG";
    public static readonly SKILL_BOOK_SPRITE_PATH = "assets/sprites/scroll.png";

    private skillBookLayer: UILayer;
    private skillBookItems: SkillBookRow[];
    private skillPointsLabel: Label;

    private emitter: Emitter;
    private cheatManager: CheatManager;

    /** Instance for the singleton */
    private static instance: SkillManager;

    /**
     * Singleton
     * 
     * Returns the current instance of this class or a new instance if none exist
     * @returns SkillManager
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

        // console.log("ACTIVE KSKILLS", this.instance.activeSkills);
        return this.instance;
    }

    public static resetSkills(): void {
        this.instance = null;
    }

    private constructor(scene: Level, player?: AnimatedSprite) {
        // this.scene = scene;
        this.setScene(scene);
        this.player = player;

        // this.skillPoints = 0;
        this.initSkillBook();
        this.skillBookItems = [];

        // Initialize all the skills into the system
        this.loadAllSkills();
        this.drawSkillBook();

        // TODO: Remove this unless we want default skills
        this.activeSkills = [null, null, null, null];

        this.activeSkills[0] = this.allSkills[0];
        this.activeSkills[1] = this.allSkills[1];
        // this.activeSkills[2] = this.allSkills[2];
        // this.activeSkills[3] = this.allSkills[3];

        this.emitter = new Emitter();

        this.cheatManager = CheatManager.getInstance();
        if(this.cheatManager.getInfiniteSkills()){
            this.maxSkillPoints = 99;
            this.skillPoints = 99;
        }
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
        this.allSkills = [new Melee(this), new Slash(this), new Repel(this), new Spin(this), null, null];
    }

    /** Called when the skillbook and all of its skills need to be drawn for the first time */
    private drawSkillBook(){
        let center = this.scene.getViewport().getCenter();
        let dy = -400;
        let dx = -325;

        let rowHeight = 150;

        let layer = SkillBookLayers.background as any

        // for(let skill of this.allSkills){
        for (let i = 0; i < this.allSkills.length; i++) {
            let skill = this.allSkills[i];

            if(!skill) continue;

            skill.initialize();

            let rowLeft = center.x + dx;
            let rowCenterY = center.y + dy / 2;

            let skillIcon = this.scene.add.sprite(skill.iconKey, SkillBookLayers.background);
            skillIcon.position.set(rowLeft, rowCenterY);
            skillIcon.scale = new Vec2(3.5, 3.5);

            let miniButtonProps = {size: new Vec2(15,15), fontSize: 15, backgroundColor: new Color(100,100,100)}

            let setQ: Button = null;
            let setE: Button = null;
            if(i > 1){
                setQ = this.scene.factory.addButton(layer, new Vec2(rowLeft - 10, rowCenterY + 20), 'Q', miniButtonProps)
                setQ.onClickEventId = 'SET-Q-' + i
                setE = this.scene.factory.addButton(layer, new Vec2(rowLeft + 10, rowCenterY + 20), 'E', miniButtonProps)
                setE.onClickEventId = 'SET-E-' + i

                if(skill.getLevel() < 0){
                    setQ.visible = false;
                    setE.visible = false;
                }
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
            subButton.onClickEventId = 'LEVEL_DOWN_' + SkillBookEventSuffix[i];
            subButton.font = 'Arial';
            subButton.fontSize = 25;
            subButton.setHAlign(HAlign.CENTER);
            subButton.setVAlign(VAlign.CENTER);

            let addButton = this.scene.factory.addButton(layer, new Vec2(rowLeft + 50, rowCenterY), '+', buttonOptions)
            addButton.onClickEventId = 'LEVEL_UP_' + SkillBookEventSuffix[i];
            addButton.font = 'Arial';
            addButton.fontSize = 25;
            addButton.setHAlign(HAlign.CENTER);
            addButton.setVAlign(VAlign.CENTER);

            rowLeft = rowLeft + 180;

            let attributes = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), `DMG: ${damage}\tCD: ${(cooldown / 1000).toFixed(1)}`)
            // attributes.backgroundColor = new Color(255, 0, 0, 0.5);
            attributes.size = new Vec2(200, rowHeight / 2);
            attributes.setHAlign(HAlign.CENTER)
            attributes.fontSize = 25;

            rowLeft = rowLeft + 250;
            let desc = this.scene.factory.addLabel(layer, new Vec2(rowLeft, rowCenterY), description)
            desc.size = new Vec2(275, rowHeight/2)
            desc.fontSize = 25;
            // desc.backgroundColor = new Color(255, 0, 0, 0.5);
            desc.setHAlign(HAlign.LEFT);
            desc.setVAlign(VAlign.CENTER);

            dy = dy + rowHeight;

            // Add to skillrow object
            let skillRow: SkillBookRow = {
                icon: skillIcon,
                setQ: setQ,
                setE: setE,
                levelLabel: levelText,
                levelDownButton: subButton,
                levelUpButton: addButton,
                attributeLabel: attributes,
                descLabel: desc,
            };
            this.skillBookItems.push(skillRow);
        }

        let pointsLabelPos = center.clone();
        pointsLabelPos.y = pointsLabelPos.y + 200;
        this.skillPointsLabel = this.scene.factory.addLabel(layer, pointsLabelPos, `Skill Points: ${this.skillPoints}`);
        // this.skillPointsLabel.backgroundColor = new Color(255, 0, 0, 0.5);
        this.skillPointsLabel.size = new Vec2(200, rowHeight / 2);
        this.skillPointsLabel.fontSize = 25;

        let warning = this.scene.factory.addLabel(layer, pointsLabelPos.clone().add(new Vec2(0, 25)), `Note: Once you learn a skill, you cannot unlearn it`);
        // warning.backgroundColor = new Color(255, 0, 0, 0.5);
        warning.textColor = Color.RED;
        warning.size = new Vec2(200, rowHeight / 2);
        warning.fontSize = 25;
    }

    /** Update each row of the skill book with the current skill attributes */
    private updateSkillBook(){
        this.skillBookItems.forEach((row, index) => {
            let skill = this.allSkills[index];

            if(!skill) return;

            if(row.setQ && row.setE){
                row.setQ.visible = !(skill.getLevel() < 1);
                row.setE.visible = !(skill.getLevel() < 1);
            }

            let skillAttr = skill.getAttributes();

            row.levelLabel.text = `${skillAttr.level}/3`
            row.attributeLabel.text = `DMG: ${skillAttr.damage}\tCD: ${(skillAttr.cooldown / 1000).toFixed(1)}`
            row.descLabel.text = skillAttr.description;
        })
        this.skillPointsLabel.text = `Skill Points ${this.skillPoints}`;
    }

    public handleLevelEvent(event: SkillBookEvent) {
        switch(event){
            case SkillBookEvents.LEVEL_DOWN_MELEE:
                this.decreaseLevel(this.allSkills[0]);
                break;
            case SkillBookEvents.LEVEL_UP_MELEE:
                this.increaseLevel(this.allSkills[0]);
                break;
            case SkillBookEvents.LEVEL_DOWN_SLASH:
                this.decreaseLevel(this.allSkills[1]);
                break;
            case SkillBookEvents.LEVEL_UP_SLASH:
                this.increaseLevel(this.allSkills[1]);
                break;
            case SkillBookEvents.LEVEL_DOWN_REPEL:
                this.decreaseLevel(this.allSkills[2]);
                break;
            case SkillBookEvents.LEVEL_UP_REPEL:
                this.increaseLevel(this.allSkills[2]);
                break;
            case SkillBookEvents.LEVEL_DOWN_SPIN:
                this.decreaseLevel(this.allSkills[3]);
                break;
            case SkillBookEvents.LEVEL_UP_SPIN:
                this.increaseLevel(this.allSkills[3]);
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
        
        this.emitter.fireEvent(CustomGameEvents.CHANGED_ACTIVE_SKILLS);
    }

    private increaseLevel(skill: Skill){
        // console.log("Increase level");
        if(skill && this.skillPoints > 0 && skill.changeLevel(1)){
            this.skillPoints--;
            this.skillPointsSpent++;
        }
    }

    private decreaseLevel(skill: Skill){
        // console.log("Decrease level");
        if(skill && skill.changeLevel(-1)){
            this.skillPoints++;
            this.skillPointsSpent--;
        }
    }

    /** Returns the cooldown of the skill at position index 
     * 
     * @param index The 0-indexed position of the skill (from 0 to 3)
     * @returns true if the skill can be activated; false if on cooldown
    */
    public getSkillCooldown(index: number): boolean {
        if (this.cheatManager.getInfiniteSkills() && this.activeSkills[index])
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

    public getActiveSkills() { return this.activeSkills; }

    public getScene() { return this.scene; }

    public getPlayer() { return this.player; }

    public setScene(scene: Level) {
        this.scene = scene;
        // console.log(scene.constructor);
        switch(scene.constructor.name){
            case 'Level1':
                this.maxSkillPoints = 0;
                break;
            case 'Level2':
                this.maxSkillPoints = 2;
                break;
            case 'Level3':
                this.maxSkillPoints = 4;
                break;
            case 'Level4':
                this.maxSkillPoints = 6;
                break;  
            case 'Level5':
                this.maxSkillPoints = 8;
                break;
            case 'Level6':
                this.maxSkillPoints = 10;
                break;
        }

        // Add additional skill points
        let diff = this.maxSkillPoints - (this.skillPoints + this.skillPointsSpent);
        if(diff > 0)
            this.skillPoints = this.skillPoints + diff;

    }

    public setPlayer(player: AnimatedSprite) { this.player = player; }
}