import { DOCUMENT } from '@angular/common'
import { Inject, Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, debounceTime, fromEvent, Subject, Subscription, tap } from 'rxjs';

@UntilDestroy()
@Injectable()
export class PlayerService {
  src$ = new BehaviorSubject<string>(null);

  playerStatus$ = new BehaviorSubject<boolean>(false);

  volume$ = new BehaviorSubject<number>(100);
  beforeMute: number = 100;

  mouseMove: Subscription;
  changeControlsStyle$ = new BehaviorSubject<boolean>(false);

  fullTrackTime$ = new BehaviorSubject<number>(0);
  currentTrackTime$ = new BehaviorSubject<number>(0);

  progressTrackBuffer$ = new BehaviorSubject<number>(0);

  fullscreen$ = new Subject<boolean>()

  timelineMove$ = new Subject<number>()

  constructor(@Inject(DOCUMENT) private document: Document) {}

  toggleFullScreen(): void {
    const isFullscreen =
      !!(this.document.fullscreenElement || this.document.webkitFullscreenElement)
    this.fullscreen$.next(isFullscreen)
    isFullscreen
      ? this.document.exitFullscreen()
      : this.document.documentElement.requestFullscreen();
  }

  changePlayerStatus(): void {
    this.playerStatus$.next(!this.playerStatus$.getValue())
  }

  updateTrackBuffer(elem: HTMLVideoElement): void {
    const duration = elem.duration;
    if (duration > 0) {
      for (let i = 0; i < elem.buffered.length; i++) {
        if (
          elem.buffered.start(elem.buffered.length - 1 - i) < elem.currentTime
        ) {
          this.progressTrackBuffer$.next((elem.buffered.end(elem.buffered.length - 1 - i) / duration) * 100)
          break;
        }
      }
    }
  }

  muteVolume(): void {
    this.volume$.next(!this.volume$.getValue() ? this.beforeMute : 0);
  }

  detectMouseMove(elem: HTMLElement): void {
    this.mouseMove = fromEvent(elem, 'mousemove')
      .pipe(
        untilDestroyed(this),
        tap(() => this.changeControlsStyle$.next(false)),
        debounceTime(2500),
        tap(() => {
          if (this.playerStatus$.getValue()) {
            this.changeControlsStyle$.next(true);
          }
        }),
      )
      .subscribe();
  }

  unsubscribeMouseMove(): void {
    if (this.mouseMove.closed) {
      return;
    }

    this.mouseMove.unsubscribe();
    this.changeControlsStyle$.next(false);
  }

}
