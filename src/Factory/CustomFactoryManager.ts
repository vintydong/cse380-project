import Level, { LevelLayer } from "../Scenes/Level";
import Spritesheet from "../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import Tilemap from "../Wolfie2D/Nodes/Tilemap";
import UIElement from "../Wolfie2D/Nodes/UIElement";
import Button from "../Wolfie2D/Nodes/UIElements/Button";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import FactoryManager from "../Wolfie2D/Scene/Factories/FactoryManager";
import Color from "../Wolfie2D/Utils/Color";
import { CustomGameEvents, MenuEvent } from "../CustomGameEvents"
import { LevelUILayer } from "../Scenes/LayerManager";

interface uiElementProps {
    size?: Vec2;
    borderWidth?: number;
    borderColor?: Color;
    backgroundColor?: Color;
    textColor?: Color;
    fontSize?: number;
    onClickEventId?: MenuEvent //typeof CustomGameEvents[keyof typeof CustomGameEvents];
}

export default class CustomFactoryManager extends FactoryManager {
    public constructor(scene: Level, tilemaps: Tilemap[]){
        super(scene, tilemaps);
    }

    // Probably don't need this
    // public addAnimatedSprite(key: string, layer: LevelLayer): AnimatedSprite {
    //     return null;
    // }

    

    public addButton(layer: LevelLayer | LevelUILayer, position: Vec2, text: string = "", options?: uiElementProps): Button{
        let button = super.uiElement(UIElementType.BUTTON, layer, {position, text}) as Button;

        if(options.size) button.size.set(options.size.x, options.size.y);
        if(options.borderWidth) button.borderWidth = options.borderWidth;
        if(options.borderColor) button.borderColor = options.borderColor;
        if(options.backgroundColor) button.backgroundColor = options.backgroundColor;
        if(options.textColor) button.textColor = options.textColor;
        if(options.fontSize) button.fontSize = options.fontSize;
        if(options.onClickEventId) button.onClickEventId = options.onClickEventId;

        return button;
    }

    public addLabel(layer: LevelLayer, position: Vec2, text?: string): Label{
        return super.uiElement(UIElementType.LABEL, layer, {position, text}) as Label
    }

    public addSprite(key, layer: LevelLayer, offset?: Vec2): Sprite {
        let sprite = super.sprite(key, layer);
        if(offset !== undefined)
            sprite.setImageOffset(offset);
        return sprite
    }

    // public addUIElement(type: string, layer: LevelLayer, options?: Record<string, any>): UIElement{
    //     return super.uiElement(type, layer, options);
    // }

    public addAnimatedSprite<T extends AnimatedSprite>(constr: new (s: Spritesheet) => T, key: string, layerName: string): AnimatedSprite {
        return this.genericAnimatedSprite(constr, key, layerName);
    }

    public graphic(type: string, layer: LevelLayer, options?: Record<string, any>): Graphic {
        return super.graphic(type, layer, options);
    }

    public sprite(key: string, layer: LevelLayer): Sprite {
        return super.sprite(key, layer);
    }
}