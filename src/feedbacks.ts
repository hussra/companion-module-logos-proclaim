import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export const UpdateFeedbacks = function (self: ModuleInstance): void {

	self.setFeedbackDefinitions({
		on_air: {
			name: 'On Air',
			type: 'boolean',
			description: 'Whether or not Proclaim is On Air',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.proclaimAPI.on_air
			},
		},
	})
	
}
