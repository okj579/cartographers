import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Goal, ScoreInfo } from '../../../models/goals';
import { BoardTile } from '../../../models/board-tile';
import { exampleBoard } from './example-board.data';
import { getScoresFromBoard } from '../../../game-logic/game-state-functions';
import { GameBoardComponent } from '../game-board/game-board.component';

@Component({
  selector: 'app-example-board',
  standalone: true,
  imports: [GameBoardComponent],
  templateUrl: './example-board.component.html',
  styleUrl: './example-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleBoardComponent implements OnInit {
  @Input() goals: Goal[] = [];
  @Input() specialHighlightGoal: Goal | undefined;

  readonly currentBoard: BoardTile[][] = exampleBoard;

  scoreInfos: ScoreInfo[] = [];
  scores: number[] = [];

  ngOnInit() {
    this.scoreInfos = getScoresFromBoard(this.goals, this.currentBoard);
    this.scores = this.scoreInfos.map((scoreInfo) => scoreInfo.score);
  }
}
