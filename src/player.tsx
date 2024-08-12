import '@vidstack/react/player/styles/base.css';

import { useEffect, useRef, useState } from 'react';

import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaCanPlayDetail,
  type MediaCanPlayEvent,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
} from '@vidstack/react';

import { VideoLayout } from './components/layouts/video-layout';

import { items } from './items.js';

export function Player() {
  let queryString = '';
  if (typeof window !== 'undefined') {
    queryString = window.location.search;
  }
  const urlParams = new URLSearchParams(queryString);
  let itemIndex = parseInt(urlParams.get('item') || 0);
  let player = useRef<MediaPlayerInstance>(null);

  const [currentItem, setCurrentItem] = useState(items[itemIndex]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(
      ({ currentTime: ct, paused, viewType }) => {
        // console.log('is paused?', '->', state.paused);
        // console.log('is audio view?', '->', state.viewType === 'audio');
        setCurrentTime(parseInt(ct));
      }
    );
  }, []);

  function onProviderChange(
    provider: MediaProviderAdapter | null,
    nativeEvent: MediaProviderChangeEvent
  ) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  function onCanPlay(
    detail: MediaCanPlayDetail,
    nativeEvent: MediaCanPlayEvent
  ) {
    // ...
  }

  function skipToSegment(start: Number, e: Event) {
    const seconds = parseInt(start);
    console.log(`Seeking to ${seconds}`);
    player.current.currentTime = seconds;
    player.current.play();
  }

  let media = currentItem?.media;
  let defaultSpeaker = '0';

  let hls =
    media?.sources?.find((s) => s.format === 'hls' || s.format === 'cmaf') ||
    null;
  let mp4s = [];
  media?.sources
    ?.filter((s) => s.format === 'mp4')
    .forEach((s) => {
      mp4s.push({
        type: 'video/mp4',
        src: s.src,
      });
    });
  let poster =
    media?.sources?.find((s) => s.label === 'poster' || s.kind === 'image') ||
    null;
  let thumbnails = media?.tracks?.find((s) => s.kind === 'thumbnails') || null;

  let playerSources = [];
  if (hls) {
    playerSources.push({
      type: 'application/x-mpegUrl',
      src: media?.hls || null,
    });
  }
  if (mp4s.length) {
    mp4s
      .sort((a, b) => a.filesize - b.filesize)
      .forEach((s) => {
        playerSources.push(s);
      });
  }

  let aspect = null;
  if (media?.width && media?.height) {
    aspect = `w-[${media.height}/${media.height}]`;
  }

  return (
    <div>
      <MediaPlayer
        className={`w-full ${
          aspect || 'aspect-video'
        } bg-black text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4`}
        src={playerSources}
        crossOrigin
        playsInline
        onProviderChange={onProviderChange}
        onCanPlay={onCanPlay}
        ref={player}
      >
        <MediaProvider>
          <Poster
            className="absolute inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
            src={poster}
            alt=""
          />
          {media?.tracks?.map((track) => (
            <Track {...track} key={track.src} />
          ))}
        </MediaProvider>
        <VideoLayout thumbnails={thumbnails} />
      </MediaPlayer>
      <div className="mt-8 flex items-end">
        <h1 className="text-gray-900 font-bold text-2xl text-left lg:pr-8">
          {currentItem?.title || null}
        </h1>
      </div>

      <details
        open
        className="group text-gray-900 px-6 py-4 bg-gray-50 mt-8 rounded-xl"
      >
        <summary className="cursor-pointer flex items-start">
          <div className="text-gray-900 font-semibold text-base flex items-center grow">
            <span>2,436 views</span>
            <span className="ml-auto">Uploaded on Aug 9th, 2024</span>
          </div>
          <button className="ml-auto mt-1 pl-4">
            <svg
              className={`fill-current opacity-75 w-4 h-4 -mr-1 rotate-90 group-open:-rotate-90`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
            </svg>
          </button>
        </summary>
        <div className="mt-8">
          <p className="text-gray-500 text-left text-base lg:text-lg max-w-4xl leading-6 whitespace-pre-line">
            {currentItem?.summary?.description}
          </p>
          <ul className="mt-8 flex flex-wrap items-start">
            {currentItem?.summary?.tags?.map((tag) => {
              return (
                <li className="cursor-pointer px-4 py-0.5 bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 transition-colors text-sm leading-6 rounded-full mr-3 mb-3">
                  {tag}
                </li>
              );
            })}
          </ul>
        </div>
      </details>

      <details
        open
        className="group text-gray-900 px-6 py-4 bg-gray-100 mt-8 rounded-md"
      >
        <summary className="cursor-pointer flex items-center font-semibold text-base">
          <span>Summary</span>
          <button className="ml-auto">
            <svg
              className="fill-current opacity-75 w-4 h-4 -mr-1 rotate-90 group-open:-rotate-90"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
            </svg>
          </button>
        </summary>
        <div className="mt-8 text-base leading-6 whitespace-pre-line max-w-4xl ">
          {currentItem?.summary?.sections.map((section, index) => {
            const activeSection =
              currentTime >= section.start && currentTime <= section.end;
            return (
              <button
                key={index}
                onClick={(e) => skipToSegment(section.start, e)}
                className={`w-full pb-6 text-left transition-opacity ${
                  activeSection ? '' : 'opacity-60 hover:opacity-90'
                }`}
              >
                <h2 className="text-base text-gray-900 font-semibold mb-2">
                  {section.heading}
                </h2>
                <p className="text-gray-800">{section.text}</p>
              </button>
            );
          })}
        </div>
      </details>

      {currentItem?.speakers ? (
        <div className="mt-8">
          {/* <h3 className="text-gray-900 text-base font-semibold">Speakers</h3> */}
          <div className="mt-4 grid lg:grid-cols-2 gap-4 lg:gap-8">
            {currentItem.speakers.map((speaker) => (
              <details className="group text-gray-900 px-6 py-4 bg-gray-100 rounded-md self-start">
                <summary className="cursor-pointer flex items-center font-semibold text-base">
                  {speaker.image ? (
                    <img
                      src={speaker.image}
                      className="w-12 h-12 object-cover object-center rounded-full"
                    />
                  ) : null}
                  <div className="ml-4">
                    <h4>{speaker.name}</h4>
                    <span className="text-xs text-gray-500">Speaker</span>
                  </div>
                  <button
                    className="h-8 rounded-sm px-4 flex items-center leading-none text-sm font-semibold border border-solid border-blue-600 bg-blue-600 text-white hover:bg-blue-700 ml-auto"
                    type="button"
                  >
                    <span>Follow</span>
                  </button>
                  <button className="ml-4">
                    <svg
                      className="fill-current opacity-75 w-4 h-4 -mr-1 rotate-90 group-open:-rotate-90"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
                    </svg>
                  </button>
                </summary>
                <div className="mt-8 text-base leading-6 whitespace-pre-line">
                  <p className="text-gray-600 text-left text-sm whitespace-pre-line">
                    {speaker.bio}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      <details className="group text-gray-900 px-6 py-4 bg-gray-100 mt-8 rounded-md">
        <summary className="cursor-pointer flex items-center font-semibold text-base">
          <span>Transcript</span>
          <button className="ml-auto">
            <svg
              className="fill-current opacity-75 w-4 h-4 -mr-1 rotate-90 group-open:-rotate-90"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
            </svg>
          </button>
        </summary>
        <div className="mt-8 text-base leading-6 whitespace-pre-line">
          {currentItem?.speech?.timeline?.map((section, index) => {
            const dateObj = new Date(section.start * 1000);
            const hours = dateObj.getUTCHours();
            const minutes = dateObj.getUTCMinutes();
            const seconds = dateObj.getSeconds();
            const timestamp =
              hours.toString().padStart(2, '0') +
              ':' +
              minutes.toString().padStart(2, '0') +
              ':' +
              seconds.toString().padStart(2, '0');

            const speaker = section.speaker;
            let speakerName = `Speaker ${speaker}`;
            if (currentItem?.speakers?.length >= speaker) {
              speakerName = currentItem.speakers[speaker - 1]?.name;
            }
            if (speaker === defaultSpeaker) speakerName = null;

            if (speaker && defaultSpeaker !== speaker) defaultSpeaker = speaker;

            const activeSection =
              currentTime >= section.start && currentTime <= section.end;
            return (
              <button
                key={index}
                onClick={(e) => skipToSegment(section.start, e)}
                className={`w-full flex items-start justify-start gap-6 mt-4 text-left text-base text-gray-800 transition-opacity ${
                  activeSection ? '' : 'opacity-60 hover:opacity-90'
                }`}
              >
                <div className="w-24 lg:w-32 text-left text-gray-500 text-sm leading-6 flex-shrink-0">
                  {speakerName}
                </div>
                <div className="flex-grow">{section.text}</div>
                <div className="w-24 text-right text-gray-500 text-sm leading-6 flex-shrink-0">
                  {timestamp}
                </div>
              </button>
            );
          })}
        </div>
      </details>

      <div className="text-gray-900 px-6 py-4 bg-gray-100 mt-8 rounded-md">
        <header className="flex items-center font-semibold text-base">
          <div className="">
            <h4>Laser Atherectomy (presented by Philips)</h4>
            <span className="text-xs text-gray-500">4 videos</span>
          </div>
          <button
            className="h-8 rounded-sm px-4 flex items-center leading-none text-sm font-semibold border border-solid border-blue-600 bg-blue-600 text-white hover:bg-blue-700 ml-auto"
            type="button"
          >
            <span>Save</span>
          </button>
        </header>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items?.map((item, index) => {
            let poster = item.media?.sources?.find(
              (s) =>
                s.label === 'poster' ||
                s.label === 'thumbnail' ||
                s.kind === 'image'
            );
            return (
              <a href={`/?item=${index}`} className="block group">
                <div className="relative w-full aspect-video object-contain object-center overflow-hidden bg-gray-200">
                  {poster ? (
                    <img
                      src={poster.src}
                      alt=""
                      className="w-full transition-transform group-hover:scale-105"
                    />
                  ) : null}
                  {item.id === currentItem.id ? (
                    <div className="absolute inset-0 bg-blue-500/75 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        Now Playing
                      </span>
                    </div>
                  ) : null}
                </div>
                <h4 className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 mt-4">
                  {item.title}
                </h4>
              </a>
            );
          })}
        </div>
      </div>

      <div className="text-gray-900 px-6 py-4 bg-gray-100 mt-8 rounded-md">
        <header className="flex items-center font-semibold text-base">
          <img
            src="https://rutherford-public-images.imgix.net/channels/logo_images/a808219ceca01e28d6e80d0d1028db32.jpg?height=48"
            className="w-12 h-12 object-cover object-center rounded-full"
          />
          <div className="ml-4">
            <h4>Philips</h4>
            <span className="text-xs text-gray-500">172 videos</span>
          </div>
          <button
            className="h-8 rounded-sm px-4 flex items-center leading-none text-sm font-semibold border border-solid border-blue-600 bg-blue-600 text-white hover:bg-blue-700 ml-auto"
            type="button"
          >
            <span>Subscribe</span>
          </button>
        </header>
        <div className="mt-8 text-base leading-6 whitespace-pre-line text-gray-800 max-w-4xl space-y-4">
          <p>
            Philips offers a variety of live courses and on-demand programs led
            by leaders in the coronary vascular community which allow you to
            discover Philips’ cardiology solutions and are designed to
            strengthen clinical confidence and improve patient outcomes
          </p>
          <p>
            <a href="https://philips.com/cardiology" className="underline">
              Philips.com/cardiology
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
