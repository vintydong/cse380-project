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
import Help from "./Help";
import LevelSelect from "./LevelSelect";
import Controls from "./Controls";
import Level1 from "../Level1";

export default class MainMenu extends Scene {
    // Need layers for multiple scenes such as mainMenu, about, control, help, levels, etc.
    private mainMenu: Layer;

    private menu: Sprite;
    
    public loadScene(): void {
        /** Audio */

        /** Images/Sprites */
        this.load.image("splashBg", "assets/sprites/menus/splash.png");
        this.load.image("menu", "assets/sprites/menus/menu.png");
    }

    /**
     * On button clicks, an event is emitted with id indicating the next scene
     * Events should be handled inside `handleEvent` and switch scenes using
     * this.sceneManager.changeToScene(newScene)
     */
    public startScene(): void {
        const center = this.viewport.getCenter();
        const {x: halfX, y: halfY} = this.viewport.getHalfSize();

        /** Main Menu Layer */
        this.mainMenu = this.addUILayer("mainMenu");
        this.menu = this.add.sprite("menu", "mainMenu");
        this.menu.position.set(center.x, center.y);
        this.menu.scale = new Vec2(0.71, 0.71);
        this.menu.tweens.add('fadeOut', {
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

        const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y), text: "Play"});
        play.size.set(200, 50);
        play.borderWidth = 2;
        play.borderColor = Color.WHITE;
        play.backgroundColor = Color.TRANSPARENT;
        play.onClickEventId = "play";

        const demo = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y + 75), text: "Demo"});
        demo.size.set(200, 50);
        demo.borderWidth = 2;
        demo.borderColor = Color.WHITE;
        demo.backgroundColor = Color.TRANSPARENT;
        // this.mainMenu.disable();
        demo.onClickEventId = "demo";

        const levelSelect = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y + 150), text: "Select Level"})
        levelSelect.size.set(200, 50);
        levelSelect.borderWidth = 2;
        levelSelect.borderColor = Color.WHITE;
        levelSelect.backgroundColor = Color.TRANSPARENT;
        // this.mainMenu.disable();
        levelSelect.onClickEventId = "level";

        const controls = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y + 225), text: "Controls"})
        controls.size.set(200, 50);
        controls.borderWidth = 2;
        controls.borderColor = Color.WHITE;
        controls.backgroundColor = Color.TRANSPARENT;
        // this.mainMenu.disable();
        controls.onClickEventId = "controls";

        const help = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y + 300), text: "Help"})
        help.size.set(200, 50);
        help.borderWidth = 2;
        help.borderColor = Color.WHITE;
        help.backgroundColor = Color.TRANSPARENT;
        // this.mainMenu.disable();
        help.onClickEventId = "help";

        this.receiver.subscribe("demo");
        this.receiver.subscribe("level");
        this.receiver.subscribe("controls");
        this.receiver.subscribe("help");
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            //Main menu options
            case "play":
                this.sceneManager.changeToScene(Level1);
                break;
            case "demo":
                this.sceneManager.changeToScene(DemoLevel);
                break;
            case "level":
                this.sceneManager.changeToScene(LevelSelect);
                break;
            case "controls":
                this.sceneManager.changeToScene(Controls);
                break;
            case "help":
                this.sceneManager.changeToScene(Help);
                break;

            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}