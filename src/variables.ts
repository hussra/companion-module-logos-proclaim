import type { ModuleInstance } from './main.js'

export const UpdateVariableDefinitions = function (self: ModuleInstance) {
	self.setVariableDefinitions([{ variableId: 'on_air', name: 'On Air' }])
}
