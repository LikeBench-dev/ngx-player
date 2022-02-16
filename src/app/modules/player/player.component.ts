import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, interval, map, switchMap, takeUntil, tap } from 'rxjs';
import { PlayerService } from './player.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ngx-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  providers: [PlayerService],
})
export class PlayerComponent implements AfterViewInit, OnChanges {
  @ViewChild('playerContainer') playerContainer: ElementRef<HTMLElement>;
  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;

  get video(): HTMLVideoElement {
    return (this.videoElement ? this.videoElement.nativeElement : null) as HTMLVideoElement;
  }

  @Input() src: string;

  constructor(public playerService: PlayerService, public changeDetector: ChangeDetectorRef) {}


  ngAfterViewInit(): void {
    this.initVideoStreams();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.playerService.src$.next(changes['src'].currentValue);
  }

  initVideoStreams(): void {
    /**
     * Video Duration
     */
    fromEvent(this.video, 'loadedmetadata')
      .pipe(
        untilDestroyed(this),
        map(() => (this.video !== null ? Number(this.video.duration.toFixed(0)) : 0)),
        map((res) => {
          this.playerService.fullTrackTime$.next(new Date(null).setSeconds(res));
        }),
      )
      .subscribe();

    /**
     * play & pause
     */
    const onPlay$ = fromEvent(this.video, 'play').pipe(
      untilDestroyed(this),
      tap(() => {
        this.playerService.playerStatus$.next(true);
        this.playerService.detectMouseMove(this.playerContainer.nativeElement);
      }),
    );

    const onPause$ = fromEvent(this.video, 'pause').pipe(
      untilDestroyed(this),
      tap(() => {
        this.playerService.playerStatus$.next(false);
        this.playerService.unsubscribeMouseMove();
      }),
    );

   onPlay$.pipe(switchMap(() => interval(1000).pipe(takeUntil(onPause$)))).subscribe();

    /**
     * ProgressBar & CurrentTrackTime
     */
    fromEvent(this.video, 'timeupdate')
      .pipe(
        untilDestroyed(this),
        map(() => (this.video !== null ? Number(this.video.currentTime.toFixed(0)) : 0)),
        map((res) => {
          this.playerService.currentTrackTime$.next(new Date(null).setSeconds(res));
        }),
      )
      .subscribe();

    /**
     * ProgressBuffer
     */
    fromEvent(this.video, 'progress')
      .pipe(untilDestroyed(this))
      .subscribe(() => this.playerService.updateTrackBuffer(this.video));


    this.playerService.timelineMove$
      .pipe(untilDestroyed(this))
      .subscribe((progress) => {
        this.video.currentTime = this.video.duration * (progress / 100)
      })
  }

  getVideoType(path: string): string {
    if (!path) {
      return '';
    }
    const val = path?.split('.');
    return 'video/' + val[val.length - 1];
  }
}
