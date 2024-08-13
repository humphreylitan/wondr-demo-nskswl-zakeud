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
import { truncateString } from './utils/truncateString';
import { ToggleText } from './components/toggle-text';

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
			<div className="flex flex-col mb-4 mt-4">
				<ul className="flex w-full whitespace-nowrap overflow-x-scroll pb-2 pt-1 mb-1">
					{currentItem?.summary?.tags?.map((tag) => {
						return (
							<li className="text-md mr-6 font-heading text-solid-blue cursor-pointer">
								{tag}
							</li>
						);
					})}
				</ul>
				<h1 className="text-2xl md:text-3xl w-full leading-tight">
					{currentItem?.title || null}
				</h1>
			</div>

			<div className="flex gap-4">
				{/* Content */}
				<div className="flex-grow flex flex-col gap-4">
					<div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col">
						<div className="font-semibold flex items-center grow mb-2">
							<span className="mr-6">2,436 views</span>
							<span>Uploaded on Aug 9th, 2024</span>
						</div>
						<div>
							<p className="text-gray-900 text-left text-md max-w-4xl leading-normal whitespace-pre-line">
								{currentItem?.summary?.description}
							</p>
						</div>
					</div>

					{/* Channel */}
					<div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col">
						<header className="flex mb-4">
							<div className="flex flex-grow items-center mr-2">
								<figure className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-gray-100 border border-solid shrink-0 mr-3">
									<img
										src="https://rutherford-public-images.imgix.net/channels/logo_images/a808219ceca01e28d6e80d0d1028db32.jpg?height=48"
										className="object-cover w-full h-full"
									/>
								</figure>
								<div className="flex flex-col">
									<h4 className="text-base text-gray-900 font-heading font-semibold">
										Philips
									</h4>
									<span className="text-xs text-gray-500 font-heading">
										172 videos
									</span>
								</div>
							</div>
							<button className="h-8 rounded-lg px-4 flex items-center leading-none text-md font-semibold border border-solid border-solid-blue bg-solid-blue text-white hover:bg-blue-900">
								Subscribe
							</button>
						</header>
						<div className="leading-6 whitespace-pre-line text-gray-800 max-w-4xl">
							<p>
								Philips offers a variety of live courses and on-demand programs
								led by leaders in the coronary vascular community which allow
								you to discover Philips’ cardiology solutions and are designed
								to strengthen clinical confidence and improve patient outcomes
							</p>
							<p>
								<a
									href="https://philips.com/cardiology"
									className="underline hover:no-underline"
								>
									Philips.com/cardiology
								</a>
							</p>
						</div>
					</div>

					<details
						open
						className="group w-full bg-gray-50 rounded-xl flex flex-col overflow-hidden"
					>
						<summary className="cursor-pointer flex items-center font-semibold  p-4 hover:bg-gray-100">
							<h2 className="text-lg font-semibold tracking-normal text-gray-900">
								Summary
							</h2>
							<button className="ml-auto">
								<svg
									width={24}
									height={24}
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="-rotate-90 group-open:rotate-0"
								>
									<path
										d="M18.75 8.625L12 15.375l-6.75-6.75"
										stroke="#767676"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</summary>
						<div className="leading-6 whitespace-pre-line max-w-4xl p-4">
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
										<h2 className=" text-gray-900 font-semibold mb-1">
											{section.heading}
										</h2>
										<p className="text-gray-800">{section.text}</p>
									</button>
								);
							})}
						</div>
					</details>

					<details className="group w-full bg-gray-50 rounded-xl flex flex-col overflow-hidden">
						<summary className="cursor-pointer flex items-center font-semibold  p-4 hover:bg-gray-100">
							<h2 className="text-lg font-semibold tracking-normal text-gray-900">
								Transcript
							</h2>
							<button className="ml-auto">
								<svg
									width={24}
									height={24}
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="-rotate-90 group-open:rotate-0"
								>
									<path
										d="M18.75 8.625L12 15.375l-6.75-6.75"
										stroke="#767676"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</summary>
						<div className="leading-6 whitespace-pre-line max-w-4xl p-4">
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

								if (speaker && defaultSpeaker !== speaker)
									defaultSpeaker = speaker;

								const activeSection =
									currentTime >= section.start && currentTime <= section.end;
								return (
									<button
										key={index}
										onClick={(e) => skipToSegment(section.start, e)}
										className={`w-full flex items-start justify-start gap-6 mt-4 text-left  text-gray-800 transition-opacity ${
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

					{/* <div className="text-gray-900 px-6 py-4 bg-gray-100 mt-8 rounded-md">
						<header className="flex items-center font-semibold ">
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
						<div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8"></div>
					</div> */}

					{currentItem?.speakers ? (
						<div className="">
							<h2 className="text-lg tracking-tight leading-none mb-4">
								Speakers
							</h2>
							<div className="grid lg:grid-cols-2 gap-4">
								{currentItem.speakers.map((speaker) => (
									<div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col">
										<div className="flex mb-2">
											<div className="flex flex-grow items-center mr-2">
												<figure className="w-12 h-12 mr-3 shrink-0 rounded-full overflow-hidden bg-gray-100">
													<img
														src={speaker.image}
														className="w-full h-full object-cover"
													/>
												</figure>
												<div className="flex flex-col">
													<h3 className="font-heading text-md font-semibold tracking-normal leading-none mb-1">
														{speaker.name}
													</h3>
													<h4 className="font-heading font-normal text-md text-gray-500 tracking-normal leading-none">
														Speaker
													</h4>
												</div>
											</div>
											<button className="h-8 rounded-lg px-4 flex items-center leading-none text-md font-semibold border border-solid border-solid-blue bg-solid-blue text-white hover:bg-blue-900">
												Follow
											</button>
										</div>

										<div>
											<p className="text-gray-500 text-md">
												<ToggleText
													collapsedContent={truncateString(speaker.bio, 120)}
													expandedContent={speaker.bio}
												/>
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					) : null}

					<section className="mt-4">
						<h2 className="text-lg tracking-tight leading-none mb-4">
							Comments
						</h2>

						<div className="flex">
							<figure className="bg-gray-900 w-12 h-12 shrink-0 rounded-full text-white flex items-center justify-center">
								DA
							</figure>
							<div className="ml-3 flex-grow flex flex-col bg-gray-50 rounded-xl overflow-hidden px-4 py-3 items-end">
								<button className="h-8 flex items-center px-4 text-white rounded-lg bg-solid-blue text-md font-semibold mt-4">
									Comment
								</button>
							</div>
						</div>
					</section>
				</div>

				{/* Sidebar */}
				<div className="sidebar w-[248px] shrink-0 flex flex-col gap-4">
					<div className="hidden w-full lg:grid grid-cols-3 mb-2">
						{/* Like */}
						<button className="flex justify-center items-center h-10 lg:h-[28px] rounded-lg px-3 bg-gray-50 lg:bg-transparent hover:bg-gray-100 text-gray-800">
							<svg
								width={16}
								height={16}
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="shrink-0"
							>
								<path
									d="M10 14.3175C10 14.3175 9.5 14.5 8 14.5C6.5 14.5 5.6875 14 5 13.5H3C2.46957 13.5 1.96086 13.2893 1.58579 12.9142C1.21071 12.5391 1 12.0304 1 11.5V10C1 9.46957 1.21071 8.96086 1.58579 8.58579C1.96086 8.21071 2.46957 8 3 8H3.9375C4.10921 7.99905 4.27784 7.95437 4.42749 7.87017C4.57714 7.78596 4.70287 7.66502 4.79281 7.51875C4.79281 7.51875 5.0625 6.93156 5.875 5.52437C6.6875 4.11719 8.25 2 8.5 1.5C9.40625 1.5 9.84375 2.1875 9.5625 2.99094C9.24125 3.90937 8.82156 4.69031 8.70438 5.7125C8.6875 5.86188 8.8025 6.0875 8.95281 6.0875L13 6.40625"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M13 8.46875L10.5 8.40625C9.875 8.34875 9.5 8.01875 9.5 7.46875C9.5 6.91875 9.9375 6.5675 10.5 6.53125L13 6.40625C13.55 6.40625 14 6.91875 14 7.46875V7.47406C13.9986 7.73836 13.8926 7.99135 13.7052 8.17774C13.5179 8.36413 13.2643 8.46875 13 8.46875ZM14 10.5L10.5 10.4375C9.9375 10.4113 9.5 10.0497 9.5 9.5C9.5 8.94969 9.9375 8.59812 10.5 8.5625L14 8.5C14.265 8.50082 14.5188 8.60645 14.7062 8.7938C14.8936 8.98116 14.9992 9.23504 15 9.5C14.9992 9.76496 14.8936 10.0188 14.7062 10.2062C14.5188 10.3936 14.265 10.4992 14 10.5ZM12.5 14.5L10.5 14.4062C9.84375 14.3487 9.5 14.05 9.5 13.5C9.5 12.95 9.95 12.5625 10.5 12.5625L12.5 12.5C12.765 12.5007 13.0189 12.6063 13.2063 12.7937C13.3937 12.9811 13.4993 13.235 13.5 13.5C13.4993 13.765 13.3937 14.0189 13.2063 14.2063C13.0189 14.3937 12.765 14.4993 12.5 14.5ZM13.5 12.5L10.5 12.4375C9.90625 12.4113 9.5 12.05 9.5 11.5C9.5 10.95 9.90625 10.5987 10.5 10.5625L13.5 10.5C13.765 10.5007 14.0189 10.6063 14.2063 10.7937C14.3937 10.9811 14.4993 11.235 14.5 11.5C14.4993 11.765 14.3937 12.0189 14.2063 12.2063C14.0189 12.3937 13.765 12.4993 13.5 12.5Z"
									stroke="currentColor"
									strokeMiterlimit={10}
								/>
							</svg>
							<span className="hidden lg:inline-block font-medium font-heading ml-1">
								Like
							</span>
						</button>

						{/* Share */}
						<button className="flex justify-center items-center h-10 lg:h-[28px] rounded-lg px-3 bg-gray-50 lg:bg-transparent hover:bg-gray-100 text-gray-800">
							<svg
								width={16}
								height={16}
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="shrink-0"
							>
								<path
									d="M14 8L8.5 2.75V5.75C3.23656 5.75 2 9.52406 2 13.25C3.51906 11.305 4.8625 10.25 8.5 10.25V13.25L14 8Z"
									stroke="currentColor"
									strokeLinejoin="round"
								/>
							</svg>

							<span className="hidden lg:inline-block font-medium font-heading ml-1">
								Share
							</span>
						</button>

						{/* Save */}
						<button className="flex justify-center items-center h-10 lg:h-[28px] rounded-lg px-3 bg-gray-50 lg:bg-transparent hover:bg-gray-100 text-gray-800">
							<svg
								width={16}
								height={16}
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="shrink-0"
							>
								<path
									d="M11 1.5H5C4.60218 1.5 4.22064 1.65804 3.93934 1.93934C3.65804 2.22064 3.5 2.60218 3.5 3V14.5L8 10.5L12.5 14.5V3C12.5 2.60218 12.342 2.22064 12.0607 1.93934C11.7794 1.65804 11.3978 1.5 11 1.5Z"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>

							<span className="hidden lg:inline-block font-medium font-heading ml-1">
								Save
							</span>
						</button>
					</div>

					<h2 className="text-lg tracking-tight leading-none">
						Related Videos
					</h2>
					{items?.map((item, index) => {
						let poster = item.media?.sources?.find(
							(s) =>
								s.label === 'poster' ||
								s.label === 'thumbnail' ||
								s.kind === 'image'
						);
						return (
							<a href={`/?item=${index}`} className="block group">
								<div className="relative w-full aspect-video object-contain object-center rounded-lg overflow-hidden bg-gray-200 mb-2">
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
								<h3 className="text-md font-medium tracking-normal leading-tight">
									{item.title}
								</h3>
							</a>
						);
					})}
				</div>
			</div>
		</div>
	);
}
