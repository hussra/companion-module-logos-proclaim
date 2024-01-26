export const UpdateVariableDefinitions = async function (self) {
	self.setVariableDefinitions([
		{ variableId: 'on_air', name: 'On Air' },
		{ variableId: 'presentation_name', name: 'Current Presentation Name' },

		{ variableId: 'connectionId', name: 'Experimental API connection ID' }, // Temporary for debugging
		{ variableId: 'authenticationToken', name: 'Experimental API authentication token' }, // Temporary for debugging
	])
}
