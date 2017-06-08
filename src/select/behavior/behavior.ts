import { OptionsBehavior } from '../lib/select-interfaces';
import { SelectItem } from '../lib/select-item';

import { SelectComponent } from '../select';

export class Behavior {
  public optionsMap:Map<string, number> = new Map<string, number>();

  public actor:SelectComponent;

  public constructor(actor:SelectComponent) {
    this.actor = actor;
  }

  public fillOptionsMap():void {
    this.optionsMap.clear();
    let startPos = 0;
    this.actor.itemObjects
      .map((item:SelectItem) => {
        startPos = item.fillChildrenHash(this.optionsMap, startPos);
      });
  }

  public ensureHighlightVisible(optionsMap:Map<string, number> = void 0):void {
    let container = this.actor.element.nativeElement.querySelector('.ui-select-choices-content');
    if (!container) {
      return;
    }
    let choices = container.querySelectorAll('.ui-select-choices-row');
    if (choices.length < 1) {
      return;
    }
    let activeIndex = this.getActiveIndex(optionsMap);
    if (activeIndex < 0) {
      return;
    }
    let highlighted:any = choices[activeIndex];
    if (!highlighted) {
      return;
    }
    let posY:number = highlighted.offsetTop + highlighted.clientHeight - container.scrollTop;
    let height:number = container.offsetHeight;
    if (posY > height) {
      container.scrollTop += posY - height;
    } else if (posY < highlighted.clientHeight) {
      container.scrollTop -= highlighted.clientHeight - posY;
    }
  }

  private getActiveIndex(optionsMap:Map<string, number> = void 0):number {
    let ai = this.actor.options.indexOf(this.actor.activeOption);
    if (ai < 0 && optionsMap !== void 0) {
      ai = optionsMap.get(this.actor.activeOption.id);
    }
    return ai;
  }
}

