import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PromptEntity, fromGenerated } from '../../entity/view.entity';
import { PromptComponent } from '../prompt/prompt.component';
import { GeneratedEntitty } from '../../entity/upload.entity';
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
    this.prompt = fromGenerated(ent);
  }

}
