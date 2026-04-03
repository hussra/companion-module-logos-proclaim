import type { ModuleInstance } from './main.js'
import { SONG_PARTS, SIMPLE_ACTIONS, CUSTOM_QUICK_SCREEN_COUNT } from './refdata.js'
import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance) {
	const style = {
		size: 18,
		bgcolor: combineRgb(0, 0, 0),
		color: combineRgb(255, 255, 255),
	}

	// On/Off Air Toggle with feedback
	const presets: CompanionPresetDefinitions = {
		on_air: {
			type: 'button',
			category: 'On Air',
			name: 'On Air',
			style: {
				...style,
				text: 'On Air',
			},
			steps: [
				{
					down: [
						{
							actionId: 'on_air_toggle',
							options: {}
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'on_air',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
		},
	}

	// Add simple action presets, using the list from refdata.js
	for (var preset in SIMPLE_ACTIONS) {
		let id: string = SIMPLE_ACTIONS[preset].name.split(' ').join('_').toLowerCase()
		let name: string = SIMPLE_ACTIONS[preset].name
		let category: string = SIMPLE_ACTIONS[preset].category
		let text: string = (SIMPLE_ACTIONS[preset].text ? SIMPLE_ACTIONS[preset].text : SIMPLE_ACTIONS[preset].name)!
		let size: number = (SIMPLE_ACTIONS[preset].size ? SIMPLE_ACTIONS[preset].size : 18)!
		presets[id] = {
			type: 'button',
			category: category,
			name: name,
			style: {
				...style,
				size: size,
				text: text,
			},
			steps: [
				{
					down: [
						{
							actionId: id,
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: []
		}
	}

	for (var i: number = 1; i <= CUSTOM_QUICK_SCREEN_COUNT; i++) {
		presets[`show_custom_quick_screen_${i}`] = {
			type: 'button',
			category: 'Quick Screens',
			name: `Show Custom Quick Screen ${i}`,
			style: {
				...style,
				text: `Custom ${i}`,
			},
			steps: [
				{
					down: [
						{
							actionId: 'show_custom_quick_screen',
							options: {
								num: i,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: []
		}
	}

	// Song Parts
	for (var part in SONG_PARTS) {
		let partId = SONG_PARTS[part].id
		let label = SONG_PARTS[part].label
		let displayLabel: string = (SONG_PARTS[part].displayLabel ? SONG_PARTS[part].displayLabel : SONG_PARTS[part].label)!

		if (label == 'Verse') {
			for (var v = 1; v < 10; v++) {
				const presetId = `song_part_${label.toLowerCase()}_${v}`
				presets[presetId] = {
					type: 'button',
					category: 'Song Parts',
					name: `${label} ${v}`,
					style: {
						...style,
						text: `${displayLabel}\\n${v}`,
					},
					steps: [
						{
							down: [
								{
									actionId: 'go_to_song_part',
									options: {
										song_part: partId,
										item_index: v,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: []
				}
			}
		} else {
			const presetId = `song_part_${label.toLowerCase()}`
			presets[presetId] = {
				type: 'button',
				category: 'Song Parts',
				name: label,
				style: {
					...style,
					text: displayLabel,
				},
				steps: [
					{
						down: [
							{
								actionId: 'go_to_song_part',
								options: {
									song_part: partId,
									item_index: 1,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: []
			}
		}
	}

	self.setPresetDefinitions(presets)
}
