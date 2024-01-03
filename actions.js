import { song_parts } from './refdata.js'

export const UpdateActions = function (self) {
	let actions = {
		on_air_toggle: {
			name: 'Toggle On Air',
			callback: async () => {
				if (self.proclaimAPI.on_air) {
					self.proclaimAPI.sendAppCommand('GoOffAir')
				} else {
					self.proclaimAPI.sendAppCommand('GoOnAir')
				}
			},
		},

		go_to_service_item: {
			name: 'Go To Service Item',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Service Item Number',
					default: 1,
					min: 1,
					max: 254,
				},
			],
			callback: async (event) => {
				self.proclaimAPI.sendAppCommand('GoToServiceItem', event.options.num)
			},
		},

		go_to_slide: {
			name: 'Go To Slide',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Slide Number',
					default: 1,
					min: 1,
					max: 254,
				},
			],
			callback: async (event) => {
				self.proclaimAPI.sendAppCommand('GoToSlide', event.options.num)
			},
		},

		go_to_song_part: {
			name: 'Go To Song Part',
			options: [
				{
					type: 'dropdown',
					id: 'song_part',
					label: 'Song Part',
					default: 0,
					choices: song_parts,
				},
				{
					id: 'item_index',
					type: 'number',
					label: 'Index',
					default: 1,
					min: 1,
					max: 254,
				},
			],
			callback: async (event) => {
				const part = song_parts[event.options.song_part].label
				self.proclaimAPI.sendAppCommand(`ShowSongLyrics${part}ByIndex`, event.options.item_index)
			},
		},
	}

	const simpleActions = [
		// On/Off Air
		{ id: 'go_on_air', name: 'Go On Air', appCommand: 'GoOnAir' },
		{ id: 'go_off_air', name: 'Go Off Air', appCommand: 'GoOffAir' },

		// Slides
		{ id: 'previous_slide', name: 'Previous Slide', appCommand: 'PreviousSlide' },
		{ id: 'next_slide', name: 'Next Slide', appCommand: 'NextSlide' },
		{ id: 'previous_service_item', name: 'Previous Service Item', appCommand: 'PreviousServiceItem' },
		{ id: 'next_service_item', name: 'Next Service Item', appCommand: 'NextServiceItem' },

		// Service Parts
		{ id: 'start_pre_service', name: 'Start Pre Service', appCommand: 'StartPreService' },
		{ id: 'start_warm_up', name: 'Start Warm Up', appCommand: 'StartWarmUp' },
		{ id: 'start_service', name: 'Start Service', appCommand: 'StartService' },
		{ id: 'start_post_service', name: 'Start Post Service', appCommand: 'StartPostService' },

		// Media
		{ id: 'next_audio_item', name: 'Next Audio Item', appCommand: 'NextAudioItem' },
		{ id: 'previous_audio_item', name: 'Previous Audio Item', appCommand: 'PreviousPreviousAudioItem' }, // (sic.)
		{ id: 'video_restart', name: 'Video Restart', appCommand: 'VideoRestart' },
		// Not clear how "rewind" differs from "restart", or what "fast forward" does
		// { id: 'video_rewind', name: 'Video Rewind', appCommand: 'VideoRestart' },
		// { id: 'video_fast_forward', name: 'Video Fast Forward', appCommand: 'VideoFastForward' },
		{ id: 'video_play', name: 'Video Play', appCommand: 'VideoPlay' },
		{ id: 'video_pause', name: 'Video Pause', appCommand: 'VideoPause' },

		// Quick Screens
		{ id: 'show_blank_quick_screen', name: 'Show Blank Quick Screen', appCommand: 'ShowBlankQuickScreen' },
		{ id: 'show_logo_quick_screen', name: 'Show Logo Quick Screen', appCommand: 'ShowLogoQuickScreen' },
		{ id: 'show_no_text_quick_screen', name: 'Show No Text Quick Screen', appCommand: 'ShowNoTextQuickScreen' },
		{
			id: 'show_floating_hearts_quick_screen',
			name: 'Show Floating Hearts Quick Screen',
			appCommand: 'ShowFloatingHeartsQuickScreen',
		},
		{
			id: 'show_floating_amens_quick_screen',
			name: 'Show Floating Amens Quick Screen',
			appCommand: 'ShowFloatingAmensQuickScreen',
		},
		{ id: 'show_amen_quick_screen', name: 'Show Amen Quick Screen', appCommand: 'ShowAmenQuickScreen' },
		{
			id: 'show_hallelujah_quick_screen',
			name: 'Show Hallelujah Quick Screen',
			appCommand: 'ShowHallelujahQuickScreen',
		},
		{
			id: 'show_praise_the_lord_quick_screen',
			name: 'Show Praise The Lord Quick Screen',
			appCommand: 'ShowPraiseTheLordQuickScreen',
		},
		{
			id: 'show_he_is_risen_quick_screen',
			name: 'Show He Is Risen Quick Screen',
			appCommand: 'ShowHeIsRisenQuickScreen',
		},
		{
			id: 'show_he_is_risen_indeed_quick_screen',
			name: 'Show He Is Indeed White Screen',
			appCommand: 'ShowHeIsRisenWhiteQuickScreen', // (sic.)
		},
	]

	// Add simple actions
	for (var action in simpleActions) {
		let id = simpleActions[action].id
		let name = simpleActions[action].name
		let appCommand = simpleActions[action].appCommand
		actions[id] = {
			name: name,
			callback: async () => {
				self.proclaimAPI.sendAppCommand(appCommand)
			},
		}
	}

	self.setActionDefinitions(actions)
}
