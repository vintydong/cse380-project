import CustomFactoryManager from "../../Factory/CustomFactoryManager";
import CheatManager from "../../Systems/CheatManager";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MainMenu from "./MainMenu";

export default class Help extends Scene{
    private helpMenu: Layer;

    private help: Sprite;

    private cheatManager: CheatManager;

    private cheatHPButton: Button;
    private cheatSkillsButton: Button;
    private cheatDamageButton: Button;
    private cheatLevelButton: Button;

    
    public loadScene(): void {
        /** Images/Sprites */
        this.load.image("help", "assets/sprites/menus/help.png");
    }

    public startScene(): void {
        const cheatManager = CheatManager.getInstance();
        this.cheatManager = cheatManager;

        const center = this.viewport.getCenter();
        this.helpMenu = this.addUILayer("helpMenu");
        this.help = this.add.sprite("help", "helpMenu");
        this.help.position.set(center.x, center.y);
        this.help.scale = new Vec2(0.71, 0.71);
        this.help.tweens.add('fadeOut', {
            startDelay: 0,
            duration: 750,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_IN_SINE
                }
            ]
        });

        const goBack = this.add.uiElement(UIElementType.BUTTON, "helpMenu", {position: new Vec2(center.x, center.y + 300), text: "Go Back"});
        goBack.size.set(200, 50);
        goBack.borderWidth = 2;
        goBack.borderColor = Color.WHITE;
        goBack.backgroundColor = Color.TRANSPARENT;
        goBack.onClickEventId = "goBack";

        const cheatHealth = this.add.uiElement(UIElementType.BUTTON, "helpMenu", {position: new Vec2(center.x - 450, center.y + 200), text: "No Damage"});
        cheatHealth.size.set(200, 50);
        cheatHealth.borderWidth = 2;
        cheatHealth.borderColor = cheatManager.getInfiniteHP() ? Color.BLACK: Color.WHITE;
        cheatHealth.backgroundColor = cheatManager.getInfiniteHP() ? Color.BLACK: Color.TRANSPARENT;
        cheatHealth.onClickEventId = "cheat_hp";
        this.cheatHPButton = cheatHealth as Button;

        const cheatSkills = this.add.uiElement(UIElementType.BUTTON, "helpMenu", {position: new Vec2(center.x - 150, center.y + 200), text: "Infinite Skills"});
        cheatSkills.size.set(200, 50);
        cheatSkills.borderWidth = 2;
        cheatSkills.borderColor = cheatManager.getInfiniteSkills() ? Color.BLACK: Color.WHITE;
        cheatSkills.backgroundColor = cheatManager.getInfiniteSkills() ? Color.BLACK: Color.TRANSPARENT;
        cheatSkills.onClickEventId = "cheat_skills";
        this.cheatSkillsButton = cheatSkills as Button;

        const cheatDamage = this.add.uiElement(UIElementType.BUTTON, "helpMenu", {position: new Vec2(center.x + 150, center.y + 200), text: "One-Shot Enemy"});
        cheatDamage.size.set(200, 50);
        cheatDamage.borderWidth = 2;
        cheatDamage.borderColor = cheatManager.getInfiniteDamage() ? Color.BLACK: Color.WHITE;
        cheatDamage.backgroundColor = cheatManager.getInfiniteDamage() ? Color.BLACK: Color.TRANSPARENT;
        cheatDamage.onClickEventId = "cheat_damage";
        this.cheatDamageButton = cheatDamage as Button;

        const cheatLevel = this.add.uiElement(UIElementType.BUTTON, "helpMenu", {position: new Vec2(center.x + 450, center.y + 200), text: "Unlock all Levels"});
        cheatLevel.size.set(200, 50);
        cheatLevel.borderWidth = 2;
        cheatLevel.borderColor = cheatManager.getUnlockAllLevels() ? Color.BLACK: Color.WHITE;
        cheatLevel.backgroundColor = cheatManager.getUnlockAllLevels() ? Color.BLACK: Color.TRANSPARENT;
        cheatLevel.onClickEventId = "cheat_level";
        this.cheatLevelButton = cheatLevel as Button;

        this.receiver.subscribe("goBack");
        this.receiver.subscribe("cheat_hp");
        this.receiver.subscribe("cheat_skills");
        this.receiver.subscribe("cheat_damage");
        this.receiver.subscribe("cheat_level");
    }

    public updateScene(){
        if(this.cheatManager){
            this.cheatHPButton.borderColor = this.cheatManager.getInfiniteHP() ? Color.BLACK: Color.WHITE;
            this.cheatHPButton.backgroundColor = this.cheatManager.getInfiniteHP() ? Color.GRAY: Color.TRANSPARENT;
            this.cheatSkillsButton.borderColor = this.cheatManager.getInfiniteSkills() ? Color.BLACK: Color.WHITE;
            this.cheatSkillsButton.backgroundColor = this.cheatManager.getInfiniteSkills() ? Color.GRAY: Color.TRANSPARENT;
            this.cheatDamageButton.borderColor = this.cheatManager.getInfiniteDamage() ? Color.BLACK: Color.WHITE;
            this.cheatDamageButton.backgroundColor = this.cheatManager.getInfiniteDamage() ? Color.GRAY: Color.TRANSPARENT;
            this.cheatLevelButton.borderColor = this.cheatManager.getUnlockAllLevels() ? Color.BLACK: Color.WHITE;
            this.cheatLevelButton.backgroundColor = this.cheatManager.getUnlockAllLevels() ? Color.GRAY: Color.TRANSPARENT;
        }

        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            //Click to go to main menu
            case "goBack":
                this.sceneManager.changeToScene(MainMenu);
                break;

            case 'cheat_hp':
                this.cheatManager.toggleInfiniteHP();
                break;
            case 'cheat_skills':
                this.cheatManager.toggleInfiniteSkills();
                break;
            case 'cheat_damage':
                this.cheatManager.toggleInfiniteDamage();
                break;
            case 'cheat_level':
                this.cheatManager.toggleUnlockAllLevels();
                break;
            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}