import { SONG_PARTS, SIMPLE_ACTIONS } from './refdata.js'

export const UpdateActions = function (self) {
	let actions = {
		on_air_toggle: {
			name: 'Toggle On Air',
			callback: async () => {
				if (self.proclaimAPI.on_air) {
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
				await self.proclaimAPI.sendAppCommand('GoToServiceItem', event.options.num)
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
				await self.proclaimAPI.sendAppCommand('GoToSlide', event.options.num)
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
				const part = SONG_PARTS[event.options.song_part].label
				await self.proclaimAPI.sendAppCommand(`ShowSongLyrics${part}ByIndex`, event.options.item_index)
			},
		},
	}

	// Add simple actions, using the list from refdata.js
	for (var action in SIMPLE_ACTIONS) {
		let id = SIMPLE_ACTIONS[action].name.split(' ').join('_').toLowerCase()
		let name = SIMPLE_ACTIONS[action].name
		let appCommand = SIMPLE_ACTIONS[action].appCommand ? SIMPLE_ACTIONS[action].appCommand : name.split(' ').join('')
		actions[id] = {
			name: name,
			callback: async () => {
				await self.proclaimAPI.sendAppCommand(appCommand)
			},
		}
	}

	self.setActionDefinitions(actions)
}
