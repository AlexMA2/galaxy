import { Component, OnInit } from '@angular/core';
import { Click, Cube } from './galaxy.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'galaxy';

  formGroup!: FormGroup;

  cubesMap = new Map<string, Cube>();
  clicksMap = new Map<string, Click>();

  private bdCubes = 'galaxy-cubes';
  private bdClicks = 'galaxy-clicks';

  editingCube = false;
  editingClick = false;

  selectedCube: any;
  selectedClick: any;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      cube: ['', Validators.required],
      click: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getCubes();
    this.getClicks();
  }

  editCube(cube: any): void {
    this.editingCube = true;
    this.selectedCube = cube;
    console.log(this.selectedCube, this.editingCube);
    this.formGroup.get('cube')?.setValue(cube.key);
  }

  editClick(click: any): void {
    this.editingClick = true;
    this.selectedClick = click;
    this.formGroup.get('click')?.setValue(click.key);
  }

  save(type: string): void {
    const value = this.formGroup.get(type)?.value.trim().toLowerCase();
    this.formGroup.get(type)?.setValue('');
    if (type === 'cube') {
      console.log('DELETE e', this.editingCube);
      if (this.editingCube) {
        console.log('DELETE', this.selectedCube);
        this.cubesMap.delete(this.selectedCube.key);
        this.cubesMap.set(value, {
          last: this.selectedCube.last,
          amount: this.selectedCube.amount,
        });
        this.editingCube = false;
        return;
      }

      if (this.cubesMap.has(value)) {
        const { last, amount } = this.cubesMap.get(value)!;
        this.cubesMap.set(value, {
          last: last,
          amount: amount + 1,
        });
      } else {
        this.cubesMap.set(value, {
          last: new Date(),
          amount: 1,
        });
      }
      const array = Array.from(this.cubesMap.entries());
      localStorage.setItem(this.bdCubes, JSON.stringify(array));
    } else {
      if (this.editingClick) {
        const [key, level] = value.split('|');
        this.clicksMap.delete(this.selectedClick.key);
        this.clicksMap.set(key, {
          last: this.selectedClick.last,
          amount: this.selectedClick.amount,
          level: level,
        });
        this.editingClick = false;
        return;
      }
      const map = this.clicksMap;
      if (map.has(value)) {
        const { last, level, amount } = map.get(value)!;
        map.set(value, {
          last: last,
          level: level,
          amount: amount + 1,
        });
      } else {
        map.set(value, {
          last: new Date(),
          level: 1,
          amount: 1,
        });
      }
      this.clicksMap = this.sortMap(map);
      const array = Array.from(this.clicksMap.entries());
      localStorage.setItem(this.bdClicks, JSON.stringify(array));
    }
  }

  private sortMap(map: Map<string, any>): Map<string, any> {
    const array = Array.from(map.entries());
    array.sort((a, b) => {
      return a[1].level - b[1].level;
    });
    return new Map(array);
  }

  private getCubes(): void {
    if (localStorage.getItem(this.bdCubes)) {
      const values = JSON.parse(localStorage.getItem(this.bdCubes)!);
      this.cubesMap = new Map(values);

      const array = Array.from(this.cubesMap.entries());

      for (let [key, value] of array) {
        const daysDiff = Math.ceil(
          (new Date().getTime() - new Date(value.last).getTime()) /
            (1000 * 3600 * 24)
        );

        if (daysDiff > 2) {
          this.cubesMap.delete(key);
        }
      }
    }
  }

  private getClicks(): void {
    if (localStorage.getItem(this.bdClicks)) {
      const values = JSON.parse(localStorage.getItem(this.bdClicks)!);
      this.clicksMap = this.sortMap(new Map(values));

      const array = Array.from(this.clicksMap.entries());

      for (let [key, value] of array) {
        const daysDiff = Math.ceil(
          (new Date().getTime() - new Date(value.last).getTime()) /
            (1000 * 3600 * 24)
        );

        if (daysDiff > 4) {
          this.clicksMap.delete(key);
        }
      }
    }
  }

  get cubesList(): any[] {
    const arr = this.mapToArray(this.cubesMap);
    return arr;
  }

  get clicksList(): any[] {
    const arr = this.mapToArray(this.clicksMap);
    return arr;
  }

  private mapToArray(map: Map<string, any>): any[] {
    const arr = [];
    for (let [key, value] of map.entries()) {
      arr.push({
        key,
        ...value,
      });
    }
    return arr;
  }
}
