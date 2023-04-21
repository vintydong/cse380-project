import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MainMenu from "./MainMenu";

export default class SplashScreen extends Scene{
    private splashScreen: Layer;
    private splashBg: Sprite;

    public loadScene(): void {
        /** Images/Sprites */
        this.load.image("splashBg", "assets/sprites/menus/splash.png");
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
        splashButton.onClickEventId = "click";
        // For WebGL temporarily disabled
        // splashButton.calculateBackgroundColor = () => splashButton.backgroundColor;
        this.receiver.subscribe("click");
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            //Click to go to main menu
            case "click":
                this.sceneManager.changeToScene(MainMenu);
                break;

            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}