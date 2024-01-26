export const UpdateVariableDefinitions = async function (self) {
	self.setVariableDefinitions([
		{ variableId: 'on_air', name: 'On Air' },
		{ variableId: 'on_air_session_id', name: 'On Air Session ID' }, // Temporary for debugging
		{ variableId: 'presentation_name', name: 'Current Presentation Name' },
		{ variableId: 'localRevision', name: 'Experimental Local revision' }, // Temporary for debugging
		{ variableId: 'connectionId', name: 'Experimental API connection ID' }, // Temporary for debugging
		{ variableId: 'authenticationToken', name: 'Experimental API authentication token' }, // Temporary for debugging
		{ variableId: 'current_item_id', name: 'Current Item ID' },
		{ variableId: 'current_item_title', name: 'Current Item Title' },
		{ variableId: 'current_item_type', name: 'Current Item Type' },
		{ variableId: 'current_item_slide_index', name: 'Current Item Slide Index' },
		{ variableId: 'current_item_slide_count', name: 'Current Item Slide Count' },
		{ variableId: 'current_quick_screen', name: 'Current Quick Screen' },
		{ variableId: 'current_current_media_state', name: 'Current Media State' },
	])
}
