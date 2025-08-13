import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PromptEntity } from '../../entity/view.entity';
import { PromptComponent } from '../prompt/prompt.component';
import { GeneratedEntitty } from '../../entity/upload.entity';
@Component({
    selector: 'app-loading',
    imports: [CommonModule, MatProgressBarModule, PromptComponent],
    templateUrl: './loading.component.html'
})
export class LoadingComponent implements OnInit {

  @Input() entity?: GeneratedEntitty | null;

  prompt?: PromptEntity;

  ngOnInit(): void {
    if (!this.entity) {
      return;
    }
    const ent = this.entity as GeneratedEntitty;
    const prompt = ent.prompt as PromptEntity;
    this.prompt = Object.entries(prompt).reduce((r: any, [k, v]) => {
      if (v != undefined) {
        r[k] = v;
      }
      return r;
    }, {}) as PromptEntity;
  }

}
