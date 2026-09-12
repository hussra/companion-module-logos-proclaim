import { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { SONG_PARTS, SIMPLE_ACTIONS, CUSTOM_QUICK_SCREEN_COUNT } from './refdata.js'

export const UpdateActions = function (self: ModuleInstance): void {
	const actions: CompanionActionDefinitions = {
		on_air_toggle: {
			name: 'Toggle On Air',
			options: [],
			callback: async () => {
				if (self.proclaimAPI.status.onAir) {
					await self.proclaimAPI.sendAppCommand('GoOffAir')
				} else {
					await self.proclaimAPI.sendAppCommand('GoOnAir')
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
				await self.proclaimAPI.sendAppCommand('GoToServiceItem', event.options.num as number)
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
				await self.proclaimAPI.sendAppCommand('GoToSlide', event.options.num as number)
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
					choices: SONG_PARTS,
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
				const part = SONG_PARTS[event.options.song_part as number].label
				await self.proclaimAPI.sendAppCommand(`ShowSongLyrics${part}ByIndex`, event.options.item_index as number)
			},
		},

		show_custom_quick_screen: {
			name: 'Show Custom Quick Screen',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Custom Quick Screen Number',
					default: 1,
					min: 1,
					max: CUSTOM_QUICK_SCREEN_COUNT,
				},
			],
			callback: async (event) => {
				await self.proclaimAPI.sendAppCommand('ShowCustomQuickScreen', event.options.num as number)
			},
		},
	}

	// Add simple actions, using the list from refdata.js
	for (const action of SIMPLE_ACTIONS) {
		const id = action.name.split(' ').join('_').toLowerCase()
		const name = action.name
		const appCommand = action.appCommand || name.split(' ').join('')
		actions[id] = {
			name: name,
			callback: async () => {
				await self.proclaimAPI.sendAppCommand(appCommand)
			},
			options: [],
		}
	}

	self.setActionDefinitions(actions)
}
