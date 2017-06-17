import { Behavior } from './behavior';
import { OptionsBehavior } from '../lib/select-interfaces';
import { SelectItem } from '../lib/select-item';
import { stripTags } from '../lib/select-pipes';

import { SelectComponent } from '../select';

export class GenericBehavior extends Behavior implements OptionsBehavior {
  public constructor(actor: SelectComponent) {
    super(actor);
  }

  public first(): void {
    this.actor.activeOption = this.actor.options[0];
    super.ensureHighlightVisible();
  }

  public last(): void {
    this.actor.activeOption = this.actor.options[this.actor.options.length - 1];
    super.ensureHighlightVisible();
  }

  public prev(): void {
    const index = this.actor.options.indexOf(this.actor.activeOption);
    this.actor.activeOption = this.actor
      .options[index - 1 < 0 ? this.actor.options.length - 1 : index - 1];
    super.ensureHighlightVisible();
  }

  public next(): void {
    const index = this.actor.options.indexOf(this.actor.activeOption);
    this.actor.activeOption = this.actor
      .options[index + 1 > this.actor.options.length - 1 ? 0 : index + 1];
    super.ensureHighlightVisible();
  }

  public filter(query: RegExp): void {
    const options = this.actor.itemObjects
      .filter((option: SelectItem) => {
        return stripTags(option.text).match(query);
      });
    this.actor.options = options;
    if (this.actor.options.length > 0) {
      this.actor.activeOption = this.actor.options[0];
      super.ensureHighlightVisible();
    }
  }
}
