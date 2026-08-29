import type { ModuleInstance } from './main.js'

export const UpdateVariableDefinitions = function (self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'on_air', name: 'On Air' },
		{ variableId: 'presentation_date', name: 'Presentation Date' },
		{ variableId: 'presentation_title', name: 'Presentation Title' },
	])
}
