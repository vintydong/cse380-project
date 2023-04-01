import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";

export default class MainMenu extends Scene {
    // Need layers for multiple scenes such as mainMenu, about, control, help, levels, etc.
    private mainMenu: Layer;

    /**
     * On button clicks, an event is emitted with id indicating the next scene
     * Events should be handled inside `handleEvent` and switch scenes using
     * this.sceneManager.changeToScene(newScene)
     */

    public loadScene(): void {}

    public startScene(): void {
        this.mainMenu = this.addUILayer("mainMenu");

        const center = this.viewport.getCenter();

        const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y - 100), text: "Play"});
        play.size.set(200, 50);
        play.borderWidth = 2;
        play.borderColor = Color.WHITE;
        play.backgroundColor = Color.TRANSPARENT;
        play.onClickEventId = "play";
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            default:
                break
        }
    }
}