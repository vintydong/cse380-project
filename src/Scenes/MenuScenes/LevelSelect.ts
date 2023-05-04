import CustomFactoryManager from "../../Factory/CustomFactoryManager";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";

import DemoLevel from "../DemoLevel";
import Level1 from "../Level1";
import Level2 from "../Level2";
import Level3 from "../Level3";
import Level4 from "../Level4";
import Level5 from "../Level5";
import Level6 from "../Level6";
import MainMenu from "./MainMenu";

export default class LevelSelect extends Scene{
    private levelSelect: Layer;
    private levels: Sprite;

    public loadScene(): void{
        this.load.image("levels", "assets/sprites/menus/levelSelect.png");
    }

    public startScene(): void {
        const center = this.viewport.getCenter();
        
        /** Level Select Layer */
        this.levelSelect = this.addUILayer("levelSelect");

        this.levels = this.add.sprite("levels", "levelSelect");
        this.levels.position.set(center.x, center.y);
        this.levels.scale = new Vec2(0.71, 0.71);
        this.levels.tweens.add('fadeOut', {
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

        const levelOne = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y - 225), text: "Level 1"})
        levelOne.size.set(200, 50);
        levelOne.borderWidth = 2;
        levelOne.borderColor = Color.WHITE;
        levelOne.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        levelOne.onClickEventId = "levelOne";
        
        const levelTwo = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y - 150), text: "Level 2"})
        levelTwo.size.set(200, 50);
        levelTwo.borderWidth = 2;
        levelTwo.borderColor = Color.WHITE;
        levelTwo.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        levelTwo.onClickEventId = "levelTwo";

        const levelThree = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y - 75), text: "Level 3"})
        levelThree.size.set(200, 50);
        levelThree.borderWidth = 2;
        levelThree.borderColor = Color.WHITE;
        levelThree.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        levelThree.onClickEventId = "levelThree";

        const levelFour = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y), text: "Level 4"})
        levelFour.size.set(200, 50);
        levelFour.borderWidth = 2;
        levelFour.borderColor = Color.WHITE;
        levelFour.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        levelFour.onClickEventId = "levelFour";

        const levelFive = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y + 75), text: "Level 5"})
        levelFive.size.set(200, 50);
        levelFive.borderWidth = 2;
        levelFive.borderColor = Color.WHITE;
        levelFive.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        levelFive.onClickEventId = "levelFive";

        const levelSix = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y + 150), text: "Level 6"})
        levelSix.size.set(200, 50);
        levelSix.borderWidth = 2;
        levelSix.borderColor = Color.WHITE;
        levelSix.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        levelSix.onClickEventId = "levelSix";

        const goBack = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x, center.y + 225), text: "Go Back"})
        goBack.size.set(200, 50);
        goBack.borderWidth = 2;
        goBack.borderColor = Color.WHITE;
        goBack.backgroundColor = Color.TRANSPARENT;
        // this.levelSelect.disable();
        goBack.onClickEventId = "goBack";

        this.receiver.subscribe("levelOne");
        this.receiver.subscribe("levelTwo");
        this.receiver.subscribe("levelThree");
        this.receiver.subscribe("levelFour");
        this.receiver.subscribe("levelFive");
        this.receiver.subscribe("levelSix");
        this.receiver.subscribe("goBack");
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "levelOne":
                this.sceneManager.changeToScene(Level1);
                break;

            case "levelTwo":
                this.sceneManager.changeToScene(Level2);
                break;

            case "levelThree":
                this.sceneManager.changeToScene(Level3);
                break;

            case "levelFour":
                this.sceneManager.changeToScene(Level4);
                break;

            case "levelFive":
                this.sceneManager.changeToScene(Level5);
                break;
            
            case "levelSix":
                this.sceneManager.changeToScene(Level6);
                break;

            case "goBack":
                this.sceneManager.changeToScene(MainMenu);
                break;

            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}