import { Component, Input } from '@angular/core';
import { PromptEntity } from '../../entity/view.entity';
import { CommonModule } from '@angular/common';
import { NgObjectPipesModule } from 'ngx-pipes';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [CommonModule, NgObjectPipesModule],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss'
})
export class PromptComponent {

  @Input() data !: PromptEntity;

}
