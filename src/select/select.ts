import { Component, Input, Output, EventEmitter, ElementRef, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GenericBehavior } from './behavior/generic-behavior';
import { SelectItem } from './lib/select-item';
import { stripTags } from './lib/select-pipes';
import { OptionsBehavior } from './lib/select-interfaces';

import { escapeRegexp } from './util/common';

@Component({
  selector: 'ng-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      /* tslint:disable */
      useExisting: forwardRef(() => SelectComponent),
      /* tslint:enable */
      multi: true
    }
  ],
  styleUrls: ['./select.css'],
  templateUrl: './select.html'
})
export class SelectComponent implements OnInit, ControlValueAccessor {
  @Input() public allowClear:boolean = false;
  @Input() public placeholder:string = '';
  @Input() public idField:string = 'id';
  @Input() public textField:string = 'text';
  @Input() public childrenField:string = 'children';

  @Input()
  public set items(value:any[]) {
    if (!value) {
      this._items = this.itemObjects = [];
    } else {
      this._items = value.filter((item:any) => {
        if ((typeof item === 'string') || (typeof item === 'object' && item && item[this.textField] && item[this.idField])) {
          return item;
        }
      });
      this.itemObjects = this._items.map((item:any) => (typeof item === 'string' ? new SelectItem(item) : new SelectItem({id: item[this.idField], text: item[this.textField], children: item[this.childrenField]})));
    }
  }

  @Input()
  public set disabled(value:boolean) {
    this._disabled = value;
    if (this._disabled === true) {
      this.hideOptions();
    }
  }

  public get disabled():boolean {
    return this._disabled;
  }

  @Input()
  public set active(selectedItems:any[]) {
    if (!selectedItems || selectedItems.length === 0) {
      this._active = [];
    } else {
      let areItemsStrings = typeof selectedItems[0] === 'string';

      this._active = selectedItems.map((item:any) => {
        let data = areItemsStrings
          ? item
          : {id: item[this.idField], text: item[this.textField]};

        return new SelectItem(data);
      });
    }
  }

  @Output() public data:EventEmitter<any> = new EventEmitter();
  @Output() public selected:EventEmitter<any> = new EventEmitter();
  @Output() public removed:EventEmitter<any> = new EventEmitter();
  @Output() public typed:EventEmitter<any> = new EventEmitter();
  @Output() public opened:EventEmitter<any> = new EventEmitter();

  public options:SelectItem[] = [];
  public itemObjects:SelectItem[] = [];
  public activeOption:SelectItem;
  public element:ElementRef;
  public  inputValue:string = '';
  public get active():any[] {
    return this._active;
  }

  private set optionsOpened(value:boolean){
    this._optionsOpened = value;
    this.opened.emit(value);
  }

  private get optionsOpened(): boolean{
    return this._optionsOpened;
  }

  protected onChange:any = Function.prototype;
  protected onTouched:any = Function.prototype;

  private inputMode:boolean = false;
  private _optionsOpened:boolean = false;
  private behavior:OptionsBehavior;
  private _items:any[] = [];
  private _disabled:boolean = false;
  private _active:SelectItem[] = [];

  public constructor(element:ElementRef, private sanitizer:DomSanitizer) {
    this.element = element;
    this.clickedOutside = this.clickedOutside.bind(this);
  }

  public sanitize(html:string):SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   *
   * @param html select item 上的 text 文本
   *  将双行文本转为只获取第一行
   */
  public displayValue(html: string ): string {
    let titleReg =/<ul><li>(\S+)<\/li>/;
    return html.match(titleReg)[1];
  }

  public inputEvent(e:any, isUpMode:boolean = false):void {
    // tab
    if (e.keyCode === 9) {
      return;
    }
    if (isUpMode && (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 38 ||
      e.keyCode === 40 || e.keyCode === 13)) {
      e.preventDefault();
      return;
    }
    // backspace
    if (!isUpMode && e.keyCode === 8) {
      let el:any = this.element.nativeElement
        .querySelector('div.ui-select-container > input');
      if (!el.value || el.value.length <= 0) {
        if (this.active.length > 0) {
          this.remove(this.active[this.active.length - 1]);
        }
        e.preventDefault();
      }
    }
    // esc
    if (!isUpMode && e.keyCode === 27) {
      this.hideOptions();
      this.element.nativeElement.children[0].focus();
      e.preventDefault();
      return;
    }
    // del
    if (!isUpMode && e.keyCode === 46) {
      if (this.active.length > 0) {
        this.remove(this.active[this.active.length - 1]);
      }
      e.preventDefault();
    }
    // left
    if (!isUpMode && e.keyCode === 37 && this._items.length > 0) {
      this.behavior.first();
      e.preventDefault();
      return;
    }
    // right
    if (!isUpMode && e.keyCode === 39 && this._items.length > 0) {
      this.behavior.last();
      e.preventDefault();
      return;
    }
    // up
    if (!isUpMode && e.keyCode === 38) {
      this.behavior.prev();
      e.preventDefault();
      return;
    }
    // down
    if (!isUpMode && e.keyCode === 40) {
      this.behavior.next();
      e.preventDefault();
      return;
    }
    // enter
    if (!isUpMode && e.keyCode === 13) {
      if (this.active.indexOf(this.activeOption) === -1) {
        this.selectActiveMatch();
        this.behavior.next();
      }
      e.preventDefault();
      return;
    }
    let target = e.target || e.srcElement;
    if (target) {
      this.inputValue = target.value;
      this.behavior.filter(new RegExp(escapeRegexp(this.inputValue), 'ig'));
      this.doEvent('typed', this.inputValue);
    }else {
      this.open();
    }
  }

  public ngOnInit():any {
    this.behavior =  new GenericBehavior(this);
  }

  public remove(item:SelectItem):void {
    if (this._disabled === true) {
      return;
    }
    this.active = [];
    this.data.next(this.active);
    this.doEvent('removed', item);
  }

  public doEvent(type:string, value:any):void {
    if ((this as any)[type] && value) {
      (this as any)[type].next(value);
    }

    this.onTouched();
    if (type === 'selected' || type === 'removed') {
      this.onChange(this.active);
    }
  }

  public clickedOutside():void {
    this.inputMode = false;
    this.inputValue = '';
    this.optionsOpened = false;
  }

  public get firstItemHasChildren():boolean {
    return this.itemObjects[0] && this.itemObjects[0].hasChildren();
  }

  public writeValue(val:any):void {
    this.active = val;
    this.data.emit(this.active);
  }

  public registerOnChange(fn:(_:any) => {}):void {this.onChange = fn;}
  public registerOnTouched(fn:() => {}):void {this.onTouched = fn;}

  protected matchClick(e:any):void {
    if (this._disabled === true) {
      return;
    }
    this.remove(this._active[0]);
    this.inputValue = '';
    this.inputMode = !this.inputMode;
    if (this.inputMode === true ) {
      this.focusToInput();
      this.open();
    }
  }

  protected  mainClick(event:any):void {
    if (this.inputMode === true || this._disabled === true) {
      return;
    }
    if (event.keyCode === 46) {
      event.preventDefault();
      this.inputEvent(event);
      return;
    }
    if (event.keyCode === 8) {
      event.preventDefault();
      this.inputEvent(event, true);
      return;
    }
    if (event.keyCode === 9 || event.keyCode === 13 ||
      event.keyCode === 27 || (event.keyCode >= 37 && event.keyCode <= 40)) {
      event.preventDefault();
      return;
    }
    this.inputMode = true;
    let value = String
      .fromCharCode(96 <= event.keyCode && event.keyCode <= 105 ? event.keyCode - 48 : event.keyCode)
      .toLowerCase();
    this.focusToInput(value);
    this.open();
    let target = event.target || event.srcElement;
    target.value = value;
    this.inputEvent(event);
  }

  protected  selectActive(value:SelectItem):void {
    this.activeOption = value;
  }

  protected  isActive(value:SelectItem):boolean {
    return this.activeOption.id === value.id;
  }

  protected removeClick(value: SelectItem, event: any): void {
    event.stopPropagation();
    this.remove(value);
  }

  private focusToInput(value:string = ''):void {
    setTimeout(() => {
      let el = this.element.nativeElement.querySelector('div.ui-select-container > input');
      if (el) {
        el.focus();
        el.value = value;
      }
    }, 0);
  }

  private open():void {
    this.options = this.itemObjects
      .filter((option:SelectItem) =>  true);

    if (this.options.length > 0) {
      this.behavior.first();
    }
    this.optionsOpened = true;
  }

  private hideOptions():void {
    this.inputMode = false;
    this.optionsOpened = false;
  }

  private selectActiveMatch():void {
    this.selectMatch(this.activeOption);
  }

  private selectMatch(value:SelectItem, e:Event = void 0):void {
    this.inputValue = '';
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (this.options.length <= 0) {
      return;
    }
    this.active[0] = value;
    this.data.next(this.active[0]);
    this.doEvent('selected', value);
    this.hideOptions();
    this.focusToInput(stripTags(value.text));
    this.element.nativeElement.querySelector('.ui-select-container').focus();
  }
}
