import { combineRgb } from '@companion-module/base'

export const UpdateFeedbacks = async function (self) {
	self.setFeedbackDefinitions({
		on_air: {
			name: 'On Air',
			type: 'boolean',
			description: 'Whether or not Proclaim is On Air',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: () => {
				return self.proclaimAPI.on_air
			},
		},
	})
}
