import { Component, Input } from '@angular/core';
import { PromptEntity } from '../../entity/view.entity';

import { NgObjectPipesModule, NgStringPipesModule } from 'ngx-pipes';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToOneLinePipe } from '../../pipes/to-one-line.pipe';
import { StartCasePipe } from '../../pipes/start-case.pipe';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [
    NgObjectPipesModule,
    NgStringPipesModule,
    MatIconModule,
    MatButtonModule,
    ToOneLinePipe,
    StartCasePipe
],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss'
})
export class PromptComponent {

  @Input() data !: PromptEntity;

}
