import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public menus = [
    { name: '操作面板', path: '菜单->操作面板' },
    { name: '分机', path: '菜单->通信->分机' },
    { name: '网络分机', path: '菜单->通信->网络分机' },
    { name: '用户设置', path: '菜单->设置->用户'}];

  private value: any = {};
  private _disabledV = '0';
  private disabled = false;
  private items: any[] = [];

  public ngOnInit(): any {
    this.menus.forEach((item: { name: string, path: string }) => {
      this.items.push({
        id: item.path,
        text: `<ul><li>${item.name}</li><li style="font-size: 11px;">${item.path}</li></ul>`
      });
    });
  }

  private get disabledV(): string {
    return this._disabledV;
  }

  private set disabledV(value: string) {
    this._disabledV = value;
    this.disabled = this._disabledV === '1';
  }

  public selected(value: any): void {
    console.log(typeof value);
    console.log('Selected value is: ', value);
  }

  public removed(value: any): void {
    console.log('Removed value is: ', value);
  }

  public typed(value: any): void {
    console.log('New search input: ', value);
  }

  public refreshValue(value: any): void {
    console.log(typeof value);
    this.value = value;
  }
}
