import { Component, OnDestroy, OnInit } from '@angular/core';
import { Center } from '../entity/area/center';
import { Class10 } from '../entity/area/class10';
import { Class15 } from '../entity/area/class15';
import { Class20 } from '../entity/area/class20';
import { Office } from '../entity/area/office';
import { AreaService } from '../services/area/area.service';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { CommonService } from '../services/common.service';
import { Subscription } from 'rxjs';

interface AreaNode {
  id: string;
  name: string;
  office?: AreaNode[];
}

interface AreaFlatNode {
  expandable: boolean;
  id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent implements OnInit  {
  centers: Center[];

  private _transformer = (node: AreaNode, level: number) => {
    return {
      expandable: !!node.office && node.office.length > 0,
      id: node.id,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<AreaFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.office,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private service: AreaService,
    private commonService: CommonService
    ) {}

  hasChild = (_: number, node: AreaFlatNode) => node.expandable;

  public serviceProp: String = null;

  private subscription!: Subscription;

  onclick(officeId: string) {
    //this.service.selectedOfficeId = officeId;
    console.log(officeId);
    this.commonService.onNotifySharedDataChanged(officeId);
  }

  ngOnInit(): void {
    //this.centers = this.service.getCenters();
    //console.log(this.centers);

    this.service.getCenters().subscribe(data => {
      //console.log(data);
      this.centers = new Array<Center>();

      for(let centerId in data.centers ) {
        let center = new Center;
        center.id = centerId;
        center.name = data.centers[centerId].name;
        center.officeName = data.centers[centerId].officeName;
        center.office = new Array<Office>();
        this.centers.push(center);
        
        //Office
        for(let officeId in data.offices) {
          if(officeId.substr(4,2) != '00') continue;

          let parentCenterId = data.offices[officeId].parent;
          if(parentCenterId == centerId) {
            let office = new Office;
            office.id = officeId;
            office.name = data.offices[officeId].name;
            office.class10 = new Array<Class10>();
            center.office.push(office);
            
            //class10s
            for(let class10Id in data.class10s) {

              let parentClass10Id = data.class10s[class10Id].parent;
              if(parentClass10Id == officeId) {
                let class10 = new Class10;
                class10.id = class10Id;
                class10.name = data.class10s[class10Id].name;
                class10.class15 = new Array<Class15>();
                office.class10.push(class10);
                
                //class15s
                for(let class15Id in data.class15s) {
                  let parentClass15Id = data.class15s[class15Id].parent;
                  if(parentClass15Id == class10Id) {
                    let class15 = new Class15;
                    class15.id = class15Id;
                    class15.name = data.class15s[class15Id].name;
                    class15.class20 = new Array<Class20>();
                    class10.class15.push(class15);

                    //class20s
                    for(let class20Id in data.class20s) {
                      let parentClass20Id = data.class20s[class20Id].parent;
                      if(parentClass20Id == class15Id) {
                        let class20 = new Class20;
                        class20.id = class20Id;
                        class20.name = data.class20s[class20Id].name;
                        class15.class20.push(class20);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      console.log(this.centers);
      this.dataSource.data = this.centers;
    },
    error => {
      console.log("Error");
    });

    this.subscription = this.commonService.sharedDataSource$.subscribe(
      msg => {
        this.serviceProp = msg;
      }
    );
  }
   
  ngOnDestroy() {
    //  リソースリーク防止のため CommonService から subcribe したオブジェクトを破棄する
    this.subscription.unsubscribe();
  }
}
