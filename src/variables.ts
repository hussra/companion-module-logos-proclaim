import { QuickScreenKind } from './apiTypes.js'
import type { ModuleInstance } from './main.js'

export const UpdateVariableDefinitions = function (self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'on_air', name: 'On Air' },
		{ variableId: 'session_id', name: 'Session ID' },
		{ variableId: 'presentation_title', name: 'Presentation Title' },
		{ variableId: 'presentation_id', name: 'Presentation ID' },
		{ variableId: 'presentation_group_name', name: 'Presentation Group Name' },
		{ variableId: 'presentation_group_id', name: 'Presentation Group ID' },
		{ variableId: 'presentation_aspect_ratio', name: 'Presentation Aspect Ratio' },
		{ variableId: 'presentation_date', name: 'Presentation Date - Unix Timestamp' },
		{ variableId: 'presentation_start_time', name: 'Presentation Start Time (On Air since) - Unix Timestamp' },
		{ variableId: 'item_id', name: 'Current Service Item ID' },
		{ variableId: 'item_title', name: 'Current Service Item Title' },
		{ variableId: 'item_index', name: 'Index of Current Service Item' },
		{ variableId: 'item_count', name: 'Number of Service Items in Current Presentation' },
		{ variableId: 'slide_index', name: 'Current Slide within Current Service Item' },
		{ variableId: 'slide_count', name: 'Number of Slides within Current Service Item' },
		{ variableId: 'quick_screen_kind', name: 'Currently active Quick Screen' },
	])
}

export const InitializeVariables = function (self: ModuleInstance): void {
	self.setVariableValues({
		on_air: false,
		session_id: '',
		presentation_title: '',
		presentation_id: '',
		presentation_group_name: '',
		presentation_group_id: '',
		presentation_aspect_ratio: '',
		presentation_date: '',
		presentation_start_time: '',
		item_id: '',
		item_title: '',
		item_index: 0,
		item_count: 0,
		slide_index: 1,
		slide_count: 0,
		quick_screen_kind: QuickScreenKind.NONE,
	})
}
