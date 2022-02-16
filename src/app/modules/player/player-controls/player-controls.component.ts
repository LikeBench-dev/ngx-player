import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild, } from '@angular/core';
import { mdiFastForward, mdiFullscreen, mdiFullscreenExit, mdiPause, mdiPlay, mdiRewind, mdiVolumeHigh, mdiVolumeOff, } from '@mdi/js';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, map, tap, } from 'rxjs';
import { PlayerService } from '../player.service';

interface Controls {
  play: string;
  pause: string;
  rewind: string;
  forward: string;
  fullscreen: string;
  iconVolume: string;
}

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    webkitIsFullScreen?: Element;
  }
}

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ngx-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
})
export class PlayerControlsComponent implements AfterViewInit {
  @ViewChild('inputVolume') inputVolume: ElementRef<HTMLInputElement>;
  @ViewChild('timelineContainer') timelineContainer: ElementRef<HTMLElement>;
  @ViewChild('timeline') timeline: ElementRef<HTMLElement>;
  @ViewChild('buffered') buffered: ElementRef<HTMLElement>;

  @Output() clickPlay = new EventEmitter();

  controls: Controls = {
    play: mdiPlay,
    pause: mdiPause,
    rewind: mdiRewind,
    forward: mdiFastForward,
    fullscreen: mdiFullscreen,
    iconVolume: mdiVolumeHigh,
  };

  constructor(
    public playerService: PlayerService
  ) {}

  onClickPlay(value: Event) {
    this.clickPlay.emit(value);
  }

  ngAfterViewInit(): void {
    this.initControlsStream();
  }

  initControlsStream(): void {
    /**
     * Set subscribe volume video
     */
    fromEvent(this.inputVolume.nativeElement, 'input')
      .pipe(
        untilDestroyed(this),
        map((e) => +(e.target as HTMLInputElement).value),
        tap((val) => this.playerService.volume$.next(val)),

        /**
         * В комменте, так как если с этим кодом нажимать на мут звука, то не отрабатывает... Пришлось отдельно
         */
        // finalize(() => console.log('test inputVolume')),
        // switchMap(() =>
        //   interval(100).pipe(
        //     takeUntil(
        //       this.playerService.volume$.pipe(
        //         tap((val) => {
        //           console.log('11')
        //           this.controls.iconVolume = !val ? mdiVolumeOff : mdiVolumeHigh;
        //           if (val) this.playerService.beforeMute = val;
        //         }),
        //       ),
        //     ),
        //   ),
        // ),
      )
      .subscribe();

    this.playerService.volume$
      .pipe(
        untilDestroyed(this),
        tap((val) => {
          this.controls.iconVolume = !val ? mdiVolumeOff : mdiVolumeHigh;
          if (val) this.playerService.beforeMute = val;
        }),
      )
      .subscribe();
  }

  getValue(event: Event): number {
    return +(event.target as HTMLInputElement).value;
  }

  /**
   * For fix 'ESC' exit from fullscreen
   */
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  handleKeyboardEvent() {
    this.controls.fullscreen =
      document.fullscreenElement || document.webkitFullscreenElement
        ? mdiFullscreenExit
        : mdiFullscreen;
  }

  onTimelineMove(
    event: MouseEvent,
    timeline: HTMLElement,
    timelineContainer: HTMLElement,
  ): void {
    const mouseX = Number((event.pageX - timeline.getBoundingClientRect().left).toFixed(0))
    const parentElem = timelineContainer.parentElement
    this.playerService.timelineMove$.next(
      mouseX / ((parentElem.offsetWidth - timelineContainer.offsetLeft * 2) / 100)
    )
  }
}
