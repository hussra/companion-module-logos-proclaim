// Reference data used in setting up actions and presets

// Song parts - used in the go_to_song_part action and in constructing its presets
export const SONG_PARTS = [
	{ id: 0, label: 'Verse' },
	{ id: 1, label: 'Chorus' },
	{ id: 2, label: 'Bridge' },
	{ id: 3, label: 'Prechorus', displayLabel: 'Pre\nchorus' },
	{ id: 4, label: 'Interlude', displayLabel: 'Inter-lude' },
	{ id: 5, label: 'Tag' },
	{ id: 6, label: 'Ending' },
]

// Simple actions, each of which has an action and matching preset, corresponding to a single Proclaim app command
//
// The action and preset IDs will be the name, converted to snake_case
// The preset text will be the name, unless overridden below
// The preset text size will be 18, unless overridden below
// The Proclaim API App Command will be the name converted to CamelCase, unless overridden below
export const SIMPLE_ACTIONS = [
	// On/Off Air
	{
		name: 'Go On Air',
		category: 'On Air',
	},
	{
		name: 'Go Off Air',
		category: 'On Air',
	},

	// Slides
	{
		name: 'Previous Slide',
		category: 'Slides',
		text: 'Prev\nSlide',
	},
	{
		name: 'Next Slide',
		category: 'Slides',
		text: 'Next\nSlide',
	},
	{
		name: 'Previous Service Item',
		category: 'Slides',
		text: 'Prev\nItem',
	},
	{
		name: 'Next Service Item',
		category: 'Slides',
		text: 'Next\nItem',
	},

	// Service Parts
	{
		name: 'Start Pre Service',
		category: 'Service Parts',
		text: 'Pre Service',
	},
	{
		name: 'Start Warm Up',
		category: 'Service Parts',
		text: 'Warm Up',
	},
	{
		name: 'Start Service',
		category: 'Service Parts',
		text: 'Service',
	},
	{
		name: 'Start Post Service',
		category: 'Service Parts',
		text: 'Post Service',
	},

	// Media
	{
		name: 'Previous Audio Item',
		category: 'Media',
		text: 'Prev\nAudio',
		appCommand: 'PreviousPreviousAudioItem', // (sic.)
	},
	{
		name: 'Next Audio Item',
		category: 'Media',
		text: 'Next\nAudio',
	},
	{
		name: 'Video Play',
		category: 'Media',
		text: 'Video\nPlay',
	},
	{
		name: 'Video Pause',
		category: 'Media',
		text: 'Video\nPause',
	},
	{
		name: 'Video Restart',
		category: 'Media',
		text: 'Video\nRestart',
	},
	{
		name: 'Video Rewind',
		category: 'Media',
		text: 'Video\nRewind',
	},
	{
		name: 'Video Fast Forward',
		category: 'Media',
		text: 'Video\nFast\nForward',
		size: 14,
	},

	// Quick Screens
	{
		name: 'Show Blank Quick Screen',
		category: 'Quick Screens',
		text: 'Blank',
	},
	{
		name: 'Show Logo Quick Screen',
		category: 'Quick Screens',
		text: 'Logo',
	},
	{
		name: 'Show No Text Quick Screen',
		category: 'Quick Screens',
		text: 'No Text',
	},
	{
		name: 'Show Floating Hearts Quick Screen',
		category: 'Quick Screens',
		text: 'Floating Hearts',
	},
	{
		name: 'Show Floating Amens Quick Screen',
		category: 'Quick Screens',
		text: 'Floating Amens',
	},
	{
		name: 'Show Amen Quick Screen',
		category: 'Quick Screens',
		text: 'Amen',
	},
	{
		name: 'Show Hallelujah Quick Screen',
		category: 'Quick Screens',
		text: 'Hallelujah',
		size: 14,
	},
	{
		name: 'Show Praise The Lord Quick Screen',
		category: 'Quick Screens',
		text: 'Praise The Lord',
		size: 14,
	},
	{
		name: 'Show He Is Risen Quick Screen',
		category: 'Quick Screens',
		text: 'He Is Risen',
	},
	{
		name: 'Show He Is Risen Indeed Quick Screen',
		category: 'Quick Screens',
		text: 'He Is Risen Indeed',
		size: 14,
		appCommand: 'ShowHeIsRisenWhiteQuickScreen', // (sic.)
	},
]
