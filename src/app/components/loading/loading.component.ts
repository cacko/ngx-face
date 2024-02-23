import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PromptEntity } from '../../entity/view.entity';
import { PromptComponent } from '../prompt/prompt.component';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { GeneratePrimeOptions } from 'crypto';
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, PromptComponent],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit {

  @Input() entity?: GeneratedEntitty | null;

  prompt?: PromptEntity;

  ngOnInit(): void {
    if (!this.entity) {
      return;
    }
    const ent = this.entity as GeneratedEntitty;
    const prompt: PromptEntity = {
      clip_skip: ent.clip_skip,
      guidance_scale: ent.guidance_scale,
      template: ent.template,
      model: ent.model,
      prompt: ent.prompt,
      num_inferance_steps: ent.num_inferance_steps,
      scale: ent.scale,
      height: ent.height,
      width: ent.width
    };
    this.prompt = Object.entries(prompt)
      .reduce((res: any, [k, v]) => {
        if (v != undefined) {
          res[k] = v;
        }
        return res;
      }, {});
  }

}
