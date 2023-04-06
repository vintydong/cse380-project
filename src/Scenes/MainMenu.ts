import CustomFactoryManager from "../Factory/CustomFactoryManager";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";

import DemoLevel from "./DemoLevel";

export default class MainMenu extends Scene {
    // Need layers for multiple scenes such as mainMenu, about, control, help, levels, etc.
    private mainMenu: Layer;

    private splashScreen: Layer;
    
    private splashBg: Sprite;

    
    public loadScene(): void {
        /** Audio */

        /** Images/Sprites */
        this.load.image("splashBg", "assets/sprites/splash.png");
    }

    /**
     * On button clicks, an event is emitted with id indicating the next scene
     * Events should be handled inside `handleEvent` and switch scenes using
     * this.sceneManager.changeToScene(newScene)
     */
    public startScene(): void {
        const center = this.viewport.getCenter();
        const {x: halfX, y: halfY} = this.viewport.getHalfSize();

        /** Splash Screen Layer */
        this.splashScreen = this.addLayer("splashScreen");

        this.splashBg = this.add.sprite("splashBg", "splashScreen");
        this.splashBg.position.set(center.x, center.y);
        this.splashBg.scale = new Vec2(0.71, 0.71);
        this.splashBg.tweens.add('fadeOut', {
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
        
        const splashButton = this.add.uiElement(UIElementType.BUTTON, "splashScreen", {position: new Vec2(center.x, center.y), text: ""});    
        splashButton.position.set(center.x, center.y);
        splashButton.size.set(1366, 768);
        splashButton.backgroundColor = Color.TRANSPARENT;
        splashButton.onClickEventId = "play";

        /** Main Menu Layer */
        this.mainMenu = this.addUILayer("mainMenu");

        const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y - 100), text: "Play"});
        play.size.set(200, 50);
        play.borderWidth = 2;
        play.borderColor = Color.WHITE;
        play.backgroundColor = Color.TRANSPARENT;
        // play.onClickEventId = "play";

        const demo = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y), text: "Demo"});
        demo.size.set(200, 50);
        demo.borderWidth = 2;
        demo.borderColor = Color.WHITE;
        demo.backgroundColor = Color.TRANSPARENT;
        demo.onClickEventId = "demo";

        this.receiver.subscribe("play");
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "play":
                console.log("PLAY CLICKED");
            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}