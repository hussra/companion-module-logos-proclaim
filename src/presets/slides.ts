import { DEFAULT_PRESET_STYLE } from '../refdata.js'
import { doubleLeftArrow, doubleRightArrow, leftArrow, rightArrow } from '../resource-images.js'
import type { PresetsBuilderContext } from './index.js'

export function createSlidePresets(context: PresetsBuilderContext): void {
	const layered = context.self.config.layeredPresets

	context.definitions['previous_slide'] = {
		type: 'simple',
		name: 'Previous Slide',
		style: {
			...DEFAULT_PRESET_STYLE,
			text: layered ? '' : 'Prev Slide',
			png64: layered ? leftArrow : undefined,
			bgcolor: layered ? 0x006600 : 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'previous_slide',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	context.definitions['next_slide'] = {
		type: 'simple',
		name: 'Next Slide',
		style: {
			...DEFAULT_PRESET_STYLE,
			text: layered ? '' : 'Next Slide',
			png64: layered ? rightArrow : undefined,
			bgcolor: layered ? 0x006600 : 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'next_slide',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	context.definitions['previous_service_item'] = {
		type: 'simple',
		name: 'Previous Service Item',
		style: {
			...DEFAULT_PRESET_STYLE,
			text: layered ? '' : 'Prev Item',
			png64: layered ? doubleLeftArrow : undefined,
			bgcolor: layered ? 0x003d00 : 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'previous_service_item',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	context.definitions['next_service_item'] = {
		type: 'simple',
		name: 'Next Service Item',
		style: {
			...DEFAULT_PRESET_STYLE,
			text: layered ? '' : 'Prev Item',
			png64: layered ? doubleRightArrow : undefined,
			bgcolor: layered ? 0x003d00 : 0x000000,
		},
		steps: [
			{
				down: [
					{
						actionId: 'next_service_item',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	context.sections.push({
		id: 'slides',
		name: 'Slides',
		definitions: ['previous_slide', 'next_slide', 'previous_service_item', 'next_service_item'],
	})
}
