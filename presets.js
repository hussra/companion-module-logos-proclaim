import { song_parts } from './refdata.js'
import { combineRgb } from '@companion-module/base'

export const UpdatePresets = async function (self) {
	const style = {
		size: 18,
		bgcolor: combineRgb(0, 0, 0),
		color: combineRgb(255, 255, 255),
	}

	// On/Off Air Toggle with feedback
	let presets = {
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
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'on_air',
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
		},
	}

	const simplePresets = [
		// On/Off Air
		{ id: 'go_on_air', name: 'Go On Air', category: 'On Air', text: 'Go On Air' },
		{ id: 'go_off_air', name: 'Go Off Air', category: 'On Air', text: 'Go Off Air' },

		// Slides
		{ id: 'previous_slide', name: 'Previous Slide', category: 'Slides', text: 'Prev\nSlide' },
		{ id: 'next_slide', name: 'Next Slide', category: 'Slides', text: 'Next\nSlide' },
		{ id: 'previous_service_item', name: 'Previous Service Item', category: 'Slides', text: 'Prev\nItem' },
		{ id: 'next_service_item', name: 'Next Service Item', category: 'Slides', text: 'Next\nItem' },

		// Service Parts
		{ id: 'start_pre_service', name: 'Start Pre Service', category: 'Service Parts', text: 'Pre Service' },
		{ id: 'start_warm_up', name: 'Start Warm Up', category: 'Service Parts', text: 'Warm Up' },
		{ id: 'start_service', name: 'Start Service', category: 'Service Parts', text: 'Service' },
		{ id: 'start_post_service', name: 'Start Post Service', category: 'Service Parts', text: 'Post Service' },

		// Media
		{ id: 'previous_audio_item', name: 'Previous Audio Item', category: 'Media', text: 'Prev\nAudio' },
		{ id: 'next_audio_item', name: 'Next Audio Item', category: 'Media', text: 'Next\nAudio' },
		{ id: 'video_play', name: 'Video Play', category: 'Media', text: 'Video\nPlay' },
		{ id: 'video_pause', name: 'Video Pause', category: 'Media', text: 'Video\nPause' },
		{ id: 'video_restart', name: 'Video Restart', category: 'Media', text: 'Video\nRestart' },

		// Quick Screens
		{ id: 'show_blank_quick_screen', name: 'Show Blank Quick Screen', category: 'Quick Screens', text: 'Blank' },
		{ id: 'show_logo_quick_screen', name: 'Show Logo Quick Screen', category: 'Quick Screens', text: 'Logo' },
		{ id: 'show_no_text_quick_screen', name: 'Show No Text Quick Screen', category: 'Quick Screens', text: 'No Text' },
		{
			id: 'show_floating_hearts_quick_screen',
			name: 'Show Floating Hearts Quick Screen',
			category: 'Quick Screens',
			text: 'Floating Hearts',
		},
		{
			id: 'show_floating_amens_quick_screen',
			name: 'Show Floating Amens Quick Screen',
			category: 'Quick Screens',
			text: 'Floating Amens',
		},
		{
			id: 'show_amen_quick_screen',
			name: 'Show Amen Quick Screen',
			category: 'Quick Screens',
			text: 'Amen',
		},
		{
			id: 'show_hallelujah_quick_screen',
			name: 'Show Hallelujah Quick Screen',
			category: 'Quick Screens',
			text: 'Hallelujah',
			size: 14,
		},
		{
			id: 'show_praise_the_lord_quick_screen',
			name: 'Show Praise The Lord Quick Screen',
			category: 'Quick Screens',
			text: 'Praise The Lord',
			size: 14,
		},
		{
			id: 'show_he_is_risen_quick_screen',
			name: 'Show He Is Risen Quick Screen',
			category: 'Quick Screens',
			text: 'He Is Risen',
		},
		{
			id: 'show_he_is_risen_indeed_quick_screen',
			name: 'Show He Is Risen Indeed Quick Screen',
			category: 'Quick Screens',
			text: 'He Is Risen Indeed',
			size: 14,
		},
	]

	for (var preset in simplePresets) {
		let id = simplePresets[preset].id
		let name = simplePresets[preset].name
		let category = simplePresets[preset].category
		let text = simplePresets[preset].text
		let size = simplePresets[preset].size
		presets[id] = {
			type: 'button',
			category: category,
			name: name,
			style: {
				...style,
				size: size ? size : 18,
				text: text,
			},
			steps: [
				{
					down: [
						{
							actionId: id,
						},
					],
					up: [],
				},
			],
		}
	}

	// Song Parts
	for (var part in song_parts) {
		if (song_parts[part].label == 'Verse') {
			for (var v = 1; v < 10; v++) {
				const id = `song_part_${song_parts[part].path}_${v}`
				presets[id] = {
					type: 'button',
					category: 'Song Parts',
					name: `${song_parts[part].label} ${v}`,
					style: {
						...style,
						text: song_parts[part].displayLabel
							? `${song_parts[part].displayLabel}\\n${v}`
							: `${song_parts[part].label}\\n${v}`,
					},
					steps: [
						{
							down: [
								{
									actionId: 'go_to_song_part',
									options: {
										song_part: song_parts[part].id,
										item_index: v,
									},
								},
							],
							up: [],
						},
					],
				}
			}
		} else {
			const id = `song_part_${song_parts[part].path}`
			presets[id] = {
				type: 'button',
				category: 'Song Parts',
				name: song_parts[part].label,
				style: {
					...style,
					text: song_parts[part].displayLabel ? song_parts[part].displayLabel : song_parts[part].label,
				},
				steps: [
					{
						down: [
							{
								actionId: 'go_to_song_part',
								options: {
									song_part: song_parts[part].id,
									item_index: 1,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	self.setPresetDefinitions(presets)
}
