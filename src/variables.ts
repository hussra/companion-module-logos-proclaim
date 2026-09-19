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
		{ variableId: 'slide_index', name: 'Current Slide within Current Service Item' },
		{ variableId: 'slide_count', name: 'Number of Slides within Current Service Item' },
	])
}
